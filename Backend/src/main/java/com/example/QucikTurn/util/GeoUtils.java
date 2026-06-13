package com.example.QucikTurn.util;

/**
 * Geospatial helper utilities.
 *
 * <p>
 * Provides a clean, reusable Haversine implementation used by the
 * "nearby projects" feature to compute great-circle distance between two
 * coordinates on Earth.
 * </p>
 */
public final class GeoUtils {

    /**
     * Mean Earth radius in kilometers (IUGG mean radius).
     */
    private static final double EARTH_RADIUS_KM = 6371.0088;

    private GeoUtils() {
        // Utility class - prevent instantiation
    }

    /**
     * Calculate the great-circle distance between two points using the
     * Haversine formula.
     *
     * @param lat1 latitude of the first point in decimal degrees
     * @param lon1 longitude of the first point in decimal degrees
     * @param lat2 latitude of the second point in decimal degrees
     * @param lon2 longitude of the second point in decimal degrees
     * @return distance in kilometers
     */
    public static double haversineKm(double lat1, double lon1, double lat2, double lon2) {
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);

        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2)
                + Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2))
                        * Math.sin(dLon / 2) * Math.sin(dLon / 2);

        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return EARTH_RADIUS_KM * c;
    }

    /**
     * Round a value to 2 decimal places (e.g., for displaying distance in km).
     *
     * @param value the value to round
     * @return the value rounded to 2 decimals
     */
    public static double roundToTwoDecimals(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
