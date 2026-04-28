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
                  I'm a Computer Science student based in Amsterdam, passionate about building
                  intelligent systems that sit at the intersection of AI, philosophy, and human
                  experience. I have developed a strong proficiency in Python and full-stack
                  development, with an increasing focus on Natural Language Processing and reasoning
                  systems.
                </p>
                <p className="leading-relaxed font-light">
                  Currently, I am applying to the MSc Artificial Intelligence at the University of
                  Amsterdam (UvA) to pursue this passion rigorously. My goal is to deepen my
                  theoretical understanding of machine learning mechanisms while pushing the
                  boundaries of applied AI in creating robust, context-aware digital guides and
                  knowledge graphs.
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
                  </div>
                </div>
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-[var(--color-text-muted)] mb-3 font-semibold">
                    Tools
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    <span className="tag">Git</span>
                    <span className="tag">Docker</span>
                    <span className="tag">Obsidian</span>
                    <span className="tag">Render</span>
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
                <p>
                  Beyond code, I'm drawn to questions at the intersection of philosophy,
                  consciousness, and AI. I practice pottery as a form of mindful making, run
                  regularly, and play dodgeball competitively. I read widely to inform my worldview
                  and my work — drawing constantly from both classic Stoic philosophy and modern
                  neuroscience.
                </p>
              </div>
            </div>

            {/* 4. Currently Section */}
            <div className="card border-l-[3px] border-[var(--color-accent)]">
              <h2 className="text-xl font-semibold mb-2 text-white">Currently</h2>
              <div className="prose prose-invert max-w-none text-[var(--color-text-secondary)] font-light">
                <p>
                  Finishing my BSc in Computer Science at [FILL IN University], building AI
                  projects, and preparing my MSc AI application to the University of Amsterdam.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
