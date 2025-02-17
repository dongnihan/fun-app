package fun.fun.utils;

import java.util.ArrayList;
import java.util.List;
import java.util.logging.Logger;

import org.springframework.javapoet.ClassName;

import fun.fun.model.Point;

public class GeoUtils {
    private static final double EARTH_RADIUS = 6371000;
    public static final int RADIUS = 100;
    private static final Logger LOGGER = Logger.getLogger( ClassName.class.getName());

    public static List<Point> getAllPointsFromDistance(Point current, int distance) {
        int cnt = distance / (2 * RADIUS);
        
        List<Point> res = new ArrayList<>();
        res.add(current);
        
        if (cnt == 0) {
            return res;
        }

        int[] offsets = getOffsets(cnt);
        res.addAll(getOffsetCoordinates(current.getLat(), current.getLon(), RADIUS * 2, offsets));

        res.forEach(r -> {
            LOGGER.info(String.format("Distance between %s and %s is %.2f meters", current.toString(), r.toString(), getDistance(current, r)));
        });
        return res;
    }

    private static int[] getOffsets(int cnt) {
        int[] offsets = new int[cnt * 2 + 1];
        int j = 0;
        for (int i = -cnt; i <= cnt; i++) {
            offsets[j++] = i;
        }
        return offsets;
    }

    private static List<Point> getOffsetCoordinates(double lat, double lon, double unitDistance, int[] offsets) {
        List<Point> coordinates = new ArrayList<>();
        double latShift = unitDistance / EARTH_RADIUS; // Shift in latitude degrees

        for (int dx : offsets) {
            for (int dy : offsets) {
                if (dx == 0 && dy == 0) continue;

                // Convert latitude shift
                double newLat = lat + Math.toDegrees(dy * latShift);

                // Convert longitude shift (adjusted for latitude)
                double lonShift = unitDistance / (EARTH_RADIUS * Math.cos(Math.toRadians(lat)));
                double newLon = lon + Math.toDegrees(dx * lonShift);

                coordinates.add(new Point(newLat, newLon));
            }
        }

        return coordinates;
    }

    private static double getDistance(Point p1, Point p2) {
        double lat1 = p1.getLat();
        double lon1 = p1.getLon();
        double lat2 = p2.getLat();
        double lon2 = p2.getLon();

        // Convert degrees to radians
        double lat1Rad = Math.toRadians(lat1);
        double lon1Rad = Math.toRadians(lon1);
        double lat2Rad = Math.toRadians(lat2);
        double lon2Rad = Math.toRadians(lon2);

        // Compute differences
        double deltaLat = lat2Rad - lat1Rad;
        double deltaLon = lon2Rad - lon1Rad;

        // Haversine formula
        double a = Math.pow(Math.sin(deltaLat / 2), 2) +
                   Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.pow(Math.sin(deltaLon / 2), 2);
        double c = 2 * Math.asin(Math.sqrt(a));

        // Compute the distance
        return EARTH_RADIUS * c;
    }
}
