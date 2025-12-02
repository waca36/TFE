package be.cercle.asblcercle.web.dto;

public class PaymentRequest {
    private Long amount; // en centimes (ex: 1000 = 10.00€)
    private String currency;
    private String description;
    private String reservationType; // "ESPACE", "EVENT", "GARDERIE"
    private Long reservationId; // optionnel - pas encore créé

    // Nouveaux champs pour identifier ce qu'on réserve
    private Long sessionId; // pour garderie
    private Long eventId; // pour events
    private Long espaceId; // pour espaces
    private Integer numberOfChildren; // pour garderie

    // Getters et Setters
    public Long getAmount() { return amount; }
    public void setAmount(Long amount) { this.amount = amount; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }

    public String getReservationType() { return reservationType; }
    public void setReservationType(String reservationType) { this.reservationType = reservationType; }

    public Long getReservationId() { return reservationId; }
    public void setReservationId(Long reservationId) { this.reservationId = reservationId; }

    public Long getSessionId() { return sessionId; }
    public void setSessionId(Long sessionId) { this.sessionId = sessionId; }

    public Long getEventId() { return eventId; }
    public void setEventId(Long eventId) { this.eventId = eventId; }

    public Long getEspaceId() { return espaceId; }
    public void setEspaceId(Long espaceId) { this.espaceId = espaceId; }

    public Integer getNumberOfChildren() { return numberOfChildren; }
    public void setNumberOfChildren(Integer numberOfChildren) { this.numberOfChildren = numberOfChildren; }
}