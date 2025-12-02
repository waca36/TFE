package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.web.dto.PaymentRequest;
import be.cercle.asblcercle.web.dto.PaymentResponse;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import com.stripe.param.PaymentIntentCreateParams;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = "*")
public class PaymentController {

    @Value("${stripe.public-key}")
    private String publicKey;

    @PostMapping("/create-payment-intent")
    public ResponseEntity<PaymentResponse> createPaymentIntent(@RequestBody PaymentRequest request) {
        try {
            PaymentIntentCreateParams.Builder paramsBuilder = PaymentIntentCreateParams.builder()
                    .setAmount(request.getAmount())
                    .setCurrency(request.getCurrency() != null ? request.getCurrency() : "eur")
                    .setDescription(request.getDescription())
                    .putMetadata("reservationType", request.getReservationType());

            // reservationId est optionnel maintenant (car la réservation n'existe pas encore)
            if (request.getReservationId() != null) {
                paramsBuilder.putMetadata("reservationId", String.valueOf(request.getReservationId()));
            }

            // Ajouter les métadonnées pour identifier la session/event
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