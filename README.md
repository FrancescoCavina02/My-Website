# Francesco Cavina - Personal Portfolio Website

A full-stack personal portfolio built with Next.js and FastAPI, featuring project showcases, an interactive notes explorer, daily quotes, and a contact form.

## Overview

This repository powers Francesco Cavina's personal website and professional showcase. It highlights engineering work across AI and full-stack development, while also exposing selected notes and quote content from a personal knowledge base.

## Features

- **Home** — Intro, profile, and navigation hub
- **About** — Background, interests, and technical profile
- **Projects** — Featured AI and software projects
- **Education** — Academic timeline and certifications
- **Notes** — Interactive browser over curated knowledge vault content
- **Daily Quotes** — Random quote generation by category
- **Contact** — Backend-connected contact form with validation

## Tech Stack

### Frontend
- Next.js (App Router)
- TypeScript
- Tailwind CSS

### Backend
- Python 3.11+
- FastAPI
- Pydantic

### Infrastructure
- Netlify (frontend)
- Render (backend)
- PostgreSQL (contact form storage)

## Project Structure

```text
My-Website/
├── frontend/           # Next.js application
│   ├── app/            # App Router pages
│   ├── components/     # React components
│   └── lib/            # API and utilities
├── backend/            # FastAPI application
│   └── app/
│       ├── api/        # REST endpoints
│       ├── services/   # Business logic
│       └── models/     # Pydantic models
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL (optional for local contact form persistence)

### Backend Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
cp .env.example .env      # Edit with your settings
uvicorn app.main:app --reload
```

### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Local Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Core API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notes` | GET | List all notes |
| `/api/notes/{id}` | GET | Get single note |
| `/api/notes/search?q=` | GET | Search notes |
| `/api/quotes/categories` | GET | List quote categories |
| `/api/quotes/random` | GET | Get random quote |
| `/api/contact` | POST | Submit contact form |

## Author

**Francesco Cavina**

- GitHub: [@FrancescoCavina02](https://github.com/FrancescoCavina02)
