import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LatLngTuple } from "leaflet";

const BiocharMap = () => {
  // Mock field polygon (replace with parsed CSV or backend)
  const fieldCoords: LatLngTuple[] = [
    [43.612, -116.391],
    [43.613, -116.391],
    [43.613, -116.389],
    [43.612, -116.389]
  ];

  return (
    <div style={{ height: "500px", width: "800px", borderRadius: "12px", overflow: "hidden" }}>
      <MapContainer
        center={[43.6125, -116.390]}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
        scrollWheelZoom={true}      // enable trackpad / scroll zoom
        touchZoom={true}            // pinch / touch support
        doubleClickZoom={true}      // double-click zoom
        zoomControl={true}           // overlay +/- buttons
      >
        {/* ESRI Satellite Imagery */}
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles © Esri — Source: Esri, Maxar, Earthstar Geographics"
        />

        {/* Field boundary polygon */}
        <Polygon
          positions={fieldCoords}
          pathOptions={{ color: "yellow", weight: 3 }}
        />
      </MapContainer>
    </div>
  );
};

export default BiocharMap;
