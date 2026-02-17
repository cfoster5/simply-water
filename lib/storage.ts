import { MMKV } from "react-native-mmkv";
import { StateStorage } from "zustand/middleware";

export const storage = new MMKV();

export const zustandStorage: StateStorage = {
  setItem: (name, value) => storage.set(name, value),
  getItem: (name) => storage.getString(name) ?? null,
  removeItem: (name) => storage.delete(name),
};
