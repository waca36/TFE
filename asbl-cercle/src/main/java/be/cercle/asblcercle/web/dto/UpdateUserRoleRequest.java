package be.cercle.asblcercle.web.dto;

import be.cercle.asblcercle.entity.Role;

public class UpdateUserRoleRequest {
    private Role role;

    public Role getRole() {
        return role;
    }

    public void setRole(Role role) {
        this.role = role;
    }
}
