import React from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useLanguage } from '@/contexts/LanguageContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Smartphone, 
  Download, 
  CheckCircle2, 
  Share, 
  PlusSquare, 
  ArrowDown,
  Wifi,
  Bell,
  Zap,
  Shield
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function InstallApp() {
  const { canInstall, isInstalled, isIOS, isStandalone, install } = usePWAInstall();
  const { t } = useLanguage();

  const handleInstall = async () => {
    await install();
  };

  const features = [
    { icon: Zap, label: 'Snelle toegang', desc: 'Open direct vanaf je homescherm' },
    { icon: Wifi, label: 'Offline beschikbaar', desc: 'Werkt ook zonder internetverbinding' },
    { icon: Bell, label: 'Volledig scherm', desc: 'Geen browserbalk, echte app-ervaring' },
    { icon: Shield, label: 'Altijd up-to-date', desc: 'Automatische updates op de achtergrond' },
  ];

  return (
    <div className="w-full max-w-full overflow-hidden space-y-6">
      {/* Header */}
      <div className="text-center space-y-3">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200, damping: 20 }}
          className="mx-auto w-20 h-20 rounded-2xl bg-gradient-primary flex items-center justify-center shadow-lg"
        >
          <Smartphone className="w-10 h-10 text-primary-foreground" />
        </motion.div>
        <h1 className="text-2xl font-bold tracking-tight">Mobiele App</h1>
        <p className="text-sm text-muted-foreground max-w-sm mx-auto">
          Installeer Axenro op je telefoon voor de beste ervaring
        </p>
      </div>

      {/* Install action */}
      {isStandalone || isInstalled ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Card className="border-emerald-500/30 bg-emerald-500/5">
            <CardContent className="flex items-center gap-4 p-5">
              <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-emerald-500" />
              </div>
              <div className="min-w-0">
                <p className="font-semibold text-sm">App is geïnstalleerd!</p>
                <p className="text-xs text-muted-foreground">Je gebruikt Axenro al als app op je apparaat.</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-4"
        >
          {/* Primary install button - always visible */}
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">
                    {canInstall ? 'Klaar om te installeren' : 'Installeer Axenro'}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {canInstall
                      ? 'Voeg Axenro toe aan je homescherm met één klik.'
                      : 'Zet Axenro op je homescherm voor een echte app-ervaring.'}
                  </p>
                </div>
              </div>
              {canInstall ? (
                <Button onClick={handleInstall} className="w-full gap-2" size="lg">
                  <Download className="w-5 h-5" />
                  Installeer op Homescherm
                </Button>
              ) : isIOS ? (
                <div className="space-y-3 pt-1">
                  <p className="text-xs text-muted-foreground font-medium">Gebruik Safari om te installeren:</p>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Share className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="text-sm">Tik op <span className="font-semibold">Deel</span> onderaan → <span className="font-semibold">Zet op beginscherm</span></p>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 pt-1">
                  <p className="text-xs text-muted-foreground font-medium">Open in Chrome op je telefoon:</p>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <ArrowDown className="w-5 h-5 text-primary flex-shrink-0" />
                    <p className="text-sm">Tik op <span className="font-semibold">⋮ menu</span> → <span className="font-semibold">Toevoegen aan startscherm</span></p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      {/* Features grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-1">Waarom installeren?</h2>
        <div className="grid grid-cols-2 gap-3">
          {features.map((feature, i) => (
            <motion.div
              key={feature.label}
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
            >
              <Card className="h-full">
                <CardContent className="p-4 space-y-2">
                  <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                    <feature.icon className="w-4 h-4 text-primary" />
                  </div>
                  <p className="text-sm font-medium leading-tight">{feature.label}</p>
                  <p className="text-xs text-muted-foreground leading-snug">{feature.desc}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
