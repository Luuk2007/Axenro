
'use client'

import * as React from 'react'
import { useLanguage, Language } from '@/contexts/LanguageContext'

interface LanguageSwitchProps {
  className?: string
}

export function LanguageSwitch({ className = '' }: LanguageSwitchProps) {
  const { language, setLanguage } = useLanguage()

  const toggleLanguage = React.useCallback(() => {
    const newLanguage: Language = language === 'english' ? 'dutch' : 'english'
    setLanguage(newLanguage)
  }, [language, setLanguage])

  return (
    <button
      onClick={toggleLanguage}
      className={`relative flex h-8 w-8 items-center justify-center rounded-full hover:opacity-80 transition-opacity overflow-hidden ${className}`}
      title={language === 'english' ? 'Switch to Dutch' : 'Switch to English'}
    >
      {language === 'english' ? (
        // British flag - circular
        <div className="h-6 w-6 rounded-full overflow-hidden">
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
      ) : (
        // Dutch flag - circular
        <div className="h-6 w-6 rounded-full overflow-hidden flex flex-col">
          <div className="flex-1 bg-[#AE1C28]"></div>
          <div className="flex-1 bg-white"></div>
          <div className="flex-1 bg-[#21468B]"></div>
        </div>
      )}
    </button>
  )
}
