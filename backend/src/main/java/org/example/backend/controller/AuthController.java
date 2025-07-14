package org.example.backend.controller;

import jakarta.servlet.http.HttpServletResponse;
import org.example.backend.dto.UserDTO;
import org.example.backend.security.JwtUtil;
import org.example.backend.service.UserService;
import org.example.backend.service.VetClinicMembershipService;
import org.example.backend.service.VetService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpHeaders;
import org.springframework.http.ResponseCookie;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtUtil jwtUtil;

    @Autowired
    private UserService userService;

    @Autowired
    private VetService vetService;

    @Autowired
    private VetClinicMembershipService vetClinicMembershipService;

    @PostMapping("/login")
    public ResponseEntity<?> authenticate(@RequestBody Map<String, Object> body, HttpServletResponse res) {

        Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(body.get("email"), body.get("password")));

        boolean keep = (boolean) body.getOrDefault("keepLoggedIn", false);
        long exp = keep ? 7 * 24 * 3600 : jwtUtil.getExpiration();
        String token = jwtUtil.generateToken(auth, exp);

        ResponseCookie cookie = ResponseCookie.from("jwtToken", token).httpOnly(true).secure(false).path("/").maxAge(exp).build();

        String userId = ((org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal()).getUsername();
        boolean isVet = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_VET"));

        if (isVet) {
            var vetDto = vetService.getVet(UUID.fromString(userId));
            return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(Map.of("role", "VET", "token", token, "vet", vetDto));
        }

        var userDto = userService.getUserById(UUID.fromString(userId));

        System.out.println("THIS IS THE DATA THE USER GETS: " + ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(Map.of("role", userDto.role(), "token", token, "user", userDto).toString()));

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(Map.of("role", userDto.role(), "token", token, "user", userDto));
    }

    @GetMapping("/user")
    public ResponseEntity<?> currentUser(@CookieValue(value = "jwtToken", required = false) String token) {
        if (token == null || token.isEmpty() || !jwtUtil.validateToken(token)) {
            return ResponseEntity.status(401).body(Map.of("error", "Not authenticated"));
        }

        String userId = jwtUtil.extractUserId(token);
        System.out.println("If the cookie is on this baby:::: ");
        try {
            UserDTO userDTO = userService.getUserById(UUID.fromString(userId));
            if (userDTO != null) {
                long tokenExpiry = jwtUtil.getExpiration();
                String refreshedToken = jwtUtil.generateToken(userId, tokenExpiry);

                ResponseCookie jwtCookie = ResponseCookie.from("jwtToken", refreshedToken).httpOnly(true).secure(false).path("/").maxAge(tokenExpiry).build();

                return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, jwtCookie.toString()).body(Map.of("user", userDTO, "token", refreshedToken));
            }
        } catch (Exception e) {
        }

        try {
            var vetDto = vetService.getVet(UUID.fromString(userId));
            if (vetDto != null) {
                List<UUID> clinicIds = vetClinicMembershipService.clinicsForVet(UUID.fromString(userId));
                UUID primaryClinicId = clinicIds.isEmpty() ? null : clinicIds.get(0);

                long tokenExpiry = jwtUtil.getExpiration();
                String refreshedToken = jwtUtil.generateToken(userId, tokenExpiry);

                ResponseCookie jwtCookie = ResponseCookie.from("jwtToken", refreshedToken).httpOnly(true).secure(false).path("/").maxAge(tokenExpiry).build();

                return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, jwtCookie.toString()).body(Map.of("vet", vetDto, "token", refreshedToken, "primaryClinicId", primaryClinicId, "clinicIds", clinicIds));
            }
        } catch (Exception e) {
        }

        return ResponseEntity.status(401).body(Map.of("error", "User not found"));
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        ResponseCookie cookie = ResponseCookie.from("jwtToken", "").httpOnly(true).secure(false).path("/").maxAge(0).build();

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(Map.of("message", "Logged out successfully"));
    }


    @PostMapping("/vet/login")
    public ResponseEntity<?> vetLogin(@RequestBody Map<String, Object> body, HttpServletResponse res) {

        Authentication auth = authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(body.get("email"), body.get("password")));

        boolean isVet = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_VET"));
        if (!isVet) {
            return ResponseEntity.status(401).body(Map.of("error", "Not a vet account"));
        }

        long exp = (boolean) body.getOrDefault("keepLoggedIn", false) ? 7 * 24 * 3600 : jwtUtil.getExpiration();

        String token = jwtUtil.generateToken(auth, exp);
        ResponseCookie cookie = ResponseCookie.from("jwtToken", token).httpOnly(true).secure(false).path("/").maxAge(exp).build();

        String vetId = ((org.springframework.security.core.userdetails.UserDetails) auth.getPrincipal()).getUsername();
        var vetDto = vetService.getVet(UUID.fromString(vetId));
        List<UUID> clinicIds = vetClinicMembershipService.clinicsForVet(UUID.fromString(vetId));
        UUID primaryClinicId = clinicIds.isEmpty() ? null : clinicIds.get(0);

        return ResponseEntity.ok().header(HttpHeaders.SET_COOKIE, cookie.toString()).body(Map.of("message", "Vet logged in", "token", token, "vet", vetDto, "primaryClinicId", primaryClinicId, "clinicIds", clinicIds));
    }


}
