import Link from "next/link";
import Image from "next/image";
import Card from "@/components/ui/Card";
import { Brain, GraduationCap, BookOpen, Quote, Mail, User, Briefcase } from "lucide-react";

export default function Home() {
  const navigationCards = [
    {
      href: "/about",
      title: "About Me",
      description: "My background, interests, and what drives me",
      icon: <User className="w-8 h-8 text-[var(--color-accent)]" />,
    },
    {
      href: "/experience",
      title: "Experience",
      description: "AI engineering and data platform infrastructure",
      icon: <Briefcase className="w-8 h-8 text-[var(--color-accent)]" />,
    },
    {
      href: "/projects",
      title: "Projects",
      description: "Websites, AI experiments, and creative work",
      icon: <Brain className="w-8 h-8 text-[var(--color-accent)]" />,
    },
    {
      href: "/education",
      title: "Education",
      description: "Academic journey and certifications",
      icon: <GraduationCap className="w-8 h-8 text-[var(--color-accent)]" />,
    },
    {
      href: "/notes",
      title: "Notes",
      description: "Insights from books on spirituality, psychology, and more",
      icon: <BookOpen className="w-8 h-8 text-[var(--color-accent)]" />,
    },
    {
      href: "/quotes",
      title: "Daily Quotes",
      description: "Discover wisdom from my reading collection",
      icon: <Quote className="w-8 h-8 text-[var(--color-accent)]" />,
    },
    {
      href: "/contact",
      title: "Contact",
      description: "Let's connect and discuss ideas",
      icon: <Mail className="w-8 h-8 text-[var(--color-accent)]" />,
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="section pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-4xl mx-auto text-center stagger-children">
          
          {/* Profile Photo */}
          <div className="mb-8 inline-block animate-fade-in-up">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border border-[rgba(255,255,255,0.08)] shadow-lg mx-auto">
              {/* Ensure to upload your profile.jpg to /public/images/profile.jpg */}
              <Image 
                src="/images/profile.jpg"
                alt="Francesco Cavina"
                fill
                priority
                className="object-cover"
              />
            </div>
          </div>

          {/* Name & Title */}
          <h1 className="mb-4">
            <span className="text-white font-bold tracking-tight">Francesco Cavina</span>
          </h1>
          <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] mb-6 font-light">
            AI Engineer & Data Engineering Intern | MSc AI Applicant @ UvA
          </p>

          {/* Introduction */}
          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            I'm currently building the core AI and data platform at Robodata — designing privacy-first, metadata-driven data pipelines, local LLM inference infrastructure, and self-service data tooling that enables enterprise clients to run production AI entirely within their own cloud environment. I'm applying to the MSc Artificial Intelligence at UvA to deepen my expertise in NLP and ML theory.
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
      <section className="section pt-8 pb-20 border-t border-[rgba(255,255,255,0.05)]">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 stagger-children">
          {navigationCards.map((card) => (
            <Card
              key={card.href}
              href={card.href}
              title={card.title}
              description={card.description}
              icon={card.icon}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
