// Review candidates and recovered illustration crops. This never grants approval.
window.SPIDEY_PREVIEW_ART=Object.freeze({
  "2026-10-01-spotlight-seedot": {
    "file": "assets/events/recovered/1000431445.png",
    "sha256": "1cc51c7567245bd9e005d13b39d3064c52409c79e4846391194fc72a85823c4d",
    "status": "PENDING_REVIEW",
    "display": "illustration_crop",
    "offset": 13,
    "aspect": 1.9
  },
  "2026-10-gigantamax-cinderace-max-day": {
    "file": "assets/events/recovered/1000431441.png",
    "sha256": "a24633255c4d22974c9d9cfb6fe6e31237f419075c260bf723d43788311425cd",
    "status": "PENDING_REVIEW",
    "display": "illustration_crop",
    "offset": 13,
    "aspect": 1.9
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
