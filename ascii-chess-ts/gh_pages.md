# GitHub Pages Deployment Guide for ascii-chess-ts

## Overview
This React app is deployed to GitHub Pages and served at https://chess.jbm.eco

## Quick Deploy

### Deploy to GitHub Pages
```bash
npm run deploy
```

Includes:
1. `npm run build` to build the production version
2. `gh-pages -d build` to deploy to GitHub Pages

The site will be available at: https://brantmerrell.github.io/my-chess/

## Useful Commands

```bash
git log --oneline -n 1 gh-pages
```
---
```bash
rm -rf node_modules build
npm install
npm run deploy

```bash
---
```
# Check DNS propagation
dig chess.jbm.eco
nslookup chess.jbm.eco
```
