package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.config.PaymentVerifier;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
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
    private final PaymentVerifier paymentVerifier;

    public PaymentController(EventRepository eventRepository,
                             EspaceRepository espaceRepository,
                             GarderieSessionRepository garderieSessionRepository,
                             ReservationRepository reservationRepository,
                             PaymentVerifier paymentVerifier) {
        this.eventRepository = eventRepository;
        this.espaceRepository = espaceRepository;
        this.garderieSessionRepository = garderieSessionRepository;
        this.reservationRepository = reservationRepository;
        this.paymentVerifier = paymentVerifier;
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
            if (request.getEspaceId() != null) {
                paramsBuilder.putMetadata("espaceId", String.valueOf(request.getEspaceId()));
            }
            if (request.getSessionId() != null) {
                paramsBuilder.putMetadata("sessionId", String.valueOf(request.getSessionId()));
            }
            if (request.getNumberOfChildren() != null) {
                paramsBuilder.putMetadata("numberOfChildren", String.valueOf(request.getNumberOfChildren()));
            }
            if (request.getNumberOfParticipants() != null) {
                paramsBuilder.putMetadata("numberOfParticipants", String.valueOf(request.getNumberOfParticipants()));
            }

            PaymentIntent paymentIntent = PaymentIntent.create(paramsBuilder.build());

            return ResponseEntity.ok(new PaymentResponse(paymentIntent.getClientSecret(), publicKey));
        } catch (StripeException e) {
            return ResponseEntity.badRequest().build();
        }
    }

    private Long calculateServerSideAmount(PaymentRequest request) {
        String type = request.getReservationType();

        if ("EVENT".equalsIgnoreCase(type) && request.getEventId() != null) {
            Event event = eventRepository.findById(request.getEventId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Evenement introuvable"));
            Double price = event.getPrice() != null ? event.getPrice() : 0.0;
            int participants = request.getNumberOfParticipants() != null ? request.getNumberOfParticipants() : 1;
            double eventTotal = price * participants;

            // Add childcare price if applicable
            double garderieTotal = 0.0;
            if (request.getNumberOfChildren() != null && request.getNumberOfChildren() > 0) {
                GarderieSession session = event.getGarderieSession();
                if (session != null) {
                    garderieTotal = session.getPricePerChild() * request.getNumberOfChildren();
                }
            }

            return Math.round((eventTotal + garderieTotal) * 100);
        }

        if ("GARDERIE".equalsIgnoreCase(type) && request.getSessionId() != null) {
            GarderieSession session = garderieSessionRepository.findById(request.getSessionId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Session introuvable"));
            int children = request.getNumberOfChildren() != null ? request.getNumberOfChildren() : 1;
            return Math.round(session.getPricePerChild() * children * 100);
        }

        if ("SPACE".equalsIgnoreCase(type) || "ESPACE".equalsIgnoreCase(type) || "AUDITORIUM".equalsIgnoreCase(type) || "AUDITOIRE".equalsIgnoreCase(type)) {
            if (request.getReservationId() != null) {
                Reservation reservation = reservationRepository.findById(request.getReservationId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Reservation introuvable"));
                return Math.round(reservation.getTotalPrice() * 100);
            }

            if (request.getEspaceId() != null) {
                Espace espace = espaceRepository.findById(request.getEspaceId())
                        .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espace introuvable"));
                double hours = request.getHours() != null ? Math.max(1.0, request.getHours()) : 1.0;
                return Math.round(espace.getBasePrice() * hours * 100);
            }
        }

        throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Type de reservation invalide ou donnees manquantes");
    }

    @GetMapping("/verify/{paymentIntentId}")
    public ResponseEntity<Map<String, Object>> verifyPayment(@PathVariable String paymentIntentId) {
        Map<String, Object> response = new HashMap<>();
        if (paymentVerifier != null) {
            try {
                paymentVerifier.verifyPayment(paymentIntentId);
                response.put("status", "succeeded");
                response.put("success", true);
                response.put("paymentIntentId", paymentIntentId);
                return ResponseEntity.ok(response);
            } catch (ResponseStatusException e) {
                response.put("status", "failed");
                response.put("success", false);
                response.put("error", e.getReason());
                return ResponseEntity.status(e.getStatusCode()).body(response);
            }
        }

        try {
            PaymentIntent paymentIntent = PaymentIntent.retrieve(paymentIntentId);

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
