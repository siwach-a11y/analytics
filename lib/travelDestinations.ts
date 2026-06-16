/** Maps IATA airport codes to city names for bundle matching and search */
export const airportToCity: Record<string, string> = {
  JFK: "New York",
  LGA: "New York",
  EWR: "New York",
  SFO: "San Francisco",
  LAX: "Los Angeles",
  LHR: "London",
  LGW: "London",
  CDG: "Paris",
  ORY: "Paris",
  NRT: "Tokyo",
  HND: "Tokyo",
  ORD: "Chicago",
  MIA: "Miami",
  DEN: "Denver",
  PHX: "Phoenix",
  DXB: "Dubai",
  SIN: "Singapore",
  FRA: "Frankfurt",
  BOS: "Boston",
  DOH: "Doha",
  SYD: "Sydney",
  SEA: "Seattle",
  HNL: "Honolulu",
  BKK: "Bangkok",
  BCN: "Barcelona",
};

export function getAirportCity(code: string): string {
  return airportToCity[code.toUpperCase()] ?? code;
}

/** Resolve a search term that may be an airport code or city name */
export function resolveDestinationQuery(query: string): string {
  const trimmed = query.trim();
  if (!trimmed) return "";
  const upper = trimmed.toUpperCase();
  return airportToCity[upper] ?? trimmed;
}

export function matchesAirportOrCity(
  airportCode: string,
  query: string
): boolean {
  if (!query.trim()) return true;
  const q = query.trim().toLowerCase();
  const code = airportCode.toLowerCase();
  const city = getAirportCity(airportCode).toLowerCase();
  return code.includes(q) || city.includes(q);
}

export function flightMatchesRoute(
  from: string,
  to: string,
  flightFrom: string,
  flightTo: string
): boolean {
  const fromOk = !from.trim() || matchesAirportOrCity(flightFrom, from);
  const toOk = !to.trim() || matchesAirportOrCity(flightTo, to);
  return fromOk && toOk;
}

export function citiesMatchForBundle(
  flightDestinationCode: string,
  hotelCity: string
): boolean {
  return (
    getAirportCity(flightDestinationCode).toLowerCase() ===
    hotelCity.toLowerCase()
  );
}
