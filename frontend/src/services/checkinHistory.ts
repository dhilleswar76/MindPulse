import { CheckInItem } from './mlApi';

const STORAGE_KEY_PREFIX = 'mindpulse_checkin_history_';
const CHECKIN_UPDATE_EVENT = 'mindpulse:checkin-history-updated';

export const DEFAULT_INITIAL_HISTORY: CheckInItem[] = [
  {
    mood: 7.0,
    stress: 3.5,
    energy: 7.0,
    sleepHours: 8.0,
    anxiety: 3.0,
    senseOfSafety: 8.0,
    supportAvailability: 8.0,
    caseRelatedStress: 3.0,
    caseStage: 'COURT_TRIAL',
    timestamp: new Date(Date.now() - 4 * 86400000).toISOString(),
  },
  {
    mood: 6.0,
    stress: 4.5,
    energy: 6.0,
    sleepHours: 7.0,
    anxiety: 4.5,
    senseOfSafety: 7.0,
    supportAvailability: 7.0,
    caseRelatedStress: 4.5,
    caseStage: 'COURT_TRIAL',
    timestamp: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    mood: 5.0,
    stress: 6.5,
    energy: 5.0,
    sleepHours: 5.5,
    anxiety: 6.5,
    senseOfSafety: 5.5,
    supportAvailability: 6.0,
    caseRelatedStress: 7.0,
    caseStage: 'COURT_TRIAL',
    timestamp: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    mood: 3.5,
    stress: 8.0,
    energy: 4.0,
    sleepHours: 4.5,
    anxiety: 8.0,
    senseOfSafety: 4.0,
    supportAvailability: 4.5,
    caseRelatedStress: 8.5,
    caseStage: 'COURT_TRIAL',
    timestamp: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
];

/**
 * Retrieves the stored check-in history for the given user, or initializes it.
 */
export function getStoredCheckIns(userId: string = 'user_alex_101'): CheckInItem[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_KEY_PREFIX}${userId}`);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.warn('Failed to parse stored check-ins from localStorage:', e);
  }

  // Initialize with longitudinal default history
  storeCheckIns(DEFAULT_INITIAL_HISTORY, userId);
  return [...DEFAULT_INITIAL_HISTORY];
}

/**
 * Persists the check-in history to localStorage and broadcasts an update event.
 */
export function storeCheckIns(items: CheckInItem[], userId: string = 'user_alex_101'): void {
  try {
    localStorage.setItem(`${STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(items));
    window.dispatchEvent(
      new CustomEvent(CHECKIN_UPDATE_EVENT, { detail: { userId, checkIns: items } })
    );
  } catch (e) {
    console.warn('Failed to save check-ins to localStorage:', e);
  }
}

/**
 * Appends a new check-in to the user's history, persists it, and returns the updated array.
 */
export function appendCheckIn(
  newCheckIn: CheckInItem,
  userId: string = 'user_alex_101'
): CheckInItem[] {
  const current = getStoredCheckIns(userId);
  const updated = [...current, newCheckIn];
  storeCheckIns(updated, userId);
  return updated;
}

/**
 * Resets the check-in history to initial longitudinal default.
 */
export function resetCheckInHistory(userId: string = 'user_alex_101'): CheckInItem[] {
  storeCheckIns(DEFAULT_INITIAL_HISTORY, userId);
  return [...DEFAULT_INITIAL_HISTORY];
}

/**
 * Subscribes to check-in history updates across components.
 */
export function subscribeCheckInUpdates(
  callback: (checkIns: CheckInItem[]) => void,
  userId: string = 'user_alex_101'
): () => void {
  const handler = (e: Event) => {
    const customEvent = e as CustomEvent<{ userId: string; checkIns: CheckInItem[] }>;
    if (!customEvent.detail || customEvent.detail.userId === userId) {
      callback(customEvent.detail?.checkIns || getStoredCheckIns(userId));
    }
  };

  window.addEventListener(CHECKIN_UPDATE_EVENT, handler);
  return () => window.removeEventListener(CHECKIN_UPDATE_EVENT, handler);
}
