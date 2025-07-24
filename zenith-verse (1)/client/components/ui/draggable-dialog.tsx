import * as React from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { X } from "lucide-react";
import { useDraggable } from "@/hooks/use-draggable";
import { cn } from "@/lib/utils";
import { isElectron, getWindowBounds, constrainToWindow } from "@/lib/electron-utils";

const DraggableDialog = DialogPrimitive.Root;
const DraggableDialogTrigger = DialogPrimitive.Trigger;
const DraggableDialogPortal = DialogPrimitive.Portal;
const DraggableDialogClose = DialogPrimitive.Close;

const DraggableDialogOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      "fixed inset-0 z-50 bg-black/80 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0",
      className,
    )}
    {...props}
  />
));
DraggableDialogOverlay.displayName = DialogPrimitive.Overlay.displayName;

const DraggableDialogContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => {
  // Check if we're in Electron
  const inElectron = React.useMemo(() => {
    const isElectronEnv = isElectron();
    console.log('DraggableDialog: Electron detection:', isElectronEnv);
    console.log('DraggableDialog: electronAPI available:', !!(window as any).electronAPI);
    return isElectronEnv;
  }, []);

  const { position, isDragging, elementRef, handleMouseDown, resetPosition } = useDraggable({
    disableTransform: true,
    constrainToWindow: false, // Allow dialogs to move freely across desktop for gaming overlay
    enableDesktopDragging: inElectron // Enable true desktop-wide dragging in Electron
  });

  console.log('DraggableDialog: useDraggable config:', {
    disableTransform: true,
    constrainToWindow: false,
    enableDesktopDragging: inElectron,
    inElectron
  });

  // Reset position when dialog opens/closes
  React.useEffect(() => {
    resetPosition();
  }, [resetPosition]);

  // Window bounds checking for Electron apps
  const [windowBounds, setWindowBounds] = React.useState({ width: 0, height: 0 });

  React.useEffect(() => {
    const updateBounds = () => {
      setWindowBounds({
        width: window.innerWidth,
        height: window.innerHeight
      });
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, []);

  // Constrain position to stay within window bounds
  const constrainedPosition = React.useMemo(() => {
    if (!elementRef.current || windowBounds.width === 0) return position;

    const rect = elementRef.current.getBoundingClientRect();
    const dialogWidth = rect.width || 512; // Default max-w-lg
    const dialogHeight = rect.height || 400;

    // Calculate safe boundaries with some padding
    const padding = 20;
    const maxX = (windowBounds.width - dialogWidth) / 2 - padding;
    const minX = -(windowBounds.width - dialogWidth) / 2 + padding;
    const maxY = (windowBounds.height - dialogHeight) / 2 - padding;
    const minY = -(windowBounds.height - dialogHeight) / 2 + padding;

    return {
      x: Math.max(minX, Math.min(maxX, position.x)),
      y: Math.max(minY, Math.min(maxY, position.y))
    };
  }, [position, windowBounds, elementRef.current]);

  // Prevent dialog from closing during drag
  const handlePointerDownOutside = React.useCallback((event: Event) => {
    if (isDragging) {
      event.preventDefault();
    }
  }, [isDragging]);

  const handleInteractOutside = React.useCallback((event: Event) => {
    if (isDragging) {
      event.preventDefault();
    }
  }, [isDragging]);

  return (
    <DraggableDialogPortal container={inElectron ? document.body : undefined}>
      <DraggableDialogOverlay />
      <DialogPrimitive.Content
        ref={(node) => {
          if (typeof ref === 'function') ref(node);
          else if (ref) ref.current = node;
          if (elementRef) elementRef.current = node;
        }}
        className={cn(
          "fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg gap-0 border bg-background shadow-lg duration-200",
          // Only add animations in web mode to prevent clipping issues in Electron
          !inElectron && "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]",
          "sm:rounded-lg",
          isDragging && "shadow-2xl shadow-black/30 transition-shadow duration-150",
          className,
        )}
        style={{
          transform: `translate3d(calc(-50% + ${constrainedPosition.x}px), calc(-50% + ${constrainedPosition.y}px), 0)`,
          willChange: isDragging ? 'transform' : 'auto',
        }}
        onPointerDownOutside={handlePointerDownOutside}
        onInteractOutside={handleInteractOutside}
        {...props}
      >
        {React.Children.map(children, (child) => {
          if (React.isValidElement(child) && child.type === DraggableDialogHeader) {
            return React.cloneElement(child as React.ReactElement<any>, {
              onMouseDown: handleMouseDown,
              isDragging: isDragging
            });
          }
          return child;
        })}
        <DialogPrimitive.Close className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground z-10">
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DraggableDialogPortal>
  );
});
DraggableDialogContent.displayName = DialogPrimitive.Content.displayName;

const DraggableDialogHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & { 
    onMouseDown?: (e: React.MouseEvent) => void;
    isDragging?: boolean;
  }
>(({ className, children, onMouseDown, isDragging, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-4 border-b border-border/10 transition-all duration-100 select-none",
        isDragging 
          ? "cursor-grabbing bg-accent/20 scale-[0.998]" 
          : "cursor-grab hover:bg-accent/5",
        className,
      )}
      onMouseDown={onMouseDown}
      {...props}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          {children}
        </div>
      </div>
    </div>
  );
});
DraggableDialogHeader.displayName = "DraggableDialogHeader";

const DraggableDialogBody = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("p-6 pt-0", className)}
    {...props}
  />
));
DraggableDialogBody.displayName = "DraggableDialogBody";

const DraggableDialogTitle = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Title>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Title>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Title
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight",
      className,
    )}
    {...props}
  />
));
DraggableDialogTitle.displayName = DialogPrimitive.Title.displayName;

const DraggableDialogDescription = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Description>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Description>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
));
DraggableDialogDescription.displayName = DialogPrimitive.Description.displayName;

export {
  DraggableDialog,
  DraggableDialogPortal,
  DraggableDialogOverlay,
  DraggableDialogClose,
  DraggableDialogTrigger,
  DraggableDialogContent,
  DraggableDialogHeader,
  DraggableDialogBody,
  DraggableDialogTitle,
  DraggableDialogDescription,
};
