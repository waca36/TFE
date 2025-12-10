package be.cercle.asblcercle.repository;

import be.cercle.asblcercle.entity.Event;
import be.cercle.asblcercle.entity.EventRegistration;
import be.cercle.asblcercle.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

public interface EventRegistrationRepository extends JpaRepository<EventRegistration, Long> {

    @Query("SELECT er FROM EventRegistration er JOIN FETCH er.event JOIN FETCH er.user WHERE er.user.id = :userId")
    List<EventRegistration> findByUserId(@Param("userId") Long userId);

    @Query("SELECT er FROM EventRegistration er JOIN FETCH er.user WHERE er.event.id = :eventId")
    List<EventRegistration> findByEventId(@Param("eventId") Long eventId);

    Optional<EventRegistration> findByUserAndEvent(User user, Event event);

    boolean existsByUserAndEvent(User user, Event event);

    @Query("SELECT COALESCE(SUM(er.numberOfParticipants), 0) FROM EventRegistration er WHERE er.event.id = :eventId AND er.status != 'CANCELLED'")
    Integer countTotalParticipantsByEventId(@Param("eventId") Long eventId);

    @Modifying
    @Transactional
    @Query("DELETE FROM EventRegistration er WHERE er.event.id = :eventId")
    void deleteByEventId(@Param("eventId") Long eventId);
}
