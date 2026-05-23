# VCS DOCX - Version Control System for Word Documents

A web application for automatically tracking changes in `.docx` files. It saves each uploaded version and visualizes the differences between them paragraph by paragraph.

## Development Guide

### Prerequisites
- [Bun](https://bun.sh/) installed.
- [Docker](https://www.docker.com/) installed and running (required for local Supabase).

### 1. Start the Database (Supabase)
The application relies on Supabase for the PostgreSQL database and file storage. To spin up the local database using Docker:

```bash
bunx supabase start
```
*Note: This command will automatically apply any database migrations.*

### 2. Start the Frontend App
To start the React development server:

```bash
bun run dev
```
Then, open the URL provided in the terminal (usually `http://localhost:5173`) in your browser.

### 3. Stopping the Environment
When you are done developing, you can stop the frontend by pressing `Ctrl + C` in the terminal where it's running.

To stop the Supabase Docker containers running in the background, run:

```bash
bunx supabase stop
```
*Note: Stopping Supabase preserves your local database data. If you ever want to completely wipe the local database and start fresh, you can run `bunx supabase stop --no-backup`.*

---

## Tech Stack
- **Frontend**: React, Vite, TypeScript, Vanilla CSS
- **Backend & Storage**: Supabase (PostgreSQL)
- **DOCX Parsing**: `mammoth`
- **Diff Engine**: `diff`
