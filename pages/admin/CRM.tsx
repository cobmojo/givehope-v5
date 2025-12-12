
import React, { useState, useMemo } from 'react';
import { 
  Search, Filter, Plus, MoreHorizontal, LayoutGrid, List, 
  ArrowUpDown, Mail, Phone, Tag, X, ChevronRight,
  Columns, ArrowUpRight, User, MessageSquare, Paperclip,
  CheckSquare, MoreVertical, Calendar
} from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar';
import { ScrollArea } from '../../components/ui/ScrollArea';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '../../components/ui/sheet';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, 
  DropdownMenuTrigger, DropdownMenuSeparator, DropdownMenuLabel 
} from '../../components/ui/DropdownMenu';
import { Separator } from '../../components/ui/separator';
import { cn, formatCurrency } from '../../lib/utils';

// --- Types & Constants ---

type Stage = 'New' | 'Contacted' | 'Meeting' | 'Proposal' | 'Won';

interface Contact {
  id: string;
  name: string;
  avatar?: string;
  title: string;
  company: string;
  companyLogo?: string;
  email: string;
  phone: string;
  value: number;
  stage: Stage;
  owner: string;
  lastActivity: string;
  tags: string[];
  city: string;
}

const STAGES: Stage[] = ['New', 'Contacted', 'Meeting', 'Proposal', 'Won'];

const STAGE_COLORS: Record<Stage, string> = {
  New: 'bg-blue-100 text-blue-700 border-blue-200',
  Contacted: 'bg-indigo-100 text-indigo-700 border-indigo-200',
  Meeting: 'bg-amber-100 text-amber-700 border-amber-200',
  Proposal: 'bg-purple-100 text-purple-700 border-purple-200',
  Won: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

// --- Mock Data ---

const MOCK_CONTACTS: Contact[] = [
  { 
    id: '1', name: 'Alice Johnson', avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&auto=format&fit=crop&q=60', 
    title: 'Director of Giving', company: 'TechFoundations', companyLogo: 'TF',
    email: 'alice@techfoundations.org', phone: '+1 555-0101', value: 50000, stage: 'Proposal', owner: 'Me', lastActivity: '2 hours ago', tags: ['High Value'], city: 'San Francisco' 
  },
  { 
    id: '2', name: 'Bob Smith', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60',
    title: 'CEO', company: 'Global Ventures', companyLogo: 'GV',
    email: 'bob@globalventures.com', phone: '+1 555-0102', value: 12000, stage: 'Meeting', owner: 'Sarah', lastActivity: '1 day ago', tags: ['Corporate'], city: 'New York' 
  },
  { 
    id: '3', name: 'Charlie Davis', title: 'Philanthropy Manager', company: 'Blue Sky Fund', companyLogo: 'BS',
    email: 'charlie@bluesky.org', phone: '+1 555-0103', value: 5000, stage: 'Contacted', owner: 'Me', lastActivity: '3 days ago', tags: [], city: 'Austin' 
  },
  { 
    id: '4', name: 'Diana Evans', avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=60',
    title: 'Trustee', company: 'The Evans Trust', companyLogo: 'ET',
    email: 'diana@evans.org', phone: '+1 555-0104', value: 150000, stage: 'New', owner: 'Mike', lastActivity: '1 week ago', tags: ['VIP', 'Referral'], city: 'London' 
  },
  { 
    id: '5', name: 'Evan Wright', title: 'Individual Donor', company: 'Freelance', companyLogo: 'EW',
    email: 'evan@wright.com', phone: '+1 555-0105', value: 2500, stage: 'Won', owner: 'Me', lastActivity: '2 weeks ago', tags: ['Recurring'], city: 'Seattle' 
  },
  { 
    id: '6', name: 'Fiona Green', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=100&auto=format&fit=crop&q=60',
    title: 'VP of CSR', company: 'Green Energy Co', companyLogo: 'GE',
    email: 'fiona@greenenergy.com', phone: '+1 555-0106', value: 75000, stage: 'Proposal', owner: 'Sarah', lastActivity: '5 hours ago', tags: ['Corporate', 'Sustainability'], city: 'Denver' 
  },
];

// --- Sub-Components ---

const KanbanColumn = ({ stage, contacts, onSelect }: { stage: Stage; contacts: Contact[]; onSelect: (c: Contact) => void }) => {
  const totalValue = contacts.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="flex-shrink-0 w-80 flex flex-col h-full bg-slate-50/50 rounded-xl border border-slate-200/50 overflow-hidden">
      <div className="p-3 bg-slate-100/50 border-b border-slate-200/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Badge variant="secondary" className={cn("px-2 py-0.5 text-xs font-bold uppercase tracking-wider rounded-sm", STAGE_COLORS[stage])}>
            {stage}
          </Badge>
          <span className="text-xs text-slate-400 font-medium">{contacts.length}</span>
        </div>
        <span className="text-xs font-medium text-slate-500">{formatCurrency(totalValue)}</span>
      </div>
      
      <div className="flex-1 overflow-y-auto p-2 space-y-2">
        {contacts.map(contact => (
          <motion.div 
            key={contact.id}
            layoutId={`card-${contact.id}`}
            onClick={() => onSelect(contact)}
            className="group bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer"
          >
            <div className="flex justify-between items-start mb-2">
              <span className="font-semibold text-slate-900 text-sm line-clamp-1">{contact.name}</span>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                <MoreHorizontal className="h-4 w-4 text-slate-400 hover:text-slate-600" />
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-3">
              <div className="h-5 w-5 rounded bg-slate-100 flex items-center justify-center text-[9px] font-bold text-slate-500 border border-slate-200">
                {contact.companyLogo}
              </div>
              <span className="text-xs text-slate-500 truncate">{contact.company}</span>
            </div>

            <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-50">
              <span className="text-xs font-medium text-slate-900">{formatCurrency(contact.value)}</span>
              <Avatar className="h-5 w-5 border border-white shadow-sm">
                <AvatarImage src={contact.avatar} />
                <AvatarFallback className="text-[8px]">{contact.name[0]}</AvatarFallback>
              </Avatar>
            </div>
          </motion.div>
        ))}
        <Button variant="ghost" className="w-full text-xs text-slate-400 hover:text-slate-600 hover:bg-slate-100 h-8 border border-dashed border-slate-200">
          <Plus className="h-3 w-3 mr-1" /> New Deal
        </Button>
      </div>
    </div>
  );
};

