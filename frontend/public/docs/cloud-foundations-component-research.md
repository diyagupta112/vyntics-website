# Cloud Foundations component research

This pass preserves the approved eleven-section order, Vyntics typography/tokens, routing, backend content, and contact form. References inform patterns; no third-party source code or new library dependency was installed.

## Evaluated patterns

| Reference | Assessment | Decision |
| --- | --- | --- |
| [Aceternity Sticky Scroll Reveal](https://ui.aceternity.com/components/sticky-scroll-reveal) | Strong paired content/visual composition. Structured content fits local services, but nested scrolling and scroll-driven state add mobile and accessibility complexity. | Adapt the split composition to click-controlled process stages; preserve native page scrolling. |
| [Aceternity Timeline](https://ui.aceternity.com/components/timeline) | Good chronological hierarchy; a long vertical timeline would unnecessarily lengthen a five-stage service process. | Use numbered stage navigation and a compact connected progress graphic. |
| [Magic UI Animated Beam](https://magicui.design/docs/components/animated-beam) | Useful connected-node visual grammar for architecture. Continuous animation, measured node positions, and gradients would add decoration and runtime work without helping the visitor choose a service. | Use static CSS connections and a small SVG foundation motif in the hero. |
| [21st.dev feature/FAQ accordion research](https://docs.21st.dev/blog/react-faq-accordion-components) | Progressive disclosure suits the three local service groups and six questions. Rich service descriptions remain available without six repeated card grids. | Native details/summary for service exploration and FAQ, with keyboard focus and SSR content. |
| [shadcn/ui Accordion](https://ui.shadcn.com/docs/components/base/accordion) | Accessible accordion behavior and state affordances fit the site; importing an entire primitive dependency is unnecessary for the current simple disclosure requirements. | Retain native disclosure semantics and adapt the restrained borders, numbering, and open-state affordance. |
| [Magic UI Terminal](https://v3.magicui.design/docs/components/terminal) | Attractive engineering aesthetic but would require fabricated commands or telemetry and imply product functionality that this service page does not have. | Reject. |
| PrebuiltUI card patterns | The attempted online cards page was unavailable. Existing project-related cards already embody a restrained card pattern and handle real data. | Reuse the existing CaseStudyRelatedCard and RelatedBlogCard instead of introducing a replacement. |

## Section mapping

| Approved section | Implementation |
| --- | --- |
| Hero | Editorial split with a static architecture/service-navigation composition. |
| Cloud problems we solve | Numbered typographic problem list with a sticky desktop heading; stacked on smaller screens. |
| Our cloud services | Expandable editorial rows with real configured capability descriptions and canonical service links. |
| Why Vyntics for cloud | Three open columns separated by quiet rules, using existing copy. |
| Cloud platforms we work with | Large restrained platform names and decorative marks; no certification or partnership claims. |
| How we work | Five intentional buttons and a stable detail panel, with an accessible pressed state and no autoplay or scroll interception. |
| Case studies | Existing backend-fed related cards, maximum two cloud-relevant published projects; honest loading/error/empty states. |
| What comes next | Wide editorial Data Engineering handoff with the canonical pillar link. |
| Related insights | Existing backend-fed blog cards, maximum three published cloud-related posts; no fake articles. |
| FAQ | Numbered native disclosures, retaining the exact questions and pending V1 answers. |
| Final CTA | Existing ContactCta; fields, validation, API integration, and submission states unchanged. |

## Maintainability and accessibility

Only the process selector needs client state. No frame loops, global scroll listeners, measured connector geometry, canvas/WebGL, new packages, or continuous decorative animations. All other new treatments use local CSS and semantic server-rendered markup. The process buttons work with keyboard activation and expose their selected state; disclosures use browser keyboard behavior. Responsive grids collapse at existing Cloud breakpoints (960px and 680px). Tokens govern both themes. Reduced motion disables added transitions/entrances.
