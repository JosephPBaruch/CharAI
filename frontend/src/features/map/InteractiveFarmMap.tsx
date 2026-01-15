import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvent, Polygon } from "react-leaflet";
import { type LatLngLiteral } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Box } from "@mui/material";
import { COLORS } from "../../styles/colors";

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

interface DraggableMarkerProps {
  position: LatLngLiteral;
  index: number;
  onDragEnd: (index: number, newPosition: LatLngLiteral) => void;
}

const DraggableMarker: React.FC<DraggableMarkerProps> = ({ position, index, onDragEnd }) => {
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
    [index, onDragEnd]
  );

  return (
    <Marker
      draggable={true}
      eventHandlers={eventHandlers}
      position={position}
      ref={markerRef}
    />
  );
};

interface InteractiveFarmMapProps {
  markers: LatLngLiteral[];
  setMarkers: React.Dispatch<React.SetStateAction<LatLngLiteral[]>>;
}

export default function InteractiveFarmMap({ markers, setMarkers }: InteractiveFarmMapProps) {
  const handleMarkerDragEnd = React.useCallback(
    (index: number, newPosition: LatLngLiteral) => {
      setMarkers((prevMarkers) => {
        const updated = [...prevMarkers];
        updated[index] = newPosition;
        return updated;
      });
    },
    [setMarkers]
  );

  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={[46.4402, -117.13005]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
      >
        {/* ESRI Satellite Imagery */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community"
        />

        {/* ESRI Transportation Layer */}
        <TileLayer
          url='https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Transportation/MapServer/tile/{z}/{y}/{x}'
          attribution="Transportation &copy; Esri"
        />

        {/* ESRI City Labels Layer */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/Reference/World_Boundaries_and_Places/MapServer/tile/{z}/{y}/{x}"
          attribution="Cities &copy; Esri"
        />

        <ClickHandler markers={markers} setMarkers={setMarkers} />

        {markers.map((position, idx) => (
          <DraggableMarker
            key={idx}
            position={position}
            index={idx}
            onDragEnd={handleMarkerDragEnd}
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
