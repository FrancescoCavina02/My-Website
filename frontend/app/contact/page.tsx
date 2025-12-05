"use client";

import { useState } from "react";
import { submitContactForm } from "@/lib/api";
import Button from "@/components/ui/Button";

interface FormData {
    name: string;
    email: string;
    subject: string;
    message: string;
}

export default function ContactPage() {
    const [formData, setFormData] = useState<FormData>({
        name: "",
        email: "",
        subject: "",
        message: "",
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitStatus, setSubmitStatus] = useState<{
        type: "success" | "error";
        message: string;
    } | null>(null);

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setSubmitStatus(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setSubmitStatus(null);

        try {
            await submitContactForm(formData);
            setSubmitStatus({
                type: "success",
                message: "Thank you for your message! I will get back to you soon.",
            });
            setFormData({ name: "", email: "", subject: "", message: "" });
        } catch (error) {
            setSubmitStatus({
                type: "error",
                message:
                    "Failed to send message. Please try again or email me directly.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen">
            <section className="section">
                <div className="max-w-2xl mx-auto">
                    {/* Page Header */}
                    <div className="mb-12 text-center stagger-children">
                        <h1 className="mb-4">
                            Get In <span className="text-gradient">Touch</span>
                        </h1>
                        <p className="text-[var(--color-text-secondary)] text-lg">
                            Have a question or want to collaborate? Drop me a message.
                        </p>
                    </div>

                    {/* Contact Form */}
                    <form
                        onSubmit={handleSubmit}
                        className="card animate-fade-in-up space-y-6"
                    >
                        {/* Name */}
                        <div>
                            <label
                                htmlFor="name"
                                className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
                            >
                                Name
                            </label>
                            <input
                                type="text"
                                id="name"
                                name="name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                minLength={2}
                                maxLength={100}
                                className="input"
                                placeholder="Your name"
                            />
                        </div>

                        {/* Email */}
                        <div>
                            <label
                                htmlFor="email"
                                className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
                            >
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="input"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        {/* Subject */}
                        <div>
                            <label
                                htmlFor="subject"
                                className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
                            >
                                Subject
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleChange}
                                required
                                minLength={5}
                                maxLength={200}
                                className="input"
                                placeholder="What's this about?"
                            />
                        </div>

                        {/* Message */}
                        <div>
                            <label
                                htmlFor="message"
                                className="block text-sm font-medium text-[var(--color-text-primary)] mb-2"
                            >
                                Message
                            </label>
                            <textarea
                                id="message"
                                name="message"
                                value={formData.message}
                                onChange={handleChange}
                                required
                                minLength={10}
                                maxLength={5000}
                                rows={6}
                                className="input resize-none"
                                placeholder="Your message..."
                            />
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2">
                            <Button
                                type="submit"
                                isLoading={isSubmitting}
                                className="w-full"
                            >
                                Send Message
                            </Button>
                        </div>

                        {/* Status Message */}
                        {submitStatus && (
                            <div
                                className={`p-4 rounded-lg text-center ${submitStatus.type === "success"
                                        ? "bg-green-500/20 text-green-400"
                                        : "bg-red-500/20 text-red-400"
                                    }`}
                            >
                                {submitStatus.message}
                            </div>
                        )}
                    </form>

                    {/* Alternative Contact */}
                    <div className="mt-12 text-center">
                        <p className="text-[var(--color-text-muted)] text-sm mb-4">
                            You can also reach me directly at:
                        </p>
                        <a
                            href="mailto:your.email@example.com"
                            className="text-[var(--color-accent-500)] hover:underline"
                        >
                            {/* PLACEHOLDER: Replace with your email */}
                            your.email@example.com
                        </a>
                    </div>
                </div>
            </section>
        </div>
    );
}
