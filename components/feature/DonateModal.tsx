
import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '../../components/ui/Dialog';
import { Check } from 'lucide-react';
import { Elements } from '@stripe/react-stripe-js';
import { stripePromise } from '../../lib/stripe';

// Mocking DonationFormContent as it is referenced but the file is not provided in context.
const DonationFormContent = ({ missionaryId, missionaryName, onSuccess, onClose }: any) => (
  <div className="p-6 space-y-4">
    <p className="text-sm text-slate-600">
      You are donating to <strong>{missionaryName}</strong> (ID: {missionaryId}).
    </p>
    <div className="bg-slate-50 p-4 rounded-md border border-slate-100 text-xs text-slate-500 text-center">
      [Stripe Payment Element Placeholder]
    </div>
    <Button onClick={onSuccess} className="w-full bg-slate-900 text-white">
      Complete Donation
    </Button>
  </div>
);

interface DonateModalProps {
  missionaryId: string;
  missionaryName: string;
  trigger?: React.ReactNode;
}

export const DonateModal: React.FC<DonateModalProps> = ({ missionaryId, missionaryName, trigger }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleOpen = () => {
    setSuccess(false);
    setIsOpen(true);
  };

  const handleClose = () => setIsOpen(false);

  const triggerElement = trigger ? (
    React.isValidElement(trigger) ? (
      React.cloneElement(trigger as React.ReactElement<any>, {
        onClick: (e: React.MouseEvent) => {
          const { onClick } = (trigger as React.ReactElement<any>).props;
          if (onClick) onClick(e);
          handleOpen();
        }
      })
    ) : (
      <span onClick={handleOpen} className="cursor-pointer">{trigger}</span>
    )
  ) : (
    <Button onClick={handleOpen} size="lg" className="shadow-lg">Donate Now</Button>
  );

  return (
    <>
      {triggerElement}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-[500px] p-0 gap-0 overflow-hidden transition-all duration-200">
          {!success ? (
            <>
              <DialogHeader className="p-6 pb-2">
                <DialogTitle className="text-xl font-bold flex items-center gap-2">
                  Support {missionaryName}
                </DialogTitle>
                <DialogDescription>
                  Your generosity empowers this mission.
                </DialogDescription>
              </DialogHeader>
              <Elements stripe={stripePromise}>
                <DonationFormContent 
                  missionaryId={missionaryId} 
                  missionaryName={missionaryName}
                  onSuccess={() => setSuccess(true)}
                  onClose={handleClose}
                />
              </Elements>
            </>
          ) : (
            <div className="py-12 flex flex-col items-center text-center animate-in zoom-in-95 duration-500 ease-out p-6">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-green-100 rounded-full animate-ping opacity-25" />
                <div className="relative h-24 w-24 bg-green-50 rounded-full flex items-center justify-center border-2 border-green-100 shadow-sm">
                  <Check className="h-12 w-12 text-green-600" strokeWidth={3} />
                </div>
              </div>
              
              <DialogTitle className="text-3xl font-bold text-slate-900 mb-3 tracking-tight text-center">Thank You!</DialogTitle>
              <DialogDescription className="sr-only">Donation successful</DialogDescription>
              
              <p className="text-slate-600 max-w-[280px] mx-auto mb-8 leading-relaxed">
                Your gift to <span className="font-semibold text-slate-900">{missionaryName}</span> has been successfully processed.
              </p>
              
              <div className="flex flex-col gap-3 w-full max-w-xs">
                <Button onClick={handleClose} className="w-full bg-slate-900 hover:bg-slate-800 h-11 font-semibold text-base shadow-md text-white">
                  Done
                </Button>
                <Button variant="outline" className="w-full border-slate-200 text-slate-600 hover:bg-slate-50">
                  View Receipt
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};
