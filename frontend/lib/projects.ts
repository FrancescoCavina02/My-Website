/**
 * Projects Data
 * 
 * Add your projects here. Each project will appear on the Projects page.
 * 
 * To add a project:
 * 1. Add the project object to the array below
 * 2. Add a thumbnail image to frontend/public/images/projects/
 * 3. Set the image path in the project object
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
    // PLACEHOLDER: Add your projects here
    {
        id: "nlp-chatbot",
        title: "Spiritual AI Guide Chatbot",
        description:
            "RAG-powered chatbot providing spiritual guidance from personal book notes",
        longDescription:
            "An intelligent chatbot using Retrieval-Augmented Generation to provide spiritual and psychological guidance based on curated notes from books on spirituality, psychology, and philosophy.",
        category: "ai",
        technologies: ["Python", "FastAPI", "ChromaDB", "Next.js", "OpenAI"],
        githubUrl: "https://github.com/FrancescoCavina02/Spiritual-chatbot",
        featured: true,
    },
    {
        id: "portfolio",
        title: "Portfolio Website",
        description:
            "This website - built with Next.js and FastAPI with Obsidian integration",
        category: "web",
        technologies: ["Next.js", "TypeScript", "FastAPI", "Tailwind CSS"],
        featured: true,
    },
    {
        id: "example-podcast",
        title: "Example Podcast",
        description: "Placeholder for your podcast project",
        category: "podcast",
        technologies: ["Audio Production", "Content Creation"],
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
