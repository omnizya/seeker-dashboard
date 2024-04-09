type positionT = {
  lat: number;
  lng: number;
};
export const SUNRISE_SUNSET = ({
  lat = 33.456444,
  lng = -7.650666,
}: positionT) => `https://api.sunrise-sunset.org/json?lat=${lat}&lng=${lng}`;
