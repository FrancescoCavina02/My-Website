import Link from "next/link";
import Card from "@/components/ui/Card";

const navigationCards = [
  {
    href: "/about",
    title: "About Me",
    description: "My background, interests, and what drives me",
    icon: "👤",
  },
  {
    href: "/projects",
    title: "Projects",
    description: "Websites, AI experiments, and creative work",
    icon: "🚀",
  },
  {
    href: "/education",
    title: "Education",
    description: "Academic journey and certifications",
    icon: "🎓",
  },
  {
    href: "/notes",
    title: "Notes",
    description: "Insights from books on spirituality, psychology, and more",
    icon: "📚",
  },
  {
    href: "/quotes",
    title: "Daily Quotes",
    description: "Discover wisdom from my reading collection",
    icon: "✨",
  },
  {
    href: "/contact",
    title: "Contact",
    description: "Let's connect and discuss ideas",
    icon: "📬",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-4xl mx-auto text-center stagger-children">
          {/* Photo Placeholder */}
          <div className="mb-8 inline-block">
            <div className="w-32 h-32 md:w-40 md:h-40 rounded-full bg-gradient-to-br from-[var(--color-accent-500)] to-[var(--color-nebula-500)] p-1 animate-float">
              <div className="w-full h-full rounded-full bg-[var(--color-space-800)] flex items-center justify-center text-[var(--color-text-muted)]">
                {/* PLACEHOLDER: Replace with your photo */}
                {/* Add your image to: frontend/public/images/profile.jpg */}
                <span className="text-sm">Photo</span>
              </div>
            </div>
          </div>

          {/* Name & Title */}
          <h1 className="mb-4">
            <span className="text-gradient">Francesco Cavina</span>
          </h1>
          <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] mb-6">
            Software Engineer & AI Enthusiast
          </p>

          {/* Brief Introduction */}
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-8 leading-relaxed">
            {/* PLACEHOLDER: Replace with your introduction */}
            Building intelligent systems at the intersection of technology and human experience.
            Passionate about leveraging AI to create meaningful solutions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Link href="/projects" className="btn btn-primary">
              View My Work
            </Link>
            <Link href="/contact" className="btn btn-secondary">
              Get In Touch
            </Link>
          </div>
        </div>
      </section>

      {/* Navigation Cards */}
      <section className="section pt-8 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {navigationCards.map((card) => (
            <Card
              key={card.href}
              href={card.href}
              title={card.title}
              description={card.description}
              icon={<span className="text-4xl">{card.icon}</span>}
            />
          ))}
        </div>
      </section>

      {/* Decorative Gradient Orb */}
      <div
        className="fixed top-1/3 -left-32 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "var(--gradient-glow)" }}
      />
      <div
        className="fixed bottom-1/3 -right-32 w-64 h-64 rounded-full opacity-20 blur-3xl pointer-events-none"
        style={{ background: "radial-gradient(circle, var(--color-nebula-500), transparent 70%)" }}
      />
    </div>
  );
}
