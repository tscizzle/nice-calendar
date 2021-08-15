# Nice Calendar

## Setup

### Install nvm and node

https://github.com/nvm-sh/nvm

Windows: https://github.com/coreybutler/nvm-windows

Then use nvm to install the version of node specified under `package.json`'s `"engines"` field.

### Install MongoDB

https://docs.mongodb.com/manual/installation/

### Install Redis

https://redis.io/download

Windows: https://github.com/microsoftarchive/redis

### Set `.env` Values

#### SESSION_SECRET

Can be anything. Used by one of our third-party packages for maintaining user sessions (staying logged in even when you refresh the page).

## Development

There's a few commands needed to start the appropriate databases and servers. They are shown in package.json under "scripts".

### npm run start-react

Runs the create-react-app development server, which is what serves the page you'll load by going to http://localhost:3000 in your browser.

This server exists only for development. In production, the page is served by the same node backend server that serves the HTTP API (described below).

### npm run start-mongo-dev

Runs the mongo server so the app can connect to the mongo database that holds all the backend data, like events and users.

Note: On Linux, run `npm run stop-mongo-dev` when you're done developing, to stop the mongo daemon.

Note: On Windows, we don't need a command to start MongoDB because the default install of MongoDB on Windows creates a Service, which keeps a MongoDB server running in the background for us automatically.

### npm run start-redis-dev

Run the redis server so the app can connect to the redis database that manages user auth sessions.

Note: On Windows, we don't need a command to start Redis because the default install of Redis on Windows creates a Service, which keeps a Redis server running in the background for automatically.

### npm run start-server-dev

Run the node backend server, which is what serves the HTTP API.

In production, the node backend server serves the HTTP API as well as the page itself, but in development the create-react-app development server serves the page.
