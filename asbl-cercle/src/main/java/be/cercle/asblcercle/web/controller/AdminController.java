package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.entity.Espace;
import be.cercle.asblcercle.repository.EspaceRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private final EspaceRepository espaceRepository;

    public AdminController(EspaceRepository espaceRepository) {
        this.espaceRepository = espaceRepository;
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
    public void deleteEspace(@PathVariable Long id) {
        espaceRepository.deleteById(id);
    }
}
