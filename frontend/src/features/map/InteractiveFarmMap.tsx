import React from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvent,
  Polygon,
  useMap,
} from "react-leaflet";
import { type LatLngLiteral } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Box } from "@mui/material";
import { COLORS } from "../../styles/colors";
import "leaflet-control-geocoder/dist/Control.Geocoder.css";
import "leaflet-control-geocoder";

// temporary workaround for marker icon clash between Vite and React Leaflet
// eslint-disable-next-line @typescript-eslint/no-explicit-any
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

interface ClickHandlerProps {
  markers: LatLngLiteral[];
  setMarkers: React.Dispatch<React.SetStateAction<LatLngLiteral[]>>;
}

const ClickHandler: React.FC<ClickHandlerProps> = ({ markers, setMarkers }) => {
  useMapEvent("click", (e) => {
    setMarkers([...markers, e.latlng]);
  });
  return null;
};

interface GeocoderControlProps {
  onLocationFound: (position: LatLngLiteral) => void;
}

const GeocoderControl: React.FC<GeocoderControlProps> = ({
  onLocationFound,
}) => {
  const map = useMap();

  React.useEffect(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const geocoder = (L.Control as any).geocoder({
      defaultMarkGeocode: false,
    });

    geocoder.on("markgeocode", (e: { geocode: { center: L.LatLng } }) => {
      const latlng = e.geocode.center;
      onLocationFound({ lat: latlng.lat, lng: latlng.lng });
      map.setView(latlng, 16);
    });

    geocoder.addTo(map);

    return () => {
      map.removeControl(geocoder);
    };
  }, [map, onLocationFound]);
  return null;
};

interface DraggableMarkerProps {
  position: LatLngLiteral;
  index: number;
  onDragEnd: (index: number, newPosition: LatLngLiteral) => void;
  draggable?: boolean;
}

const DraggableMarker: React.FC<DraggableMarkerProps> = ({
  position,
  index,
  onDragEnd,
  draggable = true,
}) => {
  const markerRef = React.useRef<L.Marker | null>(null);

  const eventHandlers = React.useMemo(
    () => ({
      dragend() {
        const marker = markerRef.current;
        if (marker != null) {
          const newPos = marker.getLatLng();
          onDragEnd(index, { lat: newPos.lat, lng: newPos.lng });
        }
      },
    }),
    [index, onDragEnd],
  );

  return (
    <Marker
      draggable={draggable}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
};

interface InteractiveFarmMapProps {
  markers: LatLngLiteral[];
  setMarkers: React.Dispatch<React.SetStateAction<LatLngLiteral[]>>;
  isReadOnly?: boolean;
}

export default function InteractiveFarmMap({
  markers,
  setMarkers,
  isReadOnly = false,
}: InteractiveFarmMapProps) {
  const handleMarkerDragEnd = React.useCallback(
    (index: number, newPosition: LatLngLiteral) => {
      if (isReadOnly) return;
      setMarkers((prevMarkers) => {
        const updated = [...prevMarkers];
        updated[index] = newPosition;
        return updated;
      });
    },
    [setMarkers, isReadOnly],
  );

  const handleLocationFound = React.useCallback(
    (position: LatLngLiteral) => {
      if (isReadOnly) return;
      setMarkers((prevMarkers) => [...prevMarkers, position]);
    },
    [setMarkers, isReadOnly],
  );

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={[46.7324, -117.0002]}
        zoom={13}
        style={{ height: "100%", width: "100%" }}
      >
        {/* ESRI Satellite Imagery */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        />

        {/* ESRI Transportation Layer */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}"
          attribution="Transportation &copy; Esri"
        />

        {/* ESRI City Labels Layer */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution="Cities &copy; Esri"
        />

        {!isReadOnly && (
          <GeocoderControl onLocationFound={handleLocationFound} />
        )}

        {!isReadOnly && (
          <ClickHandler markers={markers} setMarkers={setMarkers} />
        )}

        {markers.map((position, idx) => (
          <DraggableMarker
            key={idx}
            position={position}
            index={idx}
            onDragEnd={handleMarkerDragEnd}
            draggable={!isReadOnly}
          />
        ))}

        {markers.length >= 3 && (
          <Polygon
            positions={markers}
            pathOptions={{
              color: COLORS.gold,
              weight: 3,
              fillColor: COLORS.gold,
              fillOpacity: 0.15,
            }}
          />
        )}
      </MapContainer>
    </Box>
  );
}
