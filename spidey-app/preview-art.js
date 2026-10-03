// Review candidates and recovered illustration crops. This never grants approval.
window.SPIDEY_PREVIEW_ART=Object.freeze({
  "2026-10-06-showcase-tuesday": {
    "file": "assets/events/review/showcase-tuesday-20261006-v1.png",
    "status": "PENDING_REVIEW",
    "display": "full_poster",
    "width": 1122,
    "height": 1402,
    "sha256": "ac11ef360b595bfad180c918d6c655c08863d7f01ff36dca4a667ad0e8334c19",
    "review_record": "docs/qa/SHOWCASE_TUESDAY_REVIEW_20261003.json"
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
