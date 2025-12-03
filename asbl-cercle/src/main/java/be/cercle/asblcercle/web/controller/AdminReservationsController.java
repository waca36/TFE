package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.entity.*;
import be.cercle.asblcercle.repository.EventRegistrationRepository;
import be.cercle.asblcercle.repository.GarderieReservationRepository;
import be.cercle.asblcercle.repository.ReservationRepository;
import be.cercle.asblcercle.web.dto.AdminReservationDto;
import be.cercle.asblcercle.web.dto.AdminSpaceReservationDto;
import be.cercle.asblcercle.web.dto.AdminEventRegistrationDto;
import be.cercle.asblcercle.web.dto.AdminGarderieReservationDto;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reservations")
@CrossOrigin(origins = "*")
public class AdminReservationsController {

    private final ReservationRepository reservationRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final GarderieReservationRepository garderieReservationRepository;

    public AdminReservationsController(
            ReservationRepository reservationRepository,
            EventRegistrationRepository eventRegistrationRepository,
            GarderieReservationRepository garderieReservationRepository
    ) {
        this.reservationRepository = reservationRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.garderieReservationRepository = garderieReservationRepository;
    }

    // ==================== VUE GLOBALE UNIFIÉE ====================

    @GetMapping("/all")
    public List<AdminReservationDto> getAllReservations() {
        List<AdminReservationDto> allReservations = new ArrayList<>();

        reservationRepository.findAll().forEach(r -> {
            allReservations.add(AdminReservationDto.fromEspaceReservation(r));
        });

        eventRegistrationRepository.findAll().forEach(r -> {
            allReservations.add(AdminReservationDto.fromEventRegistration(r));
        });

        garderieReservationRepository.findAll().forEach(r -> {
            allReservations.add(AdminReservationDto.fromGarderieReservation(r));
        });

        allReservations.sort(Comparator.comparing(AdminReservationDto::getCreatedAt).reversed());

        return allReservations;
    }

    // ==================== ENDPOINTS POUR DASHBOARD ADMIN (DTOs détaillés) ====================

    // Réservations d'espaces (format détaillé pour le dashboard)
    @GetMapping("/spaces")
    public List<AdminSpaceReservationDto> getSpaceReservationsDetailed() {
        return reservationRepository.findAll().stream()
                .map(AdminSpaceReservationDto::fromEntity)
                .sorted(Comparator.comparing(AdminSpaceReservationDto::getCreatedAt).reversed())
                .toList();
    }

    // Inscriptions événements (format détaillé pour le dashboard)
    @GetMapping("/events")
    public List<AdminEventRegistrationDto> getEventRegistrationsDetailed() {
        return eventRegistrationRepository.findAll().stream()
                .map(AdminEventRegistrationDto::fromEntity)
                .sorted(Comparator.comparing(AdminEventRegistrationDto::getCreatedAt).reversed())
                .toList();
    }

    // Réservations garderie (format détaillé pour le dashboard)
    @GetMapping("/childcare")
    public List<AdminGarderieReservationDto> getGarderieReservationsDetailed() {
        return garderieReservationRepository.findAll().stream()
                .map(AdminGarderieReservationDto::fromEntity)
                .sorted(Comparator.comparing(AdminGarderieReservationDto::getCreatedAt).reversed())
                .toList();
    }

    // ==================== ENDPOINTS ALTERNATIFS (format unifié) ====================

    @GetMapping("/espaces")
    public List<AdminReservationDto> getEspaceReservations() {
        return reservationRepository.findAll().stream()
                .map(AdminReservationDto::fromEspaceReservation)
                .sorted(Comparator.comparing(AdminReservationDto::getCreatedAt).reversed())
                .toList();
    }

    @GetMapping("/garderie")
    public List<AdminReservationDto> getGarderieReservations() {
        return garderieReservationRepository.findAll().stream()
                .map(AdminReservationDto::fromGarderieReservation)
                .sorted(Comparator.comparing(AdminReservationDto::getCreatedAt).reversed())
                .toList();
    }
}