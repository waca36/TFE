package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.entity.*;
import be.cercle.asblcercle.repository.EspaceRepository;
import be.cercle.asblcercle.repository.ReservationRepository;
import be.cercle.asblcercle.repository.UserRepository;
import be.cercle.asblcercle.web.dto.CreateReservationRequest;
import be.cercle.asblcercle.web.dto.ReservationResponseDto;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

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

    @PostMapping
    public ReservationResponseDto create(
            @Valid @RequestBody CreateReservationRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté");
        }

        // 1. Vérifier le paiement Stripe
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(request.getPaymentIntentId());

            if (!"succeeded".equals(paymentIntent.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paiement non validé");
            }
        } catch (StripeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erreur vérification paiement: " + e.getMessage());
        }

        // 2. Récupérer l'utilisateur connecté
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        // 3. Récupérer l'espace
        Espace espace = espaceRepository.findById(request.getEspaceId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espace introuvable"));

        if (espace.getStatus() != EspaceStatus.AVAILABLE) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Espace non disponible");
        }

        // 4. Vérifier qu'il n'y a pas de chevauchement avec une autre réservation
        boolean hasOverlap = reservationRepository.existsOverlappingReservation(
                request.getEspaceId(),
                request.getStartDateTime(),
                request.getEndDateTime()
        );

        if (hasOverlap) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, 
                "Cet espace est déjà réservé pour cette période. Veuillez choisir un autre créneau.");
        }

        // 5. Créer la réservation avec statut CONFIRMED
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
