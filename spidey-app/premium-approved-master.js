(() => {
  'use strict';
  const master = {
  "2026-10-xerneas-raids": {
    "file": "assets/events/premium/xerneas-premium-approved-v1.avif",
    "status": "APPROVED",
    "width": 960,
    "height": 1200,
    "sha256": "458dab7343a16b75b2d64a25fef6476140895384495e1f4d9d3ff6ae3d0b94ee"
  },
  "festival-of-lights-2026-pokeminers-e2": {
    "file": "assets/festival-das-luzes-approved.png",
    "status": "APPROVED",
    "width": 1024,
    "height": 1536,
    "sha256": "6a4bc24f09a72ad7e0836197277b581207ccba6be2562c814585e50387a6acda"
  },
  "2026-09-raids-xerneas": {
    "file": "assets/events/premium/xerneas-premium-approved-v1.avif",
    "status": "APPROVED",
    "width": 960,
    "height": 1200,
    "sha256": "458dab7343a16b75b2d64a25fef6476140895384495e1f4d9d3ff6ae3d0b94ee"
  },
  "2026-09-30-raid-hour-xerneas": {
    "file": "assets/events/premium/xerneas-premium-approved-v1.avif",
    "status": "APPROVED",
    "width": 960,
    "height": 1200,
    "sha256": "458dab7343a16b75b2d64a25fef6476140895384495e1f4d9d3ff6ae3d0b94ee"
  }
};
  // Availability is separate from editorial approval. Preserve the canonical bytes.
  window.SPIDEY_UNAVAILABLE_ART=Object.freeze({
    'assets/events/premium/xerneas-premium-approved-v1.avif':'TRUNCATED_CONTAINER'
  });
  for(const entry of Object.values(master))Object.freeze(entry);
  Object.freeze(master);
  window.SPIDEY_APPROVED_ART_MASTER=master;
  window.getSpideyApprovedArt=(id)=>master[id]?.file||null;
  window.isSpideyApprovedImage=(url)=>Object.values(master).some(e=>String(url||'').split('?')[0].endsWith(e.file));
})();
