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

    @Query("SELECT r FROM Reservation r " +
           "WHERE r.status = 'PENDING_APPROVAL' " +
           "ORDER BY r.createdAt DESC")
    List<Reservation> findPendingApproval();
}
