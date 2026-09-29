# Frontend work log

## 2026-09-23

- Audited the runnable Next.js application under `frontend`.
- Installed the locked npm dependencies and verified the existing application with ESLint and a production build.
- Connected every implemented homepage section to the `/` route: hero, client marquee, featured work, capabilities, approach, why Vyntics, testimonials, and contact.
- Preserved the existing uncommitted landing-page work and did not commit or push changes.

## 2026-09-24

- Moved the testimonials section directly below the capabilities section on the homepage.
- Reduced the color and glow intensity in the Why Vyntics section while retaining accessible text contrast and clear interaction states.
- Added a blog carousel after the How We Work section using the current Vyntics blog content and an original implementation inspired by the referenced image-card gallery pattern.
- Increased the Featured Work carousel autoplay speed from 4.5 seconds to 2 seconds per project while retaining hover, focus, and reduced-motion pauses.
- Increased the Testimonials carousel autoplay speed from 4.5 seconds to 2 seconds per card while retaining hover, focus, and reduced-motion pauses.
- Reworked the blog showcase into a single-panel horizontal expanding-card queue with vertical rails, a 1.5-second autoplay interval, immediate hover/focus pause, and click, dot, and arrow controls.
- Changed the blog gallery into an overlapping card deck whose hovered card pauses autoplay, rises above the pack, and expands to reveal its complete article summary and metadata.
- Restored the horizontal expanding-card queue with a shorter heading, viewport-contained desktop layout, vertical preview rails, 1.5-second queue rotation, and hover/click/dot/arrow interaction.
- Refined the blog queue into an overlapping card stack: hovering raises and expands one card while compressed cards remain behind it with readable article headings.
