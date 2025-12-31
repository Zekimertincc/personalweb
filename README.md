# Personal Zola Site

This repository hosts the Zola version of the original static site. The layout, navbar devil eyes, and interactions remain unchanged while gaining a blog workflow.

## Prerequisites
- [Zola](https://www.getzola.org/documentation/getting-started/installation/)

## Local development
1. Install Zola.
2. Start the dev server:
   ```bash
   zola serve
   ```
3. Open the printed local URL (usually `http://127.0.0.1:1111`).

## Creating a new post
1. Add a markdown file under `content/` (e.g., `content/my-post.md`).
2. Include front matter similar to:
   ```toml
   +++
   title = "My Post"
   date = 2024-05-01
   template = "page.html"
   summary = "One-line description"
   taxonomies = { tags = ["tag-a", "tag-b"] }
   +++
   
   Your content goes here.
   ```
3. Run `zola serve` to preview.

## Deployment (GitHub Pages)
- Update `base_url` in `config.toml` before deploying:
  - User/organization page: `https://<user>.github.io`
  - Project page: `https://<user>.github.io/<repo>/`
- Push to `main`. The GitHub Actions workflow builds the site and publishes the `public/` directory to GitHub Pages.
- For project pages, ensure the `base_url` matches the repository path so assets resolve correctly.

## Structure
- `content/` – Markdown pages/posts with root-level slugs.
- `templates/` – Tera templates (`base.html`, `index.html`, `page.html`, taxonomy templates, and navbar partial).
- `static/` – Original assets (`styles.css`, `index.js`, `seytan.png`). These are served at the site root.
- `.github/workflows/gh-pages.yml` – CI workflow to build and deploy with Zola.
