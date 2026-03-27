// src/main/java/org/example/backend/security/VetDetailsService.java
package org.example.backend.security;

import lombok.RequiredArgsConstructor;
import org.example.backend.data.Vet;
import org.example.backend.repository.VetRepository;
import org.springframework.security.core.userdetails.*;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class VetDetailsService implements UserDetailsService {

    private final VetRepository vets;

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        Vet vet = vets.findByEmail(email)
                .orElseThrow(() -> new UsernameNotFoundException("Vet not found"));
        return buildVetDetails(vet);
    }

    public UserDetails loadVetById(String id) throws UsernameNotFoundException {
        Vet vet = vets.findById(java.util.UUID.fromString(id))
                .orElseThrow(() -> new UsernameNotFoundException("Vet not found by id: " + id));
        return buildVetDetails(vet);
    }

    private UserDetails buildVetDetails(Vet vet) {
        return User.withUsername(vet.getId().toString())
                .password(vet.getPassword())
                .authorities("ROLE_VET")
                .accountLocked(false)
                .build();
    }
}
