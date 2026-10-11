(() => {
  'use strict';
  function coordinateText(location) {
    const lat = location?.latitude, lon = location?.longitude;
    if (![lat, lon].every(value => (typeof value === 'number' || typeof value === 'string') && String(value).trim() !== '')) return '';
    const latitude = Number(lat), longitude = Number(lon);
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude) || Math.abs(latitude) > 90 || Math.abs(longitude) > 180) return '';
    return `${latitude.toFixed(6)},${longitude.toFixed(6)}`;
  }
  function mapUrl(location) {
    const query = coordinateText(location) || [location?.name || location?.label, location?.address].filter(Boolean).join(', ');
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
  }
  window.SpideyLocations = Object.freeze({coordinateText, mapUrl});
})();
