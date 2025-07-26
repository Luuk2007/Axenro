import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface TermsConditionsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const TermsConditionsModal = ({ open, onOpenChange }: TermsConditionsModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] p-4 mx-4 sm:mx-6 md:mx-8">
        <DialogHeader>
          <DialogTitle>Terms & Conditions</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-4 text-sm">
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default TermsConditionsModal;
