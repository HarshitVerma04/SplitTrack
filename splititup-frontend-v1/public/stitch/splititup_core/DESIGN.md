# Design System Specification: Editorial Efficiency

## 1. Overview & Creative North Star: "The Digital Architect"
This design system rejects the cluttered, "dashboard-heavy" aesthetics of traditional fintech. Instead, it adopts **"The Digital Architect"** as its Creative North Star. The goal is to present financial data with the same intentionality as a high-end architectural blueprint or a premium editorial journal.

We move beyond the "template" look by utilizing **intentional asymmetry** and **tonal depth**. Rather than boxing users into a grid of outlines, we use expansive white space and high-contrast typography scales to guide the eye. This creates a sense of authoritative calm—essential for building trust in a financial environment.

---

### 2. Colors: Tonal Depth & The Violet Core
The palette is rooted in a sophisticated Violet-led spectrum. We utilize the Material Design convention for token naming to ensure semantic clarity across engineering and design.

- **Primary Role (`#4c1b87`):** Reserved for high-priority actions and brand-defining moments.
- **Surface Roles:** We move away from flat greys. Surfaces are tinted with the brand’s DNA to maintain a cohesive "warm-neutral" feel.

#### The "No-Line" Rule
**Explicit Instruction:** Do not use 1px solid borders to section content. Boundaries must be defined solely through background color shifts.
*   *Example:* A `surface-container-low` (`#f3f4f5`) sidebar sitting against a `surface` (`#f8f9fa`) main content area.

#### Surface Hierarchy & Nesting
Treat the UI as a series of physical layers. Use the surface tiers to define importance:
1.  **Level 0 (Base):** `surface`
2.  **Level 1 (Subtle Inset):** `surface-container-low`
3.  **Level 2 (Active Cards):** `surface-container-lowest` (pure white in light mode for maximum lift).

#### The "Glass & Gradient" Rule
To elevate CTAs, use subtle linear gradients transitioning from `primary` (`#4c1b87`) to `primary_container` (`#6437a0`) at a 135-degree angle. For floating overlays, use **Glassmorphism**: apply a semi-transparent version of `surface_bright` with a `20px` backdrop-blur to allow the violet-tinted background to bleed through softly.

---

### 3. Typography: Editorial Authority
We utilize a dual-typeface system to balance character with legibility.

*   **Display & Headline (Manrope):** Chosen for its geometric precision and modern "tech-editorial" feel. Large scales (`display-lg` at 3.5rem) should be used for account balances or high-level summaries to command attention.
*   **Body & Label (Inter):** The workhorse. Inter provides exceptional readability at small sizes for transaction logs and data tables.

**Hierarchy Strategy:** 
Use `title-lg` (Inter, 1.375rem) for section headers, paired with `label-sm` (Inter, 0.6875rem) in `on_surface_variant` (`#4b4451`) for secondary metadata. This creates a clear "high-low" contrast that feels curated.

---

### 4. Elevation & Depth
Depth is achieved through **Tonal Layering** rather than structural lines.

*   **The Layering Principle:** Place a `surface-container-lowest` card on a `surface-container-low` section. This creates a soft, natural "lift" that mimics paper without the clutter of shadows.
*   **Ambient Shadows:** If a floating element (like a modal) requires a shadow, use a custom diffuse shadow: `0px 24px 48px rgba(40, 16, 78, 0.08)`. Note the violet tint in the shadow color—this ensures the shadow feels like a natural extension of the brand.
*   **The "Ghost Border" Fallback:** If a divider is mandatory for accessibility, use the `outline_variant` token at **15% opacity**. Never use a 100% opaque border.

---

### 5. Components: Refined Utility

#### Buttons
*   **Primary:** Gradient fill (`primary` to `primary_container`), white text, `md` radius (0.375rem).
*   **Secondary:** `surface_container_high` background with `primary` text. No border.
*   **Tertiary:** Ghost style; `primary` text with an 8% `primary` background on hover.

#### Cards & Data Lists
*   **Constraint:** Forbid divider lines between list items. Use vertical spacing (Scale `4` - 1rem) or subtle alternating background shifts (`surface` to `surface_container_low`) to separate transactions.
*   **Radius:** Cards must consistently use `lg` (0.5rem) for a friendly yet professional feel.

#### Input Fields
*   **Style:** Minimalist. Use `surface_container` as the background. On focus, transition the background to `surface_container_lowest` and apply a 2px "Ghost Border" of `primary` at 20% opacity.

#### Financial Specialized Components
*   **The "Quick-Split" Chip:** A high-density action chip using `secondary_container` background.
*   **Trend Sparklines:** Use `primary` for positive growth and `error` for negative, rendered in 2px stroke weight with no fill.

---

### 6. Do’s and Don’ts

#### Do
*   **Do** use `20` (5rem) spacing for major section breathing room.
*   **Do** prioritize the `surface_container` tiers for grouping related data.
*   **Do** use `manrope` for any numerical value over 24pt to add a "premium" feel.
*   **Do** ensure all text maintains WCAG AA contrast against its respective surface tier.

#### Don’t
*   **Don’t** use pure black `#000000` for text; use `on_surface` (`#191c1d`) for a softer, more sophisticated read.
*   **Don’t** use a shadow on a card that is already sitting on a contrasting surface tier.
*   **Don’t** use "Default" system fonts. Stick strictly to the Inter/Manrope pairing to maintain the editorial voice.
*   **Don't** use a border-radius larger than `xl` (0.75rem) unless it is for a pill-style button (`full`). Avoid "bubbly" aesthetics.