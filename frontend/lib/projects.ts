/**
 * Projects Data
 *
 * Add your projects here. Each project will appear on the Projects page.
 */

export interface Project {
  id: string;
  title: string;
  description: string;
  longDescription?: string;
  category: "ai" | "web" | "podcast" | "other";
  image?: string;
  technologies: string[];
  liveUrl?: string;
  githubUrl?: string;
  featured: boolean;
}

export const projects: Project[] = [
  {
    id: "personal-website",
    title: "AI-Powered Personal Website",
    description:
      "Full-stack portfolio powered by a FastAPI backend that live-parses an Obsidian vault (1,649 notes → 1,772 semantic chunks) into a REST API with multi-LLM RAG chat and SSE streaming, deployed on Render + Netlify.",
    longDescription:
      "A Next.js + FastAPI web application that parses my personal Obsidian knowledge vault in real time, extracts structured notes and quotes, and serves them through a REST API. The system uses a custom tree parser and caching layer for performance. Demonstrates full-stack development, API design, and integration of personal knowledge management with web technology.",
    category: "web",
    technologies: [
      "Next.js",
      "TypeScript",
      "FastAPI",
      "Python",
      "Tailwind CSS",
      "Obsidian",
      "Render.com",
    ],
    githubUrl: "https://github.com/FrancescoCavina02/My-Website",
    featured: true,
  },
  {
    id: "spiritual-chatbot",
    title: "Spiritual AI Guide — RAG Knowledge Chatbot",
    description:
      "Production-deployed RAG system that semantically searches 1,649 personal Obsidian notes (~300K words) and delivers grounded, cited responses via GPT-4 Turbo.",
    longDescription:
      "Five-stage RAG pipeline built from scratch: (1) Obsidian vault parser with WikiLink graph extraction; (2) structure-aware chunking (800-token chunks, 150-token overlap); (3) sentence-transformers/all-MiniLM-L6-v2 → 384-dim L2-normalised vectors in ChromaDB HNSW; (4) hybrid retrieval: 70% cosine similarity + 20% BM25 keyword overlap + 10% WikiLink density, recovering ~12% additional recall on named-entity queries vs. dense-only; (5) GPT-4 Turbo with citation-injected structured prompts, token-by-token SSE streaming. Multi-LLM abstraction (OpenAI, Ollama/Llama 3.1, Anthropic, Google) via shared abstract base class. Evaluated across 20 queries: GPT-4 Turbo achieves 4.7/5 citation accuracy, 4.6/5 contextual grounding.",
    category: "ai",
    image: "/images/Spiritual-chatbot-main.png",
    technologies: [
      "Python",
      "FastAPI",
      "ChromaDB",
      "sentence-transformers",
      "OpenAI GPT-4 Turbo",
      "Llama 3.1",
      "Claude 3 Sonnet",
      "SSE Streaming",
      "BM25",
      "HNSW",
      "Next.js",
      "RAG",
    ],
    githubUrl: "https://github.com/FrancescoCavina02/Spiritual-chatbot",
    liveUrl: "https://spiritualchatbot1.netlify.app/",
    featured: true,
  },
  {
    id: "podcasts",
    title: "Independent Podcasts",
    description: "Created and hosted two podcasts interviewing researchers on Physics, Cosmology, Mathematics, and Philosophy.",
    category: "podcast",
    image: "/images/podcast-main.png",
    technologies: ["Interviewing", "Audio Editing", "Research", "Content Creation"],
    liveUrl: "https://www.youtube.com/@francescocavina5882",
    featured: false,
  },
  {
    id: "dodgeball-club",
    title: "Dodgeball Club Amsterdam Website",
    description: "Created and currently maintaining a dynamic and modern website for the Dodgeball Club Amsterdam.",
    category: "web",
    image: "/images/dodgeball-website-main.png",
    technologies: ["HTML", "JavaScript", "CSS"],
    githubUrl: "https://github.com/FrancescoCavina02/DCA-website",
    liveUrl: "https://dodgeballclubamsterdam.com/",
    featured: false,
  },
];

export const categories = [
  { id: "all", label: "All Projects" },
  { id: "ai", label: "AI & ML" },
  { id: "web", label: "Web Development" },
  { id: "podcast", label: "Podcasts" },
  { id: "other", label: "Other" },
];
