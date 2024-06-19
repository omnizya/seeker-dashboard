export default  function getUserGeolocation() {
  const status = {
    message: "",
    isOk: false,
  };
  const success = (position: GeolocationPosition) =>
    JSON.stringify({
      lat: position.coords.latitude,
      lng: position.coords.longitude,
    });
  const error = () => (status.message = "Unable to retrieve your location");
  if (!navigator.geolocation) {
    status.message = "Geolocation is not supported by your browser";
  } else {
    status.message = "Locating";
    status.isOk = true;

    navigator.geolocation.getCurrentPosition(success, error);
  }
}
