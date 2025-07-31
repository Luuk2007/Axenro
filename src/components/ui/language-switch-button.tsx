
'use client'

import * as React from 'react'
import { useLanguage, Language } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

interface LanguageSwitchProps {
  className?: string
}

export function LanguageSwitch({ className }: LanguageSwitchProps) {
  const { language, setLanguage } = useLanguage()
  const [isDark, setIsDark] = React.useState(false)

  const toggleLanguage = React.useCallback(() => {
    const newLanguage: Language = language === 'english' ? 'dutch' : 'english'
    setLanguage(newLanguage)
  }, [language, setLanguage])

  // Check theme state from localStorage
  React.useEffect(() => {
    const checkTheme = () => {
      const savedSettings = localStorage.getItem("userSettings")
      let theme = 'light'
      
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings)
          theme = settings.theme || 'light'
        } catch (error) {
          console.error("Error parsing theme settings:", error)
        }
      }
      
      setIsDark(theme === 'dark')
    }

    // Initial check
    checkTheme()

    // Listen for storage changes
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "userSettings") {
        checkTheme()
      }
    }

    // Listen for settings changes in the same tab
    const handleSettingsChange = () => {
      checkTheme()
    }

    window.addEventListener('storage', handleStorageChange)
    window.addEventListener('settingsChanged', handleSettingsChange)

    return () => {
      window.removeEventListener('storage', handleStorageChange)
      window.removeEventListener('settingsChanged', handleSettingsChange)
    }
  }, [])

  const isDutch = language === 'dutch'

  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300",
        isDark 
          ? "bg-zinc-950 border border-zinc-800" 
          : "bg-white border border-zinc-200",
        className
      )}
      onClick={toggleLanguage}
      role="button"
      tabIndex={0}
      title={language === 'english' ? 'Switch to Dutch' : 'Switch to English'}
    >
      <div className="flex justify-between items-center w-full">
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 overflow-hidden",
            isDutch 
              ? "transform translate-x-0" 
              : "transform translate-x-8",
            // Consistent background for active state based on theme
            isDutch 
              ? (isDark ? "bg-zinc-800" : "bg-gray-200")
              : (isDark ? "bg-zinc-800" : "bg-gray-200")
          )}
        >
          {isDutch ? (
            // Dutch flag
            <img 
              src="/lovable-uploads/e271aa66-8801-4936-b23f-c39df370e64b.png" 
              alt="Dutch flag"
              className="w-4 h-4 rounded-full object-cover"
            />
          ) : (
            // British flag
            <img 
              src="/lovable-uploads/bd239568-d6b9-4f84-90b5-f69c28780e46.png" 
              alt="British flag"
              className="w-4 h-4 rounded-full object-cover"
            />
          )}
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 overflow-hidden",
            isDutch 
              ? "bg-transparent" 
              : "transform -translate-x-8",
            // Consistent background for inactive state based on theme  
            !isDutch 
              ? (isDark ? "bg-zinc-800" : "bg-gray-200")
              : "bg-transparent"
          )}
        >
          {isDutch ? (
            // British flag (inactive)
            <img 
              src="/lovable-uploads/bd239568-d6b9-4f84-90b5-f69c28780e46.png" 
              alt="British flag"
              className="w-4 h-4 rounded-full object-cover opacity-50"
            />
          ) : (
            // Dutch flag (inactive)
            <img 
              src="/lovable-uploads/e271aa66-8801-4936-b23f-c39df370e64b.png" 
              alt="Dutch flag"
              className="w-4 h-4 rounded-full object-cover opacity-50"
            />
          )}
        </div>
      </div>
    </div>
  )
}
