import AsyncStorage from "@react-native-async-storage/async-storage";
import { HISTORY_STORAGE_KEY } from "../constants/config";
import type { ScanRecord } from "../types";

export async function saveToHistory(scan: ScanRecord): Promise<void> {
  const raw = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
  const history: ScanRecord[] = raw ? JSON.parse(raw) : [];
  history.unshift(scan);
  await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
}

export async function getHistory(): Promise<ScanRecord[]> {
  const raw = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
  return raw ? JSON.parse(raw) : [];
}

export async function deleteFromHistory(id: string): Promise<void> {
  const raw = await AsyncStorage.getItem(HISTORY_STORAGE_KEY);
  const history: ScanRecord[] = raw ? JSON.parse(raw) : [];
  const updated = history.filter((item) => item.id !== id);
  await AsyncStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
}

export async function clearHistory(): Promise<void> {
  await AsyncStorage.removeItem(HISTORY_STORAGE_KEY);
}
