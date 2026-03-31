# routinePlanner

A lightweight routine scheduler for educational institutions built to automate timetabling using constraint-based slot generation while respecting teacher availability.

## Requirements

- Node.js (v20+ recommended)

## Installation

1. Clone the repository

   ```sh
   git clone https://github.com/nishantmajhi/routinePlanner.git
   cd routinePlanner
   ```

1. Install dependencies

   ```sh
   npm install
   ```

1. Initialize test data

   ```sh
   node test/
   # For Windows OS, use backslash instead
   ```

1. Start the server

   ```sh
   node server.js
   ```

1. Open <http://localhost:3645> (port can be set using `.ENV` file)

## Project structure

- `app.js`, `server.js` — entry points / server bootstrap
- `controller/` — core generation controller (`RoutinePlanner.js`)
- `model/` — data loader and DB helpers (`Loader.js`)
- `routes/` — HTTP routes for CRUD and generation
- `utils/` — helpers (logging, validation, schedule utilities)
- `view/` — static frontend assets (HTML, JS, CSS)
- `database/` — bundled SQLite DB and sample course files
- `test/` — test scripts and sample data

## Troubleshooting

- If the server fails to start, ensure Node.js is installed and `PORT` (if used) is free.
- If schedules are invalid or generate slowly, check `logs/` for detailed generation traces.
