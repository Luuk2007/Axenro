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

      {/* Status card */}
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
      ) : canInstall ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Card className="border-primary/30 bg-primary/5">
            <CardContent className="p-5 space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Download className="w-6 h-6 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm">Klaar om te installeren</p>
                  <p className="text-xs text-muted-foreground">Voeg Axenro toe aan je homescherm met één klik.</p>
                </div>
              </div>
              <Button onClick={handleInstall} className="w-full gap-2" size="lg">
                <Download className="w-4 h-4" />
                Installeer App
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      ) : isIOS ? (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="space-y-4"
        >
          <Card>
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold text-sm">Installeren op iPhone / iPad</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">1</div>
                  <div className="min-w-0 pt-1">
                    <p className="text-sm font-medium flex items-center gap-2 flex-wrap">
                      Tik op het <Share className="w-4 h-4 text-primary inline" /> Deel-icoon
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Onderaan in Safari</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">2</div>
                  <div className="min-w-0 pt-1">
                    <p className="text-sm font-medium flex items-center gap-2 flex-wrap">
                      Kies <PlusSquare className="w-4 h-4 text-primary inline" /> Zet op beginscherm
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Scroll eventueel naar beneden</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">3</div>
                  <div className="min-w-0 pt-1">
                    <p className="text-sm font-medium">Tik op Voeg toe</p>
                    <p className="text-xs text-muted-foreground mt-0.5">De app verschijnt op je homescherm</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
        >
          <Card>
            <CardContent className="p-5 space-y-5">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-primary" />
                </div>
                <p className="font-semibold text-sm">App installeren</p>
              </div>

              <div className="space-y-4">
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">1</div>
                  <div className="min-w-0 pt-1">
                    <p className="text-sm font-medium">Open deze website in Chrome of Safari</p>
                    <p className="text-xs text-muted-foreground mt-0.5">Op je mobiele telefoon</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">2</div>
                  <div className="min-w-0 pt-1">
                    <p className="text-sm font-medium flex items-center gap-2 flex-wrap">
                      Tik op <ArrowDown className="w-4 h-4 text-primary inline" /> Installeren
                    </p>
                    <p className="text-xs text-muted-foreground mt-0.5">Of gebruik het browsermenu → "Toevoegen aan startscherm"</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-xs font-bold">3</div>
                  <div className="min-w-0 pt-1">
                    <p className="text-sm font-medium">Open Axenro vanaf je homescherm</p>
                    <p className="text-xs text-muted-foreground mt-0.5">De app opent fullscreen zonder browserbalk</p>
                  </div>
                </div>
              </div>
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
