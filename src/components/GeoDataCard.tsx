import { GeolocationState, useGeolocation } from "@uidotdev/usehooks";
export default function GeoDataCard() {
  return (
    <aside>
      <h1>Geolocation</h1>
      <Location />
    </aside>
  );
}

function Location() {
  const state = useGeolocation();
  if (state.loading) {
    return (
      <p>
        Loading..
        <br />
        (You may need to enable permissions)
      </p>
    );
  }
  if (state.error) {
    return <p>Enable permissions to access your location data</p>;
  }
  return <GeoCard state={state} />;
}
function GeoCard({ state }: { state: GeolocationState }) {
  return (
    <div>
      timestamp : {state.timestamp}
      latitude: {state.latitude}
      longitude: {state.longitude}
      altitude: {state.altitude}
      altitude Accuracy: {state.altitudeAccuracy}
    </div>
  );
}
