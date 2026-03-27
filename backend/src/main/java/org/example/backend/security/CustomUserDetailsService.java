package org.example.backend.security;

import org.example.backend.data.User;
import org.example.backend.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class CustomUserDetailsService implements UserDetailsService {

    private final UserRepository userRepository;

    @Autowired
    public CustomUserDetailsService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public UserDetails loadUserByUsername(String email) throws UsernameNotFoundException {
        User user = userRepository.findByEmail(email).orElseThrow(() -> new UsernameNotFoundException("User not found"));
        return buildUserDetails(user);
    }

    public UserDetails loadUserById(String id) throws UsernameNotFoundException {
        User user = userRepository.findById(java.util.UUID.fromString(id)).orElseThrow(() -> new UsernameNotFoundException("User not found by id: " + id));
        return buildUserDetails(user);
    }

    private UserDetails buildUserDetails(User user) {
        List<SimpleGrantedAuthority> auths = new ArrayList<>();
        auths.add(new SimpleGrantedAuthority("ROLE_" + user.getRole()));
        auths.add(new SimpleGrantedAuthority("ROLE_USER"));
        return org.springframework.security.core.userdetails.User.withUsername(user.getId().toString()).password(user.getPassword()).authorities(auths).accountLocked(!user.isActive()).build();
    }
}
