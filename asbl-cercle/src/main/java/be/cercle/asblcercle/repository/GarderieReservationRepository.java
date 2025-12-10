package be.cercle.asblcercle.repository;

import be.cercle.asblcercle.entity.GarderieReservation;
import be.cercle.asblcercle.entity.GarderieReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

public interface GarderieReservationRepository extends JpaRepository<GarderieReservation, Long> {

    @Query("SELECT gr FROM GarderieReservation gr JOIN FETCH gr.session JOIN FETCH gr.user WHERE gr.user.id = :userId")
    List<GarderieReservation> findByUserId(@Param("userId") Long userId);

    @Query("SELECT gr FROM GarderieReservation gr JOIN FETCH gr.user WHERE gr.session.id = :sessionId")
    List<GarderieReservation> findBySessionId(@Param("sessionId") Long sessionId);

    @Query("SELECT COALESCE(SUM(r.numberOfChildren), 0) FROM GarderieReservation r WHERE r.session.id = :sessionId AND r.status != 'CANCELLED'")
    Integer countTotalChildrenBySessionId(@Param("sessionId") Long sessionId);

    @Modifying
    @Transactional
    @Query("DELETE FROM GarderieReservation gr WHERE gr.session.id = :sessionId")
    void deleteBySessionId(@Param("sessionId") Long sessionId);
}
