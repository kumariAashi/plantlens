import { useState, useEffect, useCallback } from "react";
import { getHistory, deleteFromHistory, clearHistory as clearHistoryService } from "../services/storageService";
import type { ScanRecord } from "../types";

export function useHistory() {
  const [history, setHistory] = useState<ScanRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const loadHistory = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getHistory();
      setHistory(data);
    } catch {
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadHistory();
  }, [loadHistory]);

  const removeItem = useCallback(
    async (id: string) => {
      await deleteFromHistory(id);
      setHistory((prev) => prev.filter((item) => item.id !== id));
    },
    []
  );

  const clearAll = useCallback(async () => {
    await clearHistoryService();
    setHistory([]);
  }, []);

  return {
    history,
    loading,
    refresh: loadHistory,
    removeItem,
    clearAll,
  };
}
