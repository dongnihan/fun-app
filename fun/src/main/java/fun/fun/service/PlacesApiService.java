package fun.fun.service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.logging.Logger;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.javapoet.ClassName;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import com.google.gson.JsonArray;
import com.google.gson.JsonObject;
import com.google.gson.JsonParser;

import fun.fun.model.Place;
import fun.fun.model.Point;
import fun.fun.model.Request.PlacesNearbySearchRequest;
import fun.fun.model.Request.PlacesTextSearchRequest;
import fun.fun.utils.GeoUtils;

@Service
public class PlacesApiService {
    private final WebClient webClient;
    private final String URL = "https://places.googleapis.com/v1/places:";
    private final String FIELD_MASK = "places.displayName," + 
                           "places.rating," + 
                           "places.priceLevel," + 
                           "places.userRatingCount," + 
                           "places.priceRange," + 
                           "places.websiteUri," + 
                           "places.formattedAddress," +
                           "places.googleMapsLinks," + 
                           "places.location";          
    private static final Logger LOGGER = Logger.getLogger( ClassName.class.getName());
    private static final int MAX_RESULT_COUNT = 20;
    private static final String[] INCLUDED_TYPES = new String[] {"restaurant"};
    private static final int FILTERED_REVIEW_COUNT = 30;
                       
    @Value("${google.api.key}")
    private String googleApiKey;

    public PlacesApiService() {
        this.webClient = WebClient.builder().build();
    }

    public List<Place> getPlacesByTextSearch(PlacesTextSearchRequest request) {
        List<Place> places = getResponse(URL + "searchText", request);
        sortPlaces(places);
        return places;              
    }

    public List<Place> getPlacesByNearbySearch(PlacesNearbySearchRequest request) {
        Point point = new Point(request.getLatitude(), request.getLongitude());
        List<Point> points = GeoUtils.getAllPointsFromDistance(point, request.getDistance());

        return getAllPlaces(points, request);
        
    }

    private List<Place> getAllPlaces(List<Point> points, PlacesNearbySearchRequest request) {
        Set<Place> places = new HashSet<>();
        LOGGER.info(String.format("Calling Google Places API %d times", points.size()));
        
        points.forEach(p -> {
            JsonObject payload = buildPayload(p.getLat(), p.getLon(), GeoUtils.RADIUS);
            List<Place> list = getResponse(URL + "searchNearby", payload.toString());
            List<Place> filtered = list.stream()
                                        .filter(l -> l.getReviewCount() > FILTERED_REVIEW_COUNT)
                                        .collect(Collectors.toList());
            places.addAll(filtered);
        });
        
        List<Place> res = new ArrayList<>(places);
        sortPlaces(res);
        return res;
    }

    private List<Place> getResponse(String url, Object payload) {
        String jsonString = this.webClient.post()
                            .uri(url)
                            .contentType(MediaType.APPLICATION_JSON)
                            .header("X-Goog-Api-Key", googleApiKey)
                            .header("X-Goog-FieldMask", FIELD_MASK)
                            .bodyValue(payload)
                            .retrieve()
                            .bodyToMono(String.class)
                            .block();
        return parseJson(jsonString);
    }

    private List<Place> parseJson(String jsonString) {
        JsonObject jsonObject = JsonParser.parseString(jsonString).getAsJsonObject();
        if (!jsonObject.has("places")) {
            return Collections.emptyList();
        }
        JsonArray jsonArray = jsonObject.get("places").getAsJsonArray();
        
        List<Place> places = new ArrayList<>();
        for (int i = 0; i < jsonArray.size(); i++) {
            JsonObject o = jsonArray.get(i).getAsJsonObject();
            double rating = o.has("rating") ? o.get("rating").getAsDouble() : 0.0;
            int reviewCount = o.has("userRatingCount") ? o.get("userRatingCount").getAsInt() : 0;
            String name = "";
            if (o.has("displayName") && o.getAsJsonObject("displayName").has("text")) {
                name = o.getAsJsonObject("displayName").get("text").getAsString();
            }
            String priceLevel = o.has("priceLevel") ? o.get("priceLevel").getAsString().substring(12) : "";
            String websiteUrl = o.has("websiteUri") ? o.get("websiteUri").getAsString() : "";
            String address = o.has("formattedAddress") ? o.get("formattedAddress").getAsString() : "";
            String googleMapLink = o.has("googleMapsLinks") ? o.getAsJsonObject("googleMapsLinks").get("placeUri").getAsString() : "";
            double latitude = 0.0;
            if (o.has("location") && o.getAsJsonObject("location").has("latitude")) {
                latitude = o.getAsJsonObject("location").get("latitude").getAsDouble();
            }
            double longitude = 0.0;
            if (o.has("location") && o.getAsJsonObject("location").has("longitude")) {
                longitude = o.getAsJsonObject("location").get("longitude").getAsDouble();
            }
            places.add(new Place(rating, priceLevel, reviewCount, name, websiteUrl, address, googleMapLink, latitude, longitude));
        }
    
        return places;
    }

    private void sortPlaces(List<Place> places) {
        Collections.sort(places, Comparator.comparing(Place::getRating)
                                            .thenComparing(Place::getReviewCount).reversed());
        for (int i = 0; i < places.size(); i++) {
            places.get(i).setId(i + 1);
        }
    }

    private JsonObject buildPayload(double latitude, double longitude, int radius) {
        JsonObject jsonObjectLevel1 = new JsonObject();
        
        JsonArray jsonArray = new JsonArray();
        for (String type : INCLUDED_TYPES) {
            jsonArray.add(type);
        }
        jsonObjectLevel1.add("includedTypes", jsonArray);
        jsonObjectLevel1.addProperty("maxResultCount", MAX_RESULT_COUNT);

        JsonObject jsonObjectLevel4 = new JsonObject();
        jsonObjectLevel4.addProperty("latitude", latitude);
        jsonObjectLevel4.addProperty("longitude", longitude);

        JsonObject jsonObjectLevel3 = new JsonObject();
        jsonObjectLevel3.add("center", jsonObjectLevel4);
        jsonObjectLevel3.addProperty("radius", radius);

        JsonObject jsonObjectLevel2 = new JsonObject();
        jsonObjectLevel2.add("circle", jsonObjectLevel3);

        jsonObjectLevel1.add("locationRestriction", jsonObjectLevel2);

        return jsonObjectLevel1;
    }

}