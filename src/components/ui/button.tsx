import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-semibold ring-offset-background transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        // Primary — solid brand blue
        default: "bg-primary text-primary-foreground shadow-sm hover:bg-primary-dark hover:shadow-md",
        // Secondary — outline
        secondary: "border-2 border-primary bg-transparent text-primary hover:bg-primary/5",
        // Neutral outline — kept for dashboards / dark admin surfaces
        outline: "border border-input bg-background hover:bg-muted hover:text-foreground",
        // Tertiary — text + arrow
        tertiary: "px-0 text-primary hover:text-primary-dark after:content-['→'] after:transition-transform hover:after:translate-x-1",
        // Amber — high-visibility CTA on dark / photo backgrounds
        amber: "bg-amber text-amber-foreground shadow-sm hover:brightness-95 hover:shadow-md",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        ghost: "text-foreground hover:bg-muted",
        link: "text-primary underline-offset-4 hover:underline",
      },
      size: {
        default: "h-11 px-5 py-2",
        sm: "h-9 px-3.5 text-[13px]",
        lg: "h-12 px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
  },
);
Button.displayName = "Button";

export { Button, buttonVariants };
