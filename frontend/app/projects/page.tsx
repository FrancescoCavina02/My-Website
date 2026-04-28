"use client";

import { useState } from "react";
import { projects, categories, Project } from "@/lib/projects";
import { Brain, Globe, Mic, Folder } from "lucide-react";

export default function ProjectsPage() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredProjects =
    activeCategory === "all" ? projects : projects.filter((p) => p.category === activeCategory);

  const featuredProjects = projects.filter((p) => p.featured);

  return (
    <div className="min-h-screen">
      <section className="section">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="mb-12 text-center stagger-children">
            <h1 className="mb-4">My Projects</h1>
            <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
              A collection of work spanning AI, web development, and creative endeavors
            </p>
          </div>

          {/* AI Skills Demonstrated Callout Box */}
          <div className="mb-12 animate-fade-in-up border border-[rgba(255,255,255,0.08)] bg-[rgba(14,165,233,0.05)] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
              <Brain className="w-5 h-5 text-[var(--color-accent)]" /> AI Skills Demonstrated
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)] list-none">
                <li className="flex items-center gap-2">
                  <span className="text-[var(--color-accent)]">•</span> Hybrid Dense-Sparse
                  Retrieval
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--color-accent)]">•</span> Transformer Sentence
                  Embeddings
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--color-accent)]">•</span> HNSW ANN Indexing
                </li>
              </ul>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)] list-none">
                <li className="flex items-center gap-2">
                  <span className="text-[var(--color-accent)]">•</span> Multi-LLM Provider
                  Abstraction
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--color-accent)]">•</span> FastAPI Async SSE Streaming
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--color-accent)]">•</span> Prompt Engineering
                </li>
              </ul>
              <ul className="space-y-2 text-sm text-[var(--color-text-secondary)] list-none">
                <li className="flex items-center gap-2">
                  <span className="text-[var(--color-accent)]">•</span> Quantitative Model
                  Evaluation
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--color-accent)]">•</span> ETL Pipeline Design
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-[var(--color-accent)]">•</span> Data Engineering
                </li>
              </ul>
            </div>
          </div>

          {/* Featured Projects */}
          {featuredProjects.length > 0 && (
            <div className="mb-12 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              <h2 className="text-xl font-semibold mb-6 text-white border-b border-[rgba(255,255,255,0.05)] pb-3">
                Featured Work
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {featuredProjects.map((project) => (
                  <ProjectCard key={project.id} project={project} featured />
                ))}
              </div>
            </div>
          )}

          {/* Category Filter */}
          <div
            className="flex flex-wrap gap-2 mb-8 animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeCategory === cat.id
                    ? "bg-[var(--color-accent)] text-black"
                    : "bg-transparent border border-[rgba(255,255,255,0.1)] text-[var(--color-text-secondary)] hover:bg-[rgba(255,255,255,0.05)] hover:text-white"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Project Grid */}
          <div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in-up"
            style={{ animationDelay: "0.3s" }}
          >
            {filteredProjects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>

          {filteredProjects.length === 0 && (
            <div className="text-center py-12 text-[var(--color-text-muted)] border border-[rgba(255,255,255,0.05)] rounded-lg border-dashed">
              No projects in this category yet.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function ProjectCard({ project, featured = false }: { project: Project; featured?: boolean }) {
  return (
    <div
      className={`card flex flex-col h-full ${
        featured ? "border-[rgba(14,165,233,0.3)] shadow-[0_0_15px_rgba(14,165,233,0.05)]" : ""
      }`}
    >
      {/* Project Image Placeholder */}
      {project.image ? (
        <div className="mb-5 rounded-md overflow-hidden bg-[#111] aspect-video border border-[rgba(255,255,255,0.05)]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={project.image}
            alt={project.title}
            className="w-full h-full object-cover opacity-90 hover:opacity-100 transition-opacity"
          />
        </div>
      ) : (
        <div className="mb-5 rounded-md bg-[#111] border border-[rgba(255,255,255,0.05)] aspect-video flex items-center justify-center">
          <span className="text-4xl opacity-50">
            {project.category === "ai" ? (
              <Brain className="w-12 h-12 text-[var(--color-accent)]" />
            ) : project.category === "web" ? (
              <Globe className="w-12 h-12 text-[var(--color-text-muted)]" />
            ) : project.category === "podcast" ? (
              <Mic className="w-12 h-12 text-[var(--color-text-muted)]" />
            ) : (
              <Folder className="w-12 h-12 text-[var(--color-text-muted)]" />
            )}
          </span>
        </div>
      )}

      {/* Content Container (flex-grow keeps footer at bottom) */}
      <div className="flex-grow flex flex-col">
        <div className="mb-3 flex items-center justify-between">
          <span className="tag">{project.category.toUpperCase()}</span>
          {project.githubUrl && (
            <a
              href={project.githubUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-[var(--color-text-muted)] hover:text-white transition-colors"
            >
              View Source
            </a>
          )}
        </div>

        <h3 className="text-lg font-semibold mb-2 text-white">{project.title}</h3>

        <p className="text-sm text-[var(--color-text-secondary)] mb-5">
          {featured && project.longDescription ? project.longDescription : project.description}
        </p>

        {/* Technologies and Links (pushed to bottom) */}
        <div className="mt-auto">
          <div className="flex flex-wrap gap-2 mb-5">
            {project.technologies.slice(0, 6).map((tech) => (
              <span
                key={tech}
                className="text-xs px-2 py-1 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.05)] rounded text-[var(--color-text-secondary)]"
              >
                {tech}
              </span>
            ))}
            {project.technologies.length > 6 && (
              <span className="text-xs px-2 py-1 text-[var(--color-text-muted)]">
                +{project.technologies.length - 6} more
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 pt-4 border-t border-[rgba(255,255,255,0.05)]">
            {project.liveUrl ? (
              <a
                href={project.liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[var(--color-accent)] hover:underline flex items-center gap-1"
              >
                Visit Live Demo
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
            ) : project.githubUrl ? (
              <a
                href={project.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-[var(--color-text-primary)] hover:text-[var(--color-accent)] transition-colors flex items-center gap-1"
              >
                View Code
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
