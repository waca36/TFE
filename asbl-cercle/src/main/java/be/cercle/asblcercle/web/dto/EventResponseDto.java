package be.cercle.asblcercle.web.dto;

import be.cercle.asblcercle.entity.Event;
import be.cercle.asblcercle.entity.EventLocationType;
import be.cercle.asblcercle.entity.GarderieSession;

import java.time.LocalDateTime;

public class EventResponseDto {

    private Long id;
    private String title;
    private String description;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private String location;
    private EventLocationType locationType;
    private Long spaceId;
    private String externalAddress;
    private Integer capacity;
    private Double price;
    private Integer minAge;
    private Integer maxAge;
    private String status;
    private Integer registeredCount;
    private Integer availablePlaces;

    private Long createdById;
    private String createdByName;
    private LocalDateTime createdAt;

    private LocalDateTime approvedAt;
    private String approvedByName;
    private String rejectionReason;

    private boolean garderieRequired;
    private Long garderieSessionId;
    private Double garderiePrice;
    private Integer garderieCapacity;
    private Integer garderieMinAge;
    private Integer garderieMaxAge;

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
        dto.locationType = e.getLocationType();
        dto.spaceId = e.getSpace() != null ? e.getSpace().getId() : null;
        dto.externalAddress = e.getExternalAddress();
        dto.capacity = e.getCapacity();
        dto.price = e.getPrice();
        dto.minAge = e.getMinAge();
        dto.maxAge = e.getMaxAge();
        dto.status = e.getStatus().name();
        dto.registeredCount = registeredCount;
        dto.availablePlaces = e.getCapacity() != null ? e.getCapacity() - registeredCount : null;
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

        dto.garderieRequired = e.isGarderieRequired();
        GarderieSession session = e.getGarderieSession();
        if (session != null) {
            dto.garderieSessionId = session.getId();
            dto.garderiePrice = session.getPricePerChild();
            dto.garderieCapacity = session.getCapacity();
            dto.garderieMinAge = session.getMinAge();
            dto.garderieMaxAge = session.getMaxAge();
        }

        return dto;
    }

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDateTime getStartDateTime() { return startDateTime; }
    public LocalDateTime getEndDateTime() { return endDateTime; }
    public String getLocation() { return location; }
    public EventLocationType getLocationType() { return locationType; }
    public Long getSpaceId() { return spaceId; }
    public String getExternalAddress() { return externalAddress; }
    public Integer getCapacity() { return capacity; }
    public Double getPrice() { return price; }
    public Integer getMinAge() { return minAge; }
    public Integer getMaxAge() { return maxAge; }
    public String getStatus() { return status; }
    public Integer getRegisteredCount() { return registeredCount; }
    public Integer getAvailablePlaces() { return availablePlaces; }
    public Long getCreatedById() { return createdById; }
    public String getCreatedByName() { return createdByName; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public LocalDateTime getApprovedAt() { return approvedAt; }
    public String getApprovedByName() { return approvedByName; }
    public String getRejectionReason() { return rejectionReason; }
    public boolean isGarderieRequired() { return garderieRequired; }
    public Long getGarderieSessionId() { return garderieSessionId; }
    public Double getGarderiePrice() { return garderiePrice; }
    public Integer getGarderieCapacity() { return garderieCapacity; }
    public Integer getGarderieMinAge() { return garderieMinAge; }
    public Integer getGarderieMaxAge() { return garderieMaxAge; }
}
