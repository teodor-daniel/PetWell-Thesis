package org.example.backend.controller;

import lombok.RequiredArgsConstructor;
import org.example.backend.data.Pet;
import org.example.backend.dto.PetDTO;
import org.example.backend.dto.PetDTOId;
import org.example.backend.dto.PetStatisticsDTO;
import org.example.backend.googleApi.CloudStorageService;
import org.example.backend.service.PetService;
import org.example.backend.service.UserService;
import org.springframework.core.env.Environment;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;
import org.example.backend.validation.PetValidation;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/pets")
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;
    private final UserService userService;
    private final CloudStorageService storageSvc;
    private final Environment environment;
    private final PetValidation petValidation;

    @GetMapping("/petid/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PetDTOId>> getPetsById(@PathVariable UUID id, @AuthenticationPrincipal UserDetails userDetails) {
        UUID myId = UUID.fromString(userDetails.getUsername());
        if (!myId.equals(id)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        List<PetDTOId> pets = petService.getAllPetsWithIDByOwnerID(id);
        return ResponseEntity.ok(pets);
    }

    @GetMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PetDTO> getPetById(@PathVariable UUID id, @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        petService.verifyOwnership(id, userId);
        Pet pet = petService.findById(id);
        return ResponseEntity.ok(petService.mapToPetDTO(pet));
    }

    @GetMapping("/mine")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PetDTO>> getMyPets(@AuthenticationPrincipal UserDetails userDetails) {
        UUID ownerId = UUID.fromString(userDetails.getUsername());
        return ResponseEntity.ok(petService.getPetsByOwnerId(ownerId));
    }

    @GetMapping("")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<List<PetDTO>> getAllPets() {
        List<PetDTO> petDTOs = petService.getAllPets();
        return ResponseEntity.ok(petDTOs);
    }

    @PostMapping
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> createPet(@RequestBody Pet pet, @AuthenticationPrincipal UserDetails userDetails) {
        if (petValidation.isNotValid(pet)) {
            return ResponseEntity.badRequest().build();
        }
        UUID ownerId = UUID.fromString(userDetails.getUsername());
        petService.createPet(pet, ownerId);
        return ResponseEntity.ok().build();
    }

    @PutMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<PetDTO> updatePet(@PathVariable UUID id, @RequestBody Pet updatedPet, @AuthenticationPrincipal UserDetails userDetails) {
        if (petValidation.isNotValidForUpdate(updatedPet)) {
            return ResponseEntity.badRequest().build();
        }
        UUID userId = UUID.fromString(userDetails.getUsername());
        petService.verifyOwnership(id, userId);
        Pet existing = petService.findById(id);
        String oldName = existing.getName();
        PetDTO dto = petService.updatePet(id, updatedPet);
        String newName = dto.getName();
        if (!oldName.equalsIgnoreCase(newName)) {
            String userEmail = userService.getUserById(userId).email();
            String bucket = environment.getProperty("bucket-value");
            String avatarFolder = userEmail + "/pets/";
            for (String ext : List.of("jpg", "jpeg", "png", "webp")) {
                String oldAvatarPath = avatarFolder + oldName + "/avatar/" + oldName + "." + ext;
                String newAvatarPath = avatarFolder + newName + "/avatar/" + newName + "." + ext;
                if (storageSvc.blobExists(bucket, oldAvatarPath)) {
                    storageSvc.renameObject(bucket, oldAvatarPath, newAvatarPath);
                }
            }
            if (existing.getImageUrl() != null && existing.getImageUrl().contains(oldName)) {
                String newImageUrl = existing.getImageUrl().replace(oldName, newName);
                petService.updatePetImageUrl(id, newImageUrl);
            }
        }
        return ResponseEntity.ok(dto);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> deletePet(@PathVariable UUID id, @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        petService.verifyOwnership(id, userId);
        petService.deletePet(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/statistics")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<PetStatisticsDTO>> getPetStatistics(@PathVariable UUID id, @AuthenticationPrincipal UserDetails userDetails) {
        UUID userId = UUID.fromString(userDetails.getUsername());
        petService.verifyOwnership(id, userId);
        List<PetStatisticsDTO> stats = petService.getPetStatistics(id);
        return ResponseEntity.ok(stats);
    }
}