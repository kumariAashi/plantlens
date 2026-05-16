# 🌿 PlantLens — Expo Go App Plan (v2)

> A clean, minimal plant identification app built with **Expo Go (React Native)**, using **PlantNet API** for identification and **React Native Paper (Material Design 3)** for UI — targeting Android & iOS.

---

## 📌 Project Overview

| Field | Details |
|---|---|
| **App Name** | PlantLens |
| **Framework** | Expo Go (React Native) |
| **Platform** | Android & iOS |
| **UI Library** | React Native Paper (Google Material Design 3) |
| **Identification API** | PlantNet API (free, no key needed for basic) |
| **Care Data API** | Perenual API (free tier) |
| **Storage** | AsyncStorage (local, on-device) |
| **Navigation** | Expo Router (file-based routing) |
| **Language** | JavaScript / TypeScript |

---

## 🎯 Core Features

1. **Camera Capture** — Use `expo-camera` to take a plant photo
2. **Gallery Upload** — Use `expo-image-picker` to select from gallery
3. **Plant Identification** — POST image to PlantNet API
4. **Plant Detail Screen** — Show:
   - Common name & scientific name
   - Care tips (watering, sunlight) via Perenual
   - Toxicity / safety info
   - Confidence score
5. **Scan History** — View past scans stored with `AsyncStorage`
6. **Offline Fallback** — Show cached results if no network

---

## 🗂️ Project Folder Structure

```
plantlens/
│
├── app/                          # Expo Router screens (file-based)
│   ├── _layout.tsx               # Root layout + Paper Provider
│   ├── index.tsx                 # Home screen
│   ├── result.tsx                # Plant result screen
│   └── history.tsx               # Scan history screen
│
├── components/
│   ├── PlantCard.tsx             # Reusable plant info card
│   ├── ImagePreview.tsx          # Camera/gallery image preview
│   ├── InfoChip.tsx              # Toxicity / sunlight chip badge
│   └── LoadingOverlay.tsx        # Full-screen loading spinner
│
├── services/
│   ├── plantnetService.ts        # PlantNet API calls
│   ├── perenualService.ts        # Perenual care data API calls
│   └── storageService.ts         # AsyncStorage read/write helpers
│
├── hooks/
│   ├── usePlantIdentify.ts       # Custom hook: image → API → result
│   └── useHistory.ts             # Custom hook: load/save history
│
├── constants/
│   ├── theme.ts                  # Material Design 3 theme config
│   └── config.ts                 # API base URLs, keys
│
└── assets/
    ├── fonts/                    # Custom fonts (if any)
    └── images/                   # App icon, splash, placeholders
```

---

## 🖥️ Screen-by-Screen Design

### Design System — Material Design 3 (React Native Paper)

| Token | Value |
|---|---|
| **Primary** | `#2E7D32` — Deep Forest Green |
| **Secondary** | `#A5D6A7` — Sage Green |
| **Surface** | `#FFFFFF` |
| **Background** | `#F1F8F1` — Faint green tint |
| **On-Primary** | `#FFFFFF` |
| **Error** | `#D32F2F` |
| **Typography** | MD3 defaults — `displayLarge`, `titleMedium`, `bodySmall` |
| **Elevation** | MD3 card elevation (`level1`–`level3`) |
| **Shape** | Rounded corners — 12px cards, 24px FAB |

---

### 1. Home Screen (`app/index.tsx`)

**Layout:**
1. **Top App Bar** — `"PlantLens 🌿"` title (MD3 `Appbar.Header`)
2. **Hero Section** — Soft botanical illustration or animated leaf
3. **Tagline** — *"Point. Snap. Identify."* in `bodyLarge`
4. **Primary FAB** — 📷 `"Scan Plant"` opens camera (`expo-camera`)
5. **Secondary Button** — 🖼️ `"Upload Image"` opens gallery (`expo-image-picker`)
6. **Bottom Navigation Bar** — Home | History (MD3 `BottomNavigation`)

---

### 2. Loading Screen (overlay on Result)

**Layout:**
1. MD3 `ActivityIndicator` in Primary Green
2. Text: *"Identifying your plant…"*
3. Lottie leaf animation (optional via `lottie-react-native`)

---

### 3. Result Screen (`app/result.tsx`)

