
'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ThemeSwitchProps {
  className?: string
}

export function ThemeSwitch({ className }: ThemeSwitchProps) {
  const [theme, setTheme] = React.useState<'light' | 'dark'>('light')

  // Check current theme on component mount
  React.useEffect(() => {
    const savedSettings = localStorage.getItem("userSettings");
    let savedTheme = 'light';
    
    if (savedSettings) {
      const settings = JSON.parse(savedSettings);
      savedTheme = settings.theme || 'light';
    }

    setTheme(savedTheme as 'light' | 'dark')
    document.documentElement.classList.toggle('dark', savedTheme === 'dark')
  }, [])

  // Toggle theme
  const toggleTheme = React.useCallback(() => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    
    // Save to localStorage
    const savedSettings = localStorage.getItem("userSettings");
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    localStorage.setItem("userSettings", JSON.stringify({
      ...settings,
      theme: newTheme
    }));
    
    document.documentElement.classList.toggle('dark', newTheme === 'dark')
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('settingsChanged'))
  }, [theme])

  const isDark = theme === 'dark'

  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300",
        isDark 
          ? "bg-zinc-950 border border-zinc-800" 
          : "bg-white border border-zinc-200",
        className
      )}
      onClick={toggleTheme}
      role="button"
      tabIndex={0}
      title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      <div className="flex justify-between items-center w-full">
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
            isDark 
              ? "transform translate-x-0 bg-zinc-800" 
              : "transform translate-x-8 bg-gray-200"
          )}
        >
          {isDark ? (
            <Moon 
              className="w-4 h-4 text-white" 
              strokeWidth={1.5}
            />
          ) : (
            <Sun 
              className="w-4 h-4 text-gray-700" 
              strokeWidth={1.5}
            />
          )}
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300",
            isDark 
              ? "bg-transparent" 
              : "transform -translate-x-8"
          )}
        >
          {isDark ? (
            <Sun 
              className="w-4 h-4 text-gray-500" 
              strokeWidth={1.5}
            />
          ) : (
            <Moon 
              className="w-4 h-4 text-black" 
              strokeWidth={1.5}
            />
          )}
        </div>
      </div>
    </div>
  )
}
