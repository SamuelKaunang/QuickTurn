package com.example.QucikTurn.dto;

import com.example.QucikTurn.Entity.enums.WorkMode;
import java.math.BigDecimal;
import java.time.LocalDate;

/**
 * DTO for the "nearby projects" feature.
 *
 * <p>
 * Returns open projects that have valid coordinates together with the computed
 * distance (in km) from the requesting user's location. Owner data is flattened
 * to only the non-sensitive {@code ownerName}/{@code ownerId} so we do not leak
 * private owner information through the public browse flow.
 * </p>
 */
public record NearbyProjectResponse(
        Long id,
        String title,
        String description,
        String category,
        BigDecimal budget,
        LocalDate deadline,
        String status,
        String ownerName,
        Long ownerId,
        String city,
        String address,
        Double latitude,
        Double longitude,
        WorkMode workMode,
        Double distanceKm // Distance from the user's coordinates, rounded to 2 decimals
) {
}
