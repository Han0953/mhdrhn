/** Milliseconds and CSS easing shared by the current motion owners. */
export const motionTokens = {
  duration: { press: 90, micro: 140, panelOpen: 240, panelClose: 180, reveal: 420, hero: 620, routeCover: 220, routeReveal: 220, editorial: 280, signal: 280, roleEnter: 650, roleExit: 500 },
  easing: { response: "cubic-bezier(.22,1,.36,1)", transfer: "cubic-bezier(.76,0,.24,1)" },
  stagger: { heading: 60, item: 35, maximum: 180 },
  distance: { heading: 20, mobileHeading: 12, media: 12, mobileMedia: 6 },
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