const TableView = ({ contacts, onSelect }: { contacts: Contact[], onSelect: (c: Contact) => void }) => {
  return (
    <div className="w-full h-full flex flex-col bg-white rounded-lg border border-slate-200 shadow-sm overflow-hidden">
      <div className="overflow-x-auto flex-1">
        <div className="min-w-[1000px] divide-y divide-slate-100">
          {/* Header */}
          <div className="flex bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wide sticky top-0 z-10 backdrop-blur-sm">
            <div className="w-12 p-3 flex items-center justify-center border-r border-slate-100 shrink-0">
                <input type="checkbox" className="rounded border-slate-300" />
            </div>
            <div className="flex-1 p-3 border-r border-slate-100 flex items-center gap-2 cursor-pointer hover:bg-slate-100 transition-colors group min-w-[200px]">
              Name <ArrowUpDown className="h-3 w-3 opacity-0 group-hover:opacity-50" />
            </div>
            <div className="w-48 p-3 border-r border-slate-100 flex items-center gap-2 shrink-0">Company</div>
            <div className="w-32 p-3 border-r border-slate-100 flex items-center gap-2 shrink-0">Stage</div>
            <div className="w-32 p-3 border-r border-slate-100 flex items-center gap-2 justify-end shrink-0">Value</div>
            <div className="w-40 p-3 border-r border-slate-100 flex items-center gap-2 shrink-0">City</div>
            <div className="w-48 p-3 border-r border-slate-100 flex items-center gap-2 shrink-0">Email</div>
            <div className="w-24 p-3 flex items-center gap-2 shrink-0">Owner</div>
          </div>

          {/* Rows */}
          <div className="bg-white">
            {contacts.map(contact => (
              <div 
                key={contact.id} 
                onClick={() => onSelect(contact)}
                className="flex items-center hover:bg-blue-50/30 transition-colors group cursor-pointer text-sm h-12 border-b border-slate-100 last:border-0"
              >
                <div className="w-12 p-3 flex items-center justify-center border-r border-transparent group-hover:border-slate-100 shrink-0">
                  <input type="checkbox" className="rounded border-slate-300 opacity-0 group-hover:opacity-100 transition-opacity" onClick={e => e.stopPropagation()} />
                </div>
                
                <div className="flex-1 p-3 border-r border-transparent group-hover:border-slate-100 flex items-center gap-3 overflow-hidden min-w-[200px]">
                  <Avatar className="h-6 w-6">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600">{contact.name[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-slate-900 truncate">{contact.name}</span>
                </div>

                <div className="w-48 p-3 border-r border-transparent group-hover:border-slate-100 flex items-center gap-2 overflow-hidden shrink-0">
                  <div className="h-5 w-5 rounded bg-slate-50 flex items-center justify-center text-[8px] font-bold text-slate-500 border border-slate-200 shrink-0">
                    {contact.companyLogo}
                  </div>
                  <span className="text-slate-600 truncate">{contact.company}</span>
                </div>

                <div className="w-32 p-3 border-r border-transparent group-hover:border-slate-100 flex items-center shrink-0">
                  <Badge variant="outline" className={cn("h-5 text-[10px] font-medium border px-1.5", STAGE_COLORS[contact.stage])}>
                    {contact.stage}
                  </Badge>
                </div>

                <div className="w-32 p-3 border-r border-transparent group-hover:border-slate-100 flex items-center justify-end text-slate-900 font-medium shrink-0">
                  {formatCurrency(contact.value)}
                </div>

                <div className="w-40 p-3 border-r border-transparent group-hover:border-slate-100 flex items-center text-slate-600 truncate shrink-0">
                  {contact.city}
                </div>

                <div className="w-48 p-3 border-r border-transparent group-hover:border-slate-100 flex items-center text-slate-500 truncate text-xs font-mono shrink-0">
                  {contact.email}
                </div>

                <div className="w-24 p-3 flex items-center shrink-0">
                  <Avatar className="h-5 w-5 mr-2">
                    <AvatarFallback className="text-[9px] bg-indigo-100 text-indigo-700">{contact.owner[0]}</AvatarFallback>
                  </Avatar>
                  <span className="text-xs text-slate-600">{contact.owner}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Footer */}
      <div className="border-t border-slate-200 p-2 flex items-center justify-between bg-slate-50/50 text-xs text-slate-500 shrink-0">
        <div className="px-2 font-medium">{contacts.length} records</div>
        <div className="flex gap-1">
           <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><ChevronRight className="h-4 w-4 rotate-180" /></Button>
           <Button variant="ghost" size="sm" className="h-7 w-7 p-0"><ChevronRight className="h-4 w-4" /></Button>
        </div>
      </div>
    </div>
  );
};

const DetailDrawer = ({ contact, onClose }: { contact: Contact, onClose: () => void }) => {
  return (
    <Sheet open={!!contact} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-xl p-0 gap-0 border-l border-slate-200 bg-slate-50 shadow-2xl overflow-hidden flex flex-col h-full">
        
        <SheetHeader className="sr-only">
            <SheetTitle>Contact Details: {contact.name}</SheetTitle>
            <SheetDescription>Detailed view of contact information and activity timeline.</SheetDescription>
        </SheetHeader>

        {/* Detail Header */}
        <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-10">
           <div className="flex items-center gap-2 text-sm text-slate-500">
              <User className="h-4 w-4" />
              <span>Person</span>
              <ChevronRight className="h-3 w-3 text-slate-300" />
              <span className="font-semibold text-slate-900">{contact.name}</span>
           </div>
           <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700">
                 <ArrowUpRight className="h-4 w-4" />
              </Button>
              <div className="h-4 w-px bg-slate-200 mx-1" />
              <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 text-slate-400 hover:text-slate-700">
                 <X className="h-4 w-4" />
              </Button>
           </div>
        </div>

        <div className="flex-1 flex overflow-hidden">
           
           {/* Left Properties Column */}
           <div className="w-1/2 border-r border-slate-200 overflow-y-auto bg-white p-6 space-y-8">
              
              {/* Identity */}
              <div className="flex items-start gap-4">
                 <Avatar className="h-16 w-16 border border-slate-100 shadow-sm">
                    <AvatarImage src={contact.avatar} />
                    <AvatarFallback className="bg-slate-100 text-slate-500 text-xl font-bold">{contact.name[0]}</AvatarFallback>
                 </Avatar>
                 <div className="space-y-1 pt-1">
                    <h2 className="text-xl font-bold text-slate-900 leading-tight">{contact.name}</h2>
                    <p className="text-sm text-slate-500">{contact.title} at <span className="text-slate-900 font-medium">{contact.company}</span></p>
                    <div className="flex gap-2 pt-1">
                       <button className="p-1.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-blue-600 transition-colors">
                          <Mail className="h-3.5 w-3.5" />
                       </button>
                       <button className="p-1.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-emerald-600 transition-colors">
                          <Phone className="h-3.5 w-3.5" />
                       </button>
                       <button className="p-1.5 rounded border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-sky-600 transition-colors">
                          <ArrowUpRight className="h-3.5 w-3.5" />
                       </button>
                    </div>
                 </div>
              </div>

              <Separator />

              {/* Properties Groups */}
              <div className="space-y-6">
                 
                 {/* Group 1: Deal Info */}
                 <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <LayoutGrid className="h-3 w-3" /> Deal Info
                    </h3>
                    <div className="grid gap-4">
                       <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Stage</label>
                          <div className="flex">
                             <Badge variant="secondary" className={cn("rounded px-2 font-medium border", STAGE_COLORS[contact.stage])}>
                                {contact.stage}
                             </Badge>
                          </div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Value</label>
                          <Input className="h-8 bg-slate-50 border-transparent hover:bg-white hover:border-slate-200 transition-all font-mono text-sm" value={formatCurrency(contact.value)} readOnly />
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Owner</label>
                          <div className="flex items-center gap-2 h-8 px-2 rounded bg-slate-50 text-sm text-slate-700">
                             <Avatar className="h-4 w-4">
                                <AvatarFallback className="text-[8px] bg-slate-200">ME</AvatarFallback>
                             </Avatar>
                             {contact.owner}
                          </div>
                       </div>
                    </div>
                 </div>

                 {/* Group 2: Contact */}
                 <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <User className="h-3 w-3" /> Contact
                    </h3>
                    <div className="grid gap-3">
                       <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Email</label>
                          <div className="text-sm font-medium text-slate-900 truncate hover:text-blue-600 cursor-pointer">{contact.email}</div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">Phone</label>
                          <div className="text-sm font-medium text-slate-900">{contact.phone}</div>
                       </div>
                       <div className="space-y-1">
                          <label className="text-[10px] uppercase font-bold text-slate-400">City</label>
                          <div className="text-sm font-medium text-slate-900">{contact.city}</div>
                       </div>
                    </div>
                 </div>

                 {/* Group 3: Tags */}
                 <div className="space-y-3">
                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest flex items-center gap-2">
                       <Tag className="h-3 w-3" /> Tags
                    </h3>
                    <div className="flex flex-wrap gap-2">
                       {contact.tags.map(tag => (
                          <span key={tag} className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded border border-slate-200 font-medium">
                             {tag}
                          </span>
                       ))}
                       <button className="text-xs bg-white text-slate-400 border border-dashed border-slate-300 px-2 py-1 rounded hover:text-slate-600 hover:border-slate-400">
                          + Add
                       </button>
                    </div>
                 </div>

              </div>
           </div>

           {/* Right Timeline/Activity Column */}
           <div className="w-1/2 bg-slate-50 flex flex-col">
              {/* Activity Composer */}
              <div className="p-4 border-b border-slate-200 bg-white shadow-sm z-10">
                 <div className="flex gap-2 mb-3">
                    <button className="text-xs font-bold text-slate-900 border-b-2 border-slate-900 pb-1">Activity</button>
                    <button className="text-xs font-bold text-slate-400 pb-1 hover:text-slate-600">Emails</button>
                    <button className="text-xs font-bold text-slate-400 pb-1 hover:text-slate-600">Tasks</button>
                 </div>
                 <div className="relative">
                    <textarea 
                       placeholder="Log a note, call, or meeting..." 
                       className="w-full h-24 bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm resize-none focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all outline-none"
                    />
                    <div className="absolute bottom-2 right-2 flex gap-2">
                       <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-slate-600">
                          <Paperclip className="h-3 w-3" />
                       </Button>
                       <Button size="sm" className="h-7 px-3 bg-slate-900 text-white text-xs">Save</Button>
                    </div>
                 </div>
              </div>

              {/* Timeline Feed */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                 
                 {/* Timeline Item 1 */}
                 <div className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                       <div className="h-8 w-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center border border-blue-200 z-10">
                          <MessageSquare className="h-4 w-4" />
                       </div>
                       <div className="w-px h-full bg-slate-200 -mt-2 -mb-6 group-last:hidden" />
                    </div>
                    <div className="pb-6">
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-900">Meeting Notes</span>
                          <span className="text-xs text-slate-400">2 hours ago</span>
                       </div>
                       <p className="text-sm text-slate-600 leading-relaxed bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                          Discussed the Q4 Gala sponsorship. Alice is interested but needs to confirm budget with the board next week.
                       </p>
                    </div>
                 </div>

                 {/* Timeline Item 2 */}
                 <div className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                       <div className="h-8 w-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center border border-purple-200 z-10">
                          <LayoutGrid className="h-4 w-4" />
                       </div>
                       <div className="w-px h-full bg-slate-200 -mt-2 -mb-6 group-last:hidden" />
                    </div>
                    <div className="pb-6">
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-900">Stage Changed</span>
                          <span className="text-xs text-slate-400">1 day ago</span>
                       </div>
                       <div className="flex items-center gap-2 text-sm text-slate-600">
                          Moved from <Badge variant="secondary" className="px-1 py-0 text-[10px]">Meeting</Badge> to <Badge variant="secondary" className="px-1 py-0 text-[10px] bg-purple-100 text-purple-700">Proposal</Badge>
                       </div>
                    </div>
                 </div>

                 {/* Timeline Item 3 */}
                 <div className="flex gap-4 group">
                    <div className="flex flex-col items-center">
                       <div className="h-8 w-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center border border-slate-200 z-10">
                          <User className="h-4 w-4" />
                       </div>
                    </div>
                    <div className="pb-2">
                       <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold text-slate-900">Created</span>
                          <span className="text-xs text-slate-400">3 weeks ago</span>
                       </div>
                       <p className="text-sm text-slate-500">Contact imported from web form.</p>
                    </div>
                 </div>

              </div>
           </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

// --- Main CRM Page ---

export const CRM = () => {
  const [view, setView] = useState<'table' | 'kanban'>('table');
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredContacts = useMemo(() => {
    return MOCK_CONTACTS.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
      c.company.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-4 md:-m-8 flex-col bg-slate-50 font-sans overflow-hidden">
      
      {/* Header */}
      <header className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-20 shadow-[0_1px_2px_rgba(0,0,0,0.03)]">
        
        {/* Left: Breadcrumb / View Picker */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
            <div className="p-1.5 rounded-md bg-rose-50 text-rose-600 border border-rose-100">
              <User className="h-4 w-4" />
            </div>
            <span>People</span>
            <span className="text-slate-300 font-light">|</span>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 hover:bg-slate-100 px-2 py-1 rounded transition-colors">
                  <span>All People</span>
                  <ChevronRight className="h-3 w-3 rotate-90 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Views</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>All People</DropdownMenuItem>
                <DropdownMenuItem>My Leads</DropdownMenuItem>
                <DropdownMenuItem>High Value Donors</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Center: Search Bar */}
        <div className="flex-1 max-w-lg px-8 hidden md:block">
          <div className="relative group">
            <Search className="absolute left-2.5 top-1.5 h-4 w-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-8 pl-9 pr-4 bg-slate-100 border-transparent rounded-md text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all outline-none placeholder:text-slate-400"
            />
            <div className="absolute right-2 top-1.5 flex gap-1">
                <kbd className="hidden sm:inline-block border border-slate-200 rounded px-1.5 text-[9px] font-bold text-slate-400 bg-white">⌘K</kbd>
            </div>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* View Toggle */}
          <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button 
              onClick={() => setView('table')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                view === 'table' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <List className="h-4 w-4" />
            </button>
            <button 
              onClick={() => setView('kanban')}
              className={cn(
                "p-1.5 rounded-md transition-all",
                view === 'kanban' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700"
              )}
            >
              <Columns className="h-4 w-4" />
            </button>
          </div>

          <div className="h-6 w-px bg-slate-200 mx-1" />

          <Button variant="outline" size="sm" className="h-8 bg-white text-slate-600 border-slate-200 shadow-sm hidden sm:flex">
            <Filter className="h-3.5 w-3.5 mr-2" /> Filter
          </Button>
          <Button variant="outline" size="sm" className="h-8 bg-white text-slate-600 border-slate-200 shadow-sm hidden sm:flex">
            <ArrowUpDown className="h-3.5 w-3.5 mr-2" /> Sort
          </Button>
          <Button size="sm" className="h-8 bg-slate-900 text-white shadow-md hover:bg-slate-800">
            <Plus className="h-3.5 w-3.5 mr-1.5" /> New Person
          </Button>
        </div>
      </header>

      {/* 2. Main Workspace */}
      <div className="flex-1 overflow-hidden p-0 relative">
        {view === 'table' ? (
          <div className="h-full p-4 md:p-6">
             <TableView contacts={filteredContacts} onSelect={setSelectedContact} />
          </div>
        ) : (
          <div className="h-full overflow-x-auto overflow-y-hidden">
            <div className="h-full flex p-4 md:p-6 gap-4 min-w-max">
              {STAGES.map(stage => (
                <React.Fragment key={stage}>
                  <KanbanColumn 
                    stage={stage} 
                    contacts={filteredContacts.filter(c => c.stage === stage)} 
                    onSelect={setSelectedContact}
                  />
                </React.Fragment>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Detail View Drawer */}
      {selectedContact && (
        <DetailDrawer 
          contact={selectedContact} 
          onClose={() => setSelectedContact(null)} 
        />
      )}

    </div>
  );
};
