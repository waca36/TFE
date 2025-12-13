package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.config.PaymentVerifier;
import be.cercle.asblcercle.entity.*;
import be.cercle.asblcercle.repository.EventRegistrationRepository;
import be.cercle.asblcercle.repository.EventRepository;
import be.cercle.asblcercle.repository.GarderieReservationRepository;
import be.cercle.asblcercle.repository.UserRepository;
import be.cercle.asblcercle.web.dto.EventRegistrationRequest;
import be.cercle.asblcercle.web.dto.EventRegistrationResponseDto;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/public/events")
public class EventRegistrationController {

    private final EventRegistrationRepository registrationRepository;
    private final EventRepository eventRepository;
    private final UserRepository userRepository;
    private final GarderieReservationRepository garderieReservationRepository;
    private final PaymentVerifier paymentVerifier;

    public EventRegistrationController(
            EventRegistrationRepository registrationRepository,
            EventRepository eventRepository,
            UserRepository userRepository,
            GarderieReservationRepository garderieReservationRepository,
            PaymentVerifier paymentVerifier
    ) {
        this.registrationRepository = registrationRepository;
        this.eventRepository = eventRepository;
        this.userRepository = userRepository;
        this.garderieReservationRepository = garderieReservationRepository;
        this.paymentVerifier = paymentVerifier;
    }

    @PostMapping("/register")
    @Transactional
    public EventRegistrationResponseDto register(
            @Valid @RequestBody EventRegistrationRequest request,
            Authentication authentication
    ) {
        if (authentication == null || authentication.getName() == null) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Non connecté");
        }

        String email = authentication.getName();
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Utilisateur introuvable"));

        Event event = eventRepository.findById(request.getEventId())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Événement introuvable"));

        if (event.getStatus() != EventStatus.PUBLISHED) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cet événement n'est pas ouvert aux inscriptions");
        }

        if (event.getStartDateTime().isBefore(LocalDateTime.now())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Cet événement est déjà passé");
        }

        if (registrationRepository.existsByUserAndEventAndStatusNot(user, event, EventRegistrationStatus.CANCELLED)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Vous êtes déjà inscrit à cet événement");
        }

        if (event.getCapacity() != null) {
            Integer currentParticipants = registrationRepository.countTotalParticipantsByEventId(event.getId());
            if (currentParticipants + request.getNumberOfParticipants() > event.getCapacity()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Capacité maximale atteinte");
            }
        }

        GarderieSession garderieSession = event.getGarderieSession();
        int numberOfChildren = 0;
        double garderiePrice = 0.0;

        if (request.isAddChildcare() && garderieSession != null) {
            numberOfChildren = request.getNumberOfChildren() != null ? request.getNumberOfChildren() : 0;
            if (numberOfChildren <= 0) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Nombre d'enfants invalide");
            }

            if (garderieSession.getStatus() != GarderieSessionStatus.OPEN) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La garderie n'est pas disponible pour cet événement");
            }

            Integer currentChildren = garderieReservationRepository.countTotalChildrenBySessionId(garderieSession.getId());
            if (currentChildren == null) currentChildren = 0;
            if (currentChildren + numberOfChildren > garderieSession.getCapacity()) {
                int remaining = garderieSession.getCapacity() - currentChildren;
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                        "Capacité garderie insuffisante. Places restantes : " + remaining);
            }

            garderiePrice = garderieSession.getPricePerChild() * numberOfChildren;
        }

        Double eventPrice = 0.0;
        if (event.getPrice() != null && event.getPrice() > 0) {
            eventPrice = event.getPrice() * request.getNumberOfParticipants();
        }

        Double totalPrice = eventPrice + garderiePrice;

        if (totalPrice > 0) {
            if (request.getPaymentIntentId() == null || request.getPaymentIntentId().isBlank()) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Paiement requis");
            }
            paymentVerifier.verifyPayment(request.getPaymentIntentId());
        }

        EventRegistration registration = new EventRegistration();
        registration.setUser(user);
        registration.setEvent(event);
        registration.setNumberOfParticipants(request.getNumberOfParticipants());
        registration.setTotalPrice(eventPrice);
        registration.setPaymentIntentId(request.getPaymentIntentId());
        registration.setStatus(EventRegistrationStatus.CONFIRMED);

        EventRegistration saved = registrationRepository.save(registration);

        if (request.isAddChildcare() && garderieSession != null && numberOfChildren > 0) {
            GarderieReservation garderieReservation = new GarderieReservation();
            garderieReservation.setUser(user);
            garderieReservation.setSession(garderieSession);
            garderieReservation.setNumberOfChildren(numberOfChildren);
            garderieReservation.setTotalPrice(garderiePrice);
            garderieReservation.setPaymentIntentId(request.getPaymentIntentId());
            garderieReservation.setStatus(GarderieReservationStatus.CONFIRMED);
            garderieReservationRepository.save(garderieReservation);
        }

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
