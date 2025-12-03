package be.cercle.asblcercle.web.dto;

import be.cercle.asblcercle.entity.GarderieSession;
import be.cercle.asblcercle.entity.GarderieSessionStatus;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

public class GarderieSessionResponseDto {

    private Long id;
    private String title;
    private String description;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer capacity;
    private Integer registeredCount;
    private Integer availablePlaces;
    private Double pricePerChild;
    private GarderieSessionStatus status;
    private LocalDateTime createdAt;

    public static GarderieSessionResponseDto fromEntity(GarderieSession s) {
        GarderieSessionResponseDto dto = new GarderieSessionResponseDto();
        dto.id = s.getId();
        dto.title = s.getTitle();
        dto.description = s.getDescription();
        dto.sessionDate = s.getSessionDate();
        dto.startTime = s.getStartTime();
        dto.endTime = s.getEndTime();
        dto.capacity = s.getCapacity();
        dto.pricePerChild = s.getPricePerChild();
        dto.status = s.getStatus();
        dto.createdAt = s.getCreatedAt();
        return dto;
    }

    public static GarderieSessionResponseDto fromEntity(GarderieSession s, Integer registeredCount) {
        GarderieSessionResponseDto dto = fromEntity(s);
        dto.registeredCount = registeredCount;
        dto.availablePlaces = s.getCapacity() - registeredCount;
        return dto;
    }

    // Getters

    public Long getId() { return id; }
    public String getTitle() { return title; }
    public String getDescription() { return description; }
    public LocalDate getSessionDate() { return sessionDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public Integer getCapacity() { return capacity; }
    public Integer getRegisteredCount() { return registeredCount; }
    public Integer getAvailablePlaces() { return availablePlaces; }
    public Double getPricePerChild() { return pricePerChild; }
    public GarderieSessionStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
