package be.cercle.asblcercle.repository;

import be.cercle.asblcercle.entity.GarderieReservation;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface GarderieReservationRepository extends JpaRepository<GarderieReservation, Long> {

    List<GarderieReservation> findByUserId(Long userId);
}