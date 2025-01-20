import axios from "axios";

export async function getLatLongFromAddress(address) {
  const apiKey = process.env.GOOGLE_API_KEY;
  try {
    // Construct the Google Maps Geocoding API URL
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    // Make the API request
    const response = await axios.get(url);

    // Check if the response contains results
    if (response.data.status === "OK" && response.data.results.length > 0) {
      const location = response.data.results[0].geometry.location;
      return {
        latitude: location.lat,
        longitude: location.lng,
      };
    } else {
      throw new Error("No results found for the given address.");
    }
  } catch (error) {
    // Handle any errors that occur during the API request
    throw new Error(`Failed to retrieve location: ${error.message}`);
  }
}

export async function getDistanceAndTimeService(pickup, destination) {
  if (!pickup || !destination) {
    throw new Error("Origin and destination are required");
  }
  const apiKey = process.env.GOOGLE_API_KEY;

  const url = `https://maps.googleapis.com/maps/api/distancematrix/json?origins=${encodeURIComponent(
    pickup
  )}&destinations=${encodeURIComponent(destination)}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      if (response.data.rows[0].elements[0].status === "ZERO_RESULTS") {
        throw new Error("No routes found");
      }

      return response.data.rows[0].elements[0];
    } else {
      throw new Error("Unable to fetch distance and time");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getSuggestionsService(address) {
  if (!address) {
    throw new Error("Address is required");
  }

  const apiKey = process.env.GOOGLE_API_KEY;

  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    address
  )}&key=${apiKey}`;

  try {
    const response = await axios.get(url);
    if (response.data.status === "OK") {
      return response.data.predictions;
    } else {
      throw new Error("Unable to fetch suggestions");
    }
  } catch (err) {
    console.error(err);
    throw err;
  }
}

export async function getFareDetailsService(distance, vehicleType) {
  if (!distance || !vehicleType) {
    throw new Error("Distance and duration are required");
  }

  const perKmCharge = {
    car: 10,
    auto: 8,
    motorcycle: 6,
  };

  const fare = (type, distance) => {
    const distanceInKm = distance / 1000;
    return (distanceInKm * perKmCharge[type] || 0).toFixed(2);
  };

  const fares = {
    Car: fare("car", distance),
    Auto: fare("auto", distance),
    Motorcycle: fare("motorcycle", distance),
  };

  return fares[vehicleType];
}

export async function getFareDetailsServiceForAllVehicle(distance) {
  if (!distance) {
    throw new Error("Distance  are required");
  }

  const perKmCharge = {
    car: 10,
    auto: 8,
    motorcycle: 6,
  };

  const fare = (type, distance) => {
    const distanceInKm = distance / 1000;
    return (distanceInKm * perKmCharge[type] || 0).toFixed(2);
  };

  const fares = {
    Car: fare("car", distance),
    Auto: fare("auto", distance),
    Motorcycle: fare("motorcycle", distance),
  };

  return fares;
}
