
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";

interface TermsConditionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermsConditionsModal = ({ open, onOpenChange }: TermsConditionsModalProps) => {
  const { t, language } = useLanguage();

  const englishContent = (
    <div className="space-y-4 text-sm px-4">
      <section>
        <h3 className="font-semibold mb-2">1. Acceptance of Terms</h3>
        <p className="text-muted-foreground">
          By accessing and using our fitness tracking application, you accept and agree to be 
          bound by the terms and provision of this agreement.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">2. Description of Service</h3>
        <p className="text-muted-foreground">
          Our application provides fitness tracking, nutrition monitoring, workout planning, 
          and progress tracking tools to help users achieve their health and fitness goals.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">3. User Responsibilities</h3>
        <p className="text-muted-foreground">
          You are responsible for maintaining the confidentiality of your account information 
          and for all activities that occur under your account. You agree to provide accurate 
          and complete information.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">4. Health Disclaimer</h3>
        <p className="text-muted-foreground">
          The information provided by our application is for educational and informational 
          purposes only. It is not intended as medical advice. Always consult with a healthcare 
          professional before starting any fitness or nutrition program.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">5. Prohibited Uses</h3>
        <p className="text-muted-foreground">
          You may not use our service for any unlawful purpose or to solicit others to perform 
          unlawful acts. You may not violate any international, federal, provincial, or state 
          regulations, rules, or laws.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">6. Limitation of Liability</h3>
        <p className="text-muted-foreground">
          In no event shall our company be liable for any indirect, incidental, special, 
          consequential, or punitive damages, including without limitation, loss of profits, 
          data, use, goodwill, or other intangible losses.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">7. Termination</h3>
        <p className="text-muted-foreground">
          We may terminate or suspend your account and bar access to the service immediately, 
          without prior notice or liability, under our sole discretion, for any reason whatsoever.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">8. Changes to Terms</h3>
        <p className="text-muted-foreground">
          We reserve the right to modify or replace these terms at any time. If a revision 
          is material, we will provide at least 30 days notice prior to any new terms taking effect.
        </p>
      </section>
    </div>
  );

  const dutchContent = (
    <div className="space-y-4 text-sm px-4">
      <section>
        <h3 className="font-semibold mb-2">1. Acceptatie van voorwaarden</h3>
        <p className="text-muted-foreground">
          Door toegang te krijgen tot en gebruik te maken van onze fitnesstracking-applicatie, 
          accepteert u en gaat u akkoord met de voorwaarden en bepalingen van deze overeenkomst.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">2. Beschrijving van de service</h3>
        <p className="text-muted-foreground">
          Onze applicatie biedt fitnesstracking, voedingsmonitoring, trainingsplanning 
          en voortgangstracking tools om gebruikers te helpen hun gezondheids- en fitnessdoelen te bereiken.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">3. Gebruikersverantwoordelijkheden</h3>
        <p className="text-muted-foreground">
          U bent verantwoordelijk voor het bewaren van de vertrouwelijkheid van uw accountinformatie 
          en voor alle activiteiten die plaatsvinden onder uw account. U stemt ermee in om nauwkeurige 
          en volledige informatie te verstrekken.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">4. Gezondheidsverklaring</h3>
        <p className="text-muted-foreground">
          De informatie die door onze applicatie wordt verstrekt, is alleen voor educatieve en informatieve 
          doeleinden. Het is niet bedoeld als medisch advies. Raadpleeg altijd een zorgverlener 
          voordat u een fitness- of voedingsprogramma start.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">5. Verboden gebruik</h3>
        <p className="text-muted-foreground">
          U mag onze service niet gebruiken voor onwettige doeleinden of om anderen aan te sporen 
          tot het uitvoeren van onwettige handelingen. U mag geen internationale, federale, provinciale 
          of staatsregelgeving, regels of wetten overtreden.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">6. Beperking van aansprakelijkheid</h3>
        <p className="text-muted-foreground">
          In geen geval zal ons bedrijf aansprakelijk zijn voor indirecte, incidentele, speciale, 
          gevolgschade of punitieve schade, inclusief maar niet beperkt tot verlies van winst, 
          gegevens, gebruik, goodwill of andere immateriële verliezen.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">7. Beëindiging</h3>
        <p className="text-muted-foreground">
          We kunnen uw account beëindigen of opschorten en de toegang tot de service onmiddellijk 
          blokkeren, zonder voorafgaande kennisgeving of aansprakelijkheid, naar eigen goeddunken, 
          om welke reden dan ook.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">8. Wijzigingen in voorwaarden</h3>
        <p className="text-muted-foreground">
          We behouden ons het recht voor om deze voorwaarden op elk moment te wijzigen of te vervangen. 
          Als een herziening materieel is, zullen we ten minste 30 dagen voorafgaand aan het van kracht 
          worden van nieuwe voorwaarden een kennisgeving verstrekken.
        </p>
      </section>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{language === 'dutch' ? 'Algemene voorwaarden' : 'Terms & Conditions'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          {language === 'dutch' ? dutchContent : englishContent}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsConditionsModal;
