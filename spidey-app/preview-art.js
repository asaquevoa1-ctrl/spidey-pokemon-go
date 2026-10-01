// Review candidates and recovered illustration crops. This never grants approval.
window.SPIDEY_PREVIEW_ART=Object.freeze({
  "2026-09-mega-victreebel-raids": {
    "file": "assets/events/review/mega-victreebel-rotation-v2.png",
    "sha256": "6cd064429903e0dce435990ce45e297a3d970fffb91dc7920c99f703220d6e22",
    "status": "PENDING_REVIEW",
    "display": "full_poster",
    "width": 1121,
    "height": 1403
  },
  "2026-10-zorua-community-day": {
    "file": "assets/events/recovered/1000431272.png",
    "sha256": "2ac4a1fd65a1aaed9f792611913584f428c00999fcaf0c81ba2820709dc24af9",
    "status": "PENDING_REVIEW",
    "display": "illustration_crop",
    "offset": 13,
    "aspect": 1.9
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
