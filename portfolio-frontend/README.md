# Frontend - Web Client (Next.js & React)

[Leer en Español](README.es.md)

This directory contains the user interface for the Dadejecova Platform. Developed with **Next.js 16 (App Router)** and **TailwindCSS**, it delivers fast page navigation, responsive presentation, and interactive course tools for registered learners.

## Core Technologies
- **Framework:** Next.js 16 (React 19) with App Router
- **Styling:** TailwindCSS
- **Authentication:** JWT handling via Fetch API and client-side decoding with `jwt-decode`
- **Markdown & Code:** `react-markdown` and `remark-gfm` for rich technical content

## Route Architecture and Navigation

The client uses nested dynamic routes reflecting database hierarchy (Topic > Series > Lesson):

### Public and Interactive Routes
- `/`: **Landing Page**. Displays available topics and course categories.
- `/topics/[topicSlug]`: Lists learning series published under a specific topic.
- `/topics/[topicSlug]/[seriesSlug]/[lessonSlug]`: **Classroom View**. Renders Markdown content, conditional video player (YouTube/Vimeo), and series table of contents with progress checkboxes.
- `/aboutme`: **Dynamic CV**. Timeline loaded from the API (Experience, Education) and featured projects gallery.
- `/search`: Real-time lesson search engine.

### User System
- `/register`: Student account creation.
- `/login`: Secure user authentication.

### Administration CMS (Protected)
Protected by server-side and client-side JWT role verification (`is_staff`):
- `/dashboard`: Welcome and overview metrics.
- `/dashboard/topics` & `/dashboard/series`: Course structure management.
- `/dashboard/lessons`: Lesson editor supporting Markdown and image uploads.
- `/dashboard/experiences` & `/dashboard/education`: CV timeline managers.
- `/dashboard/projects`: Portfolio project uploads with screenshot support.

## Local Development Guide

### Installation
```bash
# Install dependencies
npm install
```

### Running the Development Server
```bash
# Start Next.js local server on port 3000
npm run dev
```

Ensure the Django backend API is running on `http://localhost:8000` to allow the frontend to consume data successfully.
