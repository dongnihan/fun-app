import { AdvancedMarker, Pin, useMap } from "@vis.gl/react-google-maps";
import React, { useCallback, useEffect } from "react";
import { Poi } from "../models/Poi";
import {MarkerClusterer} from '@googlemaps/markerclusterer';
import type {Marker} from '@googlemaps/markerclusterer';
// import Circle from "@react-google-maps/api/src/components/drawing/Circle";
import { CircleComponent } from "./CircleComponent.tsx";

interface PoiMarkersComponentProps {
    pois: Poi[];
    radius: number;
}

export default function PoiMarkersComponent(props: PoiMarkersComponentProps) {
    const map = useMap();
    const [markers, setMarkers] = React.useState<{[key: string]: Marker}>({});
    const clusterer = React.useRef<MarkerClusterer | null>(null);
    const [circleCenter, setCircleCenter] = React.useState<google.maps.LatLng | null>(null);

    // Initialize MarkerClusterer, if the map has changed
    useEffect(() => {
        if (!map) return;
        if (!clusterer.current) {
            clusterer.current = new MarkerClusterer({map});
        }
    }, [map]);
    
    // Update markers, if the markers array has changed
    useEffect(() => {
        clusterer.current?.clearMarkers();
        clusterer.current?.addMarkers(Object.values(markers));
    }, [markers]); 

    const setMarkerRef = (marker: Marker | null, key: string) => {
        if (marker && markers[key]) return;
        if (!marker && !markers[key]) return;
    
        setMarkers(prev => {
          if (marker) {
            return {...prev, [key]: marker};
          } else {
            const newMarkers = {...prev};
            delete newMarkers[key];
            return newMarkers;
          }
        });
    };

    const handleClick = useCallback((ev: google.maps.MapMouseEvent) => {
        if(!map) return;
        if(!ev.latLng) return;
        console.log('marker clicked:', ev.latLng.toString());
        map.panTo(ev.latLng);
        // setCircleCenter(ev.latLng);
    }, [props.pois]);

    return (
        <>  
            {/* <CircleComponent
                radius={props.radius}
                center={circleCenter}
                strokeColor={'#0c4cb3'}
                strokeOpacity={1}
                strokeWeight={3}
                fillColor={'#3b82f6'}
                fillOpacity={0.3}
            /> */}
            {props.pois.map((poi: Poi) => (
                <AdvancedMarker 
                    key={poi.key} 
                    position={poi.location}
                    ref={marker => setMarkerRef(marker, poi.key)}
                    clickable={true}
                    onClick={handleClick}
                >
                    <Pin background={'#ed2136'} glyphColor={'#000'} borderColor={'#000'} />    
                </AdvancedMarker>
            ))}
        </>
    );
}