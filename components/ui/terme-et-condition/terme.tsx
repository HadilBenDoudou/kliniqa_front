"use client";

import { Button } from "./button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./Dialog";
import { useRef, useState } from "react";

interface TermsDialogProps {
  onAgree: () => void; // Prop to handle agreement
}

function TermsDialog({ onAgree }: TermsDialogProps) {
  const [hasReadToBottom, setHasReadToBottom] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const handleScroll = () => {
    const content = contentRef.current;
    if (!content) return;

    const scrollPercentage = content.scrollTop / (content.scrollHeight - content.clientHeight);
    if (scrollPercentage >= 0.99 && !hasReadToBottom) {
      setHasReadToBottom(true);
    }
  };

  const handleAgree = () => {
    if (hasReadToBottom) {
      onAgree(); // Call the parent's onAgree function
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <span className="text-blue-600 cursor-pointer">Terms and Conditions</span>
      </DialogTrigger>
      <DialogContent className="flex flex-col gap-0 p-0 sm:max-h-[min(640px,80vh)] sm:max-w-lg [&>button:last-child]:top-3.5">
        <DialogHeader className="contents space-y-0 text-left">
          <DialogTitle className="border-b border-border px-6 py-4 text-base">
            Terms & Conditions
          </DialogTitle>
          <div ref={contentRef} onScroll={handleScroll} className="overflow-y-auto">
            <DialogDescription asChild>
              <div className="px-6 py-4">
                <div className="space-y-6 [&_strong]:font-semibold [&_strong]:text-foreground">
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <p>
                        <strong>1. Introduction</strong>
                      </p>
                      <p>
                        Welcome to Kliniqa ("we," "us," or "our"). These Terms and Conditions ("Terms") govern your
                        use of our website, services, and any related applications (collectively, the "Service").
                        By accessing or using the Service, you agree to be bound by these Terms. If you do not agree
                        to these Terms, please do not use the Service.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p>
                        <strong>2. Medical Disclaimer</strong>
                      </p>
                      <p>
                        The information provided on this website is for educational and informational purposes only
                        and should not be considered medical advice. It is not intended to replace professional
                        medical diagnosis, treatment, or advice from a qualified healthcare provider. Users should
                        always consult with a qualified healthcare professional for any health concerns or before
                        making decisions based on the content provided. Kliniqa is not responsible for any actions
                        or decisions made based on the information provided on the Service.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p>
                        <strong>3. Health Data Protection</strong>
                      </p>
                      <p>
                        Users submitting medical or personal health data through the Service must ensure that their
                        information complies with applicable data protection laws, including but not limited to the
                        General Data Protection Regulation (GDPR) and the Health Insurance Portability and
                        Accountability Act (HIPAA), where applicable. We implement reasonable security measures to
                        safeguard user data; however, users are responsible for protecting their own information and
                        ensuring its accuracy and legality. Kliniqa is not liable for breaches caused by user
                        negligence or external factors beyond our control.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p>
                        <strong>4. Liability for Medical Content</strong>
                      </p>
                      <p>
                        The Service provides health-related information as a general guide and does not guarantee its
                        accuracy, completeness, or suitability for specific medical conditions or individual
                        circumstances. We do not endorse any specific treatments, medications, or healthcare providers
                        mentioned on the Service. Users should seek professional medical guidance before acting on any
                        information found on the Service. Kliniqa shall not be liable for any damages resulting from
                        reliance on such information.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p>
                        <strong>5. User Responsibilities</strong>
                      </p>
                      <p>
                        By using the Service, you agree to provide accurate, current, and complete information as
                        required during registration or other interactions. You are responsible for maintaining the
                        confidentiality of your account credentials and for all activities that occur under your
                        account. You must not use the Service for any illegal or unauthorized purpose, including but
                        not limited to distributing harmful content, violating intellectual property rights, or
                        engaging in fraudulent activities. Any misuse of the Service may result in immediate
                        termination of your access.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p>
                        <strong>6. Intellectual Property</strong>
                      </p>
                      <p>
                        All content on the Service, including text, graphics, logos, images, and software, is the
                        property of Kliniqa or its licensors and is protected by copyright, trademark, and other
                        intellectual property laws. You may not reproduce, distribute, modify, or create derivative
                        works of any content without our prior written consent. Limited use of the Service for
                        personal, non-commercial purposes is permitted, provided that all copyright and proprietary
                        notices remain intact.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p>
                        <strong>7. Termination of Service</strong>
                      </p>
                      <p>
                        We reserve the right to suspend or terminate your access to the Service at our sole discretion,
                        with or without notice, for any reason, including but not limited to violation of these Terms,
                        suspected fraudulent activity, or failure to comply with applicable laws. Upon termination,
                        your right to use the Service will cease immediately, and we may delete any data associated
                        with your account, subject to legal obligations.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p>
                        <strong>8. Third-Party Links and Services</strong>
                      </p>
                      <p>
                        The Service may contain links to third-party websites or services that are not owned or
                        controlled by Kliniqa. We are not responsible for the content, privacy policies, or practices
                        of any third-party sites or services. You access such third-party resources at your own risk,
                        and we encourage you to review their terms and conditions before engaging with them.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p>
                        <strong>9. Limitation of Liability</strong>
                      </p>
                      <p>
                        To the fullest extent permitted by law, Kliniqa, its affiliates, officers, directors, employees,
                        and agents shall not be liable for any indirect, incidental, special, consequential, or punitive
                        damages arising out of or related to your use of the Service. This includes, but is not limited
                        to, damages for loss of profits, data, or other intangible losses, even if we have been advised
                        of the possibility of such damages. Our total liability to you for any claim arising from these
                        Terms or the Service shall not exceed the amount you paid to us, if any, in the preceding twelve
                        (12) months.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p>
                        <strong>10. Governing Law and Dispute Resolution</strong>
                      </p>
                      <p>
                        These Terms shall be governed by and construed in accordance with the laws of [Insert Jurisdiction,
                        e.g., "the State of California, USA"], without regard to its conflict of law principles. Any
                        disputes arising under or in connection with these Terms shall be resolved through binding
                        arbitration in accordance with the rules of the [Insert Arbitration Body, e.g., "American
                        Arbitration Association"], conducted in [Insert Location]. You agree to waive any right to a
                        jury trial or to participate in a class action lawsuit.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p>
                        <strong>11. Changes to These Terms</strong>
                      </p>
                      <p>
                        We may update these Terms from time to time to reflect changes in our practices, legal
                        requirements, or the functionality of the Service. We will notify you of material changes by
                        posting the updated Terms on the Service or through other reasonable means. Your continued use
                        of the Service after such changes constitutes your acceptance of the revised Terms. If you do
                        not agree to the updated Terms, you must stop using the Service.
                      </p>
                    </div>

                    <div className="space-y-2">
                      <p>
                        <strong>12. Contact Us</strong>
                      </p>
                      <p>
                        If you have any questions, concerns, or feedback about these Terms or the Service, please
                        contact us at [Insert Contact Email, e.g., "support@kliniqa.com"] or [Insert Phone Number].
                        We are committed to addressing your inquiries promptly and professionally.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </DialogDescription>
          </div>
        </DialogHeader>
        <DialogFooter className="border-t border-border px-6 py-4 sm:items-center">
          {!hasReadToBottom && (
            <span className="grow text-xs text-muted-foreground max-sm:text-center">
              Please scroll to the bottom and read all terms before accepting.
            </span>
          )}
          <DialogClose asChild>
            <Button type="button" variant="outline">
              Cancel
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button type="button" disabled={!hasReadToBottom} onClick={handleAgree}>
              I agree
            </Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export { TermsDialog };