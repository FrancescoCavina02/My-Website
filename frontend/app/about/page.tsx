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
            <h1 className="mb-4">About Me</h1>
            <p className="text-[var(--color-text-secondary)] text-lg">The story behind the code</p>
          </div>

          {/* Content */}
          <div className="space-y-8 animate-fade-in-up">
            {/* 1. Introduction Section */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-white border-b border-[rgba(255,255,255,0.05)] pb-3">
                Introduction
              </h2>
              <div className="prose prose-invert max-w-none text-[var(--color-text-secondary)]">
                <p className="mb-4 leading-relaxed font-light">
                  I hold a BSc in Econometrics and Data Science from Vrije Universiteit Amsterdam,
                  with a Minor in Pure Mathematics from the University of Leeds. My work sits at
                  the intersection of rigorous mathematical foundations, production AI engineering,
                  and the philosophical questions that make both meaningful. I have developed a strong
                  proficiency in Python, machine learning, and full-stack development, with an
                  increasing focus on Natural Language Processing and reasoning
                  systems.
                </p>
                <p className="leading-relaxed font-light">
                  My focus is on understanding intelligent systems from the ground up - not just
                  building with AI, but questioning its architecture, its assumptions, and what it
                  could unlock in science and human cognition. I am currently building
                  privacy-first AI and data infrastructure at Robodata, while continuing to explore
                  these deeper questions through personal research and independent projects.
                </p>
              </div>
            </div>

            {/* 2. Technical Skills Section */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-6 text-white border-b border-[rgba(255,255,255,0.05)] pb-3">
                Technical Skills
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-[var(--color-text-muted)] mb-3 font-semibold">
                    Languages
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="tag">Python</span>
                    <span className="tag">TypeScript</span>
                    <span className="tag">JavaScript</span>
                    <span className="tag">SQL</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-[var(--color-text-muted)] mb-3 font-semibold">
                    AI / Machine Learning
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="tag border-[rgba(14,165,233,0.3)] text-[var(--color-accent)]">
                      LLMs
                    </span>
                    <span className="tag border-[rgba(14,165,233,0.3)] text-[var(--color-accent)]">
                      RAG
                    </span>
                    <span className="tag">ChromaDB</span>
                    <span className="tag">OpenAI API</span>
                    <span className="tag">Hugging Face</span>
                    <span className="tag">scikit-learn</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-[var(--color-text-muted)] mb-3 font-semibold">
                    Frameworks
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="tag">FastAPI</span>
                    <span className="tag">Next.js</span>
                    <span className="tag">React</span>
                    <span className="tag">Tailwind CSS</span>
                    <span className="tag">PySpark</span>
                  </div>
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-[var(--color-text-muted)] mb-3 font-semibold">
                    Tools
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="tag">Git</span>
                    <span className="tag">Docker</span>
                    <span className="tag">Kubernetes</span>
                    <span className="tag">Terraform</span>
                    <span className="tag">Azure</span>
                    <span className="tag">Databricks</span>
                    <span className="tag">Apache Airflow</span>
                    <span className="tag">Jinja</span>
                    <span className="tag">WireGuard</span>
                  </div>
                </div>
              </div>
            </div>

            {/* 3. Interests Section */}
            <div className="card">
              <h2 className="text-xl font-semibold mb-4 text-white border-b border-[rgba(255,255,255,0.05)] pb-3">
                Interests
              </h2>
              <div className="prose prose-invert max-w-none text-[var(--color-text-secondary)] font-light leading-relaxed">
                <p className="mb-4">
                  Beyond code, I&apos;m drawn to the deep questions — the mathematical structure
                  of physical reality, black holes, the origins of the universe, and what it means for
                  intelligent systems to understand anything at all. Between 2023 and 2024 I ran
                  two independent podcasts where I interviewed physicists, cosmologists, and
                  mathematicians about these topics, producing conversations I still return to.
                </p>
                <p>
                  I play dodgeball in the Dutch national team, read widely across philosophy, neuroscience,
                  and physics, and maintain an Obsidian vault of approximately 1,700 notes that functions as a
                  second brain — and occasionally as training data.
                </p>
              </div>
            </div>

            {/* 4. Currently Section */}
            <div className="card bg-[rgba(14,165,233,0.04)] border border-[rgba(14,165,233,0.12)]">
              <h2 className="text-xl font-semibold mb-2 text-white">Currently</h2>
              <div className="prose prose-invert max-w-none text-[var(--color-text-secondary)] font-light">
                <p>
                  Working as a Data & AI Platform Engineer at Robodata, building privacy-first AI
                  infrastructure, running personal ML research projects, and exploring the
                  mathematical foundations of intelligent systems.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
