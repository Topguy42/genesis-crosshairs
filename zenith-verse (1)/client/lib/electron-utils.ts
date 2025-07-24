// Utility functions for Electron environment detection and window management

export const isElectron = (): boolean => {
  return typeof window !== 'undefined' && !!(window as any).electronAPI;
};

export const isDesktopDraggingEnabled = async (): Promise<boolean> => {
  if (!isElectron()) return false;
  try {
    const result = await (window as any).electronAPI.enableDesktopDragging();
    return result.enabled;
  } catch {
    return false;
  }
};

export const getWindowBounds = () => {
  return {
    width: window.innerWidth,
    height: window.innerHeight
  };
};

export const constrainToWindow = (
  position: { x: number; y: number },
  elementSize: { width: number; height: number },
  padding: number = 20
) => {
  const { width: windowWidth, height: windowHeight } = getWindowBounds();
  
  // Calculate safe boundaries
  const maxX = windowWidth - elementSize.width - padding;
  const minX = padding;
  const maxY = windowHeight - elementSize.height - padding;
  const minY = padding;
  
  return {
    x: Math.max(minX, Math.min(maxX, position.x)),
    y: Math.max(minY, Math.min(maxY, position.y))
  };
};

// Prevent dialogs from escaping window bounds
export const setupElectronPortalConstraints = () => {
  if (!isElectron()) return;

  // Add a MutationObserver to watch for new portal elements
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      mutation.addedNodes.forEach((node) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as Element;
          
          // Look for Radix portal containers
          if (element.hasAttribute('data-radix-portal') || 
              element.querySelector('[data-radix-portal]')) {
            
            // Ensure the portal container is properly constrained
            const portalElement = element.hasAttribute('data-radix-portal') 
              ? element 
              : element.querySelector('[data-radix-portal]');
              
            if (portalElement) {
              (portalElement as HTMLElement).style.position = 'fixed';
              (portalElement as HTMLElement).style.inset = '0';
              (portalElement as HTMLElement).style.pointerEvents = 'none';
              (portalElement as HTMLElement).style.zIndex = '9999';
            }
          }
        }
      });
    });
  });

  observer.observe(document.body, {
    childList: true,
    subtree: true
  });

  return () => observer.disconnect();
};

// Initialize electron constraints when the module loads
if (typeof window !== 'undefined' && isElectron()) {
  setupElectronPortalConstraints();
}
