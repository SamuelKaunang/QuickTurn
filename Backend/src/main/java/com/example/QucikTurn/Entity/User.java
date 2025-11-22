package com.example.QucikTurn.Entity;

import com.example.QucikTurn.Entity.enums.Role;
import jakarta.persistence.*;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import java.time.LocalDateTime;
import java.util.Collection;
import java.util.List;

@Entity @Table(name="users")
public class User implements UserDetails {
    @Id @GeneratedValue(strategy=GenerationType.IDENTITY) private Long id;

    @Column(nullable=false, length=150) private String nama;
    @Column(nullable=false, unique=true, length=190) private String email;
    @Column(name="password_hash", nullable=false, length=100) private String passwordHash;

    @Enumerated(EnumType.STRING) @Column(nullable=false, length=20)
    private Role role = Role.MAHASISWA;

    @Column(name="is_active", nullable=false) private boolean isActive = true;
    private LocalDateTime lastLoginAt;

    @Column(nullable=false) private LocalDateTime createdAt = LocalDateTime.now();
    @Column(nullable=false) private LocalDateTime updatedAt = LocalDateTime.now();
    @PreUpdate void onUpdate(){ this.updatedAt = LocalDateTime.now(); }

    // UserDetails
    @Override public Collection<? extends GrantedAuthority> getAuthorities() {
        return List.of(new SimpleGrantedAuthority("ROLE_"+role.name()));
    }
    @Override public String getPassword() { return passwordHash; }
    @Override public String getUsername() { return email; }
    @Override public boolean isAccountNonExpired() { return true; }
    @Override public boolean isAccountNonLocked() { return isActive; }
    @Override public boolean isCredentialsNonExpired() { return true; }
    @Override public boolean isEnabled() { return isActive; }

    // getters/setters
    public Long getId() { return id; }
    public String getNama() { return nama; }
    public void setNama(String nama) { this.nama = nama; }
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }
    public String getPasswordHash() { return passwordHash; }
    public void setPasswordHash(String passwordHash) { this.passwordHash = passwordHash; }
    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }
    public void setActive(boolean active) { isActive = active; }
    public void setLastLoginAt(LocalDateTime t){ this.lastLoginAt = t; }
}
