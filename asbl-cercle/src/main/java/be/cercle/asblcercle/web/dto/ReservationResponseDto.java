package be.cercle.asblcercle.web.dto;

import be.cercle.asblcercle.entity.Reservation;
import be.cercle.asblcercle.entity.ReservationStatus;

import java.time.LocalDateTime;

public class ReservationResponseDto {

    private Long id;
    private UserResponseDto user;
    private EspaceResponseDto espace;
    private LocalDateTime startDateTime;
    private LocalDateTime endDateTime;
    private Double totalPrice;
    private ReservationStatus status;
    private LocalDateTime createdAt;

    public static ReservationResponseDto fromEntity(Reservation reservation) {
        ReservationResponseDto dto = new ReservationResponseDto();
        dto.id = reservation.getId();
        dto.user = UserResponseDto.fromEntity(reservation.getUser());
        dto.espace = EspaceResponseDto.fromEntity(reservation.getEspace());
        dto.startDateTime = reservation.getStartDateTime();
        dto.endDateTime = reservation.getEndDateTime();
        dto.totalPrice = reservation.getTotalPrice();
        dto.status = reservation.getStatus();
        dto.createdAt = reservation.getCreatedAt();
        return dto;
    }

    public Long getId() { return id; }
    public UserResponseDto getUser() { return user; }
    public EspaceResponseDto getEspace() { return espace; }
    public LocalDateTime getStartDateTime() { return startDateTime; }
    public LocalDateTime getEndDateTime() { return endDateTime; }
    public Double getTotalPrice() { return totalPrice; }
    public ReservationStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
