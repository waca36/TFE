package be.cercle.asblcercle.web.dto;

import be.cercle.asblcercle.entity.GarderieReservation;
import be.cercle.asblcercle.entity.GarderieReservationStatus;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.LocalDateTime;

public class GarderieReservationResponseDto {

    private Long id;
    private Long sessionId;
    private String sessionTitle;
    private LocalDate sessionDate;
    private LocalTime startTime;
    private LocalTime endTime;
    private Integer numberOfChildren;
    private Double totalPrice;
    private GarderieReservationStatus status;
    private LocalDateTime createdAt;

    public static GarderieReservationResponseDto fromEntity(GarderieReservation r) {
        GarderieReservationResponseDto dto = new GarderieReservationResponseDto();
        dto.id = r.getId();
        dto.sessionId = r.getSession().getId();
        dto.sessionTitle = r.getSession().getTitle();
        dto.sessionDate = r.getSession().getSessionDate();
        dto.startTime = r.getSession().getStartTime();
        dto.endTime = r.getSession().getEndTime();
        dto.numberOfChildren = r.getNumberOfChildren();
        dto.totalPrice = r.getTotalPrice();
        dto.status = r.getStatus();
        dto.createdAt = r.getCreatedAt();
        return dto;
    }

    public Long getId() { return id; }
    public Long getSessionId() { return sessionId; }
    public String getSessionTitle() { return sessionTitle; }
    public LocalDate getSessionDate() { return sessionDate; }
    public LocalTime getStartTime() { return startTime; }
    public LocalTime getEndTime() { return endTime; }
    public Integer getNumberOfChildren() { return numberOfChildren; }
    public Double getTotalPrice() { return totalPrice; }
    public GarderieReservationStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
