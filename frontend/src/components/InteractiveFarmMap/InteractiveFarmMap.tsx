import React from "react";
import { MapContainer, TileLayer, Marker, useMapEvent, Polygon } from "react-leaflet";
import { type LatLngLiteral } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Box } from "@mui/material";

// temporary workaround for marker icon clash between Vite and React Leaflet
// Cast to any to silence TS error on private property access.
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

interface InteractiveFarmMapProps {
  markers: LatLngLiteral[];
  setMarkers: React.Dispatch<React.SetStateAction<LatLngLiteral[]>>;
}

export default function InteractiveFarmMap({ markers, setMarkers }: InteractiveFarmMapProps) {
  return (
    <Box sx={{ height: "100%", width: "100%" }}>
      <MapContainer
        center={[46.4402, -117.13005]}
        zoom={6}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        <ClickHandler markers={markers} setMarkers={setMarkers} />

        {markers.map((position, idx) => (
          <Marker key={idx} position={position} />
        ))}
        {markers.length >= 3 && <Polygon positions={markers}></Polygon>}
      </MapContainer>
    </Box>
  );
}
