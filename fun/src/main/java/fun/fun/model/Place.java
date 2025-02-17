package fun.fun.model;

import lombok.Data;

@Data
public class Place {
    private Integer id;
    private Double rating;
    private String priceLevel;
    private Integer reviewCount;
    private String name;
    private String websiteUrl;
    private String address;
    private String googleMapLink;
    private double latitude;
    private double longitude;

    public Place(Double rating, 
                 String priceLevel, 
                 Integer reviewCount, 
                 String name, 
                 String websiteUrl, 
                 String address,
                 String googleMapLink,
                 double latitude,
                 double longitude) {
        this.rating = rating;
        this.priceLevel = priceLevel;
        this.reviewCount = reviewCount;
        this.name = name;
        this.websiteUrl = websiteUrl;
        this.address = address;
        this.googleMapLink = googleMapLink;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    @Override
    public boolean equals(Object obj) {
        if (this == obj) {
            return true;
        }
        if (obj == null || getClass() != obj.getClass()) {
            return false;
        }
        Place place = (Place) obj;
        return latitude == place.latitude && longitude == place.longitude;
    }

    @Override
    public int hashCode() {
        return Double.hashCode(latitude) + Double.hashCode(longitude);
    }
}
