"use client";

import { useState } from "react";
import { projects, categories, Project } from "@/lib/projects";

export default function ProjectsPage() {
    const [activeCategory, setActiveCategory] = useState("all");

    const filteredProjects =
        activeCategory === "all"
            ? projects
            : projects.filter((p) => p.category === activeCategory);

    const featuredProjects = projects.filter((p) => p.featured);

    return (
        <div className="min-h-screen">
            <section className="section">
                <div className="max-w-6xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-12 text-center stagger-children">
                        <h1 className="mb-4">
                            My <span className="text-gradient">Projects</span>
                        </h1>
                        <p className="text-[var(--color-text-secondary)] text-lg max-w-2xl mx-auto">
                            A collection of work spanning AI, web development, and creative
                            endeavors
                        </p>
                    </div>

                    {/* Featured Projects */}
                    {featuredProjects.length > 0 && (
                        <div className="mb-12">
                            <h2 className="text-xl font-semibold mb-6 text-[var(--color-text-primary)]">
                                Featured
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {featuredProjects.map((project) => (
                                    <ProjectCard key={project.id} project={project} featured />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Category Filter */}
                    <div className="flex flex-wrap gap-2 mb-8">
                        {categories.map((cat) => (
                            <button
                                key={cat.id}
                                onClick={() => setActiveCategory(cat.id)}
                                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${activeCategory === cat.id
                                        ? "bg-[var(--color-accent-500)] text-[var(--color-space-900)]"
                                        : "bg-[var(--color-space-700)] text-[var(--color-text-secondary)] hover:bg-[var(--color-space-600)]"
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>

                    {/* Project Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredProjects.map((project) => (
                            <ProjectCard key={project.id} project={project} />
                        ))}
                    </div>

                    {filteredProjects.length === 0 && (
                        <div className="text-center py-12 text-[var(--color-text-muted)]">
                            No projects in this category yet.
                        </div>
                    )}
                </div>
            </section>
        </div>
    );
}

function ProjectCard({
    project,
    featured = false,
}: {
    project: Project;
    featured?: boolean;
}) {
    return (
        <div
            className={`card card-glow ${featured ? "border-[var(--color-accent-500)]/30" : ""
                }`}
        >
            {/* Project Image Placeholder */}
            {project.image ? (
                <div className="mb-4 rounded-md overflow-hidden bg-[var(--color-space-700)] aspect-video">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                        src={project.image}
                        alt={project.title}
                        className="w-full h-full object-cover"
                    />
                </div>
            ) : (
                <div className="mb-4 rounded-md bg-gradient-to-br from-[var(--color-accent-500)]/20 to-[var(--color-nebula-500)]/20 aspect-video flex items-center justify-center">
                    <span className="text-4xl">
                        {project.category === "ai"
                            ? "🤖"
                            : project.category === "web"
                                ? "🌐"
                                : project.category === "podcast"
                                    ? "🎙️"
                                    : "📁"}
                    </span>
                </div>
            )}

            {/* Category Badge */}
            <div className="mb-2">
                <span className="tag">{project.category.toUpperCase()}</span>
            </div>

            {/* Title & Description */}
            <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                {project.title}
            </h3>
            <p className="text-sm text-[var(--color-text-secondary)] mb-4">
                {project.description}
            </p>

            {/* Technologies */}
            <div className="flex flex-wrap gap-2 mb-4">
                {project.technologies.slice(0, 4).map((tech) => (
                    <span
                        key={tech}
                        className="text-xs px-2 py-1 bg-[var(--color-space-700)] rounded text-[var(--color-text-muted)]"
                    >
                        {tech}
                    </span>
                ))}
                {project.technologies.length > 4 && (
                    <span className="text-xs px-2 py-1 text-[var(--color-text-muted)]">
                        +{project.technologies.length - 4} more
                    </span>
                )}
            </div>

            {/* Links */}
            <div className="flex gap-3">
                {project.liveUrl && (
                    <a
                        href={project.liveUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--color-accent-500)] hover:underline"
                    >
                        Live Demo →
                    </a>
                )}
                {project.githubUrl && (
                    <a
                        href={project.githubUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                    >
                        GitHub
                    </a>
                )}
            </div>
        </div>
    );
}
