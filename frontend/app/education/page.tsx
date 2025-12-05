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
                            <span className="text-gradient">Education</span>
                        </h1>
                        <p className="text-[var(--color-text-secondary)] text-lg">
                            Academic journey and professional development
                        </p>
                    </div>

                    {/* Timeline */}
                    <div className="space-y-8 animate-fade-in-up">
                        {/* PLACEHOLDER: Replace with your education */}
                        <TimelineItem
                            year="2024 - Present"
                            title="AI Master's Program"
                            institution="University of Amsterdam (UvA)"
                            description="Pursuing advanced studies in Artificial Intelligence, focusing on machine learning, NLP, and cognitive systems."
                            current
                        />

                        <TimelineItem
                            year="2020 - 2024"
                            title="Bachelor's Degree"
                            institution="[Your University]"
                            description="[Your degree and major]. Key coursework included [relevant courses]."
                            highlights={[
                                "Relevant course 1",
                                "Relevant course 2",
                                "Thesis/Project topic",
                            ]}
                        />

                        <TimelineItem
                            year="2020"
                            title="High School Diploma"
                            institution="[Your High School]"
                            description="[Brief description of your high school education]"
                        />
                    </div>

                    {/* Certifications */}
                    <div className="mt-16">
                        <h2 className="text-2xl font-semibold mb-6 text-gradient">
                            Certifications
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* PLACEHOLDER: Add your certifications */}
                            <CertificationCard
                                title="Example Certification"
                                provider="Provider Name"
                                year="2024"
                                url="#"
                            />
                            <CertificationCard
                                title="Another Certification"
                                provider="Another Provider"
                                year="2023"
                            />
                        </div>
                    </div>

                    {/* Relevant Coursework */}
                    <div className="mt-16">
                        <h2 className="text-2xl font-semibold mb-6 text-gradient">
                            Relevant Coursework
                        </h2>
                        <div className="flex flex-wrap gap-3">
                            {/* PLACEHOLDER: Add your coursework */}
                            {[
                                "Machine Learning",
                                "Deep Learning",
                                "Natural Language Processing",
                                "Computer Vision",
                                "Data Structures & Algorithms",
                                "Statistics",
                                "Linear Algebra",
                                "Calculus",
                            ].map((course) => (
                                <span
                                    key={course}
                                    className="px-3 py-2 bg-[var(--color-space-700)] rounded-lg text-sm text-[var(--color-text-secondary)]"
                                >
                                    {course}
                                </span>
                            ))}
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
        <div className="relative pl-8 border-l-2 border-[var(--color-space-600)]">
            {/* Timeline Dot */}
            <div
                className={`absolute -left-[9px] top-0 w-4 h-4 rounded-full ${current
                        ? "bg-[var(--color-accent-500)] animate-pulse-glow"
                        : "bg-[var(--color-space-600)]"
                    }`}
            />

            {/* Year Badge */}
            <span className="inline-block px-3 py-1 mb-2 text-xs font-medium bg-[var(--color-space-700)] rounded text-[var(--color-accent-400)]">
                {year}
            </span>

            {/* Content */}
            <div className="card mt-2">
                <h3 className="text-lg font-semibold text-[var(--color-text-primary)]">
                    {title}
                </h3>
                <p className="text-[var(--color-accent-500)] text-sm mb-2">
                    {institution}
                </p>
                <p className="text-[var(--color-text-secondary)] text-sm">
                    {description}
                </p>

                {highlights && highlights.length > 0 && (
                    <ul className="mt-3 space-y-1">
                        {highlights.map((item) => (
                            <li
                                key={item}
                                className="text-sm text-[var(--color-text-muted)] flex items-start gap-2"
                            >
                                <span className="text-[var(--color-accent-500)]">•</span>
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
            className="card hover:border-[var(--color-accent-500)] transition-colors"
        >
            <div className="flex items-start justify-between">
                <div>
                    <h4 className="font-semibold text-[var(--color-text-primary)]">
                        {title}
                    </h4>
                    <p className="text-sm text-[var(--color-text-secondary)]">
                        {provider}
                    </p>
                </div>
                <span className="text-xs text-[var(--color-text-muted)]">{year}</span>
            </div>
        </CardWrapper>
    );
}
