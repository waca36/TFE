package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.entity.*;
import be.cercle.asblcercle.repository.EventRegistrationRepository;
import be.cercle.asblcercle.repository.EventRepository;
import be.cercle.asblcercle.repository.UserRepository;
import be.cercle.asblcercle.web.dto.EventRegistrationRequest;
import be.cercle.asblcercle.web.dto.EventRegistrationResponseDto;
import com.stripe.exception.StripeException;
import com.stripe.model.PaymentIntent;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/public/events")
@CrossOrigin(origins = "*")
public class EventRegistrationController {

    private final EventRegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;

    public EventRegistrationController(
            EventRegistrationRepository registrationRepository,
            EventRepository eventRepository,
            UserRepository userRepository
    ) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
    }

    @PostMapping("/register")
    public EventRegistrationResponseDto register(
            @Valid @RequestBody EventRegistrationRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté");
        }

        // 1. Récupérer l'utilisateur
        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        // 2. Récupérer l'événement
        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable"));

        // 3. Vérifier que l'événement est publié et pas encore passé
        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cet événement n'est pas ouvert aux inscriptions");
        }

        if (event.getStartDateTime().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cet événement est déjà passé");
        }

        // 4. Vérifier si l'utilisateur n'est pas déjà inscrit
        if (registrationRepository.existsByUserAndEvent(user, event)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vous êtes déjà inscrit à cet événement");
        }

        // 5. Vérifier la capacité
        if (event.getCapacity() != null) {
            Integer currentParticipants = registrationRepository.countTotalParticipantsByEventId(event.getId());
            if (currentParticipants + request.getNumberOfParticipants() > event.getCapacity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacité maximale atteinte");
            }
        }

        // 6. Si l'événement est payant, vérifier le paiement
        Double totalPrice = 0.0;
        if (event.getPrice() != null && event.getPrice() > 0) {
            totalPrice = event.getPrice() * request.getNumberOfParticipants();

            if (request.getPaymentIntentId() == null || request.getPaymentIntentId().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paiement requis pour cet événement");
            }

            try {
                PaymentIntent paymentIntent = PaymentIntent.retrieve(request.getPaymentIntentId());
                if (!"succeeded".equals(paymentIntent.getStatus())) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paiement non validé");
                }
            } catch (StripeException e) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Erreur vérification paiement: " + e.getMessage());
            }
        }

        // 7. Créer l'inscription
        EventRegistration registration = new EventRegistration();
        registration.setUser(user);
        registration.setEvent(event);
        registration.setNumberOfParticipants(request.getNumberOfParticipants());
        registration.setTotalPrice(totalPrice);
        registration.setPaymentIntentId(request.getPaymentIntentId());
        registration.setStatus(EventRegistrationStatus.CONFIRMED);

        EventRegistration saved = registrationRepository.save(registration);
        return EventRegistrationResponseDto.fromEntity(saved);
    }

    @GetMapping("/registrations/me")
    public List<EventRegistrationResponseDto> getMyRegistrations(Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        List<EventRegistration> registrations = registrationRepository.findByUserId(user.getId());
        return registrations.stream()
                .map(EventRegistrationResponseDto::fromEntity)
                .toList();
    }

    @DeleteMapping("/registrations/{id}/cancel")
    public void cancelRegistration(@PathVariable Long id, Authentication authentication) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        EventRegistration registration = registrationRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Inscription introuvable"));

        if (!registration.getUser().getId().equals(user.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Vous ne pouvez pas annuler cette inscription");
        }

        if (registration.getEvent().getStartDateTime().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'événement est déjà passé");
        }

        registration.setStatus(EventRegistrationStatus.CANCELLED);
        registrationRepository.save(registration);
    }
}
