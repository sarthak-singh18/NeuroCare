import { Moon, Sun } from 'lucide-react';
import { cn } from '../lib/cn.js';
import { useThemeMode } from '../context/ThemeContext.jsx';

export default function ThemeToggle({ className = '', showLabels = false }) {
  const { isDark, toggleTheme } = useThemeMode();

  if (showLabels) {
    return (
      <div className="flex items-center gap-3">
        <span className={`text-sm font-medium transition-opacity ${isDark ? 'opacity-100' : 'opacity-50'}`}>
          Dark
        </span>
        <button
          type="button"
          className={cn(
            'theme-toggle flex h-8 w-16 cursor-pointer rounded-full p-1 transition-all duration-300 hover-scale',
            isDark ? 'theme-toggle--dark' : 'theme-toggle--light',
            className
          )}
          onClick={toggleTheme}
          role="switch"
          aria-checked={!isDark}
          aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          data-state={isDark ? 'dark' : 'light'}
        >
          <div className="flex w-full items-center justify-between">
            <div
              className={cn(
                'toggle-thumb flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300',
                isDark ? 'translate-x-0 scale-100' : 'translate-x-8 scale-100'
              )}
            >
              {isDark ? <Moon className="h-4 w-4" strokeWidth={1.6} /> : <Sun className="h-4 w-4" strokeWidth={1.6} />}
            </div>
            <div
              className={cn(
                'toggle-thumb-secondary flex h-6 w-6 items-center justify-center rounded-full transition-all duration-300',
                isDark ? 'translate-x-0 opacity-40 scale-90' : '-translate-x-8 opacity-40 scale-90'
              )}
            >
              {isDark ? <Sun className="h-4 w-4" strokeWidth={1.2} /> : <Moon className="h-4 w-4" strokeWidth={1.2} />}
            </div>
          </div>
        </button>
        <span className={`text-sm font-medium transition-opacity ${isDark ? 'opacity-50' : 'opacity-100'}`}>
          Light
        </span>
      </div>
    );
  }

  return (
    <button
      type="button"
      className={cn(
        'theme-toggle flex h-8 w-16 cursor-pointer rounded-full p-1 transition-all duration-300 hover-scale',
        isDark ? 'theme-toggle--dark' : 'theme-toggle--light',
        className
      )}
      onClick={toggleTheme}
      role="switch"
      aria-checked={!isDark}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      data-state={isDark ? 'dark' : 'light'}
    >
      <div className="flex w-full items-center justify-between">
        <div
          className={cn(
            'toggle-thumb flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300',
            isDark ? 'translate-x-0' : 'translate-x-8'
          )}
        >
          {isDark ? <Moon className="h-4 w-4" strokeWidth={1.6} /> : <Sun className="h-4 w-4" strokeWidth={1.6} />}
        </div>
        <div
          className={cn(
            'toggle-thumb-secondary flex h-6 w-6 items-center justify-center rounded-full transition-transform duration-300',
            isDark ? 'translate-x-0 opacity-70' : '-translate-x-8 opacity-100'
          )}
        >
          {isDark ? <Sun className="h-4 w-4" strokeWidth={1.2} /> : <Moon className="h-4 w-4" strokeWidth={1.2} />}
        </div>
      </div>
    </button>
  );
}
