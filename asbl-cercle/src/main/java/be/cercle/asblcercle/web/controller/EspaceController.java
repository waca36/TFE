package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.entity.Espace;
import be.cercle.asblcercle.entity.EspaceStatus;
import be.cercle.asblcercle.repository.EspaceRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/public/espaces")
@CrossOrigin(origins = "*")
public class EspaceController {

    private final EspaceRepository espaceRepository;

    public EspaceController(EspaceRepository espaceRepository) {
        this.espaceRepository = espaceRepository;
    }

    @GetMapping
    public List<Espace> getAvailableEspaces() {
        return espaceRepository.findByStatus(EspaceStatus.AVAILABLE);
    }

    @PostMapping
    public Espace create(@RequestBody Espace espace) {
        if (espace.getStatus() == null) {
            espace.setStatus(EspaceStatus.AVAILABLE);
        }
        return espaceRepository.save(espace);
    }
}
