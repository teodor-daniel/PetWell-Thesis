package org.example.backend.repository;

import org.example.backend.data.Vet;
import org.springframework.data.domain.Page;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface VetRepository extends JpaRepository<Vet, UUID> {


    Optional<Vet> findByEmail(String email);

    boolean existsByEmail(String email);

    @Query("""
               select v
               from   Vet v
               join   v.memberships m
               where  m.clinic.id = :clinicId
            """)
    List<Vet> findByClinic(@Param("clinicId") UUID clinicId);

    @Query("""
               select distinct v
               from   Vet v
               join   v.memberships m
               join   m.clinic c
               where  (:city is null or lower(c.city) = lower(:city))
                 and  (:spec is null or lower(v.specialities) like lower(concat('%',:spec,'%')))
            """)
    List<Vet> search(@Param("city") String city, @Param("spec") String spec);

    @Query("""
                SELECT v
                FROM   Vet v
                WHERE  v.isActive = TRUE                                  
                  AND ( LOWER(v.fullName) LIKE LOWER(CONCAT('%', :q, '%'))
                     OR LOWER(v.email)    LIKE LOWER(CONCAT('%', :q, '%')) )
                  AND ( :excludeClinicId IS NULL OR v.id NOT IN (
                          SELECT m.vet.id
                          FROM   VetClinicMembership m
                          WHERE  m.clinic.id = :excludeClinicId
                  ))
            """)
    Page<Vet> searchAvailable(@Param("q") String q, @Param("excludeClinicId") UUID excludeClinicId, org.springframework.data.domain.Pageable pageable);
}
