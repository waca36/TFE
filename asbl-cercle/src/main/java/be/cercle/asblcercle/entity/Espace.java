package be.cercle.asblcercle.entity;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;

@Entity
@Table(name = "espace")
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Espace {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 120)
    private String name;

    @Column(length = 50)
    private String type; // ex: SALLE, TERRAIN, LOCAL

    private Integer capacity;

    @Column(nullable = false)
    private Double basePrice;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private EspaceStatus status = EspaceStatus.AVAILABLE;

    // Getters / setters

    public Long getId() { return id; }

    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }

    public void setName(String name) { this.name = name; }

    public String getType() { return type; }

    public void setType(String type) { this.type = type; }

    public Integer getCapacity() { return capacity; }

    public void setCapacity(Integer capacity) { this.capacity = capacity; }

    public Double getBasePrice() { return basePrice; }

    public void setBasePrice(Double basePrice) { this.basePrice = basePrice; }

    public EspaceStatus getStatus() { return status; }

    public void setStatus(EspaceStatus status) { this.status = status; }
}
