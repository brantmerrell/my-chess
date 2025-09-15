# Heroku Deployment Guide

## Current Deployment (Docker Container with Diagon)

The app is deployed using Docker containers on Heroku with the `diagon` binary installed for graphdag functionality.

### Deploy Updates

```bash
# Make your changes, then:
cd /Users/joshuamerrell/github/brantmerrell/my-chess

# Commit changes
git add connector/
git commit -m "Your commit message"
git push origin main

# Deploy to Heroku
git subtree push --prefix=connector heroku main
```

### Monitor Deployment

```bash
# Watch logs during deployment
heroku logs --tail -a ascii-chess-connector

# Check deployment status
heroku releases -a ascii-chess-connector
```

## Testing Endpoints

All endpoints are working at: https://ascii-chess-connector-3fac027ebe4d.herokuapp.com/

```bash
# Health check
curl https://ascii-chess-connector-3fac027ebe4d.herokuapp.com/health

# Links endpoint
bash getLinks.sh

# Adjacencies endpoint
bash getAdjacencies.sh

# GraphDAG endpoint (uses links data to generate ASCII graph)
bash getGraphdag.sh
```

## Troubleshooting

```bash
# Check app status
heroku ps -a ascii-chess-connector

# Restart if needed
heroku restart -a ascii-chess-connector

# View recent logs
heroku logs --tail -n 50 -a ascii-chess-connector

# Rollback if deployment breaks something
heroku releases -a ascii-chess-connector
heroku rollback v[NUMBER] -a ascii-chess-connector
```

## Notes

- Stack: Container (using Dockerfile)
- Dependencies: Python 3.9, FastAPI, diagon binary
- The Dockerfile installs diagon from pre-built .deb on Heroku's amd64 architecture