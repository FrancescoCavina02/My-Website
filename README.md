# Francesco Cavina - Portfolio Website

A professional portfolio website built with Next.js and FastAPI, featuring Obsidian vault integration for notes and an AI-powered quotes feature.

## Overview

This portfolio serves as my central hub for the UvA AI Master's admission board, showcasing my work, education, and technical skills.

### Features

- **Home** — Brief introduction with navigation
- **About** — Personal background, interests, and goals
- **Projects** — Showcase of websites, AI projects, and podcasts
- **Education** — Academic history and certifications
- **Notes** — Interactive browser for my Obsidian vault
- **Daily Quotes** — AI-powered inspirational quotes from my reading notes
- **Contact** — Professional contact form

## Tech Stack

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Tailwind CSS

### Backend
- Python 3.11+
- FastAPI
- Pydantic

### Infrastructure
- PostgreSQL (contact form storage)
- In-memory caching for vault data

## Project Structure

```
My Website/
├── frontend/           # Next.js application
│   ├── app/           # App Router pages
│   ├── components/    # React components
│   └── lib/           # Utilities
├── backend/           # FastAPI application
│   └── app/
│       ├── api/       # REST endpoints
│       ├── services/  # Business logic
│       └── models/    # Pydantic models
└── README.md
```

## Getting Started

### Prerequisites

- Node.js 20+
- Python 3.11+
- PostgreSQL (optional, for contact form)

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
npm run dev
```

### Access

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

## Environment Variables

### Backend (.env)

```env
OBSIDIAN_VAULT_PATH=/path/to/obsidian/vault
PORT=8000
DEBUG=true
CORS_ORIGINS=http://localhost:3000
CACHE_TTL=300
```

### Frontend (.env.local)

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/notes` | GET | List all notes |
| `/api/notes/{id}` | GET | Get single note |
| `/api/notes/tree` | GET | Get navigation tree |
| `/api/notes/search?q=` | GET | Search notes |
| `/api/quotes/categories` | GET | List quote categories |
| `/api/quotes/random` | GET | Get random quote |
| `/api/contact` | POST | Submit contact form |

## Development

### Running Tests

```bash
# Backend
cd backend && pytest

# Frontend
cd frontend && npm test
```

### Code Quality

```bash
# Backend
black app/
flake8 app/

# Frontend
npm run lint
```

## Deployment

Documentation for deployment coming soon.

## Author

**Francesco Cavina**

- GitHub: [@FrancescoCavina02](https://github.com/FrancescoCavina02)

## License

This project is private and intended for portfolio demonstration purposes.
