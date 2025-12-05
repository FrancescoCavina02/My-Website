export const metadata = {
    title: "About | Francesco Cavina",
    description: "Learn about my background, interests, and goals.",
};

export default function AboutPage() {
    return (
        <div className="min-h-screen">
            <section className="section">
                <div className="max-w-3xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-12 text-center stagger-children">
                        <h1 className="mb-4">
                            About <span className="text-gradient">Me</span>
                        </h1>
                        <p className="text-[var(--color-text-secondary)] text-lg">
                            The story behind the code
                        </p>
                    </div>

                    {/* Content */}
                    <div className="space-y-8 animate-fade-in-up">
                        {/* Background Section */}
                        <div className="card">
                            <h2 className="text-2xl font-semibold mb-4 text-gradient">
                                Background
                            </h2>
                            {/* PLACEHOLDER: Replace with your content */}
                            <div className="prose prose-invert max-w-none text-[var(--color-text-secondary)]">
                                <p className="mb-4">
                                    [Your personal story here - 2-3 paragraphs about who you are,
                                    your journey into AI/tech, and what drives you]
                                </p>
                                <p className="mb-4">
                                    Share your background, where you grew up, what sparked your
                                    interest in technology and AI, and the experiences that shaped
                                    your career path.
                                </p>
                                <p>
                                    Explain your motivation for pursuing the AI Master's program
                                    and what you hope to achieve.
                                </p>
                            </div>
                        </div>

                        {/* Interests Section */}
                        <div className="card">
                            <h2 className="text-2xl font-semibold mb-4 text-gradient">
                                Interests
                            </h2>
                            {/* PLACEHOLDER: Replace with your interests */}
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                {[
                                    "Artificial Intelligence",
                                    "Machine Learning",
                                    "Philosophy",
                                    "Spirituality",
                                    "Psychology",
                                    "Music",
                                ].map((interest) => (
                                    <div
                                        key={interest}
                                        className="p-3 bg-[var(--color-space-700)] rounded-lg text-center text-sm text-[var(--color-text-secondary)] hover:text-[var(--color-accent-500)] transition-colors"
                                    >
                                        {interest}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Goals Section */}
                        <div className="card">
                            <h2 className="text-2xl font-semibold mb-4 text-gradient">
                                Goals
                            </h2>
                            {/* PLACEHOLDER: Replace with your goals */}
                            <div className="prose prose-invert max-w-none text-[var(--color-text-secondary)]">
                                <p className="mb-4">
                                    [Your career goals and why UvA AI Master's]
                                </p>
                                <ul className="list-disc list-inside space-y-2">
                                    <li>Short-term goal: [e.g., Complete AI Master's program]</li>
                                    <li>
                                        Medium-term goal: [e.g., Contribute to AI research or
                                        industry]
                                    </li>
                                    <li>
                                        Long-term goal: [e.g., Lead impactful AI projects that
                                        benefit society]
                                    </li>
                                </ul>
                            </div>
                        </div>

                        {/* Skills Section */}
                        <div className="card">
                            <h2 className="text-2xl font-semibold mb-4 text-gradient">
                                Skills
                            </h2>
                            <div className="space-y-4">
                                {[
                                    { name: "Python", level: 85 },
                                    { name: "JavaScript/TypeScript", level: 80 },
                                    { name: "React/Next.js", level: 75 },
                                    { name: "Machine Learning", level: 70 },
                                    { name: "Data Analysis", level: 75 },
                                ].map((skill) => (
                                    <div key={skill.name}>
                                        <div className="flex justify-between mb-1">
                                            <span className="text-[var(--color-text-primary)] text-sm">
                                                {skill.name}
                                            </span>
                                            <span className="text-[var(--color-text-muted)] text-sm">
                                                {skill.level}%
                                            </span>
                                        </div>
                                        <div className="h-2 bg-[var(--color-space-700)] rounded-full overflow-hidden">
                                            <div
                                                className="h-full bg-gradient-to-r from-[var(--color-accent-500)] to-[var(--color-nebula-500)] rounded-full transition-all duration-1000"
                                                style={{ width: `${skill.level}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
