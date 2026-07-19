# MCP Movie Assistant

An MCP server for exploring TMDB movie data. It exposes tools for searching, discovering, and reading movie information over stdio.

## Requirements

- Node.js 18 or newer
- npm
- A TMDB credential

## Install

```bash
npm install
```

## Environment

Create a `.env` file in the project root.

Supported TMDB variables:

```bash
# Preferred for TMDB v4 bearer auth
TMDB_API_KEY=your_tmdb_v4_access_token

# Optional fallback used if no bearer token is present
TMDB_API_KEY_V3=your_tmdb_v3_api_key

# Legacy variable names also supported by the code
API_TOKEN_READ_ONLY=your_tmdb_v4_access_token
API_KEY=your_tmdb_v3_api_key
```

Notes:

- The server loads `.env` on startup.
- If both token styles are present, the bearer token is used first.
- Do not commit `.env`; it is already ignored by git.

## Build

Compile the TypeScript source into `build/`:

```bash
npm run build
```

## Run the server

After building, start the MCP server with:

```bash
npm start
```

This runs `node ./build/index.js`.

## Open the MCP Inspector

The inspector script builds first, then launches the inspector against the compiled server:

```bash
npm run inspector
```

## Available tools

The server currently exposes these MCP tools:

- `search-movies`
- `get-movie-details`
- `get-trending-movies`
- `get-movie-recommendations`
- `discover-movies`

## Troubleshooting

### TMDB request failed with status 401

This usually means the token was not loaded or the wrong variable name is being used.

Check that:

- Your `.env` file exists at the project root
- It contains a valid TMDB token or API key
- The value is assigned to one of the supported variables above
- You rebuilt after making code changes with `npm run build`

### Inspector says `Not connected`

This usually means the inspector tried to launch `build/index.js` before the project was built, or the process exited early.

Fix:

```bash
npm run build
npm run inspector
```

## Project structure

```text
src/
  index.ts     # loads env and starts the stdio transport
  server.ts    # MCP server instance
  tools.ts     # TMDB-backed tools
  api.ts       # TMDB fetch helper
build/         # generated output from tsc
```

## Scripts

- `npm run build` - compile TypeScript to `build/`
- `npm start` - run the compiled server
- `npm run inspector` - build and open the MCP inspector
- `npm test` - placeholder test script

## License

No license has been declared in this repository yet.