**Layout:**
1. **Image Card** — Full-width plant image with rounded bottom (`MD3 Card`)
2. **Name Section:**
   - `titleLarge` — Common Name (e.g., *Peace Lily*)
   - `bodyMedium` italic — Scientific Name
   - MD3 `Chip` — Confidence % in green
3. **Info Cards (ScrollView):**
   - 🌊 **Watering** — MD3 `Card` with icon + description
   - ☀️ **Sunlight** — MD3 `Card` with icon + description
   - ⚠️ **Toxicity** — MD3 `Chip`, red if toxic / green if safe
4. **Save Button** — MD3 `Button` variant="contained" — `"Save to History"`
5. **Back Button** — MD3 `Appbar.BackAction`

---

### 4. History Screen (`app/history.tsx`)

**Layout:**
1. **App Bar** — `"My Plants 🕘"`
2. **Scrollable List** — MD3 `List.Item` per scan:
   - Thumbnail (rounded, 56×56)
   - Common name + scientific name
   - Date scanned
3. **Tap** → Opens full result detail
4. **Empty State** — MD3 `Text` + leaf icon: *"No plants yet. Go explore! 🌱"*

---

## 🔌 API Integration

### PlantNet API (Primary Identification)

- **Endpoint:** `https://my-api.plantnet.org/v2/identify/all`
- **Method:** POST multipart/form-data
- **Auth:** Free API key from [my.plantnet.org](https://my.plantnet.org)
- **Payload:** Image file + organs param (`leaf`, `flower`, `auto`)
- **Response:** Species list with scores, common names, scientific names

```typescript
// services/plantnetService.ts
const PLANTNET_API_KEY = "YOUR_FREE_API_KEY";
const PLANTNET_URL = "https://my-api.plantnet.org/v2/identify/all";

export async function identifyPlant(imageUri: string): Promise<PlantResult> {
  const formData = new FormData();
  formData.append("images", {
    uri: imageUri,
    type: "image/jpeg",
    name: "plant.jpg",
  } as any);
  formData.append("organs", "auto");

  const response = await fetch(`${PLANTNET_URL}?api-key=${PLANTNET_API_KEY}`, {
    method: "POST",
    body: formData,
    headers: { "Content-Type": "multipart/form-data" },
  });

  const data = await response.json();
  const top = data.results[0];

  return {
    commonName: top.species.commonNames[0] ?? "Unknown",
    scientificName: top.species.scientificNameWithoutAuthor,
    confidence: Math.round(top.score * 100),
    family: top.species.family.scientificNameWithoutAuthor,
  };
}
```

---

### Perenual API (Care Data — fetched after identification)

- **Endpoint:** `https://perenual.com/api/v2/species-list`
- **Method:** GET with `?q=<scientific_name>&key=YOUR_KEY`
- **Free Tier:** 100 requests/day
- **Returns:** Watering, sunlight, toxicity, description

```typescript
// services/perenualService.ts
const PERENUAL_KEY = "YOUR_PERENUAL_KEY";

export async function getPlantCare(scientificName: string): Promise<CareInfo> {
  const res = await fetch(
    `https://perenual.com/api/v2/species-list?q=${encodeURIComponent(scientificName)}&key=${PERENUAL_KEY}`
  );
  const data = await res.json();
  const plant = data.data[0];

  return {
    watering: plant?.watering ?? "Not available",
    sunlight: plant?.sunlight?.join(", ") ?? "Not available",
    poisonous: plant?.poisonous_to_humans === 1 || plant?.poisonous_to_pets === 1,
    description: plant?.description ?? "",
  };
}
```

---

## 🗃️ Local Storage Schema (AsyncStorage)

```typescript
// Each scan stored as JSON under key "history"
interface ScanRecord {
  id: string;               // uuid
  imageUri: string;         // local file path
  commonName: string;
  scientificName: string;
  confidence: number;
  watering: string;
  sunlight: string;
  poisonous: boolean;
  scannedAt: string;        // ISO date string
}

// storageService.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

export async function saveToHistory(scan: ScanRecord) {
  const raw = await AsyncStorage.getItem("history");
  const history: ScanRecord[] = raw ? JSON.parse(raw) : [];
  history.unshift(scan);
  await AsyncStorage.setItem("history", JSON.stringify(history));
}

export async function getHistory(): Promise<ScanRecord[]> {
  const raw = await AsyncStorage.getItem("history");
  return raw ? JSON.parse(raw) : [];
}
```

---

## 📦 Dependencies

```bash
# Initialize project
npx create-expo-app plantlens --template blank-typescript

