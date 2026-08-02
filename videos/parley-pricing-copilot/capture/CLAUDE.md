# Parley — Pricing & Negotiation Copilot

Source: https://parley-pricing-copilot.vercel.app

To create a video from this capture, use the `product-launch-video` skill.

## What's in This Capture

| File | Contents |
|------|----------|
| `screenshots/contact-sheet.jpg` | **View this first.** All scroll screenshots in labeled grid — see the entire page at a glance |
| `screenshots/scroll-*.png` | Individual viewport screenshots if you need detail on a specific section. |
| `extracted/tokens.json` | Design tokens: 17 colors, 3 fonts, 20 headings, 0 CTAs |
| `extracted/design-styles.json` | Computed styles from live DOM: typography hierarchy, button/card/nav styles, spacing scale, border-radius, box shadows. Primary data source for DESIGN.md. |
| `extracted/asset-descriptions.md` | One-line description of every downloaded asset. Read this for asset selection — only open individual files for safe-zone checking. |
| `extracted/visible-text.txt` | Page text in DOM order, prefixed with HTML tag (`[h1]`, `[p]`, `[a]`). Use as context — rephrase freely. |
| `assets/contact-sheet.jpg` | All downloaded images in one labeled grid. |
| `assets/svgs/contact-sheet.jpg` | SVGs rendered as thumbnails in labeled grid |
| `assets/` | Individual downloaded images, SVGs, and font files. |

## Brand Summary

- **Colors**: #FBF7E8 (bg-light), #141D33 (accent), #1C2440 (accent), #141C33 (accent), #FBF7E7 (bg-light), #F4F0E2 (bg-light), #B18958 (accent), #B08D57 (accent), #E8DFC4 (surface-light), #000000 (bg-dark)
- **Fonts**: Fraunces (400,500,600,700), Geist (100-900 variable), IBM Plex Mono (400,500,600)
