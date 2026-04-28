import React from "react";

interface SkeletonProps {
  className?: string;
  variant?: "text" | "circular" | "rectangular";
  width?: string | number;
  height?: string | number;
  animation?: "pulse" | "wave" | "none";
}

/**
 * Base Skeleton Component
 *
 * A versatile loading placeholder that can be used to create content-aware skeletons.
 * Supports different shapes and animation styles.
 *
 * Usage:
 *   <Skeleton variant="text" className="h-4 w-3/4" />
 *   <Skeleton variant="circular" className="w-12 h-12" />
 *   <Skeleton variant="rectangular" className="w-full h-32" />
 */
export default function Skeleton({
  className = "",
  variant = "rectangular",
  width,
  height,
  animation = "pulse",
}: SkeletonProps) {
  const baseClasses = "bg-gradient-to-r from-gray-800/50 via-gray-700/50 to-gray-800/50";

  const variantClasses = {
    text: "rounded h-4",
    circular: "rounded-full",
    rectangular: "rounded-lg",
  };

  const animationClasses = {
    pulse: "animate-pulse",
    wave: "animate-shimmer",
    none: "",
  };

  const style: React.CSSProperties = {};
  if (width) style.width = typeof width === "number" ? `${width}px` : width;
  if (height) style.height = typeof height === "number" ? `${height}px` : height;

  return (
    <div
      className={`${baseClasses} ${variantClasses[variant]} ${animationClasses[animation]} ${className}`}
      style={style}
      role="status"
      aria-label="Loading..."
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
}

/**
 * Skeleton Text - Multiple lines of text skeleton
 */
export function SkeletonText({
  lines = 3,
  className = "",
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <div className={`space-y-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} variant="text" className={`${i === lines - 1 ? "w-2/3" : "w-full"}`} />
      ))}
    </div>
  );
}
