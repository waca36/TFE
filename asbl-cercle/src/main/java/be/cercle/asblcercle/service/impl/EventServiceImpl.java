package be.cercle.asblcercle.service.impl;

import be.cercle.asblcercle.entity.Event;
import be.cercle.asblcercle.entity.EventStatus;
import be.cercle.asblcercle.repository.EventRepository;
import be.cercle.asblcercle.service.EventService;
import be.cercle.asblcercle.web.dto.EventRequest;
import be.cercle.asblcercle.web.dto.EventResponseDto;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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
        Event e = new Event();
        applyRequestToEntity(request, e);
        Event saved = eventRepository.save(e);
        return EventResponseDto.fromEntity(saved);
    }

    @Override
    public EventResponseDto updateEvent(Long id, EventRequest request) {
        Event e = eventRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Event not found"));

        applyRequestToEntity(request, e);
        Event saved = eventRepository.save(e);
        return EventResponseDto.fromEntity(saved);
    }

    @Override
    public void deleteEvent(Long id) {
        eventRepository.deleteById(id);
    }

    @Override
    public List<EventResponseDto> getAllEventsForAdmin() {
        return eventRepository.findAll()
                .stream()
                .map(EventResponseDto::fromEntity)
                .toList();
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
