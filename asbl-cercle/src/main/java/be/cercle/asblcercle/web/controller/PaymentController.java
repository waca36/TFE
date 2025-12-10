package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.entity.Event;
import be.cercle.asblcercle.entity.Espace;
import be.cercle.asblcercle.entity.GarderieSession;
import be.cercle.asblcercle.entity.Reservation;
import be.cercle.asblcercle.repository.EventRepository;
import be.cercle.asblcercle.repository.EspaceRepository;
import be.cercle.asblcercle.repository.GarderieSessionRepository;
import be.cercle.asblcercle.repository.ReservationRepository;
import be.cercle.asblcercle.web.dto.PaymentRequest;
import be.cercle.asblcercle.web.dto.PaymentResponse;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Value("${stripe.public-key}")
    private String publicKey;

    private final EventRepository eventRepository;
    private final EspaceRepository espaceRepository;
    private final GarderieSessionRepository garderieSessionRepository;
    private final ReservationRepository reservationRepository;

    public PaymentController(EventRepository eventRepository,
                            EspaceRepository espaceRepository,
                            GarderieSessionRepository garderieSessionRepository,
                            ReservationRepository reservationRepository) {
        this.eventRepository = eventRepository;
        this.espaceRepository = espaceRepository;
        this.garderieSessionRepository = garderieSessionRepository;
        this.reservationRepository = reservationRepository;
    }

    @PostMapping("/create-payment-intent")
    public ResponseEntity<PaymentResponse> createPaymentIntent(@RequestBody PaymentRequest request) {
        try {
            Long calculatedAmount = calculateServerSideAmount(request);

            if (request.getAmount() != null && !request.getAmount().equals(calculatedAmount)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Montant invalide");
            }

            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setAmount(calculatedAmount)
                    .setCurrency(request.getCurrency() != null ? request.getCurrency() : "eur")
                    .setDescription(request.getDescription())
                    .putMetadata("reservationType", request.getReservationType());

            if (request.getReservationId() != null) {
                paramsBuilder.putMetadata("reservationId", String.valueOf(request.getReservationId()));
            }

            if (request.getSessionId() != null) {
                paramsBuilder.putMetadata("sessionId", String.valueOf(request.getSessionId()));
            }
            if (request.getNumberOfChildren() != null) {
                paramsBuilder.putMetadata("numberOfChildren", String.valueOf(request.getNumberOfChildren()));
            }

            PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());

            return ResponseEntity.ok(new PaymentResponse(paymentIntent.getClientSecret(), publicKey));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private Long calculateServerSideAmount(PaymentRequest request) {
        String type = request.getReservationType();

        if ("EVENT".equals(type) && request.getEventId() != null) {
            Event event = eventRepository.findById(request.getEventId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable"));
            Double price = event.getPrice() != null ? event.getPrice() : 0.0;
            return Math.round(price * 100);
        }

        if ("GARDERIE".equals(type) && request.getSessionId() != null) {
            GarderieSession session = garderieSessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session introuvable"));
            int children = request.getNumberOfChildren() != null ? request.getNumberOfChildren() : 1;
            return Math.round(session.getPricePerChild() * children * 100);
        }

        if ("SPACE".equals(type) && request.getReservationId() != null) {
            Reservation reservation = reservationRepository.findById(request.getReservationId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable"));
            Espace espace = reservation.getEspace();
            return Math.round(espace.getBasePrice() * 100);
        }

        if ("AUDITORIUM".equals(type) && request.getReservationId() != null) {
            Reservation reservation = reservationRepository.findById(request.getReservationId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Réservation introuvable"));
            Espace espace = reservation.getEspace();
            return Math.round(espace.getBasePrice() * 100);
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type de réservation invalide ou données manquantes");
    }

    @GetMapping("/verify/{paymentIntentId}")
    public ResponseEntity<Map<String, Object>> verifyPayment(@PathVariable String paymentIntentId) {
        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

            Map<String, Object> response = new HashMap<>();
            response.put("status", paymentIntent.getStatus());
            response.put("success", "succeeded".equals(paymentIntent.getStatus()));
            response.put("paymentIntentId", paymentIntentId);

            return ResponseEntity.ok(response);
        } catch (StripeException e) {
            Map<String, Object> error = new HashMap<>();
            error.put("error", e.getMessage());
            return ResponseEntity.badRequest().body(error);
        }
    }
}
