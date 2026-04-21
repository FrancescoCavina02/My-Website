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
    description: "Full-stack personal portfolio with FastAPI backend, Obsidian vault integration, and an AI-powered knowledge graph system.",
    longDescription: "A Next.js + FastAPI web application that parses my personal Obsidian knowledge vault in real time, extracts structured notes and quotes, and serves them through a REST API. The system uses a custom tree parser and caching layer for performance. Demonstrates full-stack development, API design, and integration of personal knowledge management with web technology.",
    category: "web",
    technologies: ["Next.js", "TypeScript", "FastAPI", "Python", "Tailwind CSS", "Obsidian", "Render.com"],
    githubUrl: "https://github.com/FrancescoCavina02/My-Website",
    featured: true,
  },
  {
    id: "spiritual-chatbot",
    title: "Spiritual AI Guide Chatbot",
    description: "RAG-powered chatbot providing spiritual and psychological guidance from a curated personal knowledge base.",
    longDescription: "An intelligent conversational agent that uses Retrieval-Augmented Generation (RAG) to answer questions grounded in my personal notes on spirituality, psychology, and philosophy. Built with ChromaDB as a vector store for semantic search, OpenAI's embeddings and GPT models for generation, and FastAPI for the backend API. Demonstrates applied NLP, vector database design, prompt engineering, and LLM orchestration.",
    category: "ai",
    technologies: ["Python", "FastAPI", "ChromaDB", "OpenAI API", "LangChain", "Next.js", "RAG"],
    githubUrl: "https://github.com/FrancescoCavina02/Spiritual-chatbot",
    featured: true,
  }
];

export const categories = [
    { id: "all", label: "All Projects" },
    { id: "ai", label: "AI & ML" },
    { id: "web", label: "Web Development" },
    { id: "podcast", label: "Podcasts" },
    { id: "other", label: "Other" },
];
