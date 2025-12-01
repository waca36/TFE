package be.cercle.asblcercle.service;

import be.cercle.asblcercle.web.dto.EventRequest;
import be.cercle.asblcercle.web.dto.EventResponseDto;

import java.util.List;

public interface EventService {

    List<EventResponseDto> getPublicEvents();

    EventResponseDto createEvent(EventRequest request);

    EventResponseDto updateEvent(Long id, EventRequest request);

    void deleteEvent(Long id);

    List<EventResponseDto> getAllEventsForAdmin();
}
