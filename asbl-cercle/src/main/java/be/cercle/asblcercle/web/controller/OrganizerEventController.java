package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.entity.Event;
import be.cercle.asblcercle.entity.EventStatus;
import be.cercle.asblcercle.entity.User;
import be.cercle.asblcercle.repository.EventRepository;
import be.cercle.asblcercle.repository.EventRegistrationRepository;
import be.cercle.asblcercle.repository.UserRepository;
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
@RequestMapping("/api/organizer/events")
@CrossOrigin(origins = "*")
public class OrganizerEventController {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;
    private final UserRepository userRepository;

    public OrganizerEventController(
            EventRepository eventRepository,
            EventRegistrationRepository registrationRepository,
            UserRepository userRepository
    ) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
        this.userRepository = userRepository;
    }

    // Créer un événement (status = PENDING_APPROVAL)
    @PostMapping
    public EventResponseDto createEvent(@Valid @RequestBody EventRequestDto dto, Authentication authentication) {
        User organizer = getAuthenticatedUser(authentication);
        
        // Vérifier que l'utilisateur est bien ORGANISATEUR ou ADMIN
        if (!organizer.getRole().name().equals("ORGANISATEUR") && !organizer.getRole().name().equals("ADMIN")) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Seuls les organisateurs peuvent créer des événements");
        }

        // Validation des dates
        if (dto.getStartDateTime().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de début ne peut pas être dans le passé");
        }
        if (dto.getEndDateTime().isBefore(dto.getStartDateTime())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de fin doit être après la date de début");
        }

        Event event = new Event();
        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setStartDateTime(dto.getStartDateTime());
        event.setEndDateTime(dto.getEndDateTime());
        event.setLocation(dto.getLocation());
        event.setCapacity(dto.getCapacity());
        event.setPrice(dto.getPrice());
        event.setCreatedBy(organizer);
        
        // Si admin, l'événement est directement publié
        if (organizer.getRole().name().equals("ADMIN")) {
            event.setStatus(EventStatus.PUBLISHED);
            event.setApprovedAt(LocalDateTime.now());
            event.setApprovedBy(organizer);
        } else {
            event.setStatus(EventStatus.PENDING_APPROVAL);
        }

        Event saved = eventRepository.save(event);
        return EventResponseDto.fromEntity(saved);
    }

    // Voir mes événements (organisateur)
    @GetMapping("/my")
    public List<EventResponseDto> getMyEvents(Authentication authentication) {
        User organizer = getAuthenticatedUser(authentication);
        
        return eventRepository.findByCreatedByIdOrderByCreatedAtDesc(organizer.getId()).stream()
                .map(e -> {
                    int registered = registrationRepository.countTotalParticipantsByEventId(e.getId());
                    return EventResponseDto.fromEntity(e, registered);
                })
                .toList();
    }

    // Voir un de mes événements
    @GetMapping("/my/{id}")
    public EventResponseDto getMyEvent(@PathVariable Long id, Authentication authentication) {
        User organizer = getAuthenticatedUser(authentication);
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable"));
        
        if (!event.getCreatedBy().getId().equals(organizer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas le créateur de cet événement");
        }
        
        int registered = registrationRepository.countTotalParticipantsByEventId(event.getId());
        return EventResponseDto.fromEntity(event, registered);
    }

    // Modifier un de mes événements (seulement si PENDING_APPROVAL)
    @PutMapping("/my/{id}")
    public EventResponseDto updateMyEvent(@PathVariable Long id, @Valid @RequestBody EventRequestDto dto, Authentication authentication) {
        User organizer = getAuthenticatedUser(authentication);
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable"));
        
        if (!event.getCreatedBy().getId().equals(organizer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas le créateur de cet événement");
        }
        
        // On ne peut modifier que si en attente ou rejeté
        if (event.getStatus() != EventStatus.PENDING_APPROVAL && event.getStatus() != EventStatus.REJECTED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Impossible de modifier un événement déjà publié ou annulé");
        }

        event.setTitle(dto.getTitle());
        event.setDescription(dto.getDescription());
        event.setStartDateTime(dto.getStartDateTime());
        event.setEndDateTime(dto.getEndDateTime());
        event.setLocation(dto.getLocation());
        event.setCapacity(dto.getCapacity());
        event.setPrice(dto.getPrice());
        
        // Si c'était rejeté, on repasse en attente
        if (event.getStatus() == EventStatus.REJECTED) {
            event.setStatus(EventStatus.PENDING_APPROVAL);
            event.setRejectionReason(null);
        }

        Event saved = eventRepository.save(event);
        return EventResponseDto.fromEntity(saved);
    }

    // Annuler un de mes événements
    @DeleteMapping("/my/{id}")
    public void cancelMyEvent(@PathVariable Long id, Authentication authentication) {
        User organizer = getAuthenticatedUser(authentication);
        
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable"));
        
        if (!event.getCreatedBy().getId().equals(organizer.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous n'êtes pas le créateur de cet événement");
        }
        
        event.setStatus(EventStatus.CANCELLED);
        eventRepository.save(event);
    }

    private User getAuthenticatedUser(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté");
        }
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));
    }
}
