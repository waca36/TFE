package be.cercle.asblcercle.service.impl;

import be.cercle.asblcercle.entity.Event;
import be.cercle.asblcercle.entity.EventStatus;
import be.cercle.asblcercle.repository.EventRepository;
import be.cercle.asblcercle.service.EventService;
import be.cercle.asblcercle.web.dto.EventRequest;
import be.cercle.asblcercle.web.dto.EventResponseDto;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@Service
@Transactional
public class EventServiceImpl implements EventService {

    private final EventRepository eventRepository;

    public EventServiceImpl(EventRepository eventRepository) {
        this.eventRepository = eventRepository;
    }

    @Override
    public List<EventResponseDto> getPublicEvents() {
        List<Event> events = eventRepository
                .findByStatusAndStartDateTimeAfterOrderByStartDateTimeAsc(
                        EventStatus.PUBLISHED,
                        LocalDateTime.now()
                );
        return events.stream()
                .map(EventResponseDto::fromEntity)
                .toList();
    }

    @Override
    public EventResponseDto createEvent(EventRequest request) {
        validateEventDates(request);

        Event e = new Event();
        applyRequestToEntity(request, e);
        Event saved = eventRepository.save(e);
        return EventResponseDto.fromEntity(saved);
    }

    @Override
    public EventResponseDto updateEvent(Long id, EventRequest request) {
        validateEventDates(request);

        Event e = eventRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable"));

        applyRequestToEntity(request, e);
        Event saved = eventRepository.save(e);
        return EventResponseDto.fromEntity(saved);
    }

    @Override
    public void deleteEvent(Long id) {
        if (!eventRepository.existsById(id)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable");
        }
        eventRepository.deleteById(id);
    }

    @Override
    public List<EventResponseDto> getAllEventsForAdmin() {
        return eventRepository.findAll()
                .stream()
                .map(EventResponseDto::fromEntity)
                .toList();
    }

    private void validateEventDates(EventRequest request) {
        LocalDateTime now = LocalDateTime.now();

        // Vérifier que la date de début n'est pas dans le passé
        if (request.getStartDateTime().isBefore(now)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La date de début ne peut pas être dans le passé"
            );
        }

        // Vérifier que la date de fin n'est pas dans le passé
        if (request.getEndDateTime().isBefore(now)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La date de fin ne peut pas être dans le passé"
            );
        }

        // Vérifier que la date de fin est après la date de début
        if (request.getEndDateTime().isBefore(request.getStartDateTime()) ||
                request.getEndDateTime().isEqual(request.getStartDateTime())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "La date de fin doit être après la date de début"
            );
        }
    }

    private void applyRequestToEntity(EventRequest request, Event e) {
        e.setTitle(request.getTitle());
        e.setDescription(request.getDescription());
        e.setStartDateTime(request.getStartDateTime());
        e.setEndDateTime(request.getEndDateTime());
        e.setCapacity(request.getCapacity());
        e.setPrice(request.getPrice());
        e.setStatus(request.getStatus());
    }
}