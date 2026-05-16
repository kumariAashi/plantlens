import AsyncStorage from "@react-native-async-storage/async-storage";
import { PERENUAL_API_KEY, PERENUAL_URL, CARE_CACHE_KEY_PREFIX } from "../constants/config";
import type { CareInfo } from "../types";

export async function getPlantCare(scientificName: string): Promise<CareInfo> {
  // Check cache first (Perenual has a 100/day free limit)
  const cacheKey = `${CARE_CACHE_KEY_PREFIX}${scientificName.toLowerCase().replace(/\s+/g, "_")}`;

  try {
    const cached = await AsyncStorage.getItem(cacheKey);
    if (cached) {
      return JSON.parse(cached) as CareInfo;
    }
  } catch {
    // cache miss — continue to API
  }

  try {
    const res = await fetch(
      `${PERENUAL_URL}?q=${encodeURIComponent(scientificName)}&key=${PERENUAL_API_KEY}`
    );

    if (!res.ok) {
      return getDefaultCareInfo();
    }

    const data = await res.json();
    const plant = data?.data?.[0];

    if (!plant) {
      return getDefaultCareInfo();
    }

    const careInfo: CareInfo = {
      watering: plant?.watering ?? "Not available",
      sunlight: Array.isArray(plant?.sunlight)
        ? plant.sunlight.join(", ")
        : plant?.sunlight ?? "Not available",
      poisonous:
        plant?.poisonous_to_humans === true ||
        plant?.poisonous_to_humans === 1 ||
        plant?.poisonous_to_pets === true ||
        plant?.poisonous_to_pets === 1,
      description: plant?.description ?? "",
    };

    // Cache the result for future lookups
    try {
      await AsyncStorage.setItem(cacheKey, JSON.stringify(careInfo));
    } catch {
      // silently fail cache write
    }

    return careInfo;
  } catch {
    return getDefaultCareInfo();
  }
}

function getDefaultCareInfo(): CareInfo {
  return {
    watering: "Not available",
    sunlight: "Not available",
    poisonous: false,
    description: "",
  };
}
