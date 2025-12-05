interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "primary" | "secondary";
    size?: "sm" | "md" | "lg";
    isLoading?: boolean;
    children: React.ReactNode;
}

export default function Button({
    variant = "primary",
    size = "md",
    isLoading = false,
    children,
    className = "",
    disabled,
    ...props
}: ButtonProps) {
    const baseStyles = "btn";
    const variantStyles = {
        primary: "btn-primary",
        secondary: "btn-secondary",
    };
    const sizeStyles = {
        sm: "text-sm py-1.5 px-3",
        md: "py-2 px-4",
        lg: "text-lg py-3 px-6",
    };

    return (
        <button
            className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <svg
                    className="animate-spin h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                >
                    <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                    />
                    <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                </svg>
            ) : null}
            {children}
        </button>
    );
}
