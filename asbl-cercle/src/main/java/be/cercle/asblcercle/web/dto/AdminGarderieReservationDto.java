package be.cercle.asblcercle.web.dto;

import be.cercle.asblcercle.entity.GarderieReservation;

import java.time.LocalDate;
import java.time.LocalDateTime;

public class AdminGarderieReservationDto {

    private Long id;
    private String userName;
    private String userEmail;
    private String sessionTitle;
    private LocalDate sessionDate;
    private Integer numberOfChildren;
    private Double totalPrice;
    private String status;
    private LocalDateTime createdAt;

    public static AdminGarderieReservationDto fromEntity(GarderieReservation r) {
        AdminGarderieReservationDto dto = new AdminGarderieReservationDto();
        dto.id = r.getId();
        dto.userName = r.getUser().getFirstName() + " " + r.getUser().getLastName();
        dto.userEmail = r.getUser().getEmail();
        dto.sessionTitle = r.getSession().getTitle();
        dto.sessionDate = r.getSession().getSessionDate();
        dto.numberOfChildren = r.getNumberOfChildren();
        dto.totalPrice = r.getTotalPrice();
        dto.status = r.getStatus().name();
        dto.createdAt = r.getCreatedAt();
        return dto;
    }

    // Getters
    public Long getId() { return id; }
    public String getUserName() { return userName; }
    public String getUserEmail() { return userEmail; }
    public String getSessionTitle() { return sessionTitle; }
    public LocalDate getSessionDate() { return sessionDate; }
    public Integer getNumberOfChildren() { return numberOfChildren; }
    public Double getTotalPrice() { return totalPrice; }
    public String getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}