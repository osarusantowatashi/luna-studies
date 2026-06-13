type StoredGameSession<T> = {
  createdAt: number;
  ttlMinutes: number;
  data: T;
};

const getSessionKey = (gameKey: string) => `luna_arcade_session_${gameKey}`;

export const saveGameSession = <T,>(
  gameKey: string,
  data: T,
  ttlMinutes = 30
) => {
  const payload: StoredGameSession<T> = {
    createdAt: Date.now(),
    ttlMinutes,
    data,
  };

  sessionStorage.setItem(getSessionKey(gameKey), JSON.stringify(payload));
};

export const loadGameSession = <T,>(gameKey: string): T | null => {
  const sessionKey = getSessionKey(gameKey);
  const rawSession = sessionStorage.getItem(sessionKey);

  if (!rawSession) return null;

  try {
    const parsed = JSON.parse(rawSession) as StoredGameSession<T>;
    const ttlMinutes = parsed.ttlMinutes || 30;
    const createdAt = Number(parsed.createdAt || 0);
    const expired = !createdAt || Date.now() - createdAt > ttlMinutes * 60 * 1000;

    if (expired || !parsed.data) {
      sessionStorage.removeItem(sessionKey);
      return null;
    }

    return parsed.data;
  } catch {
    sessionStorage.removeItem(sessionKey);
    return null;
  }
};

export const clearGameSession = (gameKey: string) => {
  sessionStorage.removeItem(getSessionKey(gameKey));
};
