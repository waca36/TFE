package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.entity.*;
import be.cercle.asblcercle.repository.GarderieReservationRepository;
import be.cercle.asblcercle.repository.GarderieSessionRepository;
import be.cercle.asblcercle.repository.UserRepository;
import be.cercle.asblcercle.web.dto.GarderieReservationRequest;
import be.cercle.asblcercle.web.dto.GarderieReservationResponseDto;
import be.cercle.asblcercle.web.dto.GarderieSessionResponseDto;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/public/garderie")
@CrossOrigin(origins = "*")
public class GarderieController {

    private final GarderieSessionRepository sessionRepository;
    private final GarderieReservationRepository reservationRepository;
    private final UserRepository userRepository;

    public GarderieController(GarderieSessionRepository sessionRepository,
                              GarderieReservationRepository reservationRepository,
                              UserRepository userRepository) {
        this.sessionRepository = sessionRepository;
        this.reservationRepository = reservationRepository;
        this.userRepository = userRepository;
    }

    // PUBLIC : voir les sessions ouvertes
    @GetMapping("/sessions")
    public List<GarderieSessionResponseDto> listOpenSessions() {
        List<GarderieSession> sessions =
                sessionRepository.findByStatusAndSessionDateGreaterThanEqualOrderBySessionDateAsc(
                        GarderieSessionStatus.OPEN,
                        LocalDate.now()
                );
        return sessions.stream()
                .map(GarderieSessionResponseDto::fromEntity)
                .toList();
    }

    // USER (auth) : créer une réservation APRES paiement validé
    @PostMapping("/reservations")
    public GarderieReservationResponseDto createReservation(
            @Valid @RequestBody GarderieReservationRequest request,
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

        // 2. Récupérer l'utilisateur
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        // 3. Récupérer la session
        GarderieSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session introuvable"));

        if (session.getStatus() != GarderieSessionStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Session non ouverte à la réservation");
        }

        int totalChildren = request.getNumberOfChildren();
        if (totalChildren <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nombre d'enfants invalide");
        }

        double totalPrice = session.getPricePerChild() * totalChildren;

        // 4. Créer la réservation avec statut CONFIRMED
        GarderieReservation reservation = new GarderieReservation();
        reservation.setUser(user);
        reservation.setSession(session);
        reservation.setNumberOfChildren(totalChildren);
        reservation.setTotalPrice(totalPrice);
        reservation.setPaymentIntentId(request.getPaymentIntentId());
        reservation.setStatus(GarderieReservationStatus.CONFIRMED);

        GarderieReservation saved = reservationRepository.save(reservation);
        return GarderieReservationResponseDto.fromEntity(saved);
    }

    // USER (auth) : voir ses réservations garderie
    @GetMapping("/reservations/me")
    public List<GarderieReservationResponseDto> listMyReservations(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        List<GarderieReservation> reservations =
                reservationRepository.findByUserId(user.getId());

        return reservations.stream()
                .map(GarderieReservationResponseDto::fromEntity)
                .toList();
    }
}