# dictation-app

A single-page static web app in `index.html`.

## Local run

```bash
python3 -m http.server 8080
```

Then visit: <http://localhost:8080/>.

## Make it publicly accessible

Because this app is static HTML/CSS/JS, it can be hosted on any static hosting provider.

### GitHub Pages (quickest)
1. Push this repository to GitHub.
2. Open **Settings → Pages**.
3. Under **Build and deployment**, choose:
   - **Source**: `Deploy from a branch`
   - **Branch**: `main` (or your default branch), `/ (root)`
4. Save and wait for deployment.
5. Your public URL will look like:
   `https://<your-username>.github.io/<repo-name>/`

If your `index.html` is at the repository root (as it is here), it will be served automatically.
