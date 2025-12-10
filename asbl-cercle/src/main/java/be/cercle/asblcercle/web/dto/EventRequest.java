package be.cercle.asblcercle.web.dto;

import be.cercle.asblcercle.entity.EventLocationType;
import be.cercle.asblcercle.entity.EventStatus;
import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public class EventRequest {

    @NotBlank
    @Size(min = 3, max = 150)
    private String title;

    @NotBlank
    @Size(min = 10, max = 500)
    private String description;

    @NotNull
    @Future
    private LocalDateTime startDateTime;

    @NotNull
    @Future
    private LocalDateTime endDateTime;

    private Integer capacity;

    private Double price;

    private Integer minAge;

    private Integer maxAge;

    @NotNull
    private EventStatus status;

    private EventLocationType locationType;
    private Long spaceId;
    private String externalAddress;
    private String location;

    private boolean garderieRequired;
    private Double garderiePrice;
    private Integer garderieCapacity;
    private Integer garderieMinAge;
    private Integer garderieMaxAge;

    public String getTitle() { return title; }
    public void setTitle(String title) { this.title = title; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public LocalDateTime getStartDateTime() { return startDateTime; }
    public void setStartDateTime(LocalDateTime startDateTime) { this.startDateTime = startDateTime; }

    public LocalDateTime getEndDateTime() { return endDateTime; }
    public void setEndDateTime(LocalDateTime endDateTime) { this.endDateTime = endDateTime; }

    public Integer getCapacity() { return capacity; }
    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Double getPrice() { return price; }
    public void setPrice(Double price) { this.price = price; }

    public Integer getMinAge() { return minAge; }
    public void setMinAge(Integer minAge) { this.minAge = minAge; }

    public Integer getMaxAge() { return maxAge; }
    public void setMaxAge(Integer maxAge) { this.maxAge = maxAge; }

    public EventStatus getStatus() { return status; }
    public void setStatus(EventStatus status) { this.status = status; }

    public EventLocationType getLocationType() { return locationType; }
    public void setLocationType(EventLocationType locationType) { this.locationType = locationType; }

    public Long getSpaceId() { return spaceId; }
    public void setSpaceId(Long spaceId) { this.spaceId = spaceId; }

    public String getExternalAddress() { return externalAddress; }
    public void setExternalAddress(String externalAddress) { this.externalAddress = externalAddress; }

    public String getLocation() { return location; }
    public void setLocation(String location) { this.location = location; }

    public boolean isGarderieRequired() { return garderieRequired; }
    public void setGarderieRequired(boolean garderieRequired) { this.garderieRequired = garderieRequired; }

    public Double getGarderiePrice() { return garderiePrice; }
    public void setGarderiePrice(Double garderiePrice) { this.garderiePrice = garderiePrice; }

    public Integer getGarderieCapacity() { return garderieCapacity; }
    public void setGarderieCapacity(Integer garderieCapacity) { this.garderieCapacity = garderieCapacity; }

    public Integer getGarderieMinAge() { return garderieMinAge; }
    public void setGarderieMinAge(Integer garderieMinAge) { this.garderieMinAge = garderieMinAge; }

    public Integer getGarderieMaxAge() { return garderieMaxAge; }
    public void setGarderieMaxAge(Integer garderieMaxAge) { this.garderieMaxAge = garderieMaxAge; }
}
