# Fuji Studio

A Fuji apple website with a scroll-driven whole → peeled → sliced experience and a custom editor for text, images, colors, fonts, layout, motion, and slice content.

## Your links

- Website: https://fuji-field-notes.josiewiddi.chatgpt.site
- Custom editor: https://fuji-field-notes.josiewiddi.chatgpt.site/admin
- Create a GitHub repository: https://github.com/new
- GitHub upload instructions: https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
- GitHub command-line import instructions: https://docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github
- Node.js: https://nodejs.org/en/download

The website was published with private access. Putting code on GitHub does not change that access setting.

## Put this project on GitHub

Unzip the download first. Upload the files **inside** the `fuji-github` folder, not the ZIP itself. This is a source-code upload, not GitHub's URL-based Import Repository flow. The live website URL is not a Git repository URL.

### Recommended: use Git

1. At https://github.com/new, create an empty repository named `fuji-studio`. Choose the visibility you want. Do not initialize it with a README, license, or .gitignore, because this folder already contains files.
2. Open Terminal in the extracted `fuji-github` folder.
3. Replace `YOUR-USERNAME` in the commands below with your GitHub username, and use your exact repository name if different. Authenticate to GitHub when prompted by your configured Git credential manager.

```sh
git init
git add .
git commit -m "Add Fuji website and custom editor"
git branch -M main
git remote add origin https://github.com/YOUR-USERNAME/fuji-studio.git
git push -u origin main
```

These commands create a new repository from this export. The ZIP contains no Git history or saved credentials.

### Alternative: upload through GitHub's website

Create the repository, choose **uploading an existing file** (or **Add file → Upload files**), and upload the extracted files and folders. Keep the directory structure intact. On macOS, press Command-Shift-Period in Finder to reveal hidden files. Include `.openai/hosting.json`, `.gitignore`, and `.env.example` too. Each file in this export is below GitHub's 25 MiB browser-upload limit.

## Run it on your computer

Install Node.js 22 or newer. This project uses only Node's built-in modules, so no dependency installation is needed for these commands:

```sh
node build.mjs
node local.mjs
```

Open:

- Website: http://127.0.0.1:4173/
- Editor: http://127.0.0.1:4173/admin

Keep the Terminal running. Press Control-C to stop it. After changing source files, stop the server, rebuild, and restart it. Local draft, published content, and uploaded images are stored in `.local-data/`, separately from the online site. The local server is a development preview bound to your computer and treats its visitor as the owner; it is not a production server.

## Where to edit the code

| File | Purpose |
| --- | --- |
| `public/index.html` | Apple page structure and initial content |
| `public/style.css` | Website styling and responsive layout |
| `public/app.js` | Scroll stages, slice interactions, information dialogs |
| `public/site-config.js` | Applies saved website settings and editor previews |
| `public/default.json` | Initial design and content before an online version is saved |
| `public/admin.html` | Custom editor interface |
| `public/admin.css` | Custom editor styling |
| `public/admin.js` | Design controls, uploads, draft saving and publishing |
| `public/fuji.png`, `peeled.png`, `sliced.png` | Original AI-created apple artwork |
| `src/worker.js` | Production request handling, owner access, storage APIs |
| `build.mjs` | Packages the website into a Worker build |
| `local.mjs` | Local preview server and filesystem storage adapter |
| `.openai/hosting.json` | Existing Sites identity and R2 binding declaration |

`public/editor.js` and `public/content.json` are retained from the earlier local wording editor. The current page loads `site-config.js` and uses `/admin` instead.

## Online hosting and authentication

**GitHub stores this code; uploading it does not deploy the website or connect automatic publishing. GitHub Pages cannot run the full editor backend.**

The existing application runs on Sites with:

- A Cloudflare Worker-compatible entry point: `dist/server/index.js`.
- An R2 bucket bound as `BUCKET`.
- A server-side `OWNER_EMAIL` secret matching the site owner's authenticated account.
- Sites-managed ChatGPT sign-in and trusted identity headers.

Keep secrets in the hosting platform, never in the repository. `.env.example` documents the required secret name; the application does not automatically load `.env` files.

To update the current online site from this source, use the Sites publishing workflow: build, push the exact source to its Sites source repository using a newly issued credential, save the packaged build, and deploy the saved version. A GitHub push alone does not trigger that flow. `.openai/hosting.json` identifies the existing Fuji Site; it is not an authentication credential.

For deployment to a different provider, adapt authentication and storage before publishing. The Worker currently trusts identity headers supplied by Sites. **Do not expose this Worker directly on another provider while trusting caller-supplied `oai-authenticated-*` headers.** A standalone deployment needs verified server-side authentication, owner authorization, and an R2 binding or equivalent storage implementation. It also needs a replacement for Sites' `/signin-with-chatgpt` flow. No standalone-provider deployment is configured in this export.

## Saved content and media

- `site/draft.json` in R2 is the saved draft.
- `site/live.json` is the published website document.
- `media/` stores uploaded images.
- **Save draft** does not change the live website.
- **Publish changes** updates the live document independently of Git.

This export contains the complete local source and original images. It does **not** automatically copy later online edits or uploaded media from R2 into GitHub. To preserve your latest editor settings, open `/admin`, select **Backup**, and download the settings JSON. Restore it using the same Backup screen. That JSON references uploaded images; it does not contain their bytes. A move to different hosting also requires copying uploaded images and the storage documents from the existing bucket.

## Verification

The exported source was built successfully. Backend checks covered owner-only editor access, anonymous and other-user rejection, separate draft/live storage, publish persistence, origin validation, and rejection of invalid documents and uploads. Browser layout testing was not performed as part of this export.
