# OrderFlow TWA — Order Management System

A production-ready Telegram Mini App for manufacturer-agent order coordination.

## Features
- **Agent Interface**: Catalog browsing, GPS-tagged orders, order history.
- **Manufacturer Interface**: Real-time order dashboard, product management, agent control.
- **Real-time**: Instant notifications and status updates via Supabase.
- **Native TWA**: Follows Telegram theme, uses MainButton, BackButton, and Haptic Feedback.

## Tech Stack
- **Frontend**: React + TypeScript + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Realtime + Auth)
- **Telegram**: @twa-dev/sdk

## Setup Instructions

### 1. Supabase Setup
1. Create a new project on [Supabase](https://supabase.com).
2. Go to the **SQL Editor** and run the contents of `supabase/migrations/001_initial.sql`.
3. Go to **Project Settings > API** and copy your `URL` and `anon public` key.

### 2. Frontend Setup
1. Clone this repo.
2. Create a `.env` file from `.env.example` and paste your Supabase credentials.
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

### 3. Telegram Bot Setup
1. Message [@BotFather](https://t.me/botfather) on Telegram.
2. Create a new bot and get the **API Token**.
3. Set the Web App URL to your hosted frontend (e.g., Vercel or Netlify URL).
4. For local testing, use a tool like **Ngrok** to expose your Vite dev server (usually port 5173).

## Environment Variables
- `VITE_SUPABASE_URL`: Your Supabase Project URL.
- `VITE_SUPABASE_ANON_KEY`: Your Supabase Anon Key.
- `VITE_BOT_USERNAME`: Your Telegram Bot username (without @).

## Deployment
- Deploy the frontend to **Vercel** or **Netlify**.
- Ensure the Supabase RLS policies are active.
