package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.service.EmailService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/contact")
@RequiredArgsConstructor
public class ContactController {

    private final EmailService emailService;

    @PostMapping("/send")
    public ResponseEntity<Map<String, String>> sendContactMessage(@RequestBody Map<String, String> contactForm) {
        String name = contactForm.get("name");
        String email = contactForm.get("email");
        String message = contactForm.get("message");

        if (name == null || name.trim().isEmpty() || email == null || email.trim().isEmpty() || message == null || message.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(Map.of("error", "All fields are required"));
        }

        emailService.sendTemplateEmail("teobalan79@yahoo.com", "New Contact Form Message from " + name, "email/contact_form.html", Map.of("name", name, "email", email, "message", message), "CONTACT_FORM", UUID.randomUUID());

        return ResponseEntity.ok(Map.of("message", "Message sent successfully!"));
    }
} 