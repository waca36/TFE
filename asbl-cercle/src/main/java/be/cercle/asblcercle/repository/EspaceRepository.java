package be.cercle.asblcercle.repository;

import be.cercle.asblcercle.entity.Espace;
import be.cercle.asblcercle.entity.EspaceStatus;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface EspaceRepository extends JpaRepository<Espace, Long> {

    List<Espace> findByStatus(EspaceStatus status);
}
