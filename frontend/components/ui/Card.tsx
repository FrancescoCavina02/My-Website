import Link from "next/link";

interface CardProps {
    title: string;
    description?: string;
    href?: string;
    icon?: React.ReactNode;
    tags?: string[];
    children?: React.ReactNode;
    className?: string;
    onClick?: () => void;
}

export default function Card({
    title,
    description,
    href,
    icon,
    tags,
    children,
    className = "",
    onClick,
}: CardProps) {
    const CardWrapper = href ? Link : "div";
    const wrapperProps = href
        ? { href }
        : { onClick, role: onClick ? "button" : undefined };

    return (
        <CardWrapper
            {...(wrapperProps as any)}
            className={`card card-glow block cursor-pointer ${className}`}
        >
            {icon && (
                <div className="text-[var(--color-accent-500)] mb-4 text-3xl">
                    {icon}
                </div>
            )}
            <h3 className="text-lg font-semibold mb-2 text-[var(--color-text-primary)]">
                {title}
            </h3>
            {description && (
                <p className="text-[var(--color-text-secondary)] text-sm mb-3">
                    {description}
                </p>
            )}
            {tags && tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-3">
                    {tags.map((tag) => (
                        <span key={tag} className="tag">
                            {tag}
                        </span>
                    ))}
                </div>
            )}
            {children}
        </CardWrapper>
    );
}
