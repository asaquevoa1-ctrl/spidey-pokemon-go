// Review candidates and recovered illustration crops. This never grants approval.
window.SPIDEY_PREVIEW_ART=Object.freeze({
  "2026-11-go-wild-area-sendai": {
    "file": "assets/events/review/wild-area-sendai-2026-v1.png",
    "status": "PENDING_REVIEW",
    "display": "full_poster",
    "width": 1122,
    "height": 1402,
    "sha256": "18b4d7237129c9ab4cea402c2cc5d4fa33dc7f44e28b06d6d48c0bf83f4e4eee",
    "review_record": "docs/qa/WILD_AREA_ART_REVIEW_20261007.json"
  },
  "2026-11-go-wild-area-mexico-city": {
    "file": "assets/events/review/wild-area-mexico-city-2026-v1.png",
    "status": "PENDING_REVIEW",
    "display": "full_poster",
    "width": 1122,
    "height": 1402,
    "sha256": "b508a6e00b627eb515d747e35092330cd901d35214af7aa61c04e00fe9650789",
    "review_record": "docs/qa/WILD_AREA_ART_REVIEW_20261007.json"
  },
  "2026-11-go-wild-area-global": {
    "file": "assets/events/review/wild-area-global-2026-v1.png",
    "status": "PENDING_REVIEW",
    "display": "full_poster",
    "width": 1122,
    "height": 1402,
    "sha256": "772cd973f35942f42d6d55565d6d4c68f81bc7799b993f3a333e31fc7d440770",
    "review_record": "docs/qa/WILD_AREA_ART_REVIEW_20261007.json"
  }
});

// All screens share this explicit exception for a known unavailable original.
// A healthy approved original always wins; unrelated drafts never substitute it.
window.SpideyReviewArt=Object.freeze({
  poster(event){
    if(window.SPIDEY_APPROVED_ART_MASTER?.[event?.id])return null;
    const review=window.SPIDEY_PREVIEW_ART?.[event?.id];
    return review?.status==='PENDING_REVIEW'&&review.display==='full_poster'?review:null;
  },
  correction(event){
    const approved=window.SPIDEY_APPROVED_ART_MASTER?.[event?.id];
    const review=window.SPIDEY_PREVIEW_ART?.[event?.id];
    return Boolean(approved&&window.SPIDEY_UNAVAILABLE_ART?.[approved.file]
      &&review?.status==='PENDING_REVIEW'&&review.display==='full_poster'
      &&review.restoresUnavailableArt===approved.file);
  },
  resolve(event){
    const approved=window.SPIDEY_APPROVED_ART_MASTER?.[event?.id];
    if(!approved)return null;
    if(!window.SPIDEY_UNAVAILABLE_ART?.[approved.file])return approved;
    return this.correction(event)?window.SPIDEY_PREVIEW_ART[event.id]:null;
  }
});
