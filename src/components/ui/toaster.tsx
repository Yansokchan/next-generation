import { useToast } from "@/hooks/use-toast";
import {
  Toast,
  ToastClose,
  ToastDescription,
  ToastProvider,
  ToastTitle,
  ToastViewport,
} from "@/components/ui/toast";
import { CheckCircle2, AlertCircle, Info, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

export function Toaster() {
  const { toasts } = useToast();

  const getIcon = (variant: string | undefined) => {
    const iconClass = "animate-[spring_0.5s_ease-in-out] origin-center";

    switch (variant) {
      case "success":
        return (
          <div className="relative">
            <div className="absolute inset-0 bg-emerald-500 rounded-full blur-[1px] opacity-25 animate-pulse" />
            <div className="relative p-2 bg-gradient-to-br from-emerald-500 to-green-500 rounded-full shadow-lg shadow-emerald-500/30">
              <CheckCircle2
                className={cn("h-6 w-6 text-white drop-shadow-md", iconClass)}
              />
            </div>
          </div>
        );
      case "destructive":
        return (
          <div className="p-1 bg-red-100 rounded-full">
            <AlertCircle className={cn("h-5 w-5 text-red-600", iconClass)} />
          </div>
        );
      case "warning":
        return (
          <div className="p-1 bg-yellow-100 rounded-full">
            <AlertTriangle
              className={cn("h-5 w-5 text-yellow-600", iconClass)}
            />
          </div>
        );
      case "info":
        return (
          <div className="p-1 bg-blue-100 rounded-full">
            <Info className={cn("h-5 w-5 text-blue-600", iconClass)} />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <ToastProvider>
      {toasts.map(function ({
        id,
        title,
        description,
        action,
        variant,
        ...props
      }) {
        return (
          <Toast key={id} variant={variant} {...props}>
            <div className="flex items-start gap-3">
              {getIcon(variant)}
              <div className="grid gap-1">
                {title && (
                  <ToastTitle
                    className={cn(
                      variant === "success" &&
                        "text-emerald-900 font-bold tracking-tight"
                    )}
                  >
                    {title}
                  </ToastTitle>
                )}
                {description && (
                  <ToastDescription
                    className={cn(
                      variant === "success" && "text-emerald-800 font-medium"
                    )}
                  >
                    {description}
                  </ToastDescription>
                )}
              </div>
            </div>
            {action}
            <ToastClose
              className={cn(
                variant === "success" &&
                  "text-emerald-700 hover:text-emerald-900"
              )}
            />
          </Toast>
        );
      })}
      <ToastViewport />
    </ToastProvider>
  );
}
