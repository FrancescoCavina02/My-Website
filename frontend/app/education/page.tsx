export const metadata = {
    title: "Education | Francesco Cavina",
    description: "Academic history, coursework, and certifications.",
};

export default function EducationPage() {
    return (
        <div className="min-h-screen">
            <section className="section">
                <div className="max-w-3xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-12 text-center stagger-children">
                        <h1 className="mb-4">
                            Education
                        </h1>
                        <p className="text-[var(--color-text-secondary)] text-lg">
                            Academic background and theoretical foundations
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-8 animate-fade-in-up">
                        <TimelineItem
                            year="Expected 2024"
                            title="BSc in Computer Science"
                            institution="[FILL IN University Name], [FILL IN Location]"
                            description="Final year Bachelor's student focusing on artificial intelligence, data structures, and software engineering principles."
                            highlights={[
                                "Current GPA: [FILL IN] / [FILL IN Max GPA]",
                                "Thesis Topic: [FILL IN Thesis Topic or remove this line]",
                            ]}
                            current
                        />
                        
                        {/* High School omitted intentionally per common European Master's application standard, but can be added here if requested */}
                    </div>

                    {/* Relevant Coursework */}
                    <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
                        <h2 className="text-xl font-semibold mb-6 text-white border-b border-[rgba(255,255,255,0.05)] pb-3">
                            Relevant AI & Math Coursework
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {[
                                "Machine Learning",
                                "Natural Language Processing",
                                "Computer Vision",
                                "Linear Algebra",
                                "Statistics & Probability",
                                "Algorithms & Data Structures",
                            ].map((course) => (
                                <span
                                    key={course}
                                    className="px-4 py-2 bg-[var(--color-surface)] border border-[rgba(255,255,255,0.08)] rounded-md text-sm text-[var(--color-text-secondary)] hover:text-white hover:border-[rgba(255,255,255,0.2)] transition-colors cursor-default"
                                >
                                    {course}
                                </span>
                            ))}
                        </div>
                    </div>

                    {/* Certifications (Optional) */}
                    <div className="mt-16 animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
                        <h2 className="text-xl font-semibold mb-6 text-white border-b border-[rgba(255,255,255,0.05)] pb-3">
                            Certifications & Extras
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <CertificationCard
                                title="[FILL IN Certification Name]"
                                provider="[FILL IN Provider (e.g., Coursera)]"
                                year="2023"
                                url="#"
                            />
                            {/* Delete this second card or fill it */}
                            <CertificationCard
                                title="[FILL IN Certification Name]"
                                provider="[FILL IN Provider]"
                                year="2022"
                            />
                        </div>
                    </div>

                </div>
            </section>
        </div>
    );
}

function TimelineItem({
    year,
    title,
    institution,
    description,
    highlights,
    current = false,
}: {
    year: string;
    title: string;
    institution: string;
    description: string;
    highlights?: string[];
    current?: boolean;
}) {
    return (
        <div className="relative pl-8 border-l border-[rgba(255,255,255,0.1)]">
            {/* Timeline Dot */}
            <div
                className={`absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full ${
                    current
                        ? "bg-[var(--color-accent)] shadow-[0_0_8px_rgba(14,165,233,0.6)]"
                        : "bg-[var(--color-text-muted)]"
                }`}
            />

            {/* Content */}
            <div className="card">
                <div className="flex justify-between items-start mb-1">
                    <h3 className="text-lg font-semibold text-white">
                        {title}
                    </h3>
                    <span className="inline-block px-2.5 py-1 text-xs font-medium bg-[rgba(255,255,255,0.05)] rounded text-[var(--color-text-secondary)]">
                        {year}
                    </span>
                </div>
                
                <p className="text-[var(--color-accent)] text-sm mb-3 font-medium">
                    {institution}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm leading-relaxed mb-4 font-light">
                    {description}
                </p>

                {highlights && highlights.length > 0 && (
                    <ul className="mt-4 space-y-2 pt-4 border-t border-[rgba(255,255,255,0.05)]">
                        {highlights.map((item) => (
                            <li
                                key={item}
                                className="text-sm text-[var(--color-text-secondary)] flex items-start gap-2"
                            >
                                <span className="text-[var(--color-text-muted)] mt-0.5">•</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
}

function CertificationCard({
    title,
    provider,
    year,
    url,
}: {
    title: string;
    provider: string;
    year: string;
    url?: string;
}) {
    const CardWrapper = url ? "a" : "div";
    const wrapperProps = url
        ? { href: url, target: "_blank", rel: "noopener noreferrer" }
        : {};

    return (
        <CardWrapper
            {...wrapperProps}
            className={`block bg-[var(--color-surface)] border border-[rgba(255,255,255,0.08)] rounded-lg p-5 transition-colors ${url ? 'hover:bg-[var(--color-card)] cursor-pointer' : ''}`}
        >
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="font-medium text-white mb-1">
                        {title}
                    </h4>
                    <p className="text-sm text-[var(--color-text-muted)]">
                        {provider}
                    </p>
                </div>
                <span className="text-xs font-mono text-[var(--color-text-muted)]">{year}</span>
            </div>
        </CardWrapper>
    );
}
