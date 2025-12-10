package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.entity.*;
import be.cercle.asblcercle.repository.EventRegistrationRepository;
import be.cercle.asblcercle.repository.GarderieReservationRepository;
import be.cercle.asblcercle.repository.ReservationRepository;
import be.cercle.asblcercle.repository.UserRepository;
import be.cercle.asblcercle.web.dto.AdminReservationDto;
import be.cercle.asblcercle.web.dto.AdminSpaceReservationDto;
import be.cercle.asblcercle.web.dto.AdminEventRegistrationDto;
import be.cercle.asblcercle.web.dto.AdminGarderieReservationDto;
import be.cercle.asblcercle.web.dto.ReservationApprovalRequest;
import be.cercle.asblcercle.web.dto.ReservationResponseDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/admin/reservations")
public class AdminReservationsController {

    private final ReservationRepository reservationRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final GarderieReservationRepository garderieReservationRepository;
    private final UserRepository userRepository;

    public AdminReservationsController(
            ReservationRepository reservationRepository,
            EventRegistrationRepository eventRegistrationRepository,
            GarderieReservationRepository garderieReservationRepository,
            UserRepository userRepository
    ) {
        this.reservationRepository = reservationRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.garderieReservationRepository = garderieReservationRepository;
        this.userRepository = userRepository;
    }

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

    @GetMapping("/spaces")
    public List<AdminSpaceReservationDto> getSpaceReservationsDetailed() {
        return reservationRepository.findAll().stream()
                .map(AdminSpaceReservationDto::fromEntity)
                .sorted(Comparator.comparing(AdminSpaceReservationDto::getCreatedAt).reversed())
                .toList();
    }

    @GetMapping("/events")
    public List<AdminEventRegistrationDto> getEventRegistrationsDetailed() {
        return eventRegistrationRepository.findAll().stream()
                .map(AdminEventRegistrationDto::fromEntity)
                .sorted(Comparator.comparing(AdminEventRegistrationDto::getCreatedAt).reversed())
                .toList();
    }

    @GetMapping("/childcare")
    public List<AdminGarderieReservationDto> getGarderieReservationsDetailed() {
        return garderieReservationRepository.findAll().stream()
                .map(AdminGarderieReservationDto::fromEntity)
                .sorted(Comparator.comparing(AdminGarderieReservationDto::getCreatedAt).reversed())
                .toList();
    }

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

    @GetMapping("/pending")
    public List<ReservationResponseDto> getPendingReservations() {
        return reservationRepository.findPendingApproval().stream()
                .map(ReservationResponseDto::fromEntity)
                .toList();
    }

    @GetMapping("/{id}")
    public ReservationResponseDto getReservationById(@PathVariable Long id) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable"));
        return ReservationResponseDto.fromEntity(reservation);
    }

    @PostMapping("/{id}/approve")
    public ReservationResponseDto approveReservation(
            @PathVariable Long id,
            @Valid @RequestBody ReservationApprovalRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté");
        }

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable"));

        if (reservation.getStatus() != ReservationStatus.PENDING_APPROVAL) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Cette réservation n'est pas en attente d'approbation");
        }

        String email = authentication.getName();
        User admin = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Admin introuvable"));

        if (request.getApproved()) {
            reservation.setStatus(ReservationStatus.APPROVED);
            reservation.setApprovedBy(admin);
            reservation.setApprovedAt(LocalDateTime.now());
        } else {
            if (request.getRejectionReason() == null || request.getRejectionReason().trim().isEmpty()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Une raison de rejet est requise");
            }
            reservation.setStatus(ReservationStatus.REJECTED);
            reservation.setRejectionReason(request.getRejectionReason());
            reservation.setApprovedBy(admin);
            reservation.setApprovedAt(LocalDateTime.now());
        }

        Reservation saved = reservationRepository.save(reservation);
        return ReservationResponseDto.fromEntity(saved);
    }
}