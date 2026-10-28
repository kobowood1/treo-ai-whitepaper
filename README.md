# Treo whitepaper

**Treo: One Learner Model for the Student, the Teacher and the Parent** — version 1.0, October 27, 2026, by Kofi Obo Wood.

| File | What it is |
|---|---|
| `WHITEPAPER.md` | The whitepaper (renders on GitHub, figures included) |
| `treo-whitepaper.pdf` | Print and share version |
| `figures/*.svg` | Figures 1–3, editable SVG |

Suggested place in the Treo repo: `docs/whitepaper/`. The landing page can link to the PDF and quote the abstract and Section 2.

To rebuild the PDF after editing the Markdown:

```bash
pandoc WHITEPAPER.md -s --embed-resources --resource-path=. -o whitepaper.html
# then print whitepaper.html to PDF (Chrome: Print → Save as PDF, Letter, background graphics on)
```
