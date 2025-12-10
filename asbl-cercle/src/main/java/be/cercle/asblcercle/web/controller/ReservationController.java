package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.config.PaymentVerifier;
import be.cercle.asblcercle.entity.*;
import be.cercle.asblcercle.repository.EspaceRepository;
import be.cercle.asblcercle.repository.ReservationRepository;
import be.cercle.asblcercle.repository.UserRepository;
import be.cercle.asblcercle.web.dto.AuditoriumReservationRequest;
import be.cercle.asblcercle.web.dto.CalendarReservationDto;
import be.cercle.asblcercle.web.dto.CreateReservationRequest;
import be.cercle.asblcercle.web.dto.PayReservationRequest;
import be.cercle.asblcercle.web.dto.ReservationResponseDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/public/reservations")
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final EspaceRepository espaceRepository;
    private final PaymentVerifier paymentVerifier;

    public ReservationController(ReservationRepository reservationRepository,
                                 UserRepository userRepository,
                                 EspaceRepository espaceRepository,
                                 PaymentVerifier paymentVerifier) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.espaceRepository = espaceRepository;
        this.paymentVerifier = paymentVerifier;
    }

    @PostMapping
    public ReservationResponseDto create(
            @Valid @RequestBody CreateReservationRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connectÃ©");
        }

        Espace espace = espaceRepository.findById(request.getEspaceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espace introuvable"));

        if (espace.getType() == EspaceType.AUDITOIRE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Les auditoires doivent Ãªtre rÃ©servÃ©s via l'endpoint /auditorium");
        }

        paymentVerifier.verifyPayment(request.getPaymentIntentId());

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        if (espace.getStatus() != EspaceStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Espace non disponible");
        }

        boolean hasOverlap = reservationRepository.existsOverlappingReservation(
                request.getEspaceId(),
                request.getStartDateTime(),
                request.getEndDateTime()
        );

        if (hasOverlap) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Cet espace est dÃ©jÃ  rÃ©servÃ© pour cette pÃ©riode. Veuillez choisir un autre crÃ©neau.");
        }

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setEspace(espace);
        reservation.setStartDateTime(request.getStartDateTime());
        reservation.setEndDateTime(request.getEndDateTime());
        reservation.setTotalPrice(request.getTotalPrice());
        reservation.setPaymentIntentId(request.getPaymentIntentId());
        reservation.setStatus(ReservationStatus.CONFIRMED);

        Reservation saved = reservationRepository.save(reservation);
        return ReservationResponseDto.fromEntity(saved);
    }

    @PostMapping("/auditorium")
    public ReservationResponseDto requestAuditoriumReservation(
            @Valid @RequestBody AuditoriumReservationRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connectÃ©");
        }

        Espace espace = espaceRepository.findById(request.getEspaceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espace introuvable"));

        if (espace.getType() != EspaceType.AUDITOIRE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Cet espace n'est pas un auditoire. Utilisez l'endpoint standard pour les salles.");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        if (espace.getStatus() != EspaceStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Espace non disponible");
        }

        boolean hasOverlap = reservationRepository.existsOverlappingReservation(
                request.getEspaceId(),
                request.getStartDateTime(),
                request.getEndDateTime()
        );

        if (hasOverlap) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Cet espace est dÃ©jÃ  rÃ©servÃ© pour cette pÃ©riode. Veuillez choisir un autre crÃ©neau.");
        }

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setEspace(espace);
        reservation.setStartDateTime(request.getStartDateTime());
        reservation.setEndDateTime(request.getEndDateTime());
        reservation.setTotalPrice(request.getTotalPrice());
        reservation.setJustification(request.getJustification());
        reservation.setStatus(ReservationStatus.PENDING_APPROVAL);

        Reservation saved = reservationRepository.save(reservation);
        return ReservationResponseDto.fromEntity(saved);
    }

    @PostMapping("/{id}/pay")
    public ReservationResponseDto payApprovedReservation(
            @PathVariable Long id,
            @Valid @RequestBody PayReservationRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connectÃ©");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "RÃ©servation introuvable"));

        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous ne pouvez pas payer cette rÃ©servation");
        }

        if (reservation.getStatus() != ReservationStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Cette rÃ©servation n'est pas en attente de paiement. Statut actuel: " + reservation.getStatus());
        }

        paymentVerifier.verifyPayment(request.getPaymentIntentId());

        reservation.setPaymentIntentId(request.getPaymentIntentId());
        reservation.setStatus(ReservationStatus.CONFIRMED);

        Reservation saved = reservationRepository.save(reservation);
        return ReservationResponseDto.fromEntity(saved);
    }

    @GetMapping("/me")
    public List<ReservationResponseDto> getMyReservations(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connectÃ©");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        List<Reservation> reservations = reservationRepository.findByUser(user);
        return reservations.stream()
                .map(ReservationResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    @GetMapping("/user/{userId}")
    public List<ReservationResponseDto> getByUser(@PathVariable Long userId, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connectÇ¸");
        }

        User requester = userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        if (!requester.getId().equals(userId) && requester.getRole() != Role.ADMIN) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Accès refusé");
        }

        List<Reservation> reservations = reservationRepository.findByUser(user);
        return reservations.stream()
                .map(ReservationResponseDto::fromEntity)
                .collect(Collectors.toList());
    }
@GetMapping("/check-availability")
    public boolean checkAvailability(
            @RequestParam Long espaceId,
            @RequestParam String startDateTime,
            @RequestParam String endDateTime
    ) {
        return !reservationRepository.existsOverlappingReservation(
                espaceId,
                LocalDateTime.parse(startDateTime),
                LocalDateTime.parse(endDateTime)
        );
    }

    @GetMapping("/espace/{espaceId}/calendar")
    public List<CalendarReservationDto> getReservationsForCalendar(
            @PathVariable Long espaceId,
            @RequestParam int year,
            @RequestParam int month
    ) {
        espaceRepository.findById(espaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espace introuvable"));

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDateTime startOfMonth = yearMonth.atDay(1).atStartOfDay();
        LocalDateTime endOfMonth = yearMonth.atEndOfMonth().atTime(23, 59, 59);

        List<Reservation> reservations = reservationRepository.findByEspaceAndPeriod(
                espaceId, startOfMonth, endOfMonth
        );

        return reservations.stream()
                .map(CalendarReservationDto::fromEntity)
                .collect(Collectors.toList());
    }

    @DeleteMapping("/{id}/cancel")
    public void cancelReservation(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connectÃ©");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "RÃ©servation introuvable"));

        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous ne pouvez pas annuler cette rÃ©servation");
        }

        if (reservation.getStartDateTime().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La rÃ©servation est dÃ©jÃ  passÃ©e");
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cette rÃ©servation est dÃ©jÃ  annulÃ©e");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }
}


