# Task Manager

A modern web-based task manager application built with Next.js, TypeScript, and Supabase.

## Live Demo

The application is available online at [https://pl-crud.vercel.app/](https://pl-crud.vercel.app/)

## Features

### Core Requirements ✅
- **Create, Read, Update, Delete (CRUD) Tasks**
  - Create new tasks with title, description, due date, priority, and status
  - View a list of all tasks
  - Edit existing tasks
  - Delete individual tasks or all tasks at once

- **Task Properties**
  - Title: Short string
  - Description: Longer text field
  - Due Date: Date/time format
  - Priority: Low, Medium, High
  - Status: Incomplete, In Progress, Completed

- **Data Persistence**
  - Tasks stored in Supabase PostgreSQL database

### Bonus Features ✅
- **Search**: Search tasks by keyword (title/description)
- **Sort**: Sort tasks by title, due date, priority, status, or creation date
- **Statistics**: Display task statistics including:
  - Total number of tasks
  - Number of completed tasks
  - Number of tasks due soon
- **Export/Import**: Export tasks to JSON and import tasks from JSON
- **Modern UI**: Clean, responsive interface using Shadcn UI, Radix UI, and Tailwind CSS

## Tech Stack

### Frontend
- **Next.js 14**: React framework with App Router
- **TypeScript**: For type safety
- **Shadcn UI**: Component library
- **Radix UI**: Accessible UI primitives
- **Tailwind CSS**: Utility-first CSS framework

### Backend
- **Next.js API Routes**: Server-side API endpoints
- **Supabase**: Backend as a Service (BaaS) with PostgreSQL database

## Getting Started

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

## Database Schema

The application uses a single table called `tasks` with the following schema:

- `id`: Text (Primary Key)
- `title`: Text (Required)
- `description`: Text
- `due_date`: Timestamp with time zone
- `priority`: Text (Enum: 'Low', 'Medium', 'High')
- `status`: Text (Enum: 'Incomplete', 'In Progress', 'Completed')
- `created_at`: Timestamp with time zone (Default: NOW())

## Credits

- UI components from [Shadcn UI](https://ui.shadcn.com/)
- Icons from [Lucide Icons](https://lucide.dev/)
- Date formatting with [date-fns](https://date-fns.org/) 