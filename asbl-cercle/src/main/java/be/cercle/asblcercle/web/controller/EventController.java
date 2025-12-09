package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.entity.Event;
import be.cercle.asblcercle.entity.EventStatus;
import be.cercle.asblcercle.repository.EventRepository;
import be.cercle.asblcercle.repository.EventRegistrationRepository;
import be.cercle.asblcercle.web.dto.EventResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/public/events")
@CrossOrigin(origins = "*")
public class EventController {

    private final EventRepository eventRepository;
    private final EventRegistrationRepository registrationRepository;

    public EventController(EventRepository eventRepository, EventRegistrationRepository registrationRepository) {
        this.eventRepository = eventRepository;
        this.registrationRepository = registrationRepository;
    }

    @GetMapping
    public List<EventResponseDto> getPublishedEvents() {
        return eventRepository.findByStatusAndStartDateTimeAfterOrderByStartDateTimeAsc(
                EventStatus.PUBLISHED, 
                LocalDateTime.now()
        ).stream()
        .map(e -> {
            int registered = registrationRepository.countTotalParticipantsByEventId(e.getId());
            return EventResponseDto.fromEntity(e, registered);
        })
        .toList();
    }

    @GetMapping("/{id}")
    public EventResponseDto getEvent(@PathVariable Long id) {
        Event event = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable"));
        
        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable");
        }
        
        int registered = registrationRepository.countTotalParticipantsByEventId(event.getId());
        return EventResponseDto.fromEntity(event, registered);
    }
}
