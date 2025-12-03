package be.cercle.asblcercle.web.dto;

import be.cercle.asblcercle.entity.Event;

import java.time.LocalDateTime;

public class EventResponseDto {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String location;
    private Integer capacity;
    private Double price;
    private String status;
    private Integer registeredCount;
    private Integer availablePlaces;
    
    // Info créateur
    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;
    
    // Info approbation
    private LocalDateTime approvedAt;
    private String approvedByName;
    private String rejectionReason;

    public static EventResponseDto fromEntity(Event e) {
        return fromEntity(e, 0);
    }

    public static EventResponseDto fromEntity(Event e, Integer registeredCount) {
        EventResponseDto dto = new EventResponseDto();
        dto.id = e.getId();
        dto.title = e.getTitle();
        dto.description = e.getDescription();
        dto.startDateTime = e.getStartDateTime();
        dto.endDateTime = e.getEndDateTime();
        dto.location = e.getLocation();
        dto.capacity = e.getCapacity();
        dto.price = e.getPrice();
        dto.status = e.getStatus().name();
        dto.registeredCount = registeredCount;
        dto.availablePlaces = e.getCapacity() - registeredCount;
        dto.createdAt = e.getCreatedAt();
        
        if (e.getCreatedBy() != null) {
            dto.createdById = e.getCreatedBy().getId();
            dto.createdByName = e.getCreatedBy().getFirstName() + " " + e.getCreatedBy().getLastName();
        }
        
        dto.approvedAt = e.getApprovedAt();
        if (e.getApprovedBy() != null) {
            dto.approvedByName = e.getApprovedBy().getFirstName() + " " + e.getApprovedBy().getLastName();
        }
        dto.rejectionReason = e.getRejectionReason();
        
        return dto;
    }

    // Getters
    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDateTime getStartDateTime() { return startDateTime; }
    public LocalDateTime getEndDateTime() { return endDateTime; }
    public String getLocation() { return location; }
    public Integer getCapacity() { return capacity; }
    public Double getPrice() { return price; }
    public String getStatus() { return status; }
    public Integer getRegisteredCount() { return registeredCount; }
    public Integer getAvailablePlaces() { return availablePlaces; }
    public Long getCreatedById() { return createdById; }
    public String getCreatedByName() { return createdByName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public String getApprovedByName() { return approvedByName; }
    public String getRejectionReason() { return rejectionReason; }
}
