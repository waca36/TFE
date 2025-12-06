package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.entity.*;
import be.cercle.asblcercle.repository.EspaceRepository;
import be.cercle.asblcercle.repository.ReservationRepository;
import be.cercle.asblcercle.repository.UserRepository;
import be.cercle.asblcercle.web.dto.AuditoriumReservationRequest;
import be.cercle.asblcercle.web.dto.CalendarReservationDto;
import be.cercle.asblcercle.web.dto.CreateReservationRequest;
import be.cercle.asblcercle.web.dto.PayReservationRequest;
import be.cercle.asblcercle.web.dto.ReservationResponseDto;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
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
@CrossOrigin(origins = "*")
public class ReservationController {

    private final ReservationRepository reservationRepository;
    private final UserRepository userRepository;
    private final EspaceRepository espaceRepository;

    public ReservationController(ReservationRepository reservationRepository,
                                 UserRepository userRepository,
                                 EspaceRepository espaceRepository) {
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
        this.espaceRepository = espaceRepository;
    }

    // Endpoint pour réserver une SALLE (avec paiement immédiat)
    @PostMapping
    public ReservationResponseDto create(
            @Valid @RequestBody CreateReservationRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté");
        }

        // Récupérer l'espace
        Espace espace = espaceRepository.findById(request.getEspaceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espace introuvable"));

        // Vérifier que ce n'est PAS un auditoire (les auditoires passent par /auditorium)
        if (espace.getType() == EspaceType.AUDITOIRE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Les auditoires doivent être réservés via l'endpoint /auditorium");
        }

        // Vérifier le paiement Stripe
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(request.getPaymentIntentId());
            if (!"succeeded".equals(paymentIntent.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paiement non validé");
            }
        } catch (StripeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erreur vérification paiement: " + e.getMessage());
        }

        // Récupérer l'utilisateur connecté
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        if (espace.getStatus() != EspaceStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Espace non disponible");
        }

        // Vérifier qu'il n'y a pas de chevauchement
        boolean hasOverlap = reservationRepository.existsOverlappingReservation(
                request.getEspaceId(),
                request.getStartDateTime(),
                request.getEndDateTime()
        );

        if (hasOverlap) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Cet espace est déjà réservé pour cette période. Veuillez choisir un autre créneau.");
        }

        // Créer la réservation CONFIRMÉE
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

    // Endpoint pour demander la réservation d'un AUDITOIRE (sans paiement, en attente d'approbation)
    @PostMapping("/auditorium")
    public ReservationResponseDto requestAuditoriumReservation(
            @Valid @RequestBody AuditoriumReservationRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté");
        }

        // Récupérer l'espace
        Espace espace = espaceRepository.findById(request.getEspaceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espace introuvable"));

        // Vérifier que c'est bien un auditoire
        if (espace.getType() != EspaceType.AUDITOIRE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Cet espace n'est pas un auditoire. Utilisez l'endpoint standard pour les salles.");
        }

        // Récupérer l'utilisateur connecté
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        if (espace.getStatus() != EspaceStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Espace non disponible");
        }

        // Vérifier qu'il n'y a pas de chevauchement
        boolean hasOverlap = reservationRepository.existsOverlappingReservation(
                request.getEspaceId(),
                request.getStartDateTime(),
                request.getEndDateTime()
        );

        if (hasOverlap) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                "Cet espace est déjà réservé pour cette période. Veuillez choisir un autre créneau.");
        }

        // Créer la demande de réservation EN ATTENTE D'APPROBATION (sans paiement)
        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setEspace(espace);
        reservation.setStartDateTime(request.getStartDateTime());
        reservation.setEndDateTime(request.getEndDateTime());
        reservation.setTotalPrice(request.getTotalPrice());
        reservation.setJustification(request.getJustification());
        reservation.setStatus(ReservationStatus.PENDING_APPROVAL);
        // Pas de paymentIntentId car le paiement sera fait après approbation

        Reservation saved = reservationRepository.save(reservation);
        return ReservationResponseDto.fromEntity(saved);
    }

    // Endpoint pour payer une réservation APPROUVÉE
    @PostMapping("/{id}/pay")
    public ReservationResponseDto payApprovedReservation(
            @PathVariable Long id,
            @Valid @RequestBody PayReservationRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable"));

        // Vérifier que c'est bien la réservation de l'utilisateur
        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous ne pouvez pas payer cette réservation");
        }

        // Vérifier que la réservation est bien APPROVED (en attente de paiement)
        if (reservation.getStatus() != ReservationStatus.APPROVED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                "Cette réservation n'est pas en attente de paiement. Statut actuel: " + reservation.getStatus());
        }

        // Vérifier le paiement Stripe
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(request.getPaymentIntentId());
            if (!"succeeded".equals(paymentIntent.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paiement non validé");
            }
        } catch (StripeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erreur vérification paiement: " + e.getMessage());
        }

        // Confirmer la réservation
        reservation.setPaymentIntentId(request.getPaymentIntentId());
        reservation.setStatus(ReservationStatus.CONFIRMED);

        Reservation saved = reservationRepository.save(reservation);
        return ReservationResponseDto.fromEntity(saved);
    }

    @GetMapping("/me")
    public List<ReservationResponseDto> getMyReservations(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté");
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
        if (authentication == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté");
        }

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Utilisateur introuvable"));

        List<Reservation> reservations = reservationRepository.findByUser(user);
        return reservations.stream()
                .map(ReservationResponseDto::fromEntity)
                .collect(Collectors.toList());
    }

    // Endpoint pour vérifier la disponibilité d'un créneau
    @GetMapping("/check-availability")
    public boolean checkAvailability(
            @RequestParam Long espaceId,
            @RequestParam String startDateTime,
            @RequestParam String endDateTime
    ) {
        return !reservationRepository.existsOverlappingReservation(
                espaceId,
                java.time.LocalDateTime.parse(startDateTime),
                java.time.LocalDateTime.parse(endDateTime)
        );
    }

    // Récupérer les réservations d'un espace pour un mois donné (pour le calendrier)
    @GetMapping("/espace/{espaceId}/calendar")
    public List<CalendarReservationDto> getReservationsForCalendar(
            @PathVariable Long espaceId,
            @RequestParam int year,
            @RequestParam int month
    ) {
        // Vérifier que l'espace existe
        espaceRepository.findById(espaceId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espace introuvable"));

        // Calculer le début et la fin du mois
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

    // Annuler une réservation
    @DeleteMapping("/{id}/cancel")
    public void cancelReservation(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable"));

        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous ne pouvez pas annuler cette réservation");
        }

        if (reservation.getStartDateTime().isBefore(java.time.LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La réservation est déjà passée");
        }

        if (reservation.getStatus() == ReservationStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cette réservation est déjà annulée");
        }

        reservation.setStatus(ReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }
}
