package be.cercle.asblcercle.repository;

import be.cercle.asblcercle.entity.Event;
import be.cercle.asblcercle.entity.EventStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EventRepository extends JpaRepository<Event, Long> {

    // Événements publiés et futurs (pour le public)
    List<Event> findByStatusAndStartDateTimeAfterOrderByStartDateTimeAsc(EventStatus status, LocalDateTime dateTime);

    // Événements en attente de validation (pour admin)
    List<Event> findByStatusOrderByCreatedAtDesc(EventStatus status);

    // Événements créés par un utilisateur (pour organisateur)
    List<Event> findByCreatedByIdOrderByCreatedAtDesc(Long userId);

    // Tous les événements triés par date de création (pour admin)
    List<Event> findAllByOrderByCreatedAtDesc();
}
