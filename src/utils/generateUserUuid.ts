let cachedUuid: string | null = null;

export function generateUserUuid(): string {
  if (cachedUuid) return cachedUuid;

  const hasNavigator = typeof navigator !== 'undefined';
  const batteryLevel = hasNavigator && (navigator as any).battery
    ? Math.round((navigator as any).battery.level * 100)
    : null;
  const isOnline = hasNavigator ? navigator.onLine : true;
  const networkType = isOnline
    ? (navigator as any).connection
      ? (navigator as any).connection.effectiveType
      : 'unknown'
    : 'offline';

  const raw = typeof crypto !== 'undefined' && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`;
  const uuidPart = raw.split('-')[0];

  const components = [uuidPart, batteryLevel?.toString() ?? 'no-batt', networkType].filter(Boolean);
  cachedUuid = components.join('-');
  return cachedUuid;
}

export function resetUserUuid(): void {
  cachedUuid = null;
}