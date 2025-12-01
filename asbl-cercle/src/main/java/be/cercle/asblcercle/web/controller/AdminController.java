package be.cercle.asblcercle.web.controller;

import be.cercle.asblcercle.entity.Espace;
import be.cercle.asblcercle.repository.EspaceRepository;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin(origins = "*")
public class AdminController {

    private final EspaceRepository espaceRepository;

    public AdminController(EspaceRepository espaceRepository) {
        this.espaceRepository = espaceRepository;
    }

    // Liste de tous les espaces
    @GetMapping("/espaces")
    public List<Espace> getAllEspaces() {
        return espaceRepository.findAll();
    }

    // Récupérer un espace précis
    @GetMapping("/espaces/{id}")
    public Espace getEspace(@PathVariable Long id) {
        return espaceRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Espace not found"));
    }

    // Créer un nouvel espace
    @PostMapping("/espaces")
    public Espace createEspace(@RequestBody Espace e) {
        return espaceRepository.save(e);
    }

    // Modifier un espace
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

    // Supprimer un espace
    @DeleteMapping("/espaces/{id}")
    public void deleteEspace(@PathVariable Long id) {
        espaceRepository.deleteById(id);
    }
}
