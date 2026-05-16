export interface PlantResult {
  commonName: string;
  scientificName: string;
  confidence: number;
  family: string;
  imageUrl?: string;
}

export interface CareInfo {
  watering: string;
  sunlight: string;
  poisonous: boolean;
  description: string;
}

export interface AyurvedicData {
  localNames: { hindi?: string; sanskrit?: string; tamil?: string; telugu?: string; kannada?: string; marathi?: string };
  medicinalUses: string[];
  ayurvedicBenefits: string[];
  doshaEffect?: string;
  partUsed?: string;
}

export interface ScanRecord {
  id: string;
  imageUri: string;
  commonName: string;
  scientificName: string;
  confidence: number;
  family: string;
  watering: string;
  sunlight: string;
  poisonous: boolean;
  description: string;
  scannedAt: string;
  // Ayurvedic fields
  localNames?: { hindi?: string; sanskrit?: string };
  medicinalUses?: string[];
  ayurvedicBenefits?: string[];
  doshaEffect?: string;
  partUsed?: string;
}
