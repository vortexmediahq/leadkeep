import { create } from "zustand";
import { DEFAULT_CHANNEL, type AlertChannel } from "@/lib/alerts";
import { fetchAlertSettings, saveAlertSettings } from "@/lib/alerts-data";

type AlertState = {
  userId: string | null;
  channel: AlertChannel;
  lastSeenAt: string | null;
  load: (userId: string) => Promise<void>;
  setChannel: (channel: AlertChannel) => Promise<void>;
  markSeen: () => void;
};

export const useAlerts = create<AlertState>()((set, get) => ({
  userId: null,
  channel: DEFAULT_CHANNEL,
  lastSeenAt: null,
  load: async (userId) => {
    if (get().userId === userId) return;
    set({ userId });
    const settings = await fetchAlertSettings(userId);
    set(settings);
  },
  setChannel: async (channel) => {
    set({ channel });
    const { userId, lastSeenAt } = get();
    if (userId) await saveAlertSettings(userId, { channel, lastSeenAt });
  },
  markSeen: () => {
    const lastSeenAt = new Date().toISOString();
    set({ lastSeenAt });
    const { userId, channel } = get();
    if (userId) void saveAlertSettings(userId, { channel, lastSeenAt });
  },
}));
