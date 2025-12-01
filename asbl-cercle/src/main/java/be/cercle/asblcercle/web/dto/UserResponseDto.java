package be.cercle.asblcercle.web.dto;

import be.cercle.asblcercle.entity.Role;
import be.cercle.asblcercle.entity.User;
import be.cercle.asblcercle.entity.UserStatus;

import java.time.LocalDateTime;

public class UserResponseDto {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private Role role;
    private UserStatus status;
    private LocalDateTime createdAt;

    public static UserResponseDto fromEntity(User user) {
        UserResponseDto dto = new UserResponseDto();
        dto.id = user.getId();
        dto.firstName = user.getFirstName();
        dto.lastName = user.getLastName();
        dto.email = user.getEmail();
        dto.role = user.getRole();
        dto.status = user.getStatus();
        dto.createdAt = user.getCreatedAt();
        return dto;
    }

    // Getters uniquement (pas besoin de setters pour la réponse)
    public Long getId() { return id; }
    public String getFirstName() { return firstName; }
    public String getLastName() { return lastName; }
    public String getEmail() { return email; }
    public Role getRole() { return role; }
    public UserStatus getStatus() { return status; }
    public LocalDateTime getCreatedAt() { return createdAt; }
}
