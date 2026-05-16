import AsyncStorage from "@react-native-async-storage/async-storage";

const TOKEN_KEY = "becho_token";
const USER_KEY = "becho_user";

export async function getToken(): Promise<string | null> {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function setToken(token: string): Promise<void> {
  await AsyncStorage.setItem(TOKEN_KEY, token);
}

export async function removeToken(): Promise<void> {
  await AsyncStorage.removeItem(TOKEN_KEY);
}

export async function getStoredUser<T>(): Promise<T | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  if (!raw) return null;
  return JSON.parse(raw) as T;
}

export async function setStoredUser<T>(user: T): Promise<void> {
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function removeStoredUser(): Promise<void> {
  await AsyncStorage.removeItem(USER_KEY);
}

export async function clearAuthStorage(): Promise<void> {
  await Promise.all([removeToken(), removeStoredUser()]);
}
