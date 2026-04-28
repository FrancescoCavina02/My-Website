"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import Card from "@/components/ui/Card";
import { Brain, GraduationCap, BookOpen, Quote, Mail, User, Briefcase } from "lucide-react";

export default function Home() {
  const [imgError, setImgError] = useState(false);

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
      <section className="section pt-20 pb-16 md:pt-32 md:pb-24">
        <div className="max-w-4xl mx-auto text-center stagger-children">
          <div className="mb-8 inline-block animate-fade-in-up">
            <div className="relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border border-[rgba(255,255,255,0.08)] shadow-lg mx-auto bg-[var(--color-surface)]">
              {imgError ? (
                <div className="w-full h-full flex items-center justify-center text-[var(--color-accent)] font-bold text-3xl md:text-4xl tracking-wide">
                  FC
                </div>
              ) : (
                <Image
                  src="/images/profile.jpg"
                  alt="Francesco Cavina"
                  fill
                  priority
                  className="object-cover"
                  onError={() => setImgError(true)}
                />
              )}
            </div>
          </div>

          <h1 className="mb-4">
            <span className="text-white font-bold tracking-tight">Francesco Cavina</span>
          </h1>
          <p className="text-xl md:text-2xl text-[var(--color-text-secondary)] mb-6 font-light">
            AI Engineer & Full-Stack Developer
          </p>

          <p className="text-[var(--color-text-secondary)] max-w-2xl mx-auto mb-10 leading-relaxed font-light">
            I&apos;m currently building the core AI and data platform at Robodata — designing privacy-first, metadata-driven pipelines, local LLM inference infrastructure, and self-service tooling for enterprise teams. I&apos;m driven by building reliable AI systems that blend strong engineering with practical research.
          </p>

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
