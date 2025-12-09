package be.cercle.asblcercle.repository;

import be.cercle.asblcercle.entity.GarderieSession;
import be.cercle.asblcercle.entity.GarderieSessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;

public interface GarderieSessionRepository extends JpaRepository<GarderieSession, Long> {

    List<GarderieSession> findByStatusAndSessionDateGreaterThanEqualOrderBySessionDateAsc(
            GarderieSessionStatus status,
            LocalDate date
    );
}
