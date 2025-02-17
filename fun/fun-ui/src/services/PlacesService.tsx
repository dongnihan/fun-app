import axios from 'axios';

const URL = 'http://localhost:8080/';

export default class PlacesService {
    static getPlacesByTextSearch(data: any) {
        return axios.post(URL + "text", data);
    }

    static getPlacesByNearbySearch(data: any) {
        return axios.post(URL + "nearby", data);
    }

    static getApiKey() {
        return axios.get(URL + "key");
    }
}