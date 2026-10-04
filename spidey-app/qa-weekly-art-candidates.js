// Review candidates and recovered illustration crops. This never grants approval.
window.SPIDEY_PREVIEW_ART=Object.freeze({
  "2026-09-mega-malamar-raids": {
    "file": "assets/events/review/mega-malamar-rotation-20260923-29-v1.png",
    "status": "PENDING_REVIEW",
    "display": "full_poster",
    "width": 1122,
    "height": 1402,
    "sha256": "d59fe0c923f8e20515ec9bfd01826fecdcb9305fe9e9fcad45c65880e95e9ccd"
  },
  "2026-09-raids-ultra-beasts": {
    "file": "assets/events/review/ultra-beasts-rotation-20260923-29-v1.png",
    "status": "PENDING_REVIEW",
    "display": "full_poster",
    "width": 1122,
    "height": 1402,
    "sha256": "ec1e146bd1c202829f79c02c78efbc535dd801bf194fcb24699ad0a1435049bf"
  },
  "2026-09-28-max-monday-sobble": {
    "file": "assets/events/review/sobble-max-monday-20260928-v1.png",
    "status": "PENDING_REVIEW",
    "display": "full_poster",
    "width": 1122,
    "height": 1402,
    "sha256": "45e7e9c3ce431d71d3b36108c35410a3ed1e905e5e24efaaa588242174aadd21"
  },
  "2026-09-29-showcase-tuesday": {
    "file": "assets/events/review/showcase-tuesday-20260929-v1.png",
    "status": "PENDING_REVIEW",
    "display": "full_poster",
    "width": 1122,
    "height": 1402,
    "sha256": "7bb48bbc6bfac1cce90a2883f5f94747f385e4262dfbc5b408683643dde6a94a"
  },
  "2026-09-choose-your-path": {
    "file": "assets/events/review/choose-your-path-20260923-28-v1.png",
    "status": "PENDING_REVIEW",
    "display": "full_poster",
    "width": 1122,
    "height": 1402,
    "sha256": "c56c6b40fab56055a7208ddf34f9bc958535d170e0ca847005d5cdddecf93fa1"
  },
  "2026-09-gbl-22-29": {
    "file": "assets/events/review/gbl-ultra-master-retro-20260922-29-v1.png",
    "status": "PENDING_REVIEW",
    "display": "full_poster",
    "width": 1122,
    "height": 1402,
    "sha256": "4a17d1311b97a88444f0dc82bf677aee29cca3edec3bd7672d51f78cd266cf6e"
  },
  "2026-10-halloween-part-1": {
    "file": "assets/events/review/halloween-mystery-teaser-20261004-v1.png",
    "status": "PENDING_REVIEW",
    "display": "full_poster",
    "width": 1122,
    "height": 1402,
    "sha256": "ae832e6af897db82ebcc437fff9893049fc09869aa0114964fa97d2a554293db"
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
