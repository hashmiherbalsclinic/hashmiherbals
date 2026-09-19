/**
 * Pakistan cities sourced from country-state-city
 * (countries-states-cities database / ISO country PK).
 * There is no official Pakistan government cities API for checkout use.
 */
import cities from "@/lib/data/pakistan-cities.json";

export const PAKISTAN_CITIES: string[] = [...cities, "Other"];
