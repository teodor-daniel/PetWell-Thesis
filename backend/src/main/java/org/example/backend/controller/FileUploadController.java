package org.example.backend.controller;

import com.google.cloud.storage.StorageException;
import org.example.backend.data.Pet;
import org.example.backend.googleApi.CloudStorageService;
import org.example.backend.service.PetService;
import org.example.backend.service.UserService;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.List;
import java.util.Locale;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class FileUploadController {

    private final PetService petService;
    private final CloudStorageService storageSvc;
    private final Environment environment;
    private final UserService userService;

    public FileUploadController(CloudStorageService storageSvc, PetService petService, Environment environment, UserService userService) {
        this.storageSvc = storageSvc;
        this.petService = petService;
        this.environment = environment;
        this.userService = userService;
    }

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> uploadFile(@RequestParam("file") MultipartFile file) throws IOException {
        System.out.println("MEOWWWW");
        if (file.isEmpty()) return ResponseEntity.badRequest().body("No file selected.");

        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        String userEmail = userService.getUserById(UUID.fromString(userId)).email();
        String objectName = userEmail + "/pets/" + file.getOriginalFilename();

        storageSvc.createFolderIfMissing(environment.getProperty("bucket-value"), userEmail + "/pets");
        storageSvc.uploadObjectFromMemory(environment.getProperty("bucket-value"), objectName, file.getBytes());

        return ResponseEntity.ok("File uploaded.");
    }

    @PostMapping(value = "/upload/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<String> uploadPetImage(@RequestParam("file") MultipartFile file, @RequestParam("petName") String petName) throws IOException {

        if (file.isEmpty()) {
            return ResponseEntity.badRequest().body("Empty file.");
        }

        String ext = StringUtils.getFilenameExtension(file.getOriginalFilename());
        if (ext == null) {
            return ResponseEntity.badRequest().body("Missing extension.");
        }
        ext = ext.toLowerCase(Locale.ROOT);

        if (!List.of("jpg", "jpeg", "png", "webp").contains(ext)) {
            return ResponseEntity.badRequest().body("Only .jpg / .jpeg / webp .png allowed.");
        }

        String userId = SecurityContextHolder.getContext().getAuthentication().getName();
        String userEmail = userService.getUserById(UUID.fromString(userId)).email();

        Optional<Pet> petOptional = petService.findPetByNameAndOwnerId(petName, UUID.fromString(userId));
        if (petOptional.isEmpty()) {
            return ResponseEntity.badRequest().body("Pet not found.");
        }

        Pet pet = petOptional.get();

        String avatarFolder = userEmail + "/pets/" + petName + "/avatar/";
        String recordsFolder = userEmail + "/pets/" + petName + "/records/";
        String newObject = avatarFolder + petName + "." + ext;

        storageSvc.createFolderIfMissing(environment.getProperty("bucket-value"), avatarFolder);

        if (pet.getImageUrl() != null && !pet.getImageUrl().isEmpty()) {
            if (storageSvc.blobExists(environment.getProperty("bucket-value"), pet.getImageUrl())) {
                storageSvc.deleteObject(environment.getProperty("bucket-value"), pet.getImageUrl());
            }
        }

        for (String oldExt : List.of("jpg", "jpeg", "png", "webp")) {
            String oldObject = avatarFolder + petName + "." + oldExt;
            if (storageSvc.blobExists(environment.getProperty("bucket-value"), oldObject)) {
                storageSvc.deleteObject(environment.getProperty("bucket-value"), oldObject);
            }
        }

        storageSvc.uploadObjectFromMemory(environment.getProperty("bucket-value"), newObject, file.getBytes());

        pet.setImageUrl(newObject);
        petService.updatePet(pet.getId(), pet);

        return ResponseEntity.ok("Avatar replaced.");
    }

    @GetMapping("/picture/{petName}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getPicture(Authentication auth, @PathVariable String petName) {

        String userId = ((User) auth.getPrincipal()).getUsername();
        String userEmail = userService.getUserById(UUID.fromString(userId)).email();
        String[] exts = {"jpg", "jpeg", "png", "webp"};

        for (String ext : exts) {
            String object = userEmail + "/pets/" + petName + "/avatar/" + petName + "." + ext;
            if (storageSvc.blobExists(environment.getProperty("bucket-value"), object)) {
                try {
                    String url = storageSvc.generateSignedUrl(environment.getProperty("bucket-value"), object, 60);
                    return ResponseEntity.ok(url);
                } catch (StorageException se) {
                    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unable to sign URL");
                }
            }
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No avatar found for pet: " + petName);
    }

    @GetMapping("/pet-image/{petName}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<?> getPetImageFromDatabase(Authentication auth, @PathVariable String petName) {
        String userId = ((User) auth.getPrincipal()).getUsername();

        Optional<Pet> petOptional = petService.findPetByNameAndOwnerId(petName, UUID.fromString(userId));
        if (petOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Pet not found: " + petName);
        }

        Pet pet = petOptional.get();

        if (pet.getImageUrl() == null || pet.getImageUrl().isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("No avatar uploaded for pet: " + petName);
        }

        if (!storageSvc.blobExists(environment.getProperty("bucket-value"), pet.getImageUrl())) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Avatar file missing from storage for pet: " + petName + ". Database inconsistency detected.");
        }

        try {
            String url = storageSvc.generateSignedUrl(environment.getProperty("bucket-value"), pet.getImageUrl(), 60);
            return ResponseEntity.ok(url);
        } catch (StorageException se) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body("Unable to generate signed URL for pet: " + petName);
        }
    }
}
