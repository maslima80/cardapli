/**
 * iOS Viewport Utilities
 * 
 * Handles iOS Safari's quirky viewport behavior:
 * - Tracks virtual keyboard height
 * - Prevents zoom on input focus
 * - Manages safe area insets
 * - Fixes viewport height issues
 */

/**
 * Mounts a listener for iOS Visual Viewport API
 * This tracks keyboard open/close and updates CSS custom properties
 */
export function mountVisualViewportListener() {
  // Check if Visual Viewport API is available (iOS Safari 13+)
  if (!('visualViewport' in window)) {
    console.warn('Visual Viewport API not available - some iOS features may not work');
    return () => {};
  }

  const root = document.documentElement;
  const visualViewport = (window as any).visualViewport;

  const updateViewport = () => {
    if (!visualViewport) return;

    // Calculate keyboard offset (difference between window and viewport height)
    const keyboardOffset = Math.max(0, window.innerHeight - visualViewport.height);
    
    // Update CSS custom property for use in components
    root.style.setProperty('--keyboard-offset', `${keyboardOffset}px`);
    root.style.setProperty('--viewport-height', `${visualViewport.height}px`);
    
    // Add class when keyboard is open for conditional styling
    if (keyboardOffset > 100) {
      root.classList.add('keyboard-open');
    } else {
      root.classList.remove('keyboard-open');
    }
  };

  // Listen to both resize and scroll events
  visualViewport.addEventListener('resize', updateViewport);
  visualViewport.addEventListener('scroll', updateViewport);
  
  // Initial update
  updateViewport();

  // Return cleanup function
  return () => {
    visualViewport.removeEventListener('resize', updateViewport);
    visualViewport.removeEventListener('scroll', updateViewport);
  };
}

/**
 * Prevents iOS zoom on input focus by ensuring all inputs have font-size >= 16px
 * This is applied globally via CSS
 */
export function preventIOSZoom() {
  // This is now handled via CSS in ios.css
  // But we can also programmatically set viewport meta if needed
  const viewport = document.querySelector('meta[name="viewport"]');
  if (viewport) {
    // Ensure we have the correct viewport settings
    viewport.setAttribute(
      'content',
      'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover'
    );
  }
}

/**
 * Detects if the device is iOS
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream;
}

/**
 * Detects if the device is running iOS Safari
 */
export function isIOSSafari(): boolean {
  const ua = navigator.userAgent;
  const iOS = /iPad|iPhone|iPod/.test(ua);
  const webkit = /WebKit/.test(ua);
  const notChrome = !/CriOS/.test(ua);
  return iOS && webkit && notChrome;
}

/**
 * Gets the safe area insets for iOS devices with notches
 */
export function getSafeAreaInsets() {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);
  
  return {
    top: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-top)') || '0'),
    right: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-right)') || '0'),
    bottom: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-bottom)') || '0'),
    left: parseInt(computedStyle.getPropertyValue('env(safe-area-inset-left)') || '0'),
  };
}

/**
 * Scrolls an element into view, accounting for iOS keyboard
 */
export function scrollIntoViewWithKeyboard(element: HTMLElement, offset = 20) {
  if (!element) return;

  setTimeout(() => {
    const rect = element.getBoundingClientRect();
    const keyboardOffset = parseInt(
      getComputedStyle(document.documentElement).getPropertyValue('--keyboard-offset') || '0'
    );
    
    const visibleHeight = window.innerHeight - keyboardOffset;
    const elementBottom = rect.bottom;

    // If element is hidden by keyboard, scroll it into view
    if (elementBottom > visibleHeight) {
      const scrollAmount = elementBottom - visibleHeight + offset;
      window.scrollBy({ top: scrollAmount, behavior: 'smooth' });
    }
  }, 300); // Wait for keyboard animation
}
