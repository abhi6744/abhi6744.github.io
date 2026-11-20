# Abhinav G — Interactive Portfolio

A clean, light-by-default, interactive single-page portfolio built with plain HTML, CSS and JavaScript. No build step, no dependencies — just open `index.html`.

**Live:** https://abhi6744.github.io

## What's inside

- **Light theme** by default, with an optional dark-mode toggle (saved in `localStorage`).
- **Animated hero** with a rotating role line, floating tech chips and scrolling stat counters.
- **Sticky navigation** with active-section highlighting, a "More" dropdown and a mobile menu.
- **Filterable project grid** (RAG & LLM / Computer Vision / Security) with expandable details and direct links to the real GitHub repos.
- **Experience timeline**, tabbed skill categories, project-based usage bars, certifications, achievements and education timeline.
- **Contact section** with copy-to-clipboard email and a form that opens the visitor's email app with a prefilled message.
- **Downloadable résumé** (`assets/Abhinav_G_Resume.pdf`).
- Responsive layout, keyboard-friendly controls, ARIA labels and `prefers-reduced-motion` support.

## Run locally

```bash
git clone https://github.com/abhi6744/abhi6744.github.io.git
cd abhi6744.github.io
python -m http.server 8000
```

Then open http://localhost:8000. You can also just double-click `index.html`.

## Deployment

The `.github/workflows/deploy.yml` workflow deploys the site to GitHub Pages on every push to `main`. Pages is configured with **GitHub Actions** as the source.

To deploy your own copy:

1. Create a repo named `<username>.github.io`.
2. Push this folder to the `main` branch.
3. In **Settings → Pages**, set **Source** to **GitHub Actions**.
4. The workflow runs automatically; your site appears at `https://<username>.github.io`.

## Contact

- Email: abhinavgireesh013@gmail.com
- Phone: +91 8086201772
- LinkedIn: [linkedin.com/in/abhinav-g-334957321](https://linkedin.com/in/abhinav-g-334957321)
- GitHub: [github.com/abhi6744](https://github.com/abhi6744)
