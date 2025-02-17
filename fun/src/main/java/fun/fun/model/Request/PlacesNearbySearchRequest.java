package fun.fun.model.Request;

import lombok.Data;

@Data
public class PlacesNearbySearchRequest {
    private double latitude;
    private double longitude;
    private Integer distance; //meters
    private String[] includedTypes;
}
