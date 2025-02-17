package fun.fun.model.Request;

import lombok.Data;

@Data
public class PlacesTextSearchRequest {
    private String textQuery;
    private Integer pageSize;
    private String[] priceLevels;
    private double minRating;
}
