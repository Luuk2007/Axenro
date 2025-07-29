
'use client'

import * as React from 'react'
import { useLanguage, Language } from '@/contexts/LanguageContext'
import { cn } from '@/lib/utils'

interface LanguageSwitchProps {
  className?: string
}

export function LanguageSwitch({ className }: LanguageSwitchProps) {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = React.useCallback(() => {
    const newLanguage: Language = language === 'english' ? 'dutch' : 'english'
    setLanguage(newLanguage)
  }, [language, setLanguage])

  const isDutch = language === 'dutch'

  return (
    <div
      className={cn(
        "flex w-16 h-8 p-1 rounded-full cursor-pointer transition-all duration-300 bg-white border border-zinc-200",
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
              ? "transform translate-x-0 bg-gray-200" 
              : "transform translate-x-8 bg-gray-200"
          )}
        >
          {isDutch ? (
            // Dutch flag
            <div className="h-4 w-4 rounded-full overflow-hidden flex flex-col">
              <div className="flex-1 bg-[#AE1C28]"></div>
              <div className="flex-1 bg-white"></div>
              <div className="flex-1 bg-[#21468B]"></div>
            </div>
          ) : (
            // British flag
            <div className="h-4 w-4 rounded-full overflow-hidden">
              <svg viewBox="0 0 60 30" className="h-full w-full">
                <clipPath id="t">
                  <path d="m30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
                </clipPath>
                <path d="m0,0 v30 h60 v-30 z" fill="#012169"/>
                <path d="m0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                <path d="m0,0 L60,30 M60,0 L0,30" clipPath="url(#t)" stroke="#C8102E" strokeWidth="4"/>
                <path d="m30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                <path d="m30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
              </svg>
            </div>
          )}
        </div>
        <div
          className={cn(
            "flex justify-center items-center w-6 h-6 rounded-full transition-transform duration-300 overflow-hidden",
            isDutch 
              ? "bg-transparent" 
              : "transform -translate-x-8"
          )}
        >
          {isDutch ? (
            // British flag (inactive)
            <div className="h-4 w-4 rounded-full overflow-hidden opacity-50">
              <svg viewBox="0 0 60 30" className="h-full w-full">
                <clipPath id="t2">
                  <path d="m30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z"/>
                </clipPath>
                <path d="m0,0 v30 h60 v-30 z" fill="#012169"/>
                <path d="m0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6"/>
                <path d="m0,0 L60,30 M60,0 L0,30" clipPath="url(#t2)" stroke="#C8102E" strokeWidth="4"/>
                <path d="m30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10"/>
                <path d="m30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6"/>
              </svg>
            </div>
          ) : (
            // Dutch flag (inactive)
            <div className="h-4 w-4 rounded-full overflow-hidden flex flex-col opacity-50">
              <div className="flex-1 bg-[#AE1C28]"></div>
              <div className="flex-1 bg-white"></div>
              <div className="flex-1 bg-[#21468B]"></div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
