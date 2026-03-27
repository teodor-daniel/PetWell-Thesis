package org.example.backend.repository;

import org.example.backend.data.VeterinaryClinic;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface VeterinaryClinicRepository extends JpaRepository<VeterinaryClinic, UUID> {

    boolean existsByEmail(String email);

    @Query(value = """
            SELECT v.*, (
               6371 * acos(
                 cos(radians(:lat)) * cos(radians(v.latitude  ::double precision))
               * cos(radians(v.longitude ::double precision) - radians(:lng))
               + sin(radians(:lat)) * sin(radians(v.latitude ::double precision))
               )
            ) AS distance
            FROM dev.veterinary_clinics v
            WHERE (
               6371 * acos(
                 cos(radians(:lat)) * cos(radians(v.latitude  ::double precision))
               * cos(radians(v.longitude ::double precision) - radians(:lng))
               + sin(radians(:lat)) * sin(radians(v.latitude ::double precision))
               )
            ) <= :radiusKm
            ORDER BY distance
            """, nativeQuery = true)
    List<VeterinaryClinic> findWithinRadius(@Param("lat") double lat, @Param("lng") double lng, @Param("radiusKm") double radiusKm);

    @Query("""
            select distinct c
            from   VeterinaryClinic c
            left   join c.memberships m
            left   join m.vet v
            where  (:cityLower  is null or lower(c.city) = :cityLower)
              and  (
                    :specLower is null
                    or (v.specialities is not null
                        and lower(v.specialities)
                            like concat('%', cast(:specLower as string), '%'))
                  )
            """)
    List<VeterinaryClinic> search(@Param("cityLower") String cityLower, @Param("specLower") String specLower);


}
