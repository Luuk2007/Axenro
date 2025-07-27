import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface PrivacyPolicyModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const PrivacyPolicyModal = ({ open, onOpenChange }: PrivacyPolicyModalProps) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Privacy Policy</DialogTitle>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh]">
          <div className="space-y-4 text-sm px-4">
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
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default PrivacyPolicyModal;
