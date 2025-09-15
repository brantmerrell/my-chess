# GitHub Pages Deployment Guide for ascii-chess-ts

## Overview
This React app is deployed to GitHub Pages and served at https://chess.jbm.eco

## Prerequisites
- Node.js and npm installed
- Git repository pushed to GitHub
- AWS CLI configured (for DNS updates only)

## Quick Deploy

### Deploy to GitHub Pages
```bash
npm run deploy
```

Includes:
1. `npm run build` to build the production version
2. `gh-pages -d build` to deploy to GitHub Pages

The site will be available at: https://brantmerrell.github.io/my-chess/

## Initial Setup (Already Complete)

### 1. GitHub Pages Configuration
- Install package: `gh-pages`
- Add to `package.json`:
  ```json
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d build"
  }
  ```
- Configure homepage in `package.json`: `"homepage": "https://chess.jbm.eco"`

### 2. Custom Domain Setup

#### CNAME File
Create `public/CNAME`:
```
chess.jbm.eco
```

#### DNS Configuration (AWS Route53)
The DNS record needs to point to GitHub Pages:

```bash
# Check current DNS configuration
aws route53 list-resource-record-sets \
  --hosted-zone-id Z09993342DTENH85DU8MJ \
  --query 'ResourceRecordSets[?contains(Name,`chess.jbm.eco`)].{Name:Name,Type:Type,Value:AliasTarget.DNSName}'

# Update DNS to point to GitHub Pages (after first deployment)
# You'll need to create a change batch JSON file
```

**GitHub Pages IPs for A records:**
- 185.199.108.153
- 185.199.109.153
- 185.199.110.153
- 185.199.111.153

## Deployment Workflow

### 1. Make Changes
```bash
# Edit your code
git add .
git commit -m "Your changes"
git push origin main
```

### 2. Deploy to GitHub Pages
```bash
npm run deploy
```

### 3. Verify Deployment
- Check GitHub Actions: https://github.com/brantmerrell/my-chess/actions
- Visit your site: https://chess.jbm.eco
- Clear browser cache if needed: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows/Linux)

## Troubleshooting

### Site not updating?
1. Check GitHub Pages settings: https://github.com/brantmerrell/my-chess/settings/pages
2. Verify the `gh-pages` branch exists
3. Clear browser cache
4. Check GitHub Actions for deployment errors

### Custom domain not working?
1. Ensure `public/CNAME` file exists with `chess.jbm.eco`
2. Verify DNS propagation: `dig chess.jbm.eco`
3. Check GitHub Pages custom domain settings

### Build errors?
1. Test locally first: `npm run build`
2. Check for TypeScript errors: `npx tsc --noEmit`
3. Ensure all dependencies are installed: `npm install`

## Migrating from AWS

### Current Setup (Being Replaced)
- ~~CloudFront Distribution: E2H24NSI4X5H1A~~
- ~~ECS Service: asciichessts~~
- ~~ECR Repository: my-chess-asciichessts~~

### After Migration Complete
1. Stop ECS service to save costs
2. Delete CloudFront distribution (after DNS fully propagated)
3. Remove ECR images to free storage

## Benefits of GitHub Pages
- **No maintenance**: No servers, containers, or IPs to manage
- **Automatic SSL**: GitHub provides SSL certificates
- **Fast deployment**: Push to git, automatically deployed
- **Free hosting**: 100GB bandwidth/month
- **Simple DNS**: Point once, never update again

## Useful Commands

```bash
# Build locally
npm run build

# Deploy to GitHub Pages
npm run deploy

# Check deployment status
git log --oneline -n 1 gh-pages

# Force rebuild and deploy
rm -rf node_modules build
npm install
npm run deploy

# Check DNS propagation
dig chess.jbm.eco
nslookup chess.jbm.eco
```

## Additional Resources
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [gh-pages npm package](https://github.com/tschaub/gh-pages)
- [Custom domain setup](https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site)
