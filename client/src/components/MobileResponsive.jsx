import { useState, useEffect } from 'react';
import { useThemeMode } from '../context/ThemeContext.jsx';

export default function MobileResponsive({ children }) {
  const { isDark } = useThemeMode();
  const [isMobile, setIsMobile] = useState(false);
  const [isTablet, setIsTablet] = useState(false);
  const [orientation, setOrientation] = useState('portrait');

  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setIsMobile(width < 768);
      setIsTablet(width >= 768 && width < 1024);
      setOrientation(width > height ? 'landscape' : 'portrait');
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    window.addEventListener('orientationchange', checkScreenSize);

    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('orientationchange', checkScreenSize);
    };
  }, []);

  // Mobile-first responsive wrapper
  return (
    <div className={`mobile-responsive ${isMobile ? 'mobile' : ''} ${isTablet ? 'tablet' : ''} ${orientation}`}>
      {children}
      
      {/* Mobile Navigation Helper */}
      {isMobile && (
        <MobileNavigationHelper />
      )}
      
      {/* Responsive Utilities */}
      <ResponsiveUtilities isMobile={isMobile} isTablet={isTablet} />
    </div>
  );
}

function MobileNavigationHelper() {
  const { isDark } = useThemeMode();
  const [showHelper, setShowHelper] = useState(false);

  return (
    <>
      {/* Floating Action Button */}
      <button
        onClick={() => setShowHelper(!showHelper)}
        className={`fixed bottom-6 right-6 w-14 h-14 rounded-full shadow-lg z-50 flex items-center justify-center ${
          isDark ? 'bg-purple-600 hover:bg-purple-700' : 'bg-purple-600 hover:bg-purple-700'
        } text-white transition-all`}
      >
        {showHelper ? '✕' : '☰'}
      </button>

      {/* Quick Actions Menu */}
      {showHelper && (
        <>
          <div 
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            onClick={() => setShowHelper(false)}
          />
          <div className={`fixed bottom-24 right-6 p-4 rounded-xl shadow-xl z-50 ${
            isDark ? 'bg-purple-950 border-purple-500/20' : 'bg-white border-gray-200'
          } border min-w-48`}>
            <div className="space-y-3">
              <QuickAction icon="📝" label="New Entry" action={() => window.location.href = '/journal'} />
              <QuickAction icon="🫁" label="Breathe" action={() => window.location.href = '/breathing'} />
              <QuickAction icon="📊" label="Progress" action={() => window.location.href = '/dashboard'} />
              <QuickAction icon="🏠" label="Home" action={() => window.location.href = '/'} />
            </div>
          </div>
        </>
      )}
    </>
  );
}

function QuickAction({ icon, label, action }) {
  const { isDark } = useThemeMode();
  
  return (
    <button
      onClick={action}
      className={`w-full flex items-center gap-3 p-3 rounded-lg transition-colors ${
        isDark ? 'hover:bg-purple-900/50 text-white' : 'hover:bg-purple-50 text-gray-900'
      }`}
    >
      <span className="text-xl">{icon}</span>
      <span className="font-medium">{label}</span>
    </button>
  );
}

function ResponsiveUtilities({ isMobile, isTablet }) {
  useEffect(() => {
    // Add responsive classes to body
    document.body.classList.toggle('mobile-device', isMobile);
    document.body.classList.toggle('tablet-device', isTablet);
    document.body.classList.toggle('desktop-device', !isMobile && !isTablet);

    // Viewport meta tag for better mobile experience
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    if (!viewportMeta) {
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    
    if (isMobile) {
      viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
    } else {
      viewportMeta.content = 'width=device-width, initial-scale=1.0';
    }

    return () => {
      document.body.classList.remove('mobile-device', 'tablet-device', 'desktop-device');
    };
  }, [isMobile, isTablet]);

  return null;
}

// Hook for responsive utilities
export function useResponsive() {
  const [screenSize, setScreenSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
    isMobile: window.innerWidth < 768,
    isTablet: window.innerWidth >= 768 && window.innerWidth < 1024,
    isDesktop: window.innerWidth >= 1024
  });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      
      setScreenSize({
        width,
        height,
        isMobile: width < 768,
        isTablet: width >= 768 && width < 1024,
        isDesktop: width >= 1024
      });
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return screenSize;
}

