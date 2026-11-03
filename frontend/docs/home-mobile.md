# Home mobile layout

Edit `src/app/(marketing)/home-mobile.module.css` to change Home's mobile layout.
Its single `max-width: 767px` query matches the existing tablet boundary in
`src/lib/breakpoints.ts`. Every rule requires the Home page's local `.page` class.
Tablet/desktop layouts and other pages do not receive these styles.

The variables at the top control page gutters, section spacing, gaps, card
padding, the minimum width of service highlight columns, hero text size,
service image height, blog card height, control tap size, and chat launcher size.

Use the existing `data-home-*` hooks for section-specific rules. They keep the
central stylesheet independent of generated CSS Module class names. Intrinsic
grids and `clamp()` values cover 320–767px without additional phone breakpoints.
Original component styles remain the baseline for 768px and wider.

Mobile changes include stacked service cards across the full phone range,
proportional service media, a single active blog card with wrapping controls,
contained case-study slide entry, safe text wrapping, and 16px contact controls.
Mobile Home also keeps the cookie controls above the chat launcher and allows
the cookie panel to scroll on short landscape screens. Shared widget components
are not modified; these overrides require `body:has(.page)` within the same
mobile query.
The existing animations, colors, font family, content, and component behavior
are retained.

Browser measurements and tablet/desktop comparison snapshots are saved under
`.qa/home-mobile/`. Contact validation checks do not submit a message.
Tablet/desktop checks compare computed styles with the Home mobile class enabled
and disabled in the same render, avoiding timing differences from lazy media.

Validation on November 3, 2026: 22 mobile viewport/motion samples passed, including
320, 375, 425, 480, 640, 720, and 767px plus intermediate widths and landscape.
No page overflow, broken images, or phone inputs below 16px were detected.
Cookie controls, mobile navigation/Escape, case-study and blog carousels, and
contact validity checks passed. Computed styles were unchanged at 768, 820,
1024, 1440, and 1920px. The production build and focused lint passed.
Checks used Chromium emulation; physical iOS/Android devices were not tested.
