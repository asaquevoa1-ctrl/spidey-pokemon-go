(() => {
  'use strict';
  const master = {
  "2026-10-xerneas-raids": {
    "file": "assets/events/premium/xerneas-rotation-approved-v1.png",
    "status": "APPROVED",
    "display": "full_poster",
    "width": 1121,
    "height": 1403,
    "sha256": "b9e3b46292347a95deb2536503915cc0e3dd51faa527d1037e46ccdc9e69a738",
    "approval_record": "docs/qa/XERNEAS_ROTATION_APPROVAL_20261001.json"
  },
  "festival-of-lights-2026-pokeminers-e2": {
    "file": "assets/festival-das-luzes-approved.png",
    "status": "APPROVED",
    "width": 1024,
    "height": 1536,
    "sha256": "6a4bc24f09a72ad7e0836197277b581207ccba6be2562c814585e50387a6acda"
  },
  "2026-09-raids-xerneas": {
    "file": "assets/events/premium/xerneas-rotation-approved-v1.png",
    "status": "APPROVED",
    "display": "full_poster",
    "width": 1121,
    "height": 1403,
    "sha256": "b9e3b46292347a95deb2536503915cc0e3dd51faa527d1037e46ccdc9e69a738",
    "approval_record": "docs/qa/XERNEAS_ROTATION_APPROVAL_20261001.json"
  },
  "2026-09-30-raid-hour-xerneas": {
    "file": "assets/events/recovered/1000426235.png",
    "status": "APPROVED",
    "width": 1229,
    "height": 1536,
    "sha256": "2b97e5ae1478060889cc4503e4a66c1fe5cb85be2b365062023851943312900c"
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
