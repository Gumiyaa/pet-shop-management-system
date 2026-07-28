import * as React from "react";
import { cn } from "@/src/lib/utils";

const Dialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => {
  const [isOpen, setIsOpen] = React.useState(open ?? false);
  const actualOpen = open !== undefined ? open : isOpen;
  const setOpen = onOpenChange ?? setIsOpen;

  if (!actualOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => setOpen(false)} />
      <div className="relative z-50 w-full max-w-lg rounded-lg border bg-background p-6 shadow-lg mx-4">
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === DialogClose) {
            return React.cloneElement(child as React.ReactElement<{ onClick?: () => void }>, {
              onClick: () => setOpen(false),
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

const DialogTrigger = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => {
  return <div onClick={onClick}>{children}</div>;
};

const DialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn("space-y-4", className)}>{children}</div>;
};

const DialogHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn("flex flex-col space-y-1.5 text-center sm:text-left", className)}>{children}</div>;
};

const DialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <h2 className={cn("text-lg font-semibold leading-none tracking-tight", className)}>{children}</h2>;
};

const DialogDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <p className={cn("text-sm text-muted-foreground", className)}>{children}</p>;
};

const DialogClose = ({ children, onClick }: { children: React.ReactNode; onClick?: () => void }) => {
  return <div onClick={onClick}>{children}</div>;
};

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogClose };