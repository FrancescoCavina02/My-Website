import { Briefcase, Code, Cpu, ShieldCheck, CheckCircle2 } from "lucide-react";

export const metadata = {
  title: "Experience | Francesco Cavina",
  description: "Professional experience in AI engineering and data infrastructure.",
};

export default function ExperiencePage() {
  return (
    <div className="min-h-screen">
      <section className="section">
        <div className="max-w-4xl mx-auto">
          {/* Page Header */}
          <div className="mb-12 text-center stagger-children">
            <h1 className="mb-4">Professional Experience</h1>
            <p className="text-[var(--color-text-secondary)] text-lg">
              Building production AI systems and data infrastructure
            </p>
          </div>

          {/* Experience Entries */}
          <div className="space-y-12 animate-fade-in-up">
            <div className="relative pl-8 border-l border-[rgba(255,255,255,0.1)]">
              {/* Timeline Dot */}
              <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-[var(--color-accent)] shadow-[0_0_8px_rgba(14,165,233,0.6)]" />

              <div className="card">
                {/* Header */}
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">
                      Data & AI Platform Engineer
                    </h2>
                    <p className="text-lg text-[var(--color-accent)] font-medium">Robodata</p>
                  </div>
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded text-[var(--color-text-secondary)]">
                    January 2026 — Present
                  </span>
                </div>

                {/* Team & Domain */}
                <div className="mb-8 pb-6 border-b border-[rgba(255,255,255,0.05)]">
                  <h3 className="text-sm uppercase tracking-wider text-[var(--color-text-muted)] font-bold mb-3 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Team & Domain
                  </h3>
                  <p className="text-[var(--color-text-secondary)] leading-relaxed">
                    <span className="text-white font-medium">
                      Platform Engineering / AI & Data Infrastructure
                    </span>{" "}
                    — building the core platform that enables privacy-first, self-service data and
                    LLM capabilities for enterprise clients.
                  </p>
                </div>

                {/* Responsibilities */}
                <div className="mb-8">
                  <h3 className="text-sm uppercase tracking-wider text-[var(--color-text-muted)] font-bold mb-4 flex items-center gap-2">
                    <Code className="w-4 h-4" /> Key Technical Responsibilities
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Designed and implemented multi-tenant data pipeline infrastructure using a medallion architecture (Bronze/Silver/Gold), with automated pipeline generation driven by versioned metadata definitions",
                      "Built LLM-powered data discovery and schema inference workflows, where local language models sample ingested datasets to automatically classify fields, detect PII/GDPR-relevant data, and generate metadata contracts",
                      "Developed Infrastructure-as-Code (IaC) provisioning templates for cloud-native environments (Azure, Kubernetes), including automated deployment of LLM inference stacks (Ollama + OpenWebUI), storage, compute, and VPN networking",
                      "Implemented metadata-driven ETL/ELT pipelines in Python/PySpark/SQL covering source ingestion, structural normalization, sensitivity masking, and data lineage tracking across Bronze/Silver/Gold layers",
                      "Designed and exposed AI-ready data interfaces (Machine Context Protocols / MCPs) enabling LLM agents to safely query governed datasets with built-in privacy enforcement",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="text-[var(--color-text-secondary)] text-sm leading-relaxed flex items-start gap-3"
                      >
                        <span className="text-[var(--color-accent)] mt-1.5">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Technologies */}
                <div className="mb-8">
                  <h3 className="text-sm uppercase tracking-wider text-[var(--color-text-muted)] font-bold mb-4 flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> Technologies Used
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Python",
                      "PySpark",
                      "SQL",
                      "Apache Spark",
                      "Airflow",
                      "Azure",
                      "Kubernetes",
                      "Terraform",
                      "Docker",
                      "Ollama",
                      "OpenWebUI",
                      "MCPs",
                      "SQLAlchemy",
                      "WireGuard",
                    ].map((tech) => (
                      <span key={tech} className="tag">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notable Achievements */}
                <div className="mb-8 p-5 bg-[rgba(14,165,233,0.03)] border border-[rgba(14,165,233,0.1)] rounded-lg">
                  <h3 className="text-sm uppercase tracking-wider text-[var(--color-accent)] font-bold mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4" /> Notable Achievements
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Built the platform's LLM-powered data onboarding layer for automated schema discovery and PII classification",
                      "Architected a zero-access, privacy-first AI infrastructure running entirely within customer cloud tenants",
                      "Reduced data onboarding complexity from bespoke ETL projects to metadata-declared, auto-generated pipelines",
                      "Established multi-tenant data isolation patterns with environment-scoped resource provisioning",
                    ].map((item, i) => (
                      <li
                        key={i}
                        className="text-[var(--color-text-secondary)] text-sm leading-relaxed flex items-start gap-3"
                      >
                        <span className="text-[var(--color-accent)] mt-1">•</span>
                        {item}
                      </li>
                    ))}
                  </ul>
                </div>

                {/* AI/Data Engineering Skills */}
                <div>
                  <h3 className="text-sm uppercase tracking-wider text-[var(--color-text-muted)] font-bold mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> AI/Data Engineering Skills Demonstrated
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
                    {[
                      "Production LLM integration (Ollama, K8s)",
                      "NLP/data pipeline intersection",
                      "Data systems at scale (Medallion, DAGs)",
                      "MLOps/AI infrastructure (IaC)",
                      "Privacy-aware AI engineering (GDPR)",
                    ].map((skill, i) => (
                      <div
                        key={i}
                        className="text-[var(--color-text-secondary)] text-xs flex items-center gap-2"
                      >
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-accent)] opacity-50" />
                        {skill}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* QuantFi Experience */}
            <div className="relative pl-8 border-l border-[rgba(255,255,255,0.1)] mt-12">
              <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-[var(--color-text-muted)]" />
              <div className="card">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Operational Trader</h2>
                    <p className="text-lg text-[var(--color-accent)] font-medium">QuantFi</p>
                  </div>
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded text-[var(--color-text-secondary)]">
                    November 2022 — May 2023
                  </span>
                </div>
                <div className="mb-8">
                  <h3 className="text-sm uppercase tracking-wider text-[var(--color-text-muted)] font-bold mb-4 flex items-center gap-2">
                    <Code className="w-4 h-4" /> Key Technical Responsibilities
                  </h3>
                  <ul className="space-y-3">
                    <li className="text-[var(--color-text-secondary)] text-sm leading-relaxed flex items-start gap-3">
                      <span className="text-[var(--color-accent)] mt-1.5">•</span>
                      Developed and optimized ML-driven trading strategies (Random Forest, XGBoost, Neural Networks, walk-forward cross-validation) in Python, achieving a steady 5% lift in daily PnL through backtesting, tick-level feature engineering, and short-term volatility forecasting.
                    </li>
                    <li className="text-[var(--color-text-secondary)] text-sm leading-relaxed flex items-start gap-3">
                      <span className="text-[var(--color-accent)] mt-1.5">•</span>
                      Automated the end-to-end model pipeline, from SQL/Python data ingestion and retraining to daily forecast publishing and Matplotlib performance dashboards, significantly reducing manual prep time.
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Teaching Assistant Experience */}
            <div className="relative pl-8 border-l border-[rgba(255,255,255,0.1)] mt-12">
              <div className="absolute -left-[5px] top-2 w-2.5 h-2.5 rounded-full bg-[var(--color-text-muted)]" />
              <div className="card">
                <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Teaching Assistant</h2>
                    <p className="text-lg text-[var(--color-accent)] font-medium">Vrije Universiteit Amsterdam</p>
                  </div>
                  <span className="inline-block px-3 py-1 text-sm font-medium bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.08)] rounded text-[var(--color-text-secondary)]">
                    June 2022 — November 2024
                  </span>
                </div>
                <div className="mb-8">
                  <h3 className="text-sm uppercase tracking-wider text-[var(--color-text-muted)] font-bold mb-4 flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Key Responsibilities
                  </h3>
                  <ul className="space-y-3">
                    <li className="text-[var(--color-text-secondary)] text-sm leading-relaxed flex items-start gap-3">
                      <span className="text-[var(--color-accent)] mt-1.5">•</span>
                      Taught weekly Probability Theory tutorials for first-year students, developing collaborative teaching methods and educational materials alongside faculty to explain complex statistical and mathematical concepts.
                    </li>
                    <li className="text-[var(--color-text-secondary)] text-sm leading-relaxed flex items-start gap-3">
                      <span className="text-[var(--color-accent)] mt-1.5">•</span>
                      Built a student portfolio system for first-year Econometrics students to ease university transition, and represented the Bachelor programme at Open Days and promotional events.
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
