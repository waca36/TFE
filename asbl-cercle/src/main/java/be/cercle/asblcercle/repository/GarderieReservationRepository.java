package be.cercle.asblcercle.repository;

import be.cercle.asblcercle.entity.GarderieReservation;
import be.cercle.asblcercle.entity.GarderieReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface GarderieReservationRepository extends JpaRepository<GarderieReservation, Long> {

    List<GarderieReservation> findByUserId(Long userId);

    List<GarderieReservation> findBySessionId(Long sessionId);

    @Query("SELECT COALESCE(SUM(r.numberOfChildren), 0) FROM GarderieReservation r WHERE r.session.id = :sessionId AND r.status != 'CANCELLED'")
    Integer countTotalChildrenBySessionId(@Param("sessionId") Long sessionId);
}
