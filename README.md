# FamilyTimeline

Manage your family data with timeline.

## For developers

### Project Setup

```bash
npm install
npm run install
```

### Init demo database

```bash
cd backend-server/src
sqlite3 database.sqlite3 < db/schema.sql
sqlite3 database.sqlite3 < db/royal_family.sql
```

### Compile and run

```sh
npm start
```

The frontend is reachable  at `http://localhost:5173/`
The server side is listening on `http://localhost:5000/`

### Linter

```bash
npm run lint
```

### Test units

```bash
npm run test
```

### Docker build for server

Build image

```bash
sudo docker build . --file Dockerfile -t familytimeline-server
```

Run container

```bash
sudo docker run -d -p 5000:5000 --name familytimeline-server familytimeline-server
```

### Docker build for client

Build image

```bash
sudo docker build . --file Dockerfile -t familytimeline-client
```

Run container

```bash
sudo docker run -d -p 80:80 --name familytimeline-client familytimeline-client
```

## Build and run with docker compose 

Init data folder, database and default config for client

```bash
mkdir -p userdata/ userdata/data userdata/data/profles userdata/data/attachments
cd userdata/
sqlite3 database.sqlite3 < ../backend-server/src/db/schema.sql
cp ../vuejs-client/public/config.js .
```

Build and deploy client, server and reverse proxy in front

```bash
sudo docker compose -f docker-compose.dev.yml up --build
```

The frontend is reachable  at `http://localhost/`
The API serveur is available on `http://localhost/api/`
