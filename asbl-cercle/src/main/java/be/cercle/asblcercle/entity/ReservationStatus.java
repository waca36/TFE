package be.cercle.asblcercle.entity;

public enum ReservationStatus {
    PENDING,
    PENDING_APPROVAL,  // En attente d'approbation admin
    APPROVED,          // Approuvé par admin, en attente de paiement
    CONFIRMED,         // Payé et confirmé
    CANCELLED,
    REJECTED
}
