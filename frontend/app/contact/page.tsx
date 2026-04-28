"use client";

import { useState } from "react";
import { submitContactForm } from "@/lib/api";
import { Mail, ExternalLink, MessageSquare } from "lucide-react";

const CONTACT_EMAIL = "hello@francescocavina.com";

interface FormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

type FormErrors = Partial<Record<keyof FormData, string>>;

export default function ContactPage() {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [formErrors, setFormErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{ type: "success" | "error"; message: string } | null>(null);

    const validateForm = (data: FormData): FormErrors => {
        const errors: FormErrors = {};
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        if (!data.name.trim() || data.name.trim().length < 2) {
            errors.name = "Name is required and must be at least 2 characters.";
        }

        if (!data.email.trim() || !emailRegex.test(data.email.trim())) {
            errors.email = "Please enter a valid email address.";
        }

        if (!data.subject.trim() || data.subject.trim().length < 3) {
            errors.subject = "Subject is required and must be at least 3 characters.";
        }

        if (!data.message.trim() || data.message.trim().length < 10) {
            errors.message = "Message is required and must be at least 10 characters.";
        }

        return errors;
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setFormErrors((prev) => ({ ...prev, [name]: undefined }));
        setSubmitStatus(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        const errors = validateForm(formData);
        setFormErrors(errors);
        if (Object.keys(errors).length > 0) {
            return;
        }

        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            await submitContactForm(formData);
            setSubmitStatus({
                type: "success",
                message: `Thanks ${formData.name.trim()}! I'll get back to you soon.`,
            });
            setFormData({ name: "", email: "", subject: "", message: "" });
        } catch {
            setSubmitStatus({
                type: "error",
                message: `Message failed to send. Please try again or email me directly at ${CONTACT_EMAIL}.`,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen">
            <section className="section">
                <div className="max-w-5xl mx-auto">
                    <div className="mb-12 text-center stagger-children border-b border-[rgba(255,255,255,0.05)] pb-12">
                        <MessageSquare className="w-8 h-8 text-[var(--color-accent)] mx-auto mb-4 opacity-80" />
                        <h1 className="mb-4 text-white">Get In Touch</h1>
                        <p className="text-[var(--color-text-secondary)] text-lg font-light max-w-xl mx-auto">
                            I&apos;m always open to discussing new opportunities, AI research, and interesting side projects.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-8 animate-fade-in-up">
                        <div className="space-y-6">
                            <h2 className="text-xl font-semibold text-white mb-6">Contact Information</h2>
                            <p className="text-[var(--color-text-secondary)] font-light leading-relaxed mb-8">
                                Whether you have a question about my projects or want to discuss AI and philosophy, feel free to drop me a message. For urgent inquiries, email is the best way to reach me.
                            </p>

                            <div className="space-y-4">
                                <a
                                    href={`mailto:${CONTACT_EMAIL}`}
                                    className="flex items-center gap-4 text-[var(--color-text-secondary)] hover:text-white group transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.1)] flex items-center justify-center group-hover:border-[var(--color-accent)] group-hover:bg-[rgba(14,165,233,0.1)] transition-colors">
                                        <Mail className="w-4 h-4 group-hover:text-[var(--color-accent)]" />
                                    </div>
                                    <span className="font-medium">{CONTACT_EMAIL}</span>
                                </a>

                                <a
                                    href="https://linkedin.com/in/francescocavina"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 text-[var(--color-text-secondary)] hover:text-white group transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.1)] flex items-center justify-center group-hover:border-[var(--color-accent)] group-hover:bg-[rgba(14,165,233,0.1)] transition-colors">
                                        <ExternalLink className="w-4 h-4 group-hover:text-[var(--color-accent)]" />
                                    </div>
                                    <span className="font-medium">LinkedIn Profile</span>
                                </a>

                                <a
                                    href="https://github.com/FrancescoCavina02"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-4 text-[var(--color-text-secondary)] hover:text-white group transition-colors"
                                >
                                    <div className="w-10 h-10 rounded-full border border-[rgba(255,255,255,0.1)] flex items-center justify-center group-hover:border-[var(--color-accent)] group-hover:bg-[rgba(14,165,233,0.1)] transition-colors">
                                        <ExternalLink className="w-4 h-4 group-hover:text-[var(--color-accent)]" />
                                    </div>
                                    <span className="font-medium">GitHub Repository</span>
                                </a>
                            </div>
                        </div>

                        {submitStatus?.type === "success" ? (
                            <div className="card flex items-center justify-center text-center">
                                <p className="text-[var(--color-accent)] text-lg font-medium">{submitStatus.message}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSubmit} className="card space-y-5" noValidate>
                                <h2 className="text-xl font-semibold text-white mb-2 pb-2 border-b border-[rgba(255,255,255,0.05)]">
                                    Send a Message
                                </h2>

                                <div>
                                    <label htmlFor="name" className="block text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-2">Name</label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                        minLength={2}
                                        maxLength={100}
                                        className="input bg-[rgba(255,255,255,0.02)] focus:bg-[var(--color-surface)]"
                                        placeholder="Your Name"
                                    />
                                    {formErrors.name && <p className="text-[var(--color-error)] text-sm mt-2">{formErrors.name}</p>}
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-2">Email</label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        required
                                        className="input bg-[rgba(255,255,255,0.02)] focus:bg-[var(--color-surface)]"
                                        placeholder="you@domain.com"
                                    />
                                    {formErrors.email && <p className="text-[var(--color-error)] text-sm mt-2">{formErrors.email}</p>}
                                </div>

                                <div>
                                    <label htmlFor="subject" className="block text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-2">Subject</label>
                                    <input
                                        type="text"
                                        id="subject"
                                        name="subject"
                                        value={formData.subject}
                                        onChange={handleChange}
                                        required
                                        minLength={3}
                                        maxLength={200}
                                        className="input bg-[rgba(255,255,255,0.02)] focus:bg-[var(--color-surface)]"
                                        placeholder="What&apos;s this about?"
                                    />
                                    {formErrors.subject && <p className="text-[var(--color-error)] text-sm mt-2">{formErrors.subject}</p>}
                                </div>

                                <div>
                                    <label htmlFor="message" className="block text-xs uppercase tracking-wider font-semibold text-[var(--color-text-muted)] mb-2">Message</label>
                                    <textarea
                                        id="message"
                                        name="message"
                                        value={formData.message}
                                        onChange={handleChange}
                                        required
                                        minLength={10}
                                        maxLength={5000}
                                        rows={5}
                                        className="input resize-none bg-[rgba(255,255,255,0.02)] focus:bg-[var(--color-surface)]"
                                        placeholder="Hello Francesco, I would like to..."
                                    />
                                    {formErrors.message && <p className="text-[var(--color-error)] text-sm mt-2">{formErrors.message}</p>}
                                </div>

                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="w-full bg-[var(--color-accent)] text-black font-semibold py-3 px-8 rounded-md transition-all hover:brightness-110 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Sending..." : "Send Message"}
                                    </button>
                                </div>

                                {submitStatus?.type === "error" && (
                                    <div className="p-4 rounded-md text-sm text-center border mt-4 bg-red-500/10 text-red-400 border-red-500/20">
                                        {submitStatus.message}
                                    </div>
                                )}
                            </form>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}
