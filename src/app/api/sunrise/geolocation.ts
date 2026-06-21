/**
 * Client-side browser geolocation utility.
 * Returns a Promise that resolves to { lat, lng } or rejects with an error message.
 *
 * Usage:
 *   import getUserGeolocation from "~/app/api/sunrise/geolocation";
 *   getUserGeolocation()
 *     .then(({ lat, lng }) => console.log(lat, lng))
 *     .catch((err) => console.error(err));
 */

type GeoCoord = { lat: number; lng: number };

export default function getUserGeolocation(
  options?: PositionOptions,
): Promise<GeoCoord> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      reject(new Error("Geolocation is not supported by this browser"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position: GeolocationPosition) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      (error: GeolocationPositionError) => {
        const messages: Record<number, string> = {
          [error.PERMISSION_DENIED]: "User denied the request for geolocation",
          [error.POSITION_UNAVAILABLE]: "Location information is unavailable",
          [error.TIMEOUT]: "The request to get user location timed out",
        };
        reject(new Error(messages[error.code] || "Unknown geolocation error"));
      },
      options,
    );
  });
}
