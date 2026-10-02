// Review candidates and recovered illustration crops. This never grants approval.
window.SPIDEY_PREVIEW_ART=Object.freeze({
  "2026-10-zorua-community-day": {
    "file": "assets/events/recovered/1000431272.png",
    "sha256": "2ac4a1fd65a1aaed9f792611913584f428c00999fcaf0c81ba2820709dc24af9",
    "status": "PENDING_REVIEW",
    "display": "illustration_crop",
    "offset": 13,
    "aspect": 1.9
  },
  "2026-10-raids-yveltal": {
    "file": "assets/events/review/yveltal-rotation-v1.png",
    "sha256": "dbed7399b3e32400db94db90f98c7b23af0029c91a55b568e18948cd828e5328",
    "status": "PENDING_REVIEW",
    "display": "full_poster",
    "width": 1121,
    "height": 1403
  },
  "2026-10-07-raid-hour-yveltal": {
    "file": "assets/events/review/yveltal-raid-hour-v2.png",
    "sha256": "a3881d22755b5c326f02f45ab456af3eaa024ad99427be36c9ff1bfd9c8d436b",
    "status": "PENDING_REVIEW",
    "display": "full_poster",
    "width": 1121,
    "height": 1403
  },
  "2026-10-mega-blastoise-raids": {
    "file": "assets/events/review/mega-blastoise-rotation-v1.png",
    "sha256": "474fa9a793959d9dcac7a8f42840267695f12b2d561d8e16bb0129b9182bf321",
    "status": "PENDING_REVIEW",
    "display": "full_poster",
    "width": 1121,
    "height": 1403
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
