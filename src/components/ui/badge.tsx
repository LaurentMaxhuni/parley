import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva("inline-flex max-w-full items-center break-all rounded-full px-2.5 py-1 text-xs font-mono leading-none", {
  variants: {
    variant: {
      default: "bg-brass/20 text-brass-soft",
      sage: "bg-sage/20 text-sage",
      redline: "bg-redline/20 text-redline",
    },
  },
  defaultVariants: { variant: "default" },
});

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
