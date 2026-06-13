package com.example.QucikTurn.util;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertTrue;

/**
 * Unit tests for the Haversine distance helper.
 */
class GeoUtilsTest {

    @Test
    void distanceBetweenSamePointIsZero() {
        double d = GeoUtils.haversineKm(-6.895, 107.61, -6.895, 107.61);
        assertEquals(0.0, d, 0.0001);
    }

    @Test
    void oneDegreeOfLongitudeAtEquatorIsAboutOneEleven() {
        // 1 degree of longitude at the equator ~= 111.19 km
        double d = GeoUtils.haversineKm(0.0, 0.0, 0.0, 1.0);
        assertEquals(111.19, d, 0.5);
    }

    @Test
    void knownCityPairDistanceIsWithinTolerance() {
        // Jakarta (Monas) to Bandung (Alun-alun) is roughly ~120 km great-circle.
        double jakartaLat = -6.1754;
        double jakartaLng = 106.8272;
        double bandungLat = -6.9215;
        double bandungLng = 107.6071;

        double d = GeoUtils.haversineKm(jakartaLat, jakartaLng, bandungLat, bandungLng);
        assertTrue(d > 110 && d < 130, "Expected ~120km but got " + d);
    }

    @Test
    void distanceIsSymmetric() {
        double a = GeoUtils.haversineKm(-6.2, 106.8, -7.8, 110.4);
        double b = GeoUtils.haversineKm(-7.8, 110.4, -6.2, 106.8);
        assertEquals(a, b, 0.0001);
    }

    @Test
    void roundToTwoDecimalsWorks() {
        assertEquals(2.35, GeoUtils.roundToTwoDecimals(2.34567), 0.0);
        assertEquals(10.0, GeoUtils.roundToTwoDecimals(10.0), 0.0);
    }
}
