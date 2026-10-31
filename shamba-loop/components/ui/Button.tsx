import type { ButtonHTMLAttributes, ReactNode } from "react";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  variant?: "primary" | "outline";
  size?: "default" | "small";
};

export function Button({
  children,
  className = "",
  size = "default",
  variant = "primary",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`button button-${variant}${size === "small" ? " button-small" : ""} ${className}`.trim()}
      {...props}
    >
      {children}
    </button>
  );
}
