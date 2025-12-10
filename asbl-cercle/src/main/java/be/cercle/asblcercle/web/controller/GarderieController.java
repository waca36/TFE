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

    @GetMapping("/sessions")
    public List<GarderieSessionResponseDto> listOpenSessions() {
        List<GarderieSession> sessions =
                sessionRepository.findByStatusAndSessionDateGreaterThanEqualOrderBySessionDateAsc(
                        GarderieSessionStatus.OPEN,
                        LocalDate.now()
                );
        return sessions.stream()
                .map(s -> {
                    Integer registeredCount = reservationRepository.countTotalChildrenBySessionId(s.getId());
                    return GarderieSessionResponseDto.fromEntity(s, registeredCount);
                })
                .toList();
    }

    @PostMapping("/reservations")
    public GarderieReservationResponseDto createReservation(
            @Valid @RequestBody GarderieReservationRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté");
        }

        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(request.getPaymentIntentId());

            if (!"succeeded".equals(paymentIntent.getStatus())) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paiement non validé");
            }
        } catch (StripeException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erreur vérification paiement: " + e.getMessage());
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        GarderieSession session = sessionRepository.findById(request.getSessionId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session introuvable"));

        if (session.getStatus() != GarderieSessionStatus.OPEN) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Session non ouverte à la réservation");
        }

        int totalChildren = request.getNumberOfChildren();
        if (totalChildren <= 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nombre d'enfants invalide");
        }

        Integer currentChildren = reservationRepository.countTotalChildrenBySessionId(session.getId());
        if (currentChildren + totalChildren > session.getCapacity()) {
            int remaining = session.getCapacity() - currentChildren;
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, 
                "Capacité insuffisante. Places restantes : " + remaining);
        }

        double totalPrice = session.getPricePerChild() * totalChildren;

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

    @DeleteMapping("/reservations/{id}/cancel")
    public void cancelReservation(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        GarderieReservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable"));

        if (!reservation.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous ne pouvez pas annuler cette réservation");
        }

        if (reservation.getSession().getSessionDate().isBefore(java.time.LocalDate.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La session est déjà passée");
        }

        if (reservation.getStatus() == GarderieReservationStatus.CANCELLED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cette réservation est déjà annulée");
        }

        reservation.setStatus(GarderieReservationStatus.CANCELLED);
        reservationRepository.save(reservation);
    }
}
