package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.entity.GarderieSession;
import be.cercle.asblcercle.repository.GarderieSessionRepository;
import be.cercle.asblcercle.web.dto.GarderieSessionRequest;
import be.cercle.asblcercle.web.dto.GarderieSessionResponseDto;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/garderie")
@CrossOrigin(origins = "*")
public class AdminGarderieController {

    private final GarderieSessionRepository sessionRepository;

    public AdminGarderieController(GarderieSessionRepository sessionRepository) {
        this.sessionRepository = sessionRepository;
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
    public void deleteSession(@PathVariable Long id) {
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
