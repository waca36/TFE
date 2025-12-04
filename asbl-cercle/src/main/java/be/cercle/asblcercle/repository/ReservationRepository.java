package be.cercle.asblcercle.repository;

import be.cercle.asblcercle.entity.Espace;
import be.cercle.asblcercle.entity.Reservation;
import be.cercle.asblcercle.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUser(User user);

    List<Reservation> findByEspace(Espace espace);

    // Vérifie s'il existe une réservation qui chevauche la période demandée pour un espace donné
    // Chevauchement : (start1 < end2) AND (end1 > start2)
    @Query("SELECT COUNT(r) > 0 FROM Reservation r " +
           "WHERE r.espace.id = :espaceId " +
           "AND r.status != 'CANCELLED' " +
           "AND r.startDateTime < :endDateTime " +
           "AND r.endDateTime > :startDateTime")
    boolean existsOverlappingReservation(
            @Param("espaceId") Long espaceId,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
    );

    // Retourne les réservations qui chevauchent une période pour un espace
    @Query("SELECT r FROM Reservation r " +
           "WHERE r.espace.id = :espaceId " +
           "AND r.status != 'CANCELLED' " +
           "AND r.startDateTime < :endDateTime " +
           "AND r.endDateTime > :startDateTime")
    List<Reservation> findOverlappingReservations(
            @Param("espaceId") Long espaceId,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
    );

    // Retourne toutes les réservations confirmées d'un espace pour une période (pour le calendrier)
    @Query("SELECT r FROM Reservation r " +
           "WHERE r.espace.id = :espaceId " +
           "AND r.status = 'CONFIRMED' " +
           "AND r.startDateTime < :endDateTime " +
           "AND r.endDateTime > :startDateTime " +
           "ORDER BY r.startDateTime")
    List<Reservation> findByEspaceAndPeriod(
            @Param("espaceId") Long espaceId,
            @Param("startDateTime") LocalDateTime startDateTime,
            @Param("endDateTime") LocalDateTime endDateTime
    );
}
