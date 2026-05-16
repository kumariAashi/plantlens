import { useState, useCallback } from "react";
import { identifyPlant } from "../services/plantnetService";
import { getPlantCare } from "../services/perenualService";
import { lookupAyurvedicInfo } from "../constants/ayurvedicDb";
import type { PlantResult, CareInfo, AyurvedicData } from "../types";

interface IdentifyState {
  loading: boolean;
  results: PlantResult[] | null;
  careInfo: CareInfo | null;
  ayurvedicData: AyurvedicData | null;
  error: string | null;
}

export function usePlantIdentify() {
  const [state, setState] = useState<IdentifyState>({
    loading: false,
    results: null,
    careInfo: null,
    ayurvedicData: null,
    error: null,
  });

  const identify = useCallback(async (imageUri: string) => {
    setState({ loading: true, results: null, careInfo: null, ayurvedicData: null, error: null });

    try {
      const results = await identifyPlant(imageUri);

      let careInfo: CareInfo | null = null;
      let ayurvedicData: AyurvedicData | null = null;

      if (results.length > 0) {
        // Fetch care data
        try {
          careInfo = await getPlantCare(results[0].scientificName);
        } catch {
          careInfo = { watering: "Not available", sunlight: "Not available", poisonous: false, description: "" };
        }

        // Lookup Ayurvedic info from local DB
        const ayuInfo = lookupAyurvedicInfo(results[0].scientificName);
        if (ayuInfo) {
          ayurvedicData = {
            localNames: ayuInfo.localNames,
            medicinalUses: ayuInfo.medicinalUses,
            ayurvedicBenefits: ayuInfo.ayurvedicBenefits,
            doshaEffect: ayuInfo.doshaEffect,
            partUsed: ayuInfo.partUsed,
          };
        }
      }

      setState({ loading: false, results, careInfo, ayurvedicData, error: null });
      return { results, careInfo, ayurvedicData };
    } catch (err: any) {
      const errorMessage = err?.message ?? "Something went wrong. Please try again.";
      setState({ loading: false, results: null, careInfo: null, ayurvedicData: null, error: errorMessage });
      throw err;
    }
  }, []);

  const reset = useCallback(() => {
    setState({ loading: false, results: null, careInfo: null, ayurvedicData: null, error: null });
  }, []);

  return { ...state, identify, reset };
}
