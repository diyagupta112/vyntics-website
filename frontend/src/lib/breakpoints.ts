/**
 * Canonical responsive breakpoints. Keep in sync with the table in app/globals.css.
 * CSS media queries use the numeric values directly; JavaScript should import them from here.
 */
export const breakpoints = {
  /** Small tablet */
  sm: 640,
  /** Tablet. Layouts below this width use the mobile treatment. */
  md: 768,
  /** Laptop */
  lg: 1024,
  /** Desktop */
  xl: 1280,
  /** Large desktop */
  "2xl": 1536,
  /** Wide desktop */
  "3xl": 1920,
} as const;

/** Matches screens narrower than the tablet breakpoint (767px and below). */
export const mobileQuery = `(max-width:${breakpoints.md - 1}px)`;

/** Matches screens at or above the given breakpoint. */
export const minWidthQuery = (breakpoint: keyof typeof breakpoints) => `(min-width:${breakpoints[breakpoint]}px)`;