// Responsive Grid Component
export function ResponsiveGrid({ children, cols = { mobile: 1, tablet: 2, desktop: 3 } }) {
  const { isMobile, isTablet } = useResponsive();
  
  const gridCols = isMobile ? cols.mobile : isTablet ? cols.tablet : cols.desktop;
  
  return (
    <div 
      className="responsive-grid gap-4"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridCols}, minmax(0, 1fr))`
      }}
    >
      {children}
    </div>
  );
}

// Responsive Card Component  
export function ResponsiveCard({ children, className = '', padding = 'default' }) {
  const { isMobile } = useResponsive();
  const { isDark } = useThemeMode();
  
  const paddingClass = {
    small: isMobile ? 'p-3' : 'p-4',
    default: isMobile ? 'p-4' : 'p-6', 
    large: isMobile ? 'p-6' : 'p-8'
  }[padding];

  return (
    <div className={`responsive-card ${paddingClass} rounded-xl border transition-all ${
      isDark ? 'bg-purple-950/30 border-purple-500/20' : 'bg-white border-gray-200'
    } ${className}`}>
      {children}
    </div>
  );
}

// Responsive Modal Component
export function ResponsiveModal({ children, isOpen, onClose, title }) {
  const { isMobile } = useResponsive();
  const { isDark } = useThemeMode();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className={`responsive-modal w-full max-h-[90vh] overflow-y-auto rounded-xl ${
        isMobile ? 'max-w-full mx-2' : 'max-w-lg'
      } ${
        isDark ? 'bg-purple-950 border-purple-500/20' : 'bg-white border-gray-200'
      } border`}>
        {title && (
          <div className="sticky top-0 bg-inherit p-4 border-b border-purple-500/20 flex justify-between items-center">
            <h3 className={`text-lg font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {title}
            </h3>
            <button
              onClick={onClose}
              className={`p-2 rounded-lg ${isDark ? 'hover:bg-purple-800/50' : 'hover:bg-gray-100'}`}
            >
              ✕
            </button>
          </div>
        )}
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
}

// Touch-friendly Button Component
export function TouchButton({ children, onClick, variant = 'primary', size = 'default', className = '' }) {
  const { isMobile } = useResponsive();
  const { isDark } = useThemeMode();

  const sizeClasses = {
    small: isMobile ? 'px-4 py-3 text-sm' : 'px-3 py-2 text-sm',
    default: isMobile ? 'px-6 py-4 text-base' : 'px-4 py-2 text-sm', 
    large: isMobile ? 'px-8 py-5 text-lg' : 'px-6 py-3 text-base'
  }[size];

  const variantClasses = {
    primary: isDark 
      ? 'bg-purple-600 hover:bg-purple-700 text-white' 
      : 'bg-purple-600 hover:bg-purple-700 text-white',
    secondary: isDark 
      ? 'bg-purple-900/50 hover:bg-purple-800/50 text-purple-300' 
      : 'bg-purple-100 hover:bg-purple-200 text-purple-700',
    ghost: isDark 
      ? 'hover:bg-purple-900/50 text-purple-300' 
      : 'hover:bg-purple-50 text-purple-700'
  }[variant];

  return (
    <button
      onClick={onClick}
      className={`touch-button ${sizeClasses} ${variantClasses} rounded-lg font-medium transition-all ${
        isMobile ? 'active:scale-95' : 'hover:scale-105'
      } ${className}`}
      style={{
        minHeight: isMobile ? '44px' : '36px', // iOS accessibility guidelines
        minWidth: isMobile ? '44px' : '36px'
      }}
    >
      {children}
    </button>
  );
}