// src/main/java/org/example/backend/security/SecurityConfig.java
package org.example.backend.security;

import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.ProviderManager;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;          // <- **only injected, not declared here**
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.util.List;

import static org.springframework.security.config.Customizer.withDefaults;

@Configuration
@EnableWebSecurity
@EnableMethodSecurity
@RequiredArgsConstructor
public class SecurityConfig {

    private final JwtUtil jwtUtil;
    private final CustomUserDetailsService ownerDetailsService;
    private final VetDetailsService vetDetailsService;

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .cors(withDefaults())
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers(
                                "/", "/index.html",
                                "/static/**", "/*.js", "/*.css",
                                "/favicon.ico", "/assets/**",
                                "/auth/**", "/users/create", "/vets/register", "/auth/logout")
                        .permitAll()
                        .anyRequest().authenticated())
                .sessionManagement(sm ->
                        sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(jwtAuthenticationFilter(),
                        UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public JwtAuthenticationFilter jwtAuthenticationFilter() {
        return new JwtAuthenticationFilter(jwtUtil, ownerDetailsService, vetDetailsService);
    }

    @Bean
    public AuthenticationManager authManager(PasswordEncoder passwordEncoder) {

        DaoAuthenticationProvider userProv = new DaoAuthenticationProvider();
        userProv.setUserDetailsService(ownerDetailsService);
        userProv.setPasswordEncoder(passwordEncoder);

        DaoAuthenticationProvider vetProv = new DaoAuthenticationProvider();
        vetProv.setUserDetailsService(vetDetailsService);
        vetProv.setPasswordEncoder(passwordEncoder);

        return new ProviderManager(List.of(userProv, vetProv));
    }
}
