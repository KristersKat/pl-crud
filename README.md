# Task Manager

A Next.js application for managing tasks with Supabase as the database.

## Features

- Create, read, update, and delete tasks
- Filter and sort tasks
- Task statistics
- Import and export tasks

## Setup

### Prerequisites

- Node.js 18+ and npm
- A Supabase account

### Local Development

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create a Supabase project at [https://supabase.com](https://supabase.com)
4. Create a `tasks` table in your Supabase database with the following schema:
   ```sql
   CREATE TABLE tasks (
     id TEXT PRIMARY KEY,
     title TEXT NOT NULL,
     description TEXT,
     due_date TIMESTAMP WITH TIME ZONE,
     priority TEXT CHECK (priority IN ('Low', 'Medium', 'High')),
     status TEXT CHECK (status IN ('Incomplete', 'In Progress', 'Completed')),
     created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
   );
   ```
5. Copy your Supabase URL and anon key from the Supabase dashboard
6. Create a `.env.local` file in the root directory with the following content:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   ```
7. Run the development server:
   ```bash
   npm run dev
   ```
8. Open [http://localhost:3000](http://localhost:3000) in your browser

### Deployment to Vercel

1. Push your code to a GitHub repository
2. Connect your repository to Vercel
3. Add the following environment variables in your Vercel project settings:
   - `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anon key
4. Deploy your application

## Database Schema

The application uses a single table called `tasks` with the following schema:

- `id`: Text (Primary Key)
- `title`: Text (Required)
- `description`: Text
- `due_date`: Timestamp with time zone
- `priority`: Text (Enum: 'Low', 'Medium', 'High')
- `status`: Text (Enum: 'Incomplete', 'In Progress', 'Completed')
- `created_at`: Timestamp with time zone (Default: NOW()) 