import { PLANTNET_API_KEY, PLANTNET_URL } from "../constants/config";
import type { PlantResult } from "../types";

export async function identifyPlant(imageUri: string): Promise<PlantResult[]> {
  const formData = new FormData();

  formData.append("images", {
    uri: imageUri,
    type: "image/jpeg",
    name: "plant.jpg",
  } as any);

  formData.append("organs", "auto");

  const response = await fetch(
    `${PLANTNET_URL}?api-key=${PLANTNET_API_KEY}&include-related-images=true`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!response.ok) {
    const errorBody = await response.text();
    if (response.status === 404) {
      throw new Error("No plant match found. Try a clearer image.");
    }
    throw new Error(`Identification failed (${response.status}): ${errorBody}`);
  }

  const data = await response.json();

  if (!data.results || data.results.length === 0) {
    throw new Error("No plant match found. Try a clearer photo of a leaf or flower.");
  }

  // Return top 3 results for user to pick from
  const topResults: PlantResult[] = data.results.slice(0, 3).map((result: any) => ({
    commonName: result.species?.commonNames?.[0] ?? "Unknown",
    scientificName: result.species?.scientificNameWithoutAuthor ?? "Unknown",
    confidence: Math.round((result.score ?? 0) * 100),
    family: result.species?.family?.scientificNameWithoutAuthor ?? "Unknown",
    imageUrl: result.images?.[0]?.url?.m ?? undefined,
  }));

  return topResults;
}
