package be.cercle.asblcercle.service;

import be.cercle.asblcercle.entity.Reservation;
import be.cercle.asblcercle.web.dto.CreateReservationRequest;

import java.util.List;

public interface ReservationService {

    Reservation createReservation(CreateReservationRequest request);

    List<Reservation> getReservationsByUser(Long userId);
}
