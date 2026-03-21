"use client";

import * as React from "react";
import * as ToastPrimitive from "@radix-ui/react-toast";
import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const ToastProvider = ToastPrimitive.Provider;
const ToastViewport = React.forwardRef<
  React.ElementRef<typeof ToastPrimitive.Viewport>,
  React.ComponentPropsWithoutRef<typeof ToastPrimitive.Viewport>
>(({ className, ...props }, ref) => (
  <ToastPrimitive.Viewport
    ref={ref}
    className={cn(
      "fixed top-4 right-4 z-[100] flex max-h-screen w-full max-w-sm flex-col gap-2 p-4",
      className
    )}
    {...props}
  />
));
ToastViewport.displayName = ToastPrimitive.Viewport.displayName;

type ToastVariant = "default" | "success" | "error" | "warning";

interface ToastData {
  id: string;
  title: string;
  description?: string;
  variant?: ToastVariant;
}

let toastCallback: ((toast: Omit<ToastData, "id">) => void) | null = null;

export function toast(data: Omit<ToastData, "id">) {
  if (toastCallback) toastCallback(data);
}

export function Toaster() {
  const [toasts, setToasts] = React.useState<ToastData[]>([]);

  React.useEffect(() => {
    toastCallback = (data) => {
      const id = Math.random().toString(36).slice(2);
      setToasts((prev) => [...prev, { ...data, id }]);
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 4000);
    };
    return () => { toastCallback = null; };
  }, []);

  const variantStyles: Record<ToastVariant, string> = {
    default: "bg-white border-[#E8E8E8]",
    success: "bg-green-50 border-green-200",
    error: "bg-red-50 border-red-200",
    warning: "bg-amber-50 border-amber-200",
  };

  const variantIcons: Record<ToastVariant, React.ReactNode> = {
    default: <Info className="h-4 w-4 text-[#3B3BFF]" />,
    success: <CheckCircle className="h-4 w-4 text-green-600" />,
    error: <AlertCircle className="h-4 w-4 text-red-600" />,
    warning: <AlertCircle className="h-4 w-4 text-amber-600" />,
  };

  return (
    <ToastProvider>
      {toasts.map((t) => (
        <ToastPrimitive.Root
          key={t.id}
          open={true}
          className={cn(
            "relative flex items-start gap-3 rounded-xl border p-4 shadow-card animate-fade-in",
            variantStyles[t.variant || "default"]
          )}
        >
          {variantIcons[t.variant || "default"]}
          <div className="flex-1">
            <ToastPrimitive.Title className="text-sm font-semibold text-[#1A1A1A]">
              {t.title}
            </ToastPrimitive.Title>
            {t.description && (
              <ToastPrimitive.Description className="mt-0.5 text-xs text-[#666666]">
                {t.description}
              </ToastPrimitive.Description>
            )}
          </div>
          <ToastPrimitive.Close
            onClick={() => setToasts((prev) => prev.filter((x) => x.id !== t.id))}
            className="text-[#666666] hover:text-[#1A1A1A]"
          >
            <X className="h-3.5 w-3.5" />
          </ToastPrimitive.Close>
        </ToastPrimitive.Root>
      ))}
      <ToastViewport />
    </ToastProvider>
  );
}
