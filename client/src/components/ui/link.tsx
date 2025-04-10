import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface LinkProps {
  href: string;
  children: ReactNode;
  className?: string;
  target?: string;
  rel?: string;
}

export function Link({ href, children, className, target, rel, ...props }: LinkProps) {
  const isExternal = href.startsWith('http');
  const externalProps = isExternal ? {
    target: target || "_blank",
    rel: rel || "noopener noreferrer"
  } : {};

  return (
    <a 
      href={href} 
      className={cn("text-blue-600 hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500 rounded", className)}
      {...externalProps}
      {...props}
    >
      {children}
    </a>
  );
} 