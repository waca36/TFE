package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.service.EventService;
import be.cercle.asblcercle.web.dto.EventRequest;
import be.cercle.asblcercle.web.dto.EventResponseDto;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@CrossOrigin(origins = "*")
public class EventController {

    private final EventService eventService;

    public EventController(EventService eventService) {
        this.eventService = eventService;
    }

    // PUBLIC : liste des événements publiés et à venir
    @GetMapping("/api/public/events")
    public List<EventResponseDto> getPublicEvents() {
        return eventService.getPublicEvents();
    }

    // ADMIN : liste complète
    @GetMapping("/api/admin/events")
    public List<EventResponseDto> getAllForAdmin() {
        return eventService.getAllEventsForAdmin();
    }

    // ADMIN : créer
    @PostMapping("/api/admin/events")
    public EventResponseDto create(@Valid @RequestBody EventRequest request) {
        return eventService.createEvent(request);
    }

    // ADMIN : modifier
    @PutMapping("/api/admin/events/{id}")
    public EventResponseDto update(@PathVariable Long id,
                                   @Valid @RequestBody EventRequest request) {
        return eventService.updateEvent(id, request);
    }

    // ADMIN : supprimer
    @DeleteMapping("/api/admin/events/{id}")
    public void delete(@PathVariable Long id) {
        eventService.deleteEvent(id);
    }
}
