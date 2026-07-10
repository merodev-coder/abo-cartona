export function validateCapacity({ capacityGB, driveItems }) {
  const capacity = typeof capacityGB === 'number' ? capacityGB : 0;
  const totalGB = Array.isArray(driveItems)
    ? driveItems.reduce((acc, item) => {
        const value = typeof item.sizeGB === 'number' ? item.sizeGB : 0;
        return acc + value;
      }, 0)
    : 0;
  if (capacity <= 0 && totalGB > 0) {
    return { ok: false, totalGB, capacityGB: capacity, reason: 'NO_CAPACITY_DEFINED' };
  }
  if (capacity <= 0 && totalGB === 0) {
    return { ok: true, totalGB, capacityGB: capacity, reason: null };
  }
  if (totalGB > capacity) {
    return { ok: false, totalGB, capacityGB: capacity, reason: 'EXCEEDED_CAPACITY' };
  }
  return { ok: true, totalGB, capacityGB: capacity, reason: null };
}
