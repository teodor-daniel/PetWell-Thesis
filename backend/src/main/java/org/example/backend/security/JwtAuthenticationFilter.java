package org.example.backend.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.*;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final List<UserDetailsService> services;

    public JwtAuthenticationFilter(JwtUtil jwtUtil, CustomUserDetailsService owners, VetDetailsService vets) {
        this.jwtUtil = jwtUtil;
        this.services = List.of(owners, vets);
    }

    @Override
    protected void doFilterInternal(HttpServletRequest req, HttpServletResponse res, FilterChain chain) throws ServletException, IOException {

        try {
            String token = extractToken(req);
            if (token != null && jwtUtil.validateToken(token)) {
                String userId = jwtUtil.extractUserId(token);

                for (UserDetailsService uds : services) {
                    try {
                        UserDetails ud;
                        if (uds instanceof CustomUserDetailsService) {
                            ud = ((CustomUserDetailsService) uds).loadUserById(userId);
                        } else if (uds instanceof VetDetailsService) {
                            ud = ((VetDetailsService) uds).loadVetById(userId);
                        } else {
                            continue;
                        }
                        if (jwtUtil.validateToken(token, ud) && SecurityContextHolder.getContext().getAuthentication() == null) {

                            UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(ud, null, ud.getAuthorities());
                            auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(req));
                            SecurityContextHolder.getContext().setAuthentication(auth);
                            break;
                        }
                    } catch (UsernameNotFoundException ignore) { /* try next */ }
                }
            }
        } catch (Exception e) {
            logger.error("Cannot set user authentication", e);
        }
        chain.doFilter(req, res);
    }

    private String extractToken(HttpServletRequest req) {
        String h = req.getHeader("Authorization");
        if (h != null && h.startsWith("Bearer ")) return h.substring(7);
        if (req.getCookies() != null) {
            for (Cookie c : req.getCookies()) if ("jwtToken".equals(c.getName())) return c.getValue();
        }
        return null;
    }
}