# Install dependencies
npx expo install expo-camera expo-image-picker expo-router
npx expo install @react-native-async-storage/async-storage
npx expo install react-native-paper react-native-safe-area-context
npx expo install expo-image-manipulator
npm install uuid
```

### `package.json` key deps

```json
{
  "dependencies": {
    "expo": "~51.0.0",
    "expo-camera": "~15.0.0",
    "expo-image-picker": "~15.0.0",
    "expo-image-manipulator": "~12.0.0",
    "expo-router": "~3.5.0",
    "react-native-paper": "^5.12.0",
    "react-native-safe-area-context": "4.10.1",
    "@react-native-async-storage/async-storage": "1.23.1",
    "uuid": "^9.0.0"
  }
}
```

---

## ⚙️ Material Design 3 Theme Setup

```typescript
// constants/theme.ts
import { MD3LightTheme } from "react-native-paper";

export const AppTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: "#2E7D32",
    secondary: "#A5D6A7",
    background: "#F1F8F1",
    surface: "#FFFFFF",
    error: "#D32F2F",
    onPrimary: "#FFFFFF",
  },
};

// app/_layout.tsx
import { PaperProvider } from "react-native-paper";
import { AppTheme } from "../constants/theme";

export default function RootLayout() {
  return (
    <PaperProvider theme={AppTheme}>
      <Stack />
    </PaperProvider>
  );
}
```

---

## 🧱 Development Phases

### Phase 1 — Project Setup (Day 1)
- [ ] Init Expo project with TypeScript template
- [ ] Install all dependencies
- [ ] Configure Expo Router file-based navigation
- [ ] Set up React Native Paper + custom MD3 theme
- [ ] Run on Expo Go app on Android/iOS device

### Phase 2 — Camera & Gallery (Day 2)
- [ ] Implement camera capture with `expo-camera`
- [ ] Implement gallery pick with `expo-image-picker`
- [ ] Show image preview on Home Screen
- [ ] Handle permissions (camera, media library)

### Phase 3 — PlantNet API (Day 3–4)
- [ ] Register at my.plantnet.org → get free API key
- [ ] Build `plantnetService.ts` — POST image, parse top result
- [ ] Show result on Result Screen with name + confidence
- [ ] Handle: no match found, network error, low confidence

### Phase 4 — Perenual Care Data (Day 5)
- [ ] Register at perenual.com → get free API key
- [ ] Build `perenualService.ts` — GET by scientific name
- [ ] Map watering, sunlight, toxicity to Result Screen cards
- [ ] Add toxicity badge (red/green MD3 Chip)

### Phase 5 — History Screen (Day 6)
- [ ] Build `storageService.ts` with AsyncStorage
- [ ] Wire "Save to History" button on Result Screen
- [ ] Build History Screen with MD3 List items + thumbnails
- [ ] Empty state design

### Phase 6 — Polish & Testing (Day 7–8)
- [ ] Finalize white/green MD3 theme across all screens
- [ ] Add loading overlays + error toasts (MD3 `Snackbar`)
- [ ] Test on real Android + iOS devices via Expo Go
- [ ] Handle edge cases (blurry image, non-plant photo)
- [ ] Resize images before upload using `expo-image-manipulator`

---

## ⚠️ Key Challenges & Solutions

| Challenge | Solution |
|---|---|
| Camera permissions on iOS | Use `expo-camera` permission hooks + graceful fallback |
| Image too large for API | Resize with `expo-image-manipulator` before upload |
| PlantNet low confidence | Show top 3 results, let user pick the right one |
| Perenual 100/day free limit | Cache Perenual result in AsyncStorage by scientific name |
| Android back navigation | Use Expo Router's built-in `router.back()` |

---

## 🌱 Future Enhancements

- 🔍 **Search by name** — look up any plant without taking a photo
- 🗺️ **Location tagging** — record where the plant was found (GPS)
- 🔔 **Care reminders** — push notifications via `expo-notifications`
- 🌙 **Dark mode** — MD3 dark theme toggle
- ☁️ **Cloud backup** — sync history to Firebase / Supabase

---

*Built with React Native + Expo Go | UI: Material Design 3 (React Native Paper) | API: PlantNet + Perenual*