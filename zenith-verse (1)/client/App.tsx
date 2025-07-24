import "./global.css";

import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { createRoot } from "react-dom/client";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HashRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import { setupElectronPortalConstraints } from "./lib/electron-utils";
import CustomTitleBar from "./components/ui/custom-title-bar";
import ResizeHandle from "./components/ui/resize-handle";

const queryClient = new QueryClient();

const App = () => {
  useEffect(() => {
    // Set dark theme by default for gaming aesthetic
    document.documentElement.classList.add("dark");

    // Enable gaming overlay mode for desktop-wide dragging when in Electron
    if (typeof window !== 'undefined' && (window as any).electronAPI) {
      document.body.classList.add("gaming-overlay-mode");
    }

    // Initialize Electron portal constraints if in Electron environment
    const cleanup = setupElectronPortalConstraints();

    return cleanup;
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <div className="flex flex-col h-screen overflow-hidden bg-background">
          {/* Custom Title Bar for Desktop App */}
          <CustomTitleBar />

          {/* Main Application Content */}
          <div className="flex-1 overflow-hidden relative">
            <Toaster />
            <Sonner />
            <HashRouter>
              <Routes>
                <Route path="/" element={<Index />} />
                <Route index element={<Index />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
            </HashRouter>

            {/* Resize Handle */}
            <ResizeHandle />
          </div>
        </div>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

createRoot(document.getElementById("root")!).render(<App />);
