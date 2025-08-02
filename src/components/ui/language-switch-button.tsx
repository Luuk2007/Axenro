
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
            // Only show background when Dutch is selected
            isDutch 
              ? (isDark ? "bg-zinc-800" : "bg-gray-200")
              : ""
          )}
        >
          <img 
            src="/lovable-uploads/e271aa66-8801-4936-b23f-c39df370e64b.png" 
            alt="Dutch flag"
            className={cn(
              "w-4 h-4 rounded-full object-cover",
              !isDutch && "opacity-50"
            )}
          />
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 overflow-hidden",
            isDutch 
              ? "" 
              : "transform -translate-x-8",
            // Only show background when English is selected (when not Dutch)
            !isDutch 
              ? (isDark ? "bg-zinc-800" : "bg-gray-200")
              : ""
          )}
        >
          <img 
            src="/lovable-uploads/bd239568-d6b9-4f84-90b5-f69c28780e46.png" 
            alt="British flag"
            className={cn(
              "w-4 h-4 rounded-full object-cover",
              isDutch && "opacity-50"
            )}
          />
        </div>
      </div>
    </div>
  )
}
