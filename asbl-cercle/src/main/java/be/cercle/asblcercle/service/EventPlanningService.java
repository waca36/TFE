package be.cercle.asblcercle.service;

import be.cercle.asblcercle.entity.*;
import be.cercle.asblcercle.repository.EspaceRepository;
import be.cercle.asblcercle.repository.EventRepository;
import be.cercle.asblcercle.repository.ReservationRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.time.LocalDateTime;

@Service
@Transactional
public class EventPlanningService {

    private final EspaceRepository espaceRepository;
    private final ReservationRepository reservationRepository;
    private final EventRepository eventRepository;

    public EventPlanningService(EspaceRepository espaceRepository,
                                ReservationRepository reservationRepository,
                                EventRepository eventRepository) {
        this.espaceRepository = espaceRepository;
        this.reservationRepository = reservationRepository;
        this.eventRepository = eventRepository;
    }

    public void applyAndValidate(Event event, EventData data, Long excludeEventId) {
        validateDates(data.startDateTime(), data.endDateTime());

        event.setTitle(data.title());
        event.setDescription(data.description());
        event.setStartDateTime(data.startDateTime());
        event.setEndDateTime(data.endDateTime());
        if (data.capacity() == null || data.capacity() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La capacité doit être renseignée et positive");
        }
        event.setCapacity(data.capacity());
        event.setPrice(data.price());
        event.setMinAge(data.minAge());
        event.setMaxAge(data.maxAge());
        if (data.minAge() != null && data.minAge() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'âge minimum doit être positif");
        }
        if (data.maxAge() != null && data.maxAge() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'âge maximum doit être positif");
        }
        if (data.minAge() != null && data.maxAge() != null && data.maxAge() < data.minAge()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "L'âge maximum doit être supérieur ou égal à l'âge minimum");
        }
        if (data.status() != null) {
            event.setStatus(data.status());
        }
        event.setGarderieRequired(data.garderieRequired());

        EventLocationType typeToUse = data.locationType() != null
                ? data.locationType()
                : EventLocationType.EXTERNAL;

        if (typeToUse == EventLocationType.EXISTING_SPACE) {
            if (data.spaceId() == null) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Un espace existant doit être sélectionné");
            }

            Espace espace = espaceRepository.findById(data.spaceId())
                    .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Espace introuvable pour l'événement"));

            if (espace.getStatus() != EspaceStatus.AVAILABLE) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Espace non disponible");
            }

            if (reservationRepository.existsOverlappingReservation(
                    espace.getId(), data.startDateTime(), data.endDateTime())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "L'espace sélectionné est déjà réservé sur ce créneau");
            }

            if (eventRepository.existsOverlappingEventForSpace(
                    espace.getId(), data.startDateTime(), data.endDateTime(), excludeEventId)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Un autre événement occupe déjà cet espace sur ce créneau");
            }

            event.setSpace(espace);
            event.setLocation(espace.getName());
            event.setExternalAddress(null);
            event.setLocationType(EventLocationType.EXISTING_SPACE);
        } else {
            String resolvedAddress = StringUtils.hasText(data.externalAddress())
                    ? data.externalAddress()
                    : (StringUtils.hasText(data.locationLabel()) ? data.locationLabel() : null);

            if (!StringUtils.hasText(resolvedAddress)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Une adresse externe est requise");
            }
            event.setSpace(null);
            event.setExternalAddress(resolvedAddress);
            event.setLocation(resolvedAddress);
            event.setLocationType(EventLocationType.EXTERNAL);
        }

        syncGarderieSession(event, data);
    }

    private void validateDates(LocalDateTime start, LocalDateTime end) {
        LocalDateTime now = LocalDateTime.now();

        if (start.isBefore(now)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de début ne peut pas être dans le passé");
        }

        if (end.isBefore(now)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de fin ne peut pas être dans le passé");
        }

        if (!end.isAfter(start)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "La date de fin doit être après la date de début");
        }
    }

    private void syncGarderieSession(Event event, EventData data) {
        if (!event.isGarderieRequired()) {
            event.setGarderieSession(null);
            return;
        }

        if (data.garderieCapacity() == null || data.garderieCapacity() < 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le nombre de places de la garderie est requis");
        }
        if (data.garderiePrice() == null || data.garderiePrice() < 0) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Le prix de la garderie est requis");
        }

        GarderieSession session = event.getGarderieSession();
        if (session == null) {
            session = new GarderieSession();
        }

        session.setEvent(event);
        session.setTitle("Garderie pour event " + event.getTitle());
        session.setDescription("Garderie associée à l'événement " + event.getTitle());
        session.setSessionDate(event.getStartDateTime().toLocalDate());
        session.setStartTime(event.getStartDateTime().toLocalTime());
        session.setEndTime(event.getEndDateTime().toLocalTime());
        session.setCapacity(data.garderieCapacity());
        session.setPricePerChild(data.garderiePrice());
        session.setStatus(GarderieSessionStatus.OPEN);
        session.setMinAge(data.garderieMinAge());
        session.setMaxAge(data.garderieMaxAge());

        event.setGarderieSession(session);
    }

    public record EventData(
            String title,
            String description,
            LocalDateTime startDateTime,
            LocalDateTime endDateTime,
            Integer capacity,
            Double price,
            Integer minAge,
            Integer maxAge,
            EventStatus status,
            EventLocationType locationType,
            Long spaceId,
            String externalAddress,
            String locationLabel,
            boolean garderieRequired,
            Double garderiePrice,
            Integer garderieCapacity,
            Integer garderieMinAge,
            Integer garderieMaxAge
    ) {
        public static EventData from(be.cercle.asblcercle.web.dto.EventRequestDto dto, EventStatus status) {
            return new EventData(
                    dto.getTitle(),
                    dto.getDescription(),
                    dto.getStartDateTime(),
                    dto.getEndDateTime(),
                    dto.getCapacity(),
                    dto.getPrice(),
                    dto.getMinAge(),
                    dto.getMaxAge(),
                    status,
                    dto.getLocationType(),
                    dto.getSpaceId(),
                    dto.getExternalAddress(),
                    dto.getLocation(),
                    dto.getGarderieRequired() != null && dto.getGarderieRequired(),
                    dto.getGarderiePrice(),
                    dto.getGarderieCapacity(),
                    dto.getGarderieMinAge(),
                    dto.getGarderieMaxAge()
            );
        }

        public static EventData from(be.cercle.asblcercle.web.dto.EventRequest dto) {
            return new EventData(
                    dto.getTitle(),
                    dto.getDescription(),
                    dto.getStartDateTime(),
                    dto.getEndDateTime(),
                    dto.getCapacity(),
                    dto.getPrice(),
                    dto.getMinAge(),
                    dto.getMaxAge(),
                    dto.getStatus(),
                    dto.getLocationType(),
                    dto.getSpaceId(),
                    dto.getExternalAddress(),
                    dto.getLocation(),
                    dto.isGarderieRequired(),
                    dto.getGarderiePrice(),
                    dto.getGarderieCapacity(),
                    dto.getGarderieMinAge(),
                    dto.getGarderieMaxAge()
            );
        }
    }
}
