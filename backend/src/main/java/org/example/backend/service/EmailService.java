package org.example.backend.service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import org.example.backend.data.EmailNotification;
import org.example.backend.repository.EmailNotificationRepository;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.time.OffsetDateTime;
import java.util.Locale;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class EmailService {
    private static final Logger log = LoggerFactory.getLogger(EmailService.class);
    private final JavaMailSender mailSender;
    private final TemplateEngine templateEngine;
    private final EmailNotificationRepository notificationRepo;

    @Async
    public void sendTemplateEmail(String to, String subject, String templateName, Map<String, Object> model, String entityType, UUID entityId) {
        log.info("Attempting to send email to {} with subject {}", to, subject);
        String body = templateEngine.process(templateName, new Context(Locale.getDefault(), model));
        sendAndStore(to, subject, body, entityType, entityId);
    }

    private void sendAndStore(String to, String subject, String body, String entityType, UUID entityId) {
        EmailNotification notification = EmailNotification.builder().recipientEmail(to).subject(subject).body(body).status("PENDING").relatedEntityType(entityType).relatedEntityId(entityId).sentAt(OffsetDateTime.now()).build();
        notificationRepo.save(notification);
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(body, true);
            mailSender.send(message);
            notification.setStatus("SENT");
            log.info("Email sent to {}", to);
        } catch (Exception e) {
            notification.setStatus("FAILED");
            log.error("Failed to send email to {}: {}", to, e.getMessage(), e);
        }
        notificationRepo.save(notification);
    }
} 