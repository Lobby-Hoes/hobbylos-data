# Hobbylos Data

Apollo GraphQL based API

## Docker
### Quick Start
- ``git clone https://github.com/Lobby-Hoes/hobbylos-data.git``
- ``docker compose up --build``
- Das fertige image bekommt ihr auch mit ``docker pull ghcr.io/lobby-hoes/hobbylos-data:main``
- Die server.key und server.crt Dateien müssen in "/ssl/data.hobbylos.online/" auf dem Server/PC gespeichert sein.

## Node
### Requirements

- node
- npm

### Quick Start
- Node Environment auf "development" setzen ```$env:NODE_ENV="development"```
- ``npm install``
- ``node index.js``
