package be.cercle.asblcercle.entity;

public enum EventStatus {
    PENDING_APPROVAL,  // En attente de validation admin
    PUBLISHED,         // Validé et publié (visible par tous)
    CANCELLED,         // Annulé
    REJECTED           // Refusé par l'admin
}
