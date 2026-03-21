import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-[rgba(59,59,255,0.2)] bg-[rgba(59,59,255,0.1)] text-[#3B3BFF]",
        secondary:
          "border-[rgba(232,90,0,0.2)] bg-[rgba(232,90,0,0.1)] text-[#E85A00]",
        destructive:
          "border-transparent bg-red-50 text-red-600",
        outline: "border-[#E8E8E8] text-[#1A1A1A]",
        success:
          "border-transparent bg-green-50 text-green-600",
        warning:
          "border-transparent bg-amber-50 text-amber-600",
        pending:
          "border-transparent bg-amber-50 text-amber-600",
        approved:
          "border-transparent bg-green-50 text-green-600",
        rejected:
          "border-transparent bg-red-50 text-red-600",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
