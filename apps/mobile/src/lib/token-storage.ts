import { Preferences } from "@capacitor/preferences";

const TOKEN_KEY = "auth_session_token";

export async function saveToken(token: string): Promise<void> {
  await Preferences.set({ key: TOKEN_KEY, value: token });
}

export async function getToken(): Promise<string | null> {
  const { value } = await Preferences.get({ key: TOKEN_KEY });
  return value;
}

export async function removeToken(): Promise<void> {
  await Preferences.remove({ key: TOKEN_KEY });
}
