#!/bin/bash
if [ "$SHINY_ENVIRONMENT" = "production" ]; then
  cp .Renviron.production .Renviron
else
  cp .Renviron.development .Renviron
fi

exec "$@"

