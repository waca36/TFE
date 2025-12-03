package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.entity.Event;
import be.cercle.asblcercle.entity.EventStatus;
import be.cercle.asblcercle.entity.User;
import be.cercle.asblcercle.repository.EventRepository;
import be.cercle.asblcercle.repository.EventRegistrationRepository;
import be.cercle.asblcercle.repository.UserRepository;
import be.cercle.asblcercle.web.dto.EventApprovalDto;
import be.cercle.asblcercle.web.dto.EventRequestDto;
import be.cercle.asblcercle.web.dto.EventResponseDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/admin/events")
@CrossOrigin(origins = "*")
public class AdminEventController {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final UserRepository userRepository;

    public AdminEventController(
            EventRepository eventRepository,
            EventRegistrationRepository registrationRepository,
            UserRepository userRepository
    ) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
    }

    // Tous les événements (admin)
    @GetMapping
    public List<EventResponseDto> getAllEvents() {
        return eventRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(e -> {
                    int registered = registrationRepository.countTotalParticipantsByEventId(e.getId());
                    return EventResponseDto.fromEntity(e, registered);
                })
                .toList();
    }

    // Événements en attente d'approbation
    @GetMapping("/pending")
    public List<EventResponseDto> getPendingEvents() {
        return eventRepository.findByStatusOrderByCreatedAtDesc(EventStatus.PENDING_APPROVAL).stream()
                .map(e -> {
                    int registered = registrationRepository.countTotalParticipantsByEventId(e.getId());
                    return EventResponseDto.fromEntity(e, registered);
                })
                .toList();
    }

    // Détail d'un événement
    @GetMapping("/{id}")
    public EventResponseDto getEvent(@PathVariable Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable"));
        int registered = registrationRepository.countTotalParticipantsByEventId(event.getId());
        return EventResponseDto.fromEntity(event, registered);
    }

    // Créer un événement (directement PUBLISHED pour admin)
    @PostMapping
    public EventResponseDto createEvent(@Valid @RequestBody EventRequestDto dto, Authentication authentication) {
        User admin = getAuthenticatedAdmin(authentication);

        if (dto.getStartDateTime().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de début ne peut pas être dans le passé");
        }

        Event event = new Event();
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setStartDateTime(dto.getStartDateTime());
        event.setEndDateTime(dto.getEndDateTime());
        event.setLocation(dto.getLocation());
        event.setCapacity(dto.getCapacity());
        event.setPrice(dto.getPrice());
        event.setStatus(EventStatus.PUBLISHED);
        event.setCreatedBy(admin);
        event.setApprovedAt(LocalDateTime.now());
        event.setApprovedBy(admin);

        Event saved = eventRepository.save(event);
        return EventResponseDto.fromEntity(saved);
    }

    // Modifier un événement
    @PutMapping("/{id}")
    public EventResponseDto updateEvent(@PathVariable Long id, @Valid @RequestBody EventRequestDto dto) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable"));

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setStartDateTime(dto.getStartDateTime());
        event.setEndDateTime(dto.getEndDateTime());
        event.setLocation(dto.getLocation());
        event.setCapacity(dto.getCapacity());
        event.setPrice(dto.getPrice());

        Event saved = eventRepository.save(event);
        int registered = registrationRepository.countTotalParticipantsByEventId(saved.getId());
        return EventResponseDto.fromEntity(saved, registered);
    }

    // Approuver ou rejeter un événement
    @PostMapping("/{id}/approve")
    public EventResponseDto approveOrRejectEvent(
            @PathVariable Long id,
            @RequestBody EventApprovalDto dto,
            Authentication authentication
    ) {
        User admin = getAuthenticatedAdmin(authentication);
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable"));

        if (event.getStatus() != EventStatus.PENDING_APPROVAL) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cet événement n'est pas en attente d'approbation");
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

    // Changer le statut d'un événement
    @PatchMapping("/{id}/status")
    public EventResponseDto updateStatus(@PathVariable Long id, @RequestParam String status, Authentication authentication) {
        User admin = getAuthenticatedAdmin(authentication);
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable"));

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

    // Supprimer un événement
    @DeleteMapping("/{id}")
    public void deleteEvent(@PathVariable Long id) {
        if (!eventRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable");
        }
        eventRepository.deleteById(id);
    }

    private User getAuthenticatedAdmin(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));
    }
}
