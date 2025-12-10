package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.entity.Espace;
import be.cercle.asblcercle.entity.Event;
import be.cercle.asblcercle.repository.EspaceRepository;
import be.cercle.asblcercle.repository.EventRegistrationRepository;
import be.cercle.asblcercle.repository.EventRepository;
import be.cercle.asblcercle.repository.GarderieReservationRepository;
import be.cercle.asblcercle.repository.ReservationRepository;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final EspaceRepository espaceRepository;
    private final ReservationRepository reservationRepository;
    private final EventRepository eventRepository;
    private final EventRegistrationRepository eventRegistrationRepository;
    private final GarderieReservationRepository garderieReservationRepository;

    public AdminController(EspaceRepository espaceRepository,
                           ReservationRepository reservationRepository,
                           EventRepository eventRepository,
                           EventRegistrationRepository eventRegistrationRepository,
                           GarderieReservationRepository garderieReservationRepository) {
        this.espaceRepository = espaceRepository;
        this.reservationRepository = reservationRepository;
        this.eventRepository = eventRepository;
        this.eventRegistrationRepository = eventRegistrationRepository;
        this.garderieReservationRepository = garderieReservationRepository;
    }

    @GetMapping("/espaces")
    public List<Espace> getAllEspaces() {
        return espaceRepository.findAll();
    }

    @GetMapping("/espaces/{id}")
    public Espace getEspace(@PathVariable Long id) {
        return espaceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Espace not found"));
    }

    @PostMapping("/espaces")
    public Espace createEspace(@RequestBody Espace e) {
        return espaceRepository.save(e);
    }

    @PutMapping("/espaces/{id}")
    public Espace updateEspace(@PathVariable Long id, @RequestBody Espace updated) {
        Espace existing = espaceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Espace not found"));

        existing.setName(updated.getName());
        existing.setType(updated.getType());
        existing.setCapacity(updated.getCapacity());
        existing.setBasePrice(updated.getBasePrice());
        existing.setStatus(updated.getStatus());

        return espaceRepository.save(existing);
    }

    @DeleteMapping("/espaces/{id}")
    @Transactional
    public void deleteEspace(@PathVariable Long id) {
        List<Event> eventsWithSpace = eventRepository.findBySpaceId(id);
        for (Event event : eventsWithSpace) {
            if (event.getGarderieSession() != null) {
                garderieReservationRepository.deleteBySessionId(event.getGarderieSession().getId());
            }
            eventRegistrationRepository.deleteByEventId(event.getId());
            eventRepository.delete(event);
        }

        reservationRepository.deleteByEspaceId(id);
        espaceRepository.deleteById(id);
    }
}
