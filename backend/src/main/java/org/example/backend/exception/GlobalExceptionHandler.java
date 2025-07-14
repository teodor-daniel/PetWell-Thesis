package org.example.backend.exception;

import com.google.cloud.storage.StorageException;
import jakarta.validation.ConstraintViolationException;
import lombok.extern.slf4j.Slf4j;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ControllerAdvice;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.multipart.MaxUploadSizeExceededException;
import org.springframework.web.servlet.NoHandlerFoundException;

import java.io.IOException;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.stream.Collectors;

@ControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    // FILE UPLOAD EXCEPTIONS
    @ExceptionHandler(MaxUploadSizeExceededException.class)
    public ResponseEntity<ErrorResponse> handleMaxUploadSizeExceeded(MaxUploadSizeExceededException ex) {
        log.warn("File upload size exceeded: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse("FILE_TOO_LARGE", "File size exceeds maximum allowed limit", "The uploaded file is too large. Please use a smaller file", HttpStatus.PAYLOAD_TOO_LARGE.value());
        return ResponseEntity.status(HttpStatus.PAYLOAD_TOO_LARGE).body(error);
    }

    @ExceptionHandler(StorageException.class)
    public ResponseEntity<ErrorResponse> handleStorageException(StorageException ex) {
        log.error("Cloud storage error: {}", ex.getMessage(), ex);
        ErrorResponse error = new ErrorResponse("STORAGE_ERROR", "File storage operation failed", "Unable to store or retrieve the file from cloud storage", HttpStatus.INTERNAL_SERVER_ERROR.value());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(IOException.class)
    public ResponseEntity<ErrorResponse> handleIOException(IOException ex) {
        log.error("IO error: {}", ex.getMessage(), ex);
        ErrorResponse error = new ErrorResponse("IO_ERROR", "File operation failed", "An error occurred while processing the file", HttpStatus.INTERNAL_SERVER_ERROR.value());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    //ROUTING EXCEPTIONS

    @ExceptionHandler(NoHandlerFoundException.class)
    public ResponseEntity<ErrorResponse> handleNoHandlerFound(NoHandlerFoundException ex) {
        log.warn("No handler found for {} {}", ex.getHttpMethod(), ex.getRequestURL());
        ErrorResponse error = new ErrorResponse("ENDPOINT_NOT_FOUND", "Endpoint not found", "The requested endpoint does not exist", HttpStatus.NOT_FOUND.value());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    //GENERAL EXCEPTIONS

    @ExceptionHandler(RuntimeException.class)
    public ResponseEntity<ErrorResponse> handleRuntimeException(RuntimeException ex) {
        log.error("Runtime error: {}", ex.getMessage(), ex);
        ErrorResponse error = new ErrorResponse("RUNTIME_ERROR", "An unexpected error occurred", "The application encountered an unexpected error. Please try again later", HttpStatus.INTERNAL_SERVER_ERROR.value());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorResponse> handleGenericException(Exception ex) {
        log.error("Unhandled exception: {}", ex.getMessage(), ex);
        ErrorResponse error = new ErrorResponse("INTERNAL_SERVER_ERROR", "Internal server error", "An unexpected error occurred. Please contact support if the problem persists", HttpStatus.INTERNAL_SERVER_ERROR.value());
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(error);
    }

    @ExceptionHandler(ClinicAccountException.class)
    public ResponseEntity<ErrorResponse> handleClinicAccountException(ClinicAccountException ex) {
        log.warn("Clinic account operation failed: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse("CLINIC_ACCOUNT_ERROR", ex.getMessage(), "Clinic account operation could not be completed", HttpStatus.BAD_REQUEST.value());
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(UserNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleUserNotFoundException(UserNotFoundException ex) {
        log.warn("User not found: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse("USER_NOT_FOUND", ex.getMessage(), "The requested user could not be found in the system", HttpStatus.NOT_FOUND.value());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(PetNotFoundException.class)
    public ResponseEntity<ErrorResponse> handlePetNotFoundException(PetNotFoundException ex) {
        log.warn("Pet not found: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse("PET_NOT_FOUND", ex.getMessage(), "The requested pet could not be found in the system", HttpStatus.NOT_FOUND.value());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ErrorResponse> handleResourceNotFoundException(ResourceNotFoundException ex) {
        log.warn("Resource not found: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse("RESOURCE_NOT_FOUND", ex.getMessage(), "The requested resource could not be found in the system", HttpStatus.NOT_FOUND.value());
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(error);
    }

    @ExceptionHandler(UnauthorizedException.class)
    public ResponseEntity<ErrorResponse> handleUnauthorizedException(UnauthorizedException ex) {
        log.warn("Unauthorized access attempt: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse("UNAUTHORIZED", ex.getMessage(), "You are not authorized to perform this action", HttpStatus.UNAUTHORIZED.value());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    //SECURITY EXCEPTIONS

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorResponse> handleAccessDenied(AccessDeniedException ex) {
        log.warn("Access denied: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse("ACCESS_DENIED", "You are not allowed to access this resource", "Insufficient permissions to perform the requested operation", HttpStatus.FORBIDDEN.value());
        return ResponseEntity.status(HttpStatus.FORBIDDEN).body(error);
    }

    @ExceptionHandler(BadCredentialsException.class)
    public ResponseEntity<ErrorResponse> handleBadCredentials(BadCredentialsException ex) {
        log.warn("Bad credentials provided");
        ErrorResponse error = new ErrorResponse("BAD_CREDENTIALS", "Invalid email or password", "The provided credentials are incorrect", HttpStatus.UNAUTHORIZED.value());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ErrorResponse> handleAuthenticationException(AuthenticationException ex) {
        log.warn("Authentication failed: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse("AUTHENTICATION_FAILED", "Authentication failed", "Unable to authenticate with the provided credentials", HttpStatus.UNAUTHORIZED.value());
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body(error);
    }

    //VALIDATION EXCEPTIONS

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorResponse> handleValidationExceptions(MethodArgumentNotValidException ex) {
        Map<String, String> errors = new HashMap<>();
        ex.getBindingResult().getAllErrors().forEach((error) -> {
            String fieldName = ((FieldError) error).getField();
            String errorMessage = error.getDefaultMessage();
            errors.put(fieldName, errorMessage);
        });

        String validationErrors = errors.entrySet().stream().map(entry -> entry.getKey() + ": " + entry.getValue()).collect(Collectors.joining(", "));

        log.warn("Validation failed: {}", validationErrors);
        ErrorResponse error = new ErrorResponse("VALIDATION_ERROR", "Validation failed", "The provided data does not meet the required validation criteria", HttpStatus.BAD_REQUEST.value(), Map.of("validationErrors", errors));
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(ConstraintViolationException.class)
    public ResponseEntity<ErrorResponse> handleConstraintViolation(ConstraintViolationException ex) {
        String violations = ex.getConstraintViolations().stream().map(violation -> violation.getPropertyPath() + ": " + violation.getMessage()).collect(Collectors.joining(", "));

        log.warn("Constraint violation: {}", violations);
        ErrorResponse error = new ErrorResponse("CONSTRAINT_VIOLATION", "Data constraint violation", "The provided data violates database constraints", HttpStatus.BAD_REQUEST.value(), Map.of("violations", violations));
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorResponse> handleTypeMismatch(MethodArgumentTypeMismatchException ex) {
        String message = String.format("Invalid value '%s' for parameter '%s'. Expected type: %s", ex.getValue(), ex.getName(), ex.getRequiredType().getSimpleName());

        log.warn("Type mismatch: {}", message);
        ErrorResponse error = new ErrorResponse("TYPE_MISMATCH", message, "The provided parameter value does not match the expected type", HttpStatus.BAD_REQUEST.value());
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorResponse> handleMissingParameter(MissingServletRequestParameterException ex) {
        String message = String.format("Missing required parameter '%s' of type '%s'", ex.getParameterName(), ex.getParameterType());

        log.warn("Missing parameter: {}", message);
        ErrorResponse error = new ErrorResponse("MISSING_PARAMETER", message, "A required parameter is missing from the request", HttpStatus.BAD_REQUEST.value());
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorResponse> handleHttpMessageNotReadable(HttpMessageNotReadableException ex) {
        log.warn("Invalid request body: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse("INVALID_REQUEST_BODY", "Invalid request body format", "The request body could not be parsed or is malformed", HttpStatus.BAD_REQUEST.value());
        return ResponseEntity.badRequest().body(error);
    }

    //DATA ACCESS EXCEPTIONS

    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorResponse> handleDataIntegrityViolation(DataIntegrityViolationException ex) {
        log.error("Data integrity violation: {}", ex.getMessage(), ex);
        ErrorResponse error = new ErrorResponse("DATA_INTEGRITY_VIOLATION", "Data integrity constraint violation", "The operation would violate database constraints (e.g., unique key, foreign key)", HttpStatus.CONFLICT.value());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<ErrorResponse> handleIllegalArgumentException(IllegalArgumentException ex) {
        log.warn("Illegal argument: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse("INVALID_ARGUMENT", ex.getMessage(), "One or more arguments provided are invalid", HttpStatus.BAD_REQUEST.value());
        return ResponseEntity.badRequest().body(error);
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<ErrorResponse> handleIllegalStateException(IllegalStateException ex) {
        log.warn("Illegal state: {}", ex.getMessage());
        ErrorResponse error = new ErrorResponse("INVALID_STATE", ex.getMessage(), "The requested operation cannot be performed in the current state", HttpStatus.CONFLICT.value());
        return ResponseEntity.status(HttpStatus.CONFLICT).body(error);
    }


    //ERROR RESPONSE CLASS


    public static class ErrorResponse {
        private final String errorCode;
        private final String message;
        private final String description;
        private final int statusCode;
        private final LocalDateTime timestamp;
        private final Map<String, Object> details;

        public ErrorResponse(String errorCode, String message, String description, int statusCode) {
            this(errorCode, message, description, statusCode, null);
        }

        public ErrorResponse(String errorCode, String message, String description, int statusCode, Map<String, Object> details) {
            this.errorCode = errorCode;
            this.message = message;
            this.description = description;
            this.statusCode = statusCode;
            this.timestamp = LocalDateTime.now();
            this.details = details;
        }

        public String getErrorCode() {
            return errorCode;
        }

        public String getMessage() {
            return message;
        }

        public String getDescription() {
            return description;
        }

        public int getStatusCode() {
            return statusCode;
        }

        public LocalDateTime getTimestamp() {
            return timestamp;
        }

        public Map<String, Object> getDetails() {
            return details;
        }
    }
} 