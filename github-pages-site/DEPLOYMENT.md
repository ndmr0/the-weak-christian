# GitHub Pages Deployment

Publish the contents of this `github-pages-site/` folder to:

```txt
https://ndmr0.github.io/the-weak-christian/
```

Before App Store submission, the hosted pages must match the current local files.

Create the deployment folder from the app project root:

```bash
npm run package:public-pages
```

Deploy only the generated files in `dist/github-pages-site/`:

- `index.html`
- `privacy-policy.html`
- `support.html`
- `.nojekyll`

If deploying from a separate authenticated checkout, use this workflow:

```bash
git clone https://github.com/ndmr0/the-weak-christian.git twc-pages-deploy
rsync -a dist/github-pages-site/ twc-pages-deploy/
cd twc-pages-deploy
git status --short
git add .nojekyll index.html privacy-policy.html support.html
git commit -m "Update public App Store pages"
git push origin main
```

If you want to verify the prepared patch before deploying, run:

```bash
npm run check:pages-patch
```

After deployment, run this from the app project root:

```bash
npm run check:public
```

The check must pass before the App Store URLs are considered ready.

Known stale hosted-page failures as of 2026-05-30:

- The hosted privacy policy still includes the removed External Links section.
- The hosted support page still includes donation/Ko-fi language.
- The hosted support page does not match the current app navigation language.
