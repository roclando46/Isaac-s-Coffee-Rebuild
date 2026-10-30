# Isaac's Coffee preview

## Running on Replit

Use the **Start application** workflow (the Run button). It serves the existing
static website on `0.0.0.0:5000` with Python's built-in HTTP server:

```sh
python3 -m http.server 5000 --bind 0.0.0.0
```

Open the Preview to view the site. No third-party packages, secrets, database,
or external services are needed to run this preview.

## Editing and rebuilding

Keep the imported static HTML/Python structure. Edit `src/template.html` for
page content and behavior and `src/assets.json` for embedded images, then run:

```sh
python3 src/build.py
```

This regenerates `index.html`; refresh the Preview after rebuilding.

## Scope

This is a clickable preview, not a connected Shopify storefront. Checkout,
subscriptions, contact submissions, and email signup are not live services.
See `README.md` and the site's launch checklist for Shopify setup requirements
and draft business details that still need confirmation.
