package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.entity.Event;
import be.cercle.asblcercle.entity.EventStatus;
import be.cercle.asblcercle.entity.User;
import be.cercle.asblcercle.repository.EventRegistrationRepository;
import be.cercle.asblcercle.repository.EventRepository;
import be.cercle.asblcercle.repository.GarderieReservationRepository;
import be.cercle.asblcercle.repository.UserRepository;
import be.cercle.asblcercle.service.EventPlanningService;
import be.cercle.asblcercle.web.dto.EventApprovalDto;
import be.cercle.asblcercle.web.dto.EventRequestDto;
import be.cercle.asblcercle.web.dto.EventResponseDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/events")
public class AdminEventController {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final GarderieReservationRepository garderieReservationRepository;
    private final UserRepository userRepository;
    private final EventPlanningService eventPlanningService;

    public AdminEventController(
            EventRepository eventRepository,
            EventRegistrationRepository registrationRepository,
            GarderieReservationRepository garderieReservationRepository,
            UserRepository userRepository,
            EventPlanningService eventPlanningService
    ) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.garderieReservationRepository = garderieReservationRepository;
        this.userRepository = userRepository;
        this.eventPlanningService = eventPlanningService;
    }

    @GetMapping
    public List<EventResponseDto> getAllEvents() {
        return eventRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(e -> {
                    int registered = registrationRepository.countTotalParticipantsByEventId(e.getId());
                    return EventResponseDto.fromEntity(e, registered);
                })
                .toList();
    }

    @GetMapping("/pending")
    public List<EventResponseDto> getPendingEvents() {
        return eventRepository.findByStatusOrderByCreatedAtDesc(EventStatus.PENDING_APPROVAL).stream()
                .map(e -> {
                    int registered = registrationRepository.countTotalParticipantsByEventId(e.getId());
                    return EventResponseDto.fromEntity(e, registered);
                })
                .toList();
    }

    @GetMapping("/{id}")
    public EventResponseDto getEvent(@PathVariable Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evenement introuvable"));
        int registered = registrationRepository.countTotalParticipantsByEventId(event.getId());
        return EventResponseDto.fromEntity(event, registered);
    }

    @PostMapping
    public EventResponseDto createEvent(@Valid @RequestBody EventRequestDto dto, Authentication authentication) {
        User admin = getAuthenticatedAdmin(authentication);

        Event event = new Event();
        eventPlanningService.applyAndValidate(
                event,
                EventPlanningService.EventData.from(dto, EventStatus.PUBLISHED),
                null
        );
        event.setStatus(EventStatus.PUBLISHED);
        event.setCreatedBy(admin);
        event.setApprovedAt(LocalDateTime.now());
        event.setApprovedBy(admin);

        Event saved = eventRepository.save(event);
        return EventResponseDto.fromEntity(saved);
    }

    @PutMapping("/{id}")
    public EventResponseDto updateEvent(@PathVariable Long id, @Valid @RequestBody EventRequestDto dto) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evenement introuvable"));

        eventPlanningService.applyAndValidate(
                event,
                EventPlanningService.EventData.from(dto, event.getStatus()),
                event.getId()
        );

        Event saved = eventRepository.save(event);
        int registered = registrationRepository.countTotalParticipantsByEventId(saved.getId());
        return EventResponseDto.fromEntity(saved, registered);
    }

    @PostMapping("/{id}/approve")
    public EventResponseDto approveOrRejectEvent(
            @PathVariable Long id,
            @RequestBody EventApprovalDto dto,
            Authentication authentication
    ) {
        User admin = getAuthenticatedAdmin(authentication);

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evenement introuvable"));

        if (event.getStatus() != EventStatus.PENDING_APPROVAL) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cet evenement n'est pas en attente d'approbation");
        }

        if (dto.isApproved()) {
            event.setStatus(EventStatus.PUBLISHED);
            event.setApprovedAt(LocalDateTime.now());
            event.setApprovedBy(admin);
            event.setRejectionReason(null);
        } else {
            event.setStatus(EventStatus.REJECTED);
            event.setRejectionReason(dto.getRejectionReason());
        }

        Event saved = eventRepository.save(event);
        int registered = registrationRepository.countTotalParticipantsByEventId(saved.getId());
        return EventResponseDto.fromEntity(saved, registered);
    }

    @PatchMapping("/{id}/status")
    public EventResponseDto updateStatus(@PathVariable Long id, @RequestParam String status, Authentication authentication) {
        User admin = getAuthenticatedAdmin(authentication);

        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evenement introuvable"));

        try {
            EventStatus newStatus = EventStatus.valueOf(status.toUpperCase());
            event.setStatus(newStatus);

            if (newStatus == EventStatus.PUBLISHED && event.getApprovedAt() == null) {
                event.setApprovedAt(LocalDateTime.now());
                event.setApprovedBy(admin);
            }
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Statut invalide");
        }

        Event saved = eventRepository.save(event);
        int registered = registrationRepository.countTotalParticipantsByEventId(saved.getId());
        return EventResponseDto.fromEntity(saved, registered);
    }

    @DeleteMapping("/{id}")
    @Transactional
    public void deleteEvent(@PathVariable Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evenement introuvable"));

        if (event.getGarderieSession() != null) {
            garderieReservationRepository.deleteBySessionId(event.getGarderieSession().getId());
        }
        registrationRepository.deleteByEventId(id);
        eventRepository.delete(event);
    }

    private User getAuthenticatedAdmin(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecte");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));
    }
}
