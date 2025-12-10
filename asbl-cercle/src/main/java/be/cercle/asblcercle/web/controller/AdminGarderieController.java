package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.entity.GarderieSession;
import be.cercle.asblcercle.repository.GarderieSessionRepository;
import be.cercle.asblcercle.repository.GarderieReservationRepository;
import be.cercle.asblcercle.web.dto.GarderieSessionRequest;
import be.cercle.asblcercle.web.dto.GarderieSessionResponseDto;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@RestController
@RequestMapping("/api/admin/garderie")
public class AdminGarderieController {

    private final GarderieSessionRepository sessionRepository;
    private final GarderieReservationRepository reservationRepository;

    public AdminGarderieController(GarderieSessionRepository sessionRepository,
                                   GarderieReservationRepository reservationRepository) {
        this.sessionRepository = sessionRepository;
        this.reservationRepository = reservationRepository;
    }

    @GetMapping("/sessions")
    public List<GarderieSessionResponseDto> listSessions() {
        return sessionRepository.findAll()
                .stream()
                .map(GarderieSessionResponseDto::fromEntity)
                .toList();
    }

    @PostMapping("/sessions")
    public GarderieSessionResponseDto createSession(@Valid @RequestBody GarderieSessionRequest request) {
        GarderieSession s = new GarderieSession();
        apply(request, s);
        GarderieSession saved = sessionRepository.save(s);
        return GarderieSessionResponseDto.fromEntity(saved);
    }

    @GetMapping("/sessions/{id}")
    public GarderieSessionResponseDto getSession(@PathVariable Long id) {
        GarderieSession s = sessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));
        return GarderieSessionResponseDto.fromEntity(s);
    }

    @PutMapping("/sessions/{id}")
    public GarderieSessionResponseDto updateSession(
            @PathVariable Long id,
            @Valid @RequestBody GarderieSessionRequest request
    ) {
        GarderieSession s = sessionRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Session not found"));

        apply(request, s);
        GarderieSession saved = sessionRepository.save(s);
        return GarderieSessionResponseDto.fromEntity(saved);
    }

    @DeleteMapping("/sessions/{id}")
    @Transactional
    public void deleteSession(@PathVariable Long id) {
        reservationRepository.deleteBySessionId(id);
        sessionRepository.deleteById(id);
    }

    private void apply(GarderieSessionRequest r, GarderieSession s) {
        s.setTitle(r.getTitle());
        s.setDescription(r.getDescription());
        s.setSessionDate(r.getSessionDate());
        s.setStartTime(r.getStartTime());
        s.setEndTime(r.getEndTime());
        s.setCapacity(r.getCapacity());
        s.setPricePerChild(r.getPricePerChild());
        s.setStatus(r.getStatus());
    }
}
