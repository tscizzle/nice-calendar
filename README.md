# Nice Calendar

## Development

There's a few commands needed to start the appropriate databases and servers. They are shown in package.json under "scripts".

### npm run start-client-dev

Runs the create-react-app development server, which is what serves the page you'll load by going to http://localhost:3000 in your browser.

This server exists only for development. In production, the page is served by the same node backend server that serves the HTTP API (described below).

### npm run start-mongo-dev:linux

Runs the mongo daemon so the app can access the mongo database that holds all the backend data, like events and users.

For macOS, use `npm run start-mongo-dev:macos`.

On linux, run `npm run stop-mongo-dev:linux` when you're done developing, to stop the mongo daemon.

### npm run start-redis-dev

Run the redis server so the app can access the redis database that manages user auth sessions.

### npm run start-server-dev

Run the node backend server, which is what serves the HTTP API.

In production, the node backend server serves the HTTP API as well as the page itself, but in development the create-react-app development server serves the page.
