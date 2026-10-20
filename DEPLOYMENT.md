# Deployment Guide - ScienceMap Benelux

## GitHub Pages Deployment

This application is configured for easy deployment to GitHub Pages.

### Automatic Deployment (Recommended)

The project includes a deployment script in `package.json`:

```bash
npm run deploy
```

This single command will:
1. Build the production-optimized version
2. Deploy to GitHub Pages (`gh-pages` branch)

### Manual Steps

If you prefer to deploy manually:

```bash
# 1. Build the project
npm run build

# 2. Deploy to GitHub Pages
npx gh-pages -d dist
```

### Configuration

The application is configured with:
- **Base path**: `/sciencemap/` (for GitHub Pages URL structure)
- **Build output**: `dist/` folder
- **Repository**: `rpbeuk/sciencemap`

### After Deployment

1. **Enable GitHub Pages** (if not already):
   - Go to: Settings → Pages
   - Source: Deploy from a branch
   - Branch: `gh-pages`
   - Folder: `/ (root)`
   - Save

2. **Access your app**:
   - URL: `https://rpbeuk.github.io/sciencemap/`
   - The app will be live in a few minutes

### Troubleshooting

#### App not loading
- Clear browser cache (Ctrl+Shift+Delete)
- Wait 5-10 minutes for GitHub Pages to update
- Check that `gh-pages` branch was created

#### CSS/JS not loading
- Verify base path is set correctly: `/sciencemap/`
- Check browser console for 404 errors
- Clear browser cache and refresh

#### Routes not working
- All routes are handled client-side (Single Page App)
- No server-side routing configuration needed
- Direct links should work after initial page load

---

## Alternative Deployment Options

### Option 1: Vercel (Easiest)

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

Benefits:
- ✅ Automatic deployments from git
- ✅ Environment variables support
- ✅ Free tier available
- ✅ Fast global CDN

### Option 2: Netlify

1. Push code to GitHub
2. Connect repository on Netlify
3. Build command: `npm run build`
4. Publish directory: `dist`

Benefits:
- ✅ Git-based deployment
- ✅ Continuous deployment
- ✅ Form handling
- ✅ Edge functions

### Option 3: Docker + Any Server

```dockerfile
FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "run", "preview"]
```

### Option 4: Static File Hosting

Simply upload the `dist/` folder to:
- AWS S3 + CloudFront
- Google Cloud Storage
- Azure Static Web Apps
- Firebase Hosting
- Any traditional web host

---

## Continuous Deployment

### GitHub Actions Workflow (Optional)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: 22
      - run: npm install
      - run: npm run build
      - uses: peaceiris/actions-gh-pages@v3
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
          publish_dir: ./dist
```

This automatically deploys on every push to `main`.

---

## Performance After Deployment

### Expected Load Time
- First load: 2-3 seconds
- Subsequent loads: <1 second (cached)
- Map rendering: <500ms
- Data filtering: <10ms

### CDN Benefits
- Global content delivery
- Automatic compression
- Cache optimization
- DDoS protection

---

## Monitoring & Updates

### Check Deployment Status
- GitHub Pages: Settings → Pages → "Your site is live at..."
- View deployment history: Actions tab

### Update Content
1. Make changes locally
2. Commit to `rpbeuk-science-map-benelux` branch
3. Push to GitHub
4. Run `npm run deploy` (or wait for auto-deploy)
5. Visit `https://rpbeuk.github.io/sciencemap/`

### Rollback
If deployment has issues:
```bash
git reset --hard <previous-commit>
npm run deploy
```

---

## Security Considerations

✅ **Static deployment** (no server vulnerabilities)
✅ **No backend secrets** exposed
✅ **HTTPS by default** (GitHub Pages, Vercel, Netlify)
✅ **No database access** (data loaded locally)
✅ **Content Security Policy ready**

---

## Domain Setup (Optional)

### Custom Domain on GitHub Pages

1. Create `CNAME` file in `public/`:
   ```
   yourdomain.com
   ```

2. Update DNS settings:
   ```
   A record → 185.199.108.153
   A record → 185.199.109.153
   A record → 185.199.110.153
   A record → 185.199.111.153
   ```

3. Enable in GitHub Settings → Pages

---

## Support

### Deployment Issues?
1. Check GitHub Pages settings
2. Clear browser cache
3. Try different browser
4. Check browser console (F12)
5. Review build output for errors

### Questions?
- Review Vite deployment docs: https://vite.dev/guide/static-deploy.html
- GitHub Pages docs: https://pages.github.com/
- See README.md for more info

---

**Version**: 1.0
**Last Updated**: 2026-10-20
**Status**: Ready to Deploy ✅
