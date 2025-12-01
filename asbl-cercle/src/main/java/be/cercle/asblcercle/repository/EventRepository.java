package be.cercle.asblcercle.repository;

import be.cercle.asblcercle.entity.Event;
import be.cercle.asblcercle.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface EventRepository extends JpaRepository<Event, Long> {

    // pour la partie publique : événements visibles et futurs
    List<Event> findByStatusAndStartDateTimeAfterOrderByStartDateTimeAsc(
            EventStatus status,
            LocalDateTime now
    );
}
