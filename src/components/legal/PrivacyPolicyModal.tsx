import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useLanguage } from "@/contexts/LanguageContext";

interface PrivacyPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrivacyPolicyModal = ({ open, onOpenChange }: PrivacyPolicyModalProps) => {
  const { t, language } = useLanguage();

  const englishContent = (
    <div className="space-y-4 text-sm">
      <section>
        <h3 className="font-semibold mb-2">1. Information We Collect</h3>
        <p className="text-muted-foreground">
          We collect information you provide directly to us, such as when you create an account, 
          update your profile, track your nutrition and workouts, or contact us for support.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">2. How We Use Your Information</h3>
        <p className="text-muted-foreground">
          We use the information we collect to provide, maintain, and improve our fitness tracking services, 
          personalize your experience, and communicate with you about our services.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">3. Information Sharing</h3>
        <p className="text-muted-foreground">
          We do not sell, trade, or otherwise transfer your personal information to third parties without 
          your consent, except as described in this policy or as required by law.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">4. Data Security</h3>
        <p className="text-muted-foreground">
          We implement appropriate security measures to protect your personal information against 
          unauthorized access, alteration, disclosure, or destruction.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">5. Data Retention</h3>
        <p className="text-muted-foreground">
          We retain your personal information for as long as necessary to provide our services 
          and fulfill the purposes outlined in this policy, unless a longer retention period 
          is required by law.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">6. Your Rights</h3>
        <p className="text-muted-foreground">
          You have the right to access, update, or delete your personal information. You can 
          manage your account settings or contact us directly to exercise these rights.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">7. Contact Us</h3>
        <p className="text-muted-foreground">
          If you have any questions about this Privacy Policy, please contact us through 
          our support channels.
        </p>
      </section>
    </div>
  );

  const dutchContent = (
    <div className="space-y-4 text-sm">
      <section>
        <h3 className="font-semibold mb-2">1. Informatie die we verzamelen</h3>
        <p className="text-muted-foreground">
          We verzamelen informatie die u direct aan ons verstrekt, zoals wanneer u een account aanmaakt, 
          uw profiel bijwerkt, uw voeding en trainingen bijhoudt, of contact met ons opneemt voor ondersteuning.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">2. Hoe we uw informatie gebruiken</h3>
        <p className="text-muted-foreground">
          We gebruiken de informatie die we verzamelen om onze fitnesstracking-diensten te leveren, 
          onderhouden en verbeteren, uw ervaring te personaliseren en met u te communiceren over onze diensten.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">3. Informatie delen</h3>
        <p className="text-muted-foreground">
          We verkopen, verhandelen of dragen uw persoonlijke informatie niet over aan derden zonder 
          uw toestemming, behalve zoals beschreven in dit beleid of zoals vereist door de wet.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">4. Gegevensbeveiliging</h3>
        <p className="text-muted-foreground">
          We implementeren passende beveiligingsmaatregelen om uw persoonlijke informatie te beschermen 
          tegen ongeautoriseerde toegang, wijziging, openbaarmaking of vernietiging.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">5. Gegevensbewaring</h3>
        <p className="text-muted-foreground">
          We bewaren uw persoonlijke informatie zo lang als nodig is om onze diensten te leveren 
          en de doeleinden uit dit beleid te vervullen, tenzij een langere bewaartermijn 
          vereist is door de wet.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">6. Uw rechten</h3>
        <p className="text-muted-foreground">
          U heeft het recht om uw persoonlijke informatie te bekijken, bij te werken of te verwijderen. 
          U kunt uw accountinstellingen beheren of direct contact met ons opnemen om deze rechten uit te oefenen.
        </p>
      </section>

      <section>
        <h3 className="font-semibold mb-2">7. Contact opnemen</h3>
        <p className="text-muted-foreground">
          Als u vragen heeft over dit privacybeleid, neem dan contact met ons op via 
          onze ondersteuningskanalen.
        </p>
      </section>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>{language === 'dutch' ? 'Privacybeleid' : 'Privacy Policy'}</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] px-4">
          {language === 'dutch' ? dutchContent : englishContent}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyModal;
