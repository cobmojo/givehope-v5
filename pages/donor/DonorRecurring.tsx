
import React, { useState } from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { MoreHorizontal, X, ChevronLeft } from 'lucide-react';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger 
} from '../../components/ui/DropdownMenu';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription 
} from '../../components/ui/Dialog';
import { formatCurrency } from '../../lib/utils';

// Mock Data
const RECURRING_GIFTS = [
  { id: '1', missionary: 'The Miller Family', amount: 100, frequency: 'Monthly', nextDate: 'Nov 1, 2024', status: 'Active' },
  { id: '2', missionary: 'Clean Water Fund', amount: 50, frequency: 'Monthly', nextDate: 'Nov 15, 2024', status: 'Active' },
  { id: '3', missionary: 'General Fund', amount: 25, frequency: 'Monthly', nextDate: 'Nov 5, 2024', status: 'Paused' },
];

export const DonorRecurring = () => {
  const [editingGift, setEditingGift] = useState<string | null>(null);

  const selectedGift = RECURRING_GIFTS.find(g => g.id === editingGift);

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500 pt-4 pb-20">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Recurring Pledges</h1>
        <p className="text-slate-500 mt-2 text-lg">Manage your ongoing support commitments.</p>
      </div>

      <div className="grid gap-4">
        {RECURRING_GIFTS.map((gift) => (
          <Card key={gift.id} className="overflow-hidden bg-white border-slate-200 shadow-sm">
            <div className="flex flex-col sm:flex-row items-center p-6 gap-6">
              <div className="flex-1 text-center sm:text-left">
                <h3 className="text-lg font-bold text-slate-900">{gift.missionary}</h3>
                <div className="flex items-center justify-center sm:justify-start gap-2 mt-1 text-slate-500">
                  <Badge variant={gift.status === 'Active' ? 'success' : 'secondary'} className="uppercase text-[10px]">
                    {gift.status}
                  </Badge>
                  <span className="text-sm font-medium">• {gift.frequency}</span>
                </div>
              </div>
              
              <div className="text-center sm:text-right">
                <div className="text-2xl font-bold text-slate-900">{formatCurrency(gift.amount)}</div>
                <div className="text-xs text-slate-500 mt-1 font-medium">Next: {gift.nextDate}</div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="h-9" onClick={() => setEditingGift(gift.id)}>Edit</Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-9 w-9">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Update Payment Method</DropdownMenuItem>
                    <DropdownMenuItem>View History</DropdownMenuItem>
                    {gift.status === 'Active' ? (
                      <DropdownMenuItem className="text-amber-600 focus:text-amber-600">Pause Pledge</DropdownMenuItem>
                    ) : (
                      <DropdownMenuItem className="text-emerald-600 focus:text-emerald-600">Resume Pledge</DropdownMenuItem>
                    )}
                    <DropdownMenuItem className="text-red-600 focus:text-red-600">Cancel Pledge</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Dialog open={!!editingGift} onOpenChange={(open) => !open && setEditingGift(null)}>
        <DialogContent className="sm:max-w-[480px] p-0 gap-0 overflow-hidden shadow-2xl border-slate-200">
           <div className="sr-only">
              <DialogTitle>Manage Pledge</DialogTitle>
              <DialogDescription>Update amount, payment method, or pause subscription.</DialogDescription>
           </div>
           
           {/* Visual Header */}
           <div className="bg-slate-50/80 backdrop-blur-sm border-b border-slate-100 p-6 pb-4">
              <div className="flex items-center justify-between mb-2">
                 <h3 className="font-bold text-lg text-slate-900">Manage Pledge</h3>
                 <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={() => setEditingGift(null)}>
                    <X className="h-4 w-4" />
                 </Button>
              </div>
              {selectedGift && (
                <p className="text-sm text-slate-500">Editing support for <strong>{selectedGift.missionary}</strong></p>
              )}
           </div>

           <div className="p-6 space-y-6">
              <div className="text-center py-8 text-slate-400">
                 <p>Edit form content would go here.</p>
              </div>
              <div className="flex gap-3">
                 <Button variant="outline" className="flex-1" onClick={() => setEditingGift(null)}>Cancel</Button>
                 <Button className="flex-1 bg-slate-900 text-white">Save Changes</Button>
              </div>
           </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
