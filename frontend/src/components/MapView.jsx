import "./MapView.css";

function MapView({ mapData }) {
  if (!mapData || !mapData.google_maps_embed_url) {
    return null;
  }

  return (
    <div className="map-container">
      <h2>Location Map</h2>

      <iframe
        title="Google Maps"
        src={mapData.google_maps_embed_url}
        className="map-frame"
        loading="lazy"
        allowFullScreen
      />
    </div>
  );
}

export default MapView;