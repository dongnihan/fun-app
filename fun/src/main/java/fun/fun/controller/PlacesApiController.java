package fun.fun.controller;

import java.util.List;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

import fun.fun.model.Place;
import fun.fun.model.Request.PlacesNearbySearchRequest;
import fun.fun.model.Request.PlacesTextSearchRequest;
import fun.fun.service.PlacesApiService;

@RestController
public class PlacesApiController {

    @Value("${google.api.key}")
    private String apiKey;

    @Autowired
    private PlacesApiService placesApiService;

    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/text")
    public List<Place> getPlacesByTextSearch(@RequestBody PlacesTextSearchRequest request) {
        return placesApiService.getPlacesByTextSearch(request);
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @PostMapping("/nearby")
    public List<Place> getPlacesByNearybySearch(@RequestBody PlacesNearbySearchRequest request) {
        return placesApiService.getPlacesByNearbySearch(request);
    }

    @CrossOrigin(origins = "http://localhost:3000")
    @GetMapping("/key")
    public String getKey() {
        return apiKey;
    }
}
