package be.cercle.asblcercle.web.dto;

import be.cercle.asblcercle.entity.Event;
import be.cercle.asblcercle.entity.EventStatus;

import java.time.LocalDateTime;

public class EventResponseDto {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private Integer capacity;
    private Double price;
    private EventStatus status;
    private LocalDateTime createdAt;

    public static EventResponseDto fromEntity(Event e) {
        EventResponseDto dto = new EventResponseDto();
        dto.id = e.getId();
        dto.title = e.getTitle();
        dto.description = e.getDescription();
        dto.startDateTime = e.getStartDateTime();
        dto.endDateTime = e.getEndDateTime();
        dto.capacity = e.getCapacity();
        dto.price = e.getPrice();
        dto.status = e.getStatus();
        dto.createdAt = e.getCreatedAt();
        return dto;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDateTime getStartDateTime() { return startDateTime; }
    public LocalDateTime getEndDateTime() { return endDateTime; }
    public Integer getCapacity() { return capacity; }
    public Double getPrice() { return price; }
    public EventStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
