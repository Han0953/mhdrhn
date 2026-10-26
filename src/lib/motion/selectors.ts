/** Shared content leaves; diagram coordinates and nested role labels keep their own transforms. */
export const revealSelector = [
  "h1,h2,h3,h4,p,figcaption,dt,dd,summary,button",
  ".technology-item,.technology-mark,.technology-label,.technology-badge",
  ".plain-list>li,.home-domain-list>li,.tags>span,.tag-list>li",
  ".timeline-row,.education-record,.skill-group,.certificate-record,.archive-row,.award-row,.education-award,.project-spread",
  ".home-achievement-list>li,.certificate-title-list>li,.search-field,.status-field",
  ".home-entry-year,.archive-number,.project-number,.award-row>span,.education-award>span,.timeline-row>.meta,.footer-bottom>span",
  ".text-link,.button-primary,.footer-cta,.footer-wordmark,.contact-link,.contact-channel,nav>a",
  ".portrait-photo,.media-gallery-grid .media-frame,.project-spread .media-frame,.archive-thumbnail,.story-media",
  ".wordmark,.media-enlarge,.header-controls-entry",
  ".text-link>svg,.button-primary>svg,.contact-link>svg,.footer-cta>svg,.icon-button>svg",
  ".hero-signal-frame,.rotating-roles,.hero-top>.meta,.project-facts>div",
].join(",");
