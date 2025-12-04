import React, { useState } from "react";
import { MapContainer, TileLayer, Marker, useMapEvent, Polygon } from "react-leaflet";
import { type LatLngLiteral } from "leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { Box, Button } from "@mui/material";

// temporary workaround for marker icon clash between Vite and React Leaflet
delete L.Icon.Default.prototype._getIconUrl;
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

export default function FarmMap() {
  const [markers, setMarkers] = useState<LatLngLiteral[]>([]);

  const handleClearMarkers = () => {
    setMarkers([]);
  }

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <Button variant="contained" onClick={handleClearMarkers}>Clear markers</Button>
      <Box sx={{ height: "500px", width: "66%" }}>
        <MapContainer
          center={[40, -100]}
          zoom={4}
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
    </Box>
  );
};