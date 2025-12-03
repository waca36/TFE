package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.entity.EventRegistrationStatus;
import be.cercle.asblcercle.entity.GarderieReservationStatus;
import be.cercle.asblcercle.entity.ReservationStatus;
import be.cercle.asblcercle.repository.*;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/admin/stats")
@CrossOrigin(origins = "*")
public class AdminStatsController {

    private final UserRepository userRepository;
    private final EspaceRepository espaceRepository;
    private final EventRepository eventRepository;
    private final GarderieSessionRepository garderieSessionRepository;
    private final ReservationRepository reservationRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final GarderieReservationRepository garderieReservationRepository;

    public AdminStatsController(
            UserRepository userRepository,
            EspaceRepository espaceRepository,
            EventRepository eventRepository,
            GarderieSessionRepository garderieSessionRepository,
            ReservationRepository reservationRepository,
            EventRegistrationRepository eventRegistrationRepository,
            GarderieReservationRepository garderieReservationRepository
    ) {
        this.userRepository = userRepository;
        this.espaceRepository = espaceRepository;
        this.eventRepository = eventRepository;
        this.garderieSessionRepository = garderieSessionRepository;
        this.reservationRepository = reservationRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.garderieReservationRepository = garderieReservationRepository;
    }

    @GetMapping
    public Map<String, Object> getStats() {
        Map<String, Object> stats = new HashMap<>();

        // Totaux
        stats.put("totalUsers", userRepository.count());
        stats.put("totalEspaces", espaceRepository.count());
        stats.put("totalEvents", eventRepository.count());
        stats.put("totalGarderieSessions", garderieSessionRepository.count());

        // Réservations espaces
        long confirmedSpaceRes = reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .count();
        long cancelledSpaceRes = reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == ReservationStatus.CANCELLED)
                .count();
        double spaceRevenue = reservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == ReservationStatus.CONFIRMED)
                .mapToDouble(r -> r.getTotalPrice() != null ? r.getTotalPrice() : 0)
                .sum();

        stats.put("confirmedSpaceReservations", confirmedSpaceRes);
        stats.put("cancelledSpaceReservations", cancelledSpaceRes);
        stats.put("spaceRevenue", spaceRevenue);

        // Inscriptions événements
        long confirmedEventRes = eventRegistrationRepository.findAll().stream()
                .filter(r -> r.getStatus() == EventRegistrationStatus.CONFIRMED)
                .count();
        long cancelledEventRes = eventRegistrationRepository.findAll().stream()
                .filter(r -> r.getStatus() == EventRegistrationStatus.CANCELLED)
                .count();
        double eventRevenue = eventRegistrationRepository.findAll().stream()
                .filter(r -> r.getStatus() == EventRegistrationStatus.CONFIRMED)
                .mapToDouble(r -> r.getTotalPrice() != null ? r.getTotalPrice() : 0)
                .sum();

        stats.put("confirmedEventRegistrations", confirmedEventRes);
        stats.put("cancelledEventRegistrations", cancelledEventRes);
        stats.put("eventRevenue", eventRevenue);

        // Réservations garderie
        long confirmedGarderieRes = garderieReservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == GarderieReservationStatus.CONFIRMED)
                .count();
        long cancelledGarderieRes = garderieReservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == GarderieReservationStatus.CANCELLED)
                .count();
        double garderieRevenue = garderieReservationRepository.findAll().stream()
                .filter(r -> r.getStatus() == GarderieReservationStatus.CONFIRMED)
                .mapToDouble(r -> r.getTotalPrice() != null ? r.getTotalPrice() : 0)
                .sum();

        stats.put("confirmedGarderieReservations", confirmedGarderieRes);
        stats.put("cancelledGarderieReservations", cancelledGarderieRes);
        stats.put("garderieRevenue", garderieRevenue);

        // Total revenus
        stats.put("totalRevenue", spaceRevenue + eventRevenue + garderieRevenue);

        return stats;
    }
}
