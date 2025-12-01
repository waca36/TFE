package be.cercle.asblcercle.service.impl;

import be.cercle.asblcercle.entity.Espace;
import be.cercle.asblcercle.entity.Reservation;
import be.cercle.asblcercle.entity.User;
import be.cercle.asblcercle.repository.EspaceRepository;
import be.cercle.asblcercle.repository.ReservationRepository;
import be.cercle.asblcercle.repository.UserRepository;
import be.cercle.asblcercle.service.ReservationService;
import be.cercle.asblcercle.web.dto.CreateReservationRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final EspaceRepository espaceRepository;

    public ReservationServiceImpl(ReservationRepository reservationRepository,
                                  UserRepository userRepository,
                                  EspaceRepository espaceRepository) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.espaceRepository = espaceRepository;
    }

    @Override
    public Reservation createReservation(CreateReservationRequest request) {
        User user = userRepository.findById(request.getUserId())
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Espace espace = espaceRepository.findById(request.getEspaceId())
                .orElseThrow(() -> new IllegalArgumentException("Espace not found"));

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setEspace(espace);
        reservation.setStartDateTime(request.getStartDateTime());
        reservation.setEndDateTime(request.getEndDateTime());
        reservation.setTotalPrice(request.getTotalPrice());

        return reservationRepository.save(reservation);
    }

    @Override
    public List<Reservation> getReservationsByUser(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return reservationRepository.findByUser(user);
    }
}
