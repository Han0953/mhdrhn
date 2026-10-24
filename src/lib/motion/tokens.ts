/** Milliseconds and CSS easing shared by the current motion owners. */
export const motionTokens = {
  duration: { press: 110, micro: 220, panelOpen: 480, panelClose: 380, modalOpen: 520, modalClose: 420, chatClose: 560, reveal: 1050, hero: 1800, routeCover: 420, routeReveal: 480, editorial: 950, signal: 420, roleEnter: 850, roleExit: 500, copy: 760, card: 900, media: 1200 },
  easing: { response: "cubic-bezier(.22,1,.36,1)", transfer: "cubic-bezier(.76,0,.24,1)", editorial: "cubic-bezier(.16,1,.3,1)", mechanical: "cubic-bezier(.65,0,.2,1)", settle: "cubic-bezier(.2,.8,.2,1)" },
  stagger: { heading: 130, item: 65, maximum: 360 },
  distance: { heading: 40, mobileHeading: 26, media: 24, mobileMedia: 12 },
  cadence: { role: 3000 },
} as const;

/** A new effect must use a separate wrapper rather than overwrite these owners. */
export const motionOwnership = {
  navigation: "route-wipe: transform; RouteTransition: readiness, inert and focus",
  showcase: "mountProjectStory: track transform, travel and root height",
  media: "MediaImage: quarter-turn orientation; MediaGallery: fit, zoom and pan",
  diagram: "SignalDiagram: SVG signal progress",
  disclosure: "native details + disclosure controller: open, content height and inert",
  preference: "motion preference store: data-motion; ThemeProvider: colors only",
} as const;

export function applyMotionTokens() {
  for (const [name, value] of Object.entries({
    "--motion-micro": `${motionTokens.duration.micro}ms`,
    "--motion-response": motionTokens.easing.response,
    "--motion-role-enter": `${motionTokens.duration.roleEnter}ms`,
    "--motion-role-exit": `${motionTokens.duration.roleExit}ms`,
  })) document.documentElement.style.setProperty(name, value);
}
