package fun.fun.model;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public class Point {
    private double lat;
    private double lon;

    @Override
    public String toString() {
        return String.format("%.4f,%.4f", lat, lon);
    }

}
