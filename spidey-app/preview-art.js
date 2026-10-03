// Review candidates and recovered illustration crops. This never grants approval.
window.SPIDEY_PREVIEW_ART=Object.freeze({
  '2026-10-shadow-thundurus':Object.freeze({
    file:'assets/events/review/thundurus-shadow-weekend-v1.png',
    status:'PENDING_REVIEW',display:'full_poster',revision:1,
    width:1121,height:1403,
    sha256:'eb8141c8220c4acf4c3a962aaf12ee07b7c37085d5e8f6a1f1d233e25b6a4439',
    review_record:'docs/qa/THUNDURUS_ELGYEM_REVIEW_20261002.json'
  }),
  '2026-10-08-spotlight-elgyem':Object.freeze({
    file:'assets/events/review/elgyem-spotlight-v2.png',
    status:'PENDING_REVIEW',display:'full_poster',revision:2,
    width:1121,height:1403,
    sha256:'2ab5e183a146654848b962d4e02603561cccfa5b20ad34ddbeacdaef3b913df9',
    review_record:'docs/qa/THUNDURUS_ELGYEM_REVIEW_20261002.json'
  })
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
