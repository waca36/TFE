package be.cercle.asblcercle.repository;

import be.cercle.asblcercle.entity.Reservation;
import be.cercle.asblcercle.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    List<Reservation> findByUser(User user);
}
