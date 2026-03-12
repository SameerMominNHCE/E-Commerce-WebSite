export const getTrackingUrl = (trackingNumber) => {
  if (!trackingNumber) return null;

  const normalized = trackingNumber.trim().toUpperCase();

  if (normalized.startsWith('BD') || normalized.startsWith('BLUEDART')) {
    return `https://www.google.com/search?q=${encodeURIComponent(`Blue Dart tracking ${trackingNumber}`)}`;
  }

  if (normalized.startsWith('DLV') || normalized.startsWith('DELHIVERY')) {
    return `https://www.google.com/search?q=${encodeURIComponent(`Delhivery tracking ${trackingNumber}`)}`;
  }

  if (normalized.startsWith('EK')) {
    return `https://www.google.com/search?q=${encodeURIComponent(`Ekart tracking ${trackingNumber}`)}`;
  }

  if (normalized.startsWith('XP') || normalized.startsWith('XBEES')) {
    return `https://www.google.com/search?q=${encodeURIComponent(`Xpressbees tracking ${trackingNumber}`)}`;
  }

  // Internal or unknown prefixes fall back to a generic tracking search.
  return `https://www.google.com/search?q=${encodeURIComponent(`Track shipment ${trackingNumber}`)}`;
};
