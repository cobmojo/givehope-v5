
import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, MapPin, Users, DollarSign, 
  Plus, Search, Filter, MoreHorizontal, ChevronRight, 
  Clock, CheckCircle2, QrCode, Printer, X, Layout, 
  FileText, Settings, ArrowLeft, Mic2, List, Grid,
  CreditCard, ExternalLink, Download, BarChart3, ScanLine,
  TrendingUp, Mail, Save, UserPlus, Trash2, Linkedin, Twitter, Globe,
  Image as ImageIcon, Upload, AtSign, Briefcase, User, Check,
  GripVertical, FileInput, ListOrdered, ToggleLeft, Layers,
  AlertCircle, Eye, Copy, ArrowDown, Type, Plane, Database,
  Lock, Shield, RotateCcw, Code, Palette, Terminal, Megaphone, Webhook, Key,
  MousePointerClick, Ticket, AlignLeft, CheckSquare, Radio
} from 'lucide-react';
import { motion, AnimatePresence, Reorder, useDragControls } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/Tabs';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar';
import { ScrollArea } from '../../components/ui/ScrollArea';
import { Switch } from '../../components/ui/Switch';
import { Label } from '../../components/ui/Label';
import { Progress } from '../../components/ui/Progress';
import { Textarea } from '../../components/ui/Textarea';
import { Select } from '../../components/ui/Select';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { Separator } from '../../components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '../../components/ui/DropdownMenu';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from '../../components/ui/Dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter
} from '../../components/ui/sheet';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { formatCurrency, cn, getInitials } from '../../lib/utils';

// --- Types & Mock Data ---

type EventStatus = 'Draft' | 'Published' | 'Live' | 'Completed';
type SpeakerStatus = 'Confirmed' | 'Invited' | 'Pending' | 'Declined';

interface ConferenceEvent {
  id: string;
  name: string;
  slug: string;
  description?: string;
  startDate: string;
  endDate: string;
  startTime?: string;
  location: string;
  status: EventStatus;
  registrants: number;
  capacity: number;
  revenue: number;
  image: string;
  fundCode: string;
  goalRevenue?: number;
  speakers?: string[];
}

interface Speaker {
  id: string;
  eventId: string;
  firstName: string;
  lastName: string;
  email: string;
  jobTitle: string;
  company: string;
  bio: string;
  avatar: string;
  status: SpeakerStatus;
  linkedin?: string;
  twitter?: string;
  website?: string;
  sessions?: string[]; // IDs of sessions
}

interface Attendee {
  id: string;
  name: string;
  email: string;
  ticketType: string;
  status: 'Registered' | 'Checked In' | 'Cancelled';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded';
  checkInTime?: string;
  organization?: string;
}

interface Session {
  id: string;
  title: string;
  time: string;
  duration: string;
  location: string;
  speaker: string;
  track: string;
}

// --- Form Builder Types ---

type FormFieldType = 'text' | 'email' | 'date' | 'select' | 'radio' | 'checkbox' | 'file' | 'textarea' | 'ranking' | 'repeater';

interface FormField {
  id: string;
  type: FormFieldType;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: string[]; // For select, radio, ranking
  crmField?: string; // CRM mapping key
  helpText?: string;
  subFields?: FormField[]; // For repeater groups
}

const DEFAULT_FORM_FIELDS: FormField[] = [
  { id: 'f1', type: 'text', label: 'First Name', required: true, crmField: 'contact.firstName' },
  { id: 'f2', type: 'text', label: 'Last Name', required: true, crmField: 'contact.lastName' },
  { id: 'f3', type: 'email', label: 'Email Address', required: true, crmField: 'contact.email' },
  { id: 'f4', type: 'date', label: 'Date of Birth', required: true, crmField: 'contact.dob' },
  { id: 'f5', type: 'textarea', label: 'Food Allergies or Dietary Restrictions', required: false, crmField: 'attendee.dietary' },
  { id: 'f6', type: 'file', label: 'Upload Passport Photo', required: true, helpText: 'Upload 1 supported file: PDF, document, or image. Max 100 MB.', crmField: 'attendee.documents.passport' },
  { 
    id: 'f7', type: 'select', label: 'T-Shirt Size', required: true, 
    options: ['XS', 'S', 'M', 'L', 'XL', 'XXL'], 
    crmField: 'attendee.swag.shirtSize' 
  },
  {
    id: 'f8', type: 'ranking', label: 'Rank activities in order of preference', required: true,
    options: ['Hike', 'Coffee Tasting', 'Elephant Sanctuary', 'Spa', 'Creative Workshop'],
    crmField: 'attendee.preferences.activities'
  },
  {
    id: 'f9', type: 'repeater', label: 'Child Registration', required: false,
    helpText: 'Please complete for each minor attending.',
    subFields: [
       { id: 'c1', type: 'text', label: 'Child First Name', required: true },
       { id: 'c2', type: 'text', label: 'Child Last Name', required: true },
       { id: 'c3', type: 'date', label: 'Date of Birth', required: true },
    ]
  }
];

const INITIAL_EVENTS: ConferenceEvent[] = [
  {
    id: 'evt-1',
    name: 'Global Impact Conference 2025',
    slug: 'global-impact-2025',
    startDate: '2025-10-15',
    endDate: '2025-10-17',
    location: 'Denver Convention Center, CO',
    status: 'Published',
    registrants: 450,
    capacity: 1200,
    revenue: 112500,
    image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=2000',
    fundCode: 'CONF-25',
  },
  {
    id: 'evt-2',
    name: 'Field Partners Retreat',
    slug: 'partners-retreat-2025',
    startDate: '2025-11-10',
    endDate: '2025-11-12',
    location: 'Chiang Mai, Thailand',
    status: 'Draft',
    registrants: 0,
    capacity: 50,
    revenue: 0,
    image: 'https://images.unsplash.com/photo-1528181304800-259b08848526?auto=format&fit=crop&q=80&w=2000',
    fundCode: 'RETREAT-25'
  },
  {
    id: 'evt-3',
    name: 'Donor Gala: Night of Hope',
    slug: 'gala-2025',
    startDate: '2025-12-05',
    endDate: '2025-12-05',
    location: 'The Grand Hall, NYC',
    status: 'Live',
    registrants: 280,
    capacity: 300,
    revenue: 140000,
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&q=80&w=2000',
    fundCode: 'GALA-25'
  }
];

const MOCK_SPEAKERS: Speaker[] = [
  {
    id: 'spk-1',
    eventId: 'evt-1',
    firstName: 'Elena',
    lastName: 'Rostova',
    email: 'elena.r@givehope.org',
    jobTitle: 'Executive Director',
    company: 'GiveHope',
    bio: '<p>Dr. Elena Rostova has over 20 years of experience in international humanitarian aid.</p>',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200',
    status: 'Confirmed',
    linkedin: 'linkedin.com/in/elena',
    sessions: ['sess-1']
  },
  {
    id: 'spk-2',
    eventId: 'evt-1',
    firstName: 'David',
    lastName: 'Kim',
    email: 'david.kim@agritech.io',
    jobTitle: 'Founder & CEO',
    company: 'AgriTech Solutions',
    bio: '<p>David pioneers sustainable farming technologies for developing nations.</p>',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200',
    status: 'Confirmed',
    twitter: '@davidkim',
    sessions: ['sess-2']
  },
  {
    id: 'spk-3',
    eventId: 'evt-1',
    firstName: 'Sarah',
    lastName: 'Jenkins',
    email: 'sarah.j@techforgood.org',
    jobTitle: 'CTO',
    company: 'Tech For Good',
    bio: '<p>Sarah leads digital transformation initiatives for nonprofits worldwide.</p>',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=200',
    status: 'Invited',
    sessions: ['sess-3']
  }
];

const MOCK_ATTENDEES: Attendee[] = [
  { id: 'att-1', name: 'Alice Johnson', email: 'alice@example.com', ticketType: 'General Admission', status: 'Registered', paymentStatus: 'Paid', organization: 'First Baptist' },
  { id: 'att-2', name: 'Bob Smith', email: 'bob@example.com', ticketType: 'VIP', status: 'Checked In', paymentStatus: 'Paid', checkInTime: '08:45 AM', organization: 'Grace Community' },
  { id: 'att-3', name: 'Charlie Davis', email: 'charlie@example.com', ticketType: 'General Admission', status: 'Cancelled', paymentStatus: 'Refunded' },
  { id: 'att-4', name: 'Diana Evans', email: 'diana@example.com', ticketType: 'Speaker', status: 'Registered', paymentStatus: 'Paid', organization: 'GiveHope HQ' },
  { id: 'att-5', name: 'Evan Wright', email: 'evan@example.com', ticketType: 'Volunteer', status: 'Checked In', paymentStatus: 'Paid', checkInTime: '07:30 AM' },
];

const MOCK_SESSIONS: Session[] = [
  { id: 'sess-1', title: 'Opening Keynote: The Future of Aid', time: '09:00 AM', duration: '90m', location: 'Main Auditorium', speaker: 'Dr. Elena Rostova', track: 'General' },
  { id: 'sess-2', title: 'Sustainable Agriculture Workshop', time: '11:00 AM', duration: '60m', location: 'Room B', speaker: 'David Kim', track: 'Workshops' },
  { id: 'sess-3', title: 'Technology in the Field', time: '11:00 AM', duration: '60m', location: 'Room C', speaker: 'Sarah Jenkins', track: 'Tech' },
  { id: 'sess-4', title: 'Networking Lunch', time: '12:30 PM', duration: '90m', location: 'Dining Hall', speaker: '-', track: 'Social' },
];

// --- Helper Functions ---

const formatDateRange = (start: string, end: string) => {
  const s = new Date(start);
  const e = new Date(end);
  if (s.toDateString() === e.toDateString()) {
    return s.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  return `${s.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${e.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
};

const getStatusColor = (status: SpeakerStatus) => {
  switch (status) {
    case 'Confirmed': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    case 'Invited': return 'bg-blue-50 text-blue-700 border-blue-200';
    case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
    case 'Declined': return 'bg-red-50 text-red-700 border-red-200';
    default: return 'bg-slate-100 text-slate-700';
  }
};

// --- Sub-Components ---

const EventCard: React.FC<{ event: ConferenceEvent, onClick: () => void }> = ({ event, onClick }) => {
  return (
    <Card className="overflow-hidden cursor-pointer group hover:shadow-md transition-all duration-300 border-slate-200" onClick={onClick}>
      <div className="h-40 bg-slate-100 relative overflow-hidden">
        <img src={event.image} alt={event.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
        <div className="absolute top-4 right-4">
          <Badge variant="secondary" className="bg-white/90 backdrop-blur-sm shadow-sm">{event.status}</Badge>
        </div>
      </div>
      <CardContent className="p-5">
        <h3 className="font-bold text-lg text-slate-900 mb-1 line-clamp-1">{event.name}</h3>
        <p className="text-xs text-slate-500 flex items-center gap-1.5 mb-4">
          <CalendarIcon className="h-3.5 w-3.5" />
          {formatDateRange(event.startDate, event.endDate)}
        </p>
        
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Registrants</p>
            <p className="text-sm font-semibold text-slate-700 mt-0.5">{event.registrants} / {event.capacity}</p>
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue</p>
            <p className="text-sm font-semibold text-emerald-600 mt-0.5">{formatCurrency(event.revenue)}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SpeakerCard: React.FC<{ speaker: Speaker, onEdit: (s: Speaker) => void }> = ({ speaker, onEdit }) => (
  <Card className="overflow-hidden group hover:shadow-md transition-all border-slate-200">
    <CardContent className="p-5">
      <div className="flex items-start justify-between mb-4">
        <Avatar className="h-14 w-14 border border-slate-100">
          <AvatarImage src={speaker.avatar} />
          <AvatarFallback>{speaker.firstName[0]}{speaker.lastName[0]}</AvatarFallback>
        </Avatar>
        <Badge variant="outline" className={cn("text-[10px]", getStatusColor(speaker.status))}>
          {speaker.status}
        </Badge>
      </div>
      
      <div className="space-y-1 mb-4">
        <h3 className="font-bold text-slate-900">{speaker.firstName} {speaker.lastName}</h3>
        <p className="text-xs text-slate-500 line-clamp-1">{speaker.jobTitle}, {speaker.company}</p>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="flex gap-2">
          {speaker.linkedin && <Linkedin className="h-4 w-4 text-slate-400 hover:text-[#0077b5] cursor-pointer transition-colors" />}
          {speaker.twitter && <Twitter className="h-4 w-4 text-slate-400 hover:text-[#1da1f2] cursor-pointer transition-colors" />}
        </div>
        <Button variant="ghost" size="sm" onClick={() => onEdit(speaker)} className="h-8 text-xs">Edit Profile</Button>
      </div>
    </CardContent>
  </Card>
);

const CheckInKiosk = ({ onClose }: { onClose: () => void }) => (
  <div className="fixed inset-0 bg-slate-950 z-50 flex flex-col items-center justify-center p-4">
    <Button variant="ghost" className="absolute top-4 right-4 text-white/50 hover:text-white" onClick={onClose}>
      <X className="h-6 w-6" />
    </Button>
    <div className="w-full max-w-md bg-white rounded-3xl p-8 shadow-2xl text-center space-y-8">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-slate-900">Self Check-In</h2>
        <p className="text-slate-500">Scan your QR code or search by name.</p>
      </div>
      
      <div className="aspect-square bg-slate-100 rounded-2xl border-2 border-dashed border-slate-300 flex items-center justify-center flex-col gap-4">
        <QrCode className="h-16 w-16 text-slate-300" />
        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Camera Active</span>
      </div>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-slate-200" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-white px-2 text-slate-500">Or search manually</span>
        </div>
      </div>

      <div className="flex gap-2">
        <Input placeholder="Last Name or Email" className="h-12 text-lg" />
        <Button size="icon" className="h-12 w-12 bg-blue-600 hover:bg-blue-700">
          <Search className="h-5 w-5" />
        </Button>
      </div>
    </div>
  </div>
);

// --- Form Builder Components ---

const DraggableFieldItem: React.FC<{ field: FormField, isSelected: boolean, onClick: () => void, onRemove: () => void }> = ({ field, isSelected, onClick, onRemove }) => {
  const dragControls = useDragControls();
  
  return (
    <Reorder.Item
      value={field}
      id={field.id}
      dragListener={false}
      dragControls={dragControls}
      onClick={onClick}
      className={cn(
        "bg-white p-4 rounded-xl border-2 transition-all relative group shadow-sm flex items-start gap-3",
        isSelected 
          ? "border-blue-500 shadow-md ring-4 ring-blue-500/10 z-10" 
          : "border-transparent hover:border-slate-200"
      )}
    >
      <div 
        className="mt-1 text-slate-300 cursor-grab active:cursor-grabbing hover:text-slate-500 transition-colors"
        onPointerDown={(e) => dragControls.start(e)}
      >
        <GripVertical className="h-5 w-5" />
      </div>
      
      <div className="flex-1 space-y-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-slate-900 text-sm">{field.label}</span>
          {field.required && <span className="text-red-500 text-xs">*</span>}
          {field.crmField && (
            <Badge variant="secondary" className="h-4 px-1 text-[9px] bg-indigo-50 text-indigo-600 border-indigo-100 gap-1">
              <Database className="h-2 w-2" /> CRM
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
           <span className="text-[10px] text-slate-400 font-mono capitalize bg-slate-50 inline-block px-1.5 py-0.5 rounded border border-slate-100">
             {field.type}
           </span>
           {field.options && <span className="text-[10px] text-slate-400">{field.options.length} options</span>}
           {field.subFields && <span className="text-[10px] text-slate-400">{field.subFields.length} sub-fields</span>}
        </div>
      </div>

      <Button 
        variant="ghost" 
        size="icon" 
        className="h-8 w-8 text-slate-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={(e) => { e.stopPropagation(); onRemove(); }}
      >
        <Trash2 className="h-4 w-4" />
      </Button>
    </Reorder.Item>
  );
};

const FormPreview = ({ fields }: { fields: FormField[] }) => {
  return (
    <div className="bg-white rounded-xl shadow-2xl border border-slate-200 max-w-2xl mx-auto my-10 overflow-hidden">
      <div className="bg-slate-50 border-b border-slate-100 p-8 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Event Registration</h2>
        <p className="text-slate-500 mt-2">Join us for an unforgettable experience.</p>
      </div>
      <div className="p-8 space-y-6">
        {fields.map(field => (
          <div key={field.id} className="space-y-2">
            <Label>
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </Label>
            
            {field.type === 'text' && <Input placeholder={field.placeholder} />}
            {field.type === 'email' && <Input type="email" placeholder={field.placeholder} />}
            {field.type === 'date' && <Input type="date" />}
            {field.type === 'textarea' && <Textarea placeholder={field.placeholder} />}
            
            {(field.type === 'select') && (
              <Select>
                <option value="">Select an option</option>
                {field.options?.map(opt => <option key={opt} value={opt}>{opt}</option>)}
              </Select>
            )}

            {field.type === 'radio' && (
              <div className="space-y-2">
                 {field.options?.map(opt => (
                    <div key={opt} className="flex items-center gap-2">
                       <input type="radio" name={field.id} id={`${field.id}-${opt}`} />
                       <label htmlFor={`${field.id}-${opt}`} className="text-sm text-slate-700">{opt}</label>
                    </div>
                 ))}
              </div>
            )}

            {field.type === 'checkbox' && (
               <div className="flex items-center gap-2">
                  <input type="checkbox" id={field.id} />
                  <label htmlFor={field.id} className="text-sm text-slate-700">{field.placeholder || "Yes, I agree"}</label>
               </div>
            )}

            {field.type === 'file' && (
              <div className="border-2 border-dashed border-slate-200 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer">
                <Upload className="mx-auto h-8 w-8 text-slate-400 mb-2" />
                <p className="text-sm text-slate-600">Click to upload or drag and drop</p>
                <p className="text-xs text-slate-400 mt-1">SVG, PNG, JPG or GIF (max. 3MB)</p>
              </div>
            )}

            {field.type === 'ranking' && (
              <div className="space-y-2">
                {field.options?.map((opt, i) => (
                  <div key={i} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                    <div className="h-6 w-6 rounded-full bg-slate-200 flex items-center justify-center text-xs font-bold text-slate-600">
                      {i + 1}
                    </div>
                    <span className="text-sm font-medium">{opt}</span>
                    <GripVertical className="ml-auto h-4 w-4 text-slate-400 cursor-move" />
                  </div>
                ))}
              </div>
            )}

            {field.type === 'repeater' && (
              <div className="space-y-4">
                <div className="p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm font-bold text-slate-700">Item #1</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0"><X className="h-3 w-3" /></Button>
                  </div>
                  <div className="grid gap-4">
                    {field.subFields?.map(sub => (
                      <div key={sub.id} className="space-y-1">
                        <Label className="text-xs">{sub.label}</Label>
                        {sub.type === 'date' ? <Input type="date" className="h-8" /> : <Input className="h-8" />}
                      </div>
                    ))}
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full border-dashed">
                  <Plus className="h-3 w-3 mr-2" /> Add Another
                </Button>
              </div>
            )}

            {field.helpText && <p className="text-[11px] text-slate-500">{field.helpText}</p>}
          </div>
        ))}
        <div className="pt-6">
          <Button className="w-full bg-slate-900 text-white font-bold h-12 text-lg">Complete Registration</Button>
        </div>
      </div>
    </div>
  );
};

const RegistrationFormBuilder = () => {
  const [fields, setFields] = useState<FormField[]>(DEFAULT_FORM_FIELDS);
  const [selectedFieldId, setSelectedFieldId] = useState<string | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);

  const selectedField = fields.find(f => f.id === selectedFieldId);

  const addField = (type: FormFieldType) => {
    const newField: FormField = {
      id: `f-${Date.now()}`,
      type,
      label: 'New Question',
      required: false,
      options: type === 'select' || type === 'ranking' || type === 'radio' ? ['Option 1', 'Option 2'] : undefined,
      subFields: type === 'repeater' ? [
         {id: `sub-${Date.now()}-1`, type: 'text', label: 'First Name', required: true},
         {id: `sub-${Date.now()}-2`, type: 'date', label: 'Date of Birth', required: true},
      ] : undefined
    };
    setFields([...fields, newField]);
    setSelectedFieldId(newField.id);
  };

  const addSmartBlock = (type: 'travel' | 'emergency' | 'address') => {
      let newFields: FormField[] = [];
      const baseId = Date.now();
      
      if (type === 'travel') {
          newFields = [
              { id: `t-${baseId}-1`, type: 'date', label: 'Arrival Date', required: true, crmField: 'travel.arrivalDate' },
              { id: `t-${baseId}-2`, type: 'text', label: 'Airline & Flight Number', required: true, crmField: 'travel.arrivalFlight' },
              { id: `t-${baseId}-3`, type: 'date', label: 'Departure Date', required: true, crmField: 'travel.departureDate' },
          ];
      } else if (type === 'emergency') {
          newFields = [
              { id: `e-${baseId}-1`, type: 'text', label: 'Emergency Contact Name', required: true, crmField: 'contact.emergencyName' },
              { id: `e-${baseId}-2`, type: 'text', label: 'Relationship', required: true, crmField: 'contact.emergencyRelation' },
              { id: `e-${baseId}-3`, type: 'text', label: 'Emergency Phone', required: true, crmField: 'contact.emergencyPhone' },
          ];
      } else if (type === 'address') {
           newFields = [
              { id: `a-${baseId}-1`, type: 'text', label: 'Street Address', required: true, crmField: 'contact.address.street' },
              { id: `a-${baseId}-2`, type: 'text', label: 'City', required: true, crmField: 'contact.address.city' },
              { id: `a-${baseId}-3`, type: 'text', label: 'Zip / Postal Code', required: true, crmField: 'contact.address.zip' },
              { id: `a-${baseId}-4`, type: 'text', label: 'Country', required: true, crmField: 'contact.address.country' },
          ];
      }
      
      setFields([...fields, ...newFields]);
      if(newFields.length > 0) setSelectedFieldId(newFields[0].id);
  };

  const updateField = (id: string, updates: Partial<FormField>) => {
    setFields(fields.map(f => f.id === id ? { ...f, ...updates } : f));
  };

  const removeField = (id: string) => {
    setFields(fields.filter(f => f.id !== id));
    if (selectedFieldId === id) setSelectedFieldId(null);
  };

  return (
    <div className="flex h-[calc(100vh-14rem)] bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
      
      {/* Sidebar: Toolbox */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col overflow-y-auto">
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Field Types</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { type: 'text', icon: Type, label: 'Text' },
              { type: 'email', icon: Mail, label: 'Email' },
              { type: 'date', icon: CalendarIcon, label: 'Date' },
              { type: 'select', icon: List, label: 'Select' },
              { type: 'radio', icon: Radio, label: 'Radio' },
              { type: 'checkbox', icon: CheckSquare, label: 'Check' },
              { type: 'file', icon: FileInput, label: 'Upload' },
              { type: 'ranking', icon: ListOrdered, label: 'Rank' },
              { type: 'repeater', icon: Users, label: 'Group' },
              { type: 'textarea', icon: FileText, label: 'Area' },
            ].map((item) => (
              <button 
                key={item.type}
                onClick={() => addField(item.type as FormFieldType)}
                className="flex flex-col items-center justify-center p-3 rounded-lg border border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all bg-slate-50 text-slate-600 hover:text-blue-700"
              >
                <item.icon className="h-5 w-5 mb-1.5" />
                <span className="text-[10px] font-bold">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
        <div className="p-4">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Smart Blocks</h3>
          <div className="space-y-2">
            <button onClick={() => addSmartBlock('travel')} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 rounded hover:bg-slate-100 border border-transparent hover:border-slate-200 flex items-center gap-2">
              <Plane className="h-3 w-3" /> Travel Info
            </button>
            <button onClick={() => addSmartBlock('emergency')} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 rounded hover:bg-slate-100 border border-transparent hover:border-slate-200 flex items-center gap-2">
              <AlertCircle className="h-3 w-3" /> Emergency Contact
            </button>
            <button onClick={() => addSmartBlock('address')} className="w-full text-left px-3 py-2 text-xs font-medium text-slate-600 bg-slate-50 rounded hover:bg-slate-100 border border-transparent hover:border-slate-200 flex items-center gap-2">
              <MapPin className="h-3 w-3" /> Address Block
            </button>
          </div>
        </div>
      </div>

      {/* Main Canvas */}
      <div className="flex-1 overflow-y-auto p-8 bg-slate-100/50 flex flex-col items-center">
        <div className="w-full max-w-2xl space-y-3">
          <Reorder.Group axis="y" values={fields} onReorder={setFields} className="space-y-3">
            <AnimatePresence>
              {fields.map((field) => (
                <DraggableFieldItem 
                   key={field.id} 
                   field={field} 
                   isSelected={selectedFieldId === field.id}
                   onClick={() => setSelectedFieldId(field.id)}
                   onRemove={() => removeField(field.id)}
                />
              ))}
            </AnimatePresence>
          </Reorder.Group>
          
          {fields.length === 0 && (
            <div className="text-center py-20 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl">
              <p>Drag or click fields from the sidebar to start building.</p>
            </div>
          )}
        </div>
      </div>

      {/* Right Sidebar: Properties */}
      <div className="w-80 bg-white border-l border-slate-200 flex flex-col">
        {selectedField ? (
          <>
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
              <h3 className="font-bold text-sm text-slate-900">Field Settings</h3>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setSelectedFieldId(null)}><X className="h-4 w-4" /></Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                
                <div className="space-y-3">
                  <Label>Label</Label>
                  <Input 
                    value={selectedField.label} 
                    onChange={(e) => updateField(selectedField.id, { label: e.target.value })} 
                  />
                </div>

                <div className="space-y-3">
                  <Label>Helper Text</Label>
                  <Input 
                    value={selectedField.helpText || ''} 
                    onChange={(e) => updateField(selectedField.id, { helpText: e.target.value })}
                    placeholder="Instructions for user..."
                  />
                </div>

                {['text', 'email', 'textarea'].includes(selectedField.type) && (
                   <div className="space-y-3">
                      <Label>Placeholder</Label>
                      <Input 
                         value={selectedField.placeholder || ''} 
                         onChange={(e) => updateField(selectedField.id, { placeholder: e.target.value })}
                         placeholder="Input placeholder..."
                      />
                   </div>
                )}

                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <Label className="cursor-pointer" htmlFor="req-switch">Required Field</Label>
                  <Switch 
                    id="req-switch"
                    checked={selectedField.required} 
                    onCheckedChange={(c) => updateField(selectedField.id, { required: c })}
                  />
                </div>

                {/* CRM Mapping */}
                <div className="space-y-3 pt-4 border-t border-slate-100">
                  <div className="flex items-center justify-between">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Data Binding</Label>
                    <Badge variant="outline" className="text-[10px]">Optional</Badge>
                  </div>
                  <Select 
                    value={selectedField.crmField || ''} 
                    onChange={(e) => updateField(selectedField.id, { crmField: e.target.value })}
                  >
                    <option value="">-- No Mapping --</option>
                    <option value="contact.firstName">Contact: First Name</option>
                    <option value="contact.lastName">Contact: Last Name</option>
                    <option value="contact.email">Contact: Email</option>
                    <option value="attendee.dietary">Attendee: Dietary Restrictions</option>
                    <option value="attendee.documents.passport">Document: Passport</option>
                  </Select>
                  <p className="text-[10px] text-slate-400">
                    Map this field to a CRM property to auto-sync data.
                  </p>
                </div>

                {/* Options Editor (for select/radio/ranking) */}
                {(selectedField.type === 'select' || selectedField.type === 'ranking' || selectedField.type === 'radio') && (
                  <div className="space-y-3 pt-4 border-t border-slate-100">
                    <Label className="text-xs font-bold text-slate-500 uppercase">Options</Label>
                    <div className="space-y-2">
                      {selectedField.options?.map((opt, idx) => (
                        <div key={idx} className="flex gap-2">
                          <Input 
                            value={opt} 
                            onChange={(e) => {
                              const newOpts = [...(selectedField.options || [])];
                              newOpts[idx] = e.target.value;
                              updateField(selectedField.id, { options: newOpts });
                            }} 
                            className="h-8 text-sm"
                          />
                          <Button 
                            variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500"
                            onClick={() => {
                              const newOpts = selectedField.options?.filter((_, i) => i !== idx);
                              updateField(selectedField.id, { options: newOpts });
                            }}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ))}
                      <Button 
                        variant="outline" size="sm" className="w-full text-xs h-8"
                        onClick={() => updateField(selectedField.id, { options: [...(selectedField.options || []), `Option ${(selectedField.options?.length || 0) + 1}`] })}
                      >
                        <Plus className="h-3 w-3 mr-1" /> Add Option
                      </Button>
                    </div>
                  </div>
                )}
                
                {/* Repeater Sub-Fields */}
                {selectedField.type === 'repeater' && (
                   <div className="space-y-3 pt-4 border-t border-slate-100">
                      <Label className="text-xs font-bold text-slate-500 uppercase">Sub Fields</Label>
                      <div className="space-y-2">
                         {selectedField.subFields?.map((sub, idx) => (
                            <div key={sub.id} className="p-2 border rounded bg-slate-50 text-sm">
                               <div className="flex justify-between items-center mb-1">
                                  <span className="font-semibold text-xs text-slate-700">{sub.type}</span>
                                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0" onClick={() => {
                                      const newSubs = selectedField.subFields?.filter((_, i) => i !== idx);
                                      updateField(selectedField.id, { subFields: newSubs });
                                  }}>
                                     <X className="h-3 w-3" />
                                  </Button>
                               </div>
                               <Input 
                                  value={sub.label} 
                                  onChange={(e) => {
                                      const newSubs = [...(selectedField.subFields || [])];
                                      newSubs[idx] = { ...newSubs[idx], label: e.target.value };
                                      updateField(selectedField.id, { subFields: newSubs });
                                  }}
                                  className="h-7 text-xs"
                               />
                            </div>
                         ))}
                         <div className="grid grid-cols-2 gap-2">
                            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => {
                                const newSub = { id: `sub-${Date.now()}`, type: 'text' as FormFieldType, label: 'New Text', required: true };
                                updateField(selectedField.id, { subFields: [...(selectedField.subFields || []), newSub] });
                            }}>+ Text</Button>
                            <Button variant="outline" size="sm" className="text-xs h-7" onClick={() => {
                                const newSub = { id: `sub-${Date.now()}`, type: 'date' as FormFieldType, label: 'New Date', required: true };
                                updateField(selectedField.id, { subFields: [...(selectedField.subFields || []), newSub] });
                            }}>+ Date</Button>
                         </div>
                      </div>
                   </div>
                )}

              </div>
            </ScrollArea>
          </>
        ) : (
          <div className="flex flex-col h-full items-center justify-center text-slate-400 p-8 text-center">
            <Settings className="h-10 w-10 mb-2 opacity-20" />
            <p className="text-sm">Select a field on the canvas to edit its properties.</p>
          </div>
        )}
      </div>

      {/* Floating Preview Button */}
      <div className="absolute bottom-6 right-6 z-20">
        <Button onClick={() => setIsPreviewOpen(true)} className="rounded-full shadow-xl bg-slate-900 text-white h-12 px-6">
          <Eye className="h-4 w-4 mr-2" /> Live Preview
        </Button>
      </div>

      {/* Preview Sheet */}
      <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
        <SheetContent className="w-full sm:max-w-2xl p-0 overflow-y-auto bg-slate-100">
          <SheetHeader className="sr-only">
            <SheetTitle>Form Preview</SheetTitle>
          </SheetHeader>
          <div className="min-h-full py-10 px-4">
             <FormPreview fields={fields} />
          </div>
        </SheetContent>
      </Sheet>

    </div>
  );
};

// --- Create Event Wizard Component ---

const CreateEventDialog = ({ open, onOpenChange, onCreate }: { open: boolean, onOpenChange: (open: boolean) => void, onCreate: (event: ConferenceEvent) => void }) => {
    // ... (keeping existing implementation)
    const [activeTab, setActiveTab] = useState('basics');
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        description: '',
        status: 'Draft' as EventStatus,
        startDate: '',
        endDate: '',
        startTime: '09:00',
        endTime: '17:00',
        location: '',
        venue: '',
        capacity: 100,
        fundCode: '',
        goalRevenue: 0,
        speakers: [] as string[],
        newSpeaker: ''
    });

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => {
        const newData = { ...prev, [field]: value };
        // Auto-generate slug from name
        if (field === 'name' && !prev.slug) {
            newData.slug = value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
        }
        return newData;
        });
    };

    const addSpeaker = () => {
        if (formData.newSpeaker.trim()) {
        setFormData(prev => ({
            ...prev,
            speakers: [...prev.speakers, prev.newSpeaker.trim()],
            newSpeaker: ''
        }));
        }
    };

    const removeSpeaker = (index: number) => {
        setFormData(prev => ({
        ...prev,
        speakers: prev.speakers.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = () => {
        const newEvent: ConferenceEvent = {
        id: `evt-${Date.now()}`,
        name: formData.name,
        slug: formData.slug,
        description: formData.description,
        startDate: formData.startDate,
        endDate: formData.endDate,
        startTime: formData.startTime,
        location: formData.location + (formData.venue ? `, ${formData.venue}` : ''),
        status: formData.status,
        registrants: 0,
        capacity: formData.capacity,
        revenue: 0,
        image: '', // Placeholder logic could go here
        fundCode: formData.fundCode,
        speakers: formData.speakers,
        goalRevenue: formData.goalRevenue
        };
        onCreate(newEvent);
        onOpenChange(false);
        // Reset form...
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] p-0 gap-0 overflow-hidden flex flex-col h-[85vh]">
            <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <DialogTitle className="text-xl">Create New Event</DialogTitle>
            <DialogDescription>Configure details, logistics, and settings for your upcoming event.</DialogDescription>
            </DialogHeader>
            
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-4 shrink-0">
                <TabsList className="grid w-full grid-cols-4 bg-slate-100 h-10 p-1">
                <TabsTrigger value="basics">Basics</TabsTrigger>
                <TabsTrigger value="logistics">Logistics</TabsTrigger>
                <TabsTrigger value="registration">Registration</TabsTrigger>
                <TabsTrigger value="content">Content</TabsTrigger>
                </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <TabsContent value="basics" className="space-y-6 mt-0">
                <div className="space-y-2">
                    <Label>Event Name</Label>
                    <Input 
                    placeholder="e.g. Annual Gala 2025" 
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className="text-lg font-medium h-11"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                    <Label>URL Slug</Label>
                    <div className="flex items-center">
                        <span className="bg-slate-100 border border-r-0 border-slate-200 rounded-l-md px-3 h-10 flex items-center text-slate-500 text-sm">/events/</span>
                        <Input 
                        placeholder="annual-gala-2025" 
                        value={formData.slug}
                        onChange={(e) => handleInputChange('slug', e.target.value)}
                        className="rounded-l-none"
                        />
                    </div>
                    </div>
                    <div className="space-y-2">
                    <Label>Status</Label>
                    <Select 
                        value={formData.status} 
                        onChange={(e) => handleInputChange('status', e.target.value)}
                    >
                        <option value="Draft">Draft</option>
                        <option value="Published">Published</option>
                    </Select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea 
                    placeholder="Summarize the event..." 
                    value={formData.description}
                    onChange={(e) => handleInputChange('description', e.target.value)}
                    className="min-h-[120px]"
                    />
                </div>
                </TabsContent>

                <TabsContent value="logistics" className="space-y-6 mt-0">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                    <Label>Start Date</Label>
                    <Input 
                        type="date" 
                        value={formData.startDate}
                        onChange={(e) => handleInputChange('startDate', e.target.value)}
                    />
                    </div>
                    <div className="space-y-2">
                    <Label>End Date</Label>
                    <Input 
                        type="date" 
                        value={formData.endDate}
                        onChange={(e) => handleInputChange('endDate', e.target.value)}
                    />
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                    <Label>Start Time</Label>
                    <Input 
                        type="time" 
                        value={formData.startTime}
                        onChange={(e) => handleInputChange('startTime', e.target.value)}
                    />
                    </div>
                    <div className="space-y-2">
                    <Label>End Time</Label>
                    <Input 
                        type="time" 
                        value={formData.endTime}
                        onChange={(e) => handleInputChange('endTime', e.target.value)}
                    />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>City / Region</Label>
                    <Input 
                    placeholder="e.g. New York, NY" 
                    value={formData.location}
                    onChange={(e) => handleInputChange('location', e.target.value)}
                    />
                </div>

                <div className="space-y-2">
                    <Label>Venue Name</Label>
                    <Input 
                    placeholder="e.g. Grand Hyatt Ballroom" 
                    value={formData.venue}
                    onChange={(e) => handleInputChange('venue', e.target.value)}
                    />
                </div>
                </TabsContent>

                <TabsContent value="registration" className="space-y-6 mt-0">
                <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                    <Label>Max Capacity</Label>
                    <Input 
                        type="number" 
                        value={formData.capacity}
                        onChange={(e) => handleInputChange('capacity', parseInt(e.target.value))}
                    />
                    </div>
                    <div className="space-y-2">
                    <Label>Revenue Goal ($)</Label>
                    <Input 
                        type="number" 
                        value={formData.goalRevenue}
                        onChange={(e) => handleInputChange('goalRevenue', parseFloat(e.target.value))}
                    />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Financial Fund Code</Label>
                    <Input 
                    placeholder="e.g. FUND-2025-EVT" 
                    value={formData.fundCode}
                    onChange={(e) => handleInputChange('fundCode', e.target.value)}
                    />
                    <p className="text-[11px] text-slate-500">
                    Transactions will be tagged with this code in the Finance Hub.
                    </p>
                </div>

                <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
                    <h4 className="font-semibold text-sm mb-2">Ticket Settings</h4>
                    <div className="flex items-center justify-between">
                    <Label className="font-normal text-slate-600">Enable Paid Tickets?</Label>
                    <Switch />
                    </div>
                </div>
                </TabsContent>

                <TabsContent value="content" className="space-y-6 mt-0">
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                    <Label>Featured Speakers</Label>
                    <Badge variant="outline" className="font-normal">{formData.speakers.length} added</Badge>
                    </div>
                    
                    <div className="flex gap-2">
                    <Input 
                        placeholder="Add speaker name..." 
                        value={formData.newSpeaker}
                        onChange={(e) => handleInputChange('newSpeaker', e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSpeaker())}
                    />
                    <Button variant="secondary" onClick={addSpeaker} disabled={!formData.newSpeaker.trim()}>
                        <UserPlus className="h-4 w-4" />
                    </Button>
                    </div>

                    <div className="space-y-2">
                    {formData.speakers.map((speaker, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 bg-white border border-slate-200 rounded-md shadow-sm">
                        <div className="flex items-center gap-3">
                            <Avatar className="h-8 w-8">
                            <AvatarFallback className="bg-slate-100 text-xs font-bold text-slate-600">{speaker.substring(0,2).toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium">{speaker}</span>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-400 hover:text-red-500" onClick={() => removeSpeaker(idx)}>
                            <Trash2 className="h-4 w-4" />
                        </Button>
                        </div>
                    ))}
                    {formData.speakers.length === 0 && (
                        <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-100 rounded-lg bg-slate-50">
                        <Mic2 className="h-8 w-8 mx-auto mb-2 opacity-20" />
                        <p className="text-sm">No speakers added yet.</p>
                        </div>
                    )}
                    </div>
                </div>
                </TabsContent>
            </div>
            </Tabs>

            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0">
            <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
            <Button onClick={handleSubmit} className="bg-slate-900 text-white min-w-[140px]">
                <Save className="mr-2 h-4 w-4" /> Create Event
            </Button>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    );
};

const SpeakerDialog = ({ 
    open, 
    onOpenChange, 
    speaker, 
    onSave 
}: { 
    open: boolean; 
    onOpenChange: (open: boolean) => void; 
    speaker?: Speaker;
    onSave: (s: Speaker) => void; 
}) => {
    // ... (keeping existing implementation)
    const [activeTab, setActiveTab] = useState('profile');
    const [formData, setFormData] = useState<Partial<Speaker>>({
        firstName: '',
        lastName: '',
        email: '',
        jobTitle: '',
        company: '',
        bio: '',
        status: 'Invited',
        linkedin: '',
        twitter: '',
        website: '',
        ...speaker
    });

    React.useEffect(() => {
        if (speaker) {
        setFormData(speaker);
        } else {
        setFormData({ 
            firstName: '', lastName: '', email: '', jobTitle: '', 
            company: '', bio: '', status: 'Invited' 
        });
        }
    }, [speaker, open]);

    const handleSubmit = () => {
        if (!formData.firstName || !formData.lastName) return;
        
        const newSpeaker: Speaker = {
        id: speaker?.id || `spk-${Date.now()}`,
        eventId: speaker?.eventId || 'evt-1', // Default or passed prop
        firstName: formData.firstName || '',
        lastName: formData.lastName || '',
        email: formData.email || '',
        jobTitle: formData.jobTitle || '',
        company: formData.company || '',
        bio: formData.bio || '',
        avatar: formData.avatar || '',
        status: formData.status as SpeakerStatus,
        linkedin: formData.linkedin,
        twitter: formData.twitter,
        website: formData.website,
        sessions: formData.sessions || []
        };
        onSave(newSpeaker);
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[700px] p-0 gap-0 overflow-hidden flex flex-col h-[85vh]">
            <DialogHeader className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 shrink-0">
            <DialogTitle className="text-xl">{speaker ? 'Edit Speaker' : 'Add New Speaker'}</DialogTitle>
            <DialogDescription>Manage speaker profile, bio, and visibility.</DialogDescription>
            </DialogHeader>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col overflow-hidden">
            <div className="px-6 pt-4 shrink-0">
                <TabsList className="grid w-full grid-cols-3 bg-slate-100 h-10 p-1">
                <TabsTrigger value="profile">Profile & Bio</TabsTrigger>
                <TabsTrigger value="social">Social & Media</TabsTrigger>
                <TabsTrigger value="sessions">Sessions</TabsTrigger>
                </TabsList>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
                <TabsContent value="profile" className="space-y-6 mt-0">
                <div className="flex items-start gap-6">
                    <div className="shrink-0 space-y-3">
                    <div className="h-24 w-24 bg-slate-100 rounded-full border-2 border-dashed border-slate-200 flex items-center justify-center relative overflow-hidden group cursor-pointer hover:border-blue-400 transition-colors">
                        {formData.avatar ? (
                            <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-center">
                            <ImageIcon className="h-6 w-6 text-slate-300 mx-auto" />
                            <span className="text-[10px] text-slate-400 block mt-1">Upload</span>
                            </div>
                        )}
                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <Upload className="h-6 w-6 text-white" />
                        </div>
                    </div>
                    </div>
                    <div className="flex-1 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>First Name</Label>
                        <Input value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                        <Label>Last Name</Label>
                        <Input value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                    </div>
                    <div className="col-span-2 space-y-2">
                        <Label>Email (Private)</Label>
                        <Input value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="speaker@example.com" />
                    </div>
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label>Job Title</Label>
                        <Input value={formData.jobTitle} onChange={e => setFormData({...formData, jobTitle: e.target.value})} placeholder="e.g. Chief Product Officer" />
                    </div>
                    <div className="space-y-2">
                        <Label>Company / Organization</Label>
                        <Input value={formData.company} onChange={e => setFormData({...formData, company: e.target.value})} placeholder="e.g. Acme Corp" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label>Biography</Label>
                    <RichTextEditor 
                        value={formData.bio || ''} 
                        onChange={(val) => setFormData({...formData, bio: val})} 
                        placeholder="Enter speaker bio..."
                        className="min-h-[150px]"
                    />
                </div>
                </TabsContent>

                <TabsContent value="social" className="space-y-6 mt-0">
                <div className="space-y-4">
                    <h3 className="font-semibold text-sm text-slate-900">Social Links</h3>
                    <div className="space-y-3">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-[#0077b5]">
                            <Linkedin className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-1">
                            <Label className="text-xs">LinkedIn URL</Label>
                            <Input value={formData.linkedin} onChange={e => setFormData({...formData, linkedin: e.target.value})} placeholder="linkedin.com/in/username" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-900">
                            <Twitter className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-1">
                            <Label className="text-xs">Twitter / X Handle</Label>
                            <Input value={formData.twitter} onChange={e => setFormData({...formData, twitter: e.target.value})} placeholder="@username" />
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center text-slate-500">
                            <Globe className="h-5 w-5" />
                            </div>
                            <div className="flex-1 space-y-1">
                            <Label className="text-xs">Website</Label>
                            <Input value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} placeholder="https://..." />
                            </div>
                        </div>
                    </div>
                </div>
                </TabsContent>

                <TabsContent value="sessions" className="space-y-6 mt-0">
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex gap-3 items-start">
                    <div className="p-2 bg-white rounded-full text-blue-600 shadow-sm"><Mic2 className="h-4 w-4" /></div>
                    <div>
                        <h4 className="font-bold text-sm text-blue-900">Session Assignment</h4>
                        <p className="text-xs text-blue-700 mt-1">To assign this speaker to sessions, go to the Schedule tab and edit the specific session.</p>
                    </div>
                </div>
                
                <div className="space-y-3">
                    <Label>Assigned Sessions</Label>
                    {formData.sessions && formData.sessions.length > 0 ? (
                        <div className="space-y-2">
                            {formData.sessions.map(sid => {
                            const session = MOCK_SESSIONS.find(s => s.id === sid);
                            if (!session) return null;
                            return (
                                <div key={sid} className="flex items-center justify-between p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                    <div>
                                        <p className="font-bold text-sm text-slate-900">{session.title}</p>
                                        <p className="text-xs text-slate-500">{session.time} • {session.location}</p>
                                    </div>
                                    <Button variant="ghost" size="sm" className="h-8">View</Button>
                                </div>
                            )
                            })}
                        </div>
                    ) : (
                        <p className="text-sm text-slate-500 italic">No sessions assigned.</p>
                    )}
                </div>
                </TabsContent>
            </div>
            </Tabs>

            <DialogFooter className="px-6 py-4 border-t border-slate-100 bg-slate-50 shrink-0 flex justify-between items-center sm:justify-between">
            <div className="flex items-center gap-2">
                <Label className="text-xs font-medium text-slate-500 mr-2">Status:</Label>
                <Select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})} className="h-8 w-32 text-xs">
                    <option value="Invited">Invited</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="Pending">Pending</option>
                    <option value="Declined">Declined</option>
                </Select>
            </div>
            <div className="flex gap-2">
                <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
                <Button onClick={handleSubmit} className="bg-slate-900 text-white min-w-[100px]">Save Speaker</Button>
            </div>
            </DialogFooter>
        </DialogContent>
        </Dialog>
    );
};

const EventSettings: React.FC<{ event: ConferenceEvent }> = ({ event }) => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card>
        <CardHeader>
          <CardTitle>Event Settings</CardTitle>
          <CardDescription>Manage core details for {event.name}.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Event Name</Label>
              <Input defaultValue={event.name} />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input defaultValue={event.slug} />
            </div>
          </div>
          <div className="space-y-2">
             <Label>Fund Code</Label>
             <Input defaultValue={event.fundCode} />
          </div>
        </CardContent>
        <CardFooter className="border-t bg-slate-50 px-6 py-4">
           <Button className="bg-slate-900 text-white">Save Changes</Button>
        </CardFooter>
      </Card>
      
      <Card className="border-red-200">
         <CardHeader className="bg-red-50/50 border-b border-red-100">
            <CardTitle className="text-red-700">Danger Zone</CardTitle>
         </CardHeader>
         <CardContent className="p-6 flex items-center justify-between">
            <div>
               <h4 className="font-bold text-slate-900">Delete Event</h4>
               <p className="text-sm text-slate-500">Permanently remove this event and all data.</p>
            </div>
            <Button variant="destructive">Delete Event</Button>
         </CardContent>
      </Card>
    </div>
  );
};

// --- Main Page Component ---
export const Events = () => {
    // ... (keeping existing Events implementation, which calls RegistrationFormBuilder)
  const [events, setEvents] = useState<ConferenceEvent[]>(INITIAL_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  
  // Speakers State
  const [speakers, setSpeakers] = useState<Speaker[]>(MOCK_SPEAKERS);
  const [speakerSearch, setSpeakerSearch] = useState('');
  const [editingSpeaker, setEditingSpeaker] = useState<Speaker | undefined>(undefined);
  const [isSpeakerDialogOpen, setIsSpeakerDialogOpen] = useState(false);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const handleCreateEvent = (newEvent: ConferenceEvent) => {
    setEvents(prev => [newEvent, ...prev]);
    setSelectedEventId(newEvent.id);
  };

  const handleSaveSpeaker = (newSpeaker: Speaker) => {
    setSpeakers(prev => {
      const exists = prev.find(s => s.id === newSpeaker.id);
      if (exists) {
        return prev.map(s => s.id === newSpeaker.id ? newSpeaker : s);
      }
      return [...prev, newSpeaker];
    });
  };

  const deleteSpeaker = (id: string) => {
    if (confirm('Are you sure you want to remove this speaker?')) {
        setSpeakers(prev => prev.filter(s => s.id !== id));
    }
  };

  const filteredSpeakers = useMemo(() => {
    return speakers.filter(s => s.eventId === selectedEventId && (
        s.firstName.toLowerCase().includes(speakerSearch.toLowerCase()) || 
        s.lastName.toLowerCase().includes(speakerSearch.toLowerCase()) ||
        s.company.toLowerCase().includes(speakerSearch.toLowerCase())
    ));
  }, [speakers, selectedEventId, speakerSearch]);

  const renderEventList = () => (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Events & Conferences</h1>
          <p className="text-slate-500 mt-1">Manage registrations, schedules, and on-site operations.</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)} className="bg-slate-900 text-white shadow-md">
          <Plus className="mr-2 h-4 w-4" /> Create Event
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="border-slate-200 shadow-sm md:col-span-3">
          <div className="p-1">
            <div className="flex items-center gap-2 p-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input placeholder="Search events..." className="pl-9 border-none bg-slate-50 focus:bg-white transition-all" />
              </div>
              <div className="h-8 w-px bg-slate-100 mx-2" />
              <div className="flex bg-slate-100 p-1 rounded-lg">
                <button onClick={() => setViewMode('grid')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'grid' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}><Grid className="h-4 w-4" /></button>
                <button onClick={() => setViewMode('list')} className={cn("p-1.5 rounded-md transition-all", viewMode === 'list' ? "bg-white shadow-sm text-slate-900" : "text-slate-500")}><List className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        </Card>
        <Card className="border-slate-200 shadow-sm bg-slate-900 text-white">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-xs font-bold uppercase tracking-wider">Total Revenue</p>
              <p className="text-2xl font-bold mt-1">$252,500</p>
            </div>
            <div className="h-10 w-10 bg-white/10 rounded-full flex items-center justify-center">
              <DollarSign className="h-5 w-5 text-emerald-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(evt => (
            <EventCard key={evt.id} event={evt} onClick={() => setSelectedEventId(evt.id)} />
          ))}
          
          <div 
            onClick={() => setIsCreateOpen(true)}
            className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-blue-400 hover:bg-blue-50/50 hover:text-blue-500 transition-all cursor-pointer group h-full min-h-[300px]"
          >
            <div className="h-14 w-14 rounded-full bg-slate-50 flex items-center justify-center mb-4 group-hover:bg-white group-hover:shadow-md transition-all">
              <Plus className="h-6 w-6" />
            </div>
            <span className="font-semibold">Draft New Event</span>
          </div>
        </div>
      ) : (
        <Card className="border-slate-200 shadow-sm">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead>Event Name</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Registrants</TableHead>
                <TableHead className="text-right">Revenue</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {events.map(evt => (
                <TableRow key={evt.id} className="cursor-pointer hover:bg-slate-50/50" onClick={() => setSelectedEventId(evt.id)}>
                  <TableCell className="font-semibold text-slate-900">{evt.name}</TableCell>
                  <TableCell>{formatDateRange(evt.startDate, evt.endDate)}</TableCell>
                  <TableCell>{evt.location}</TableCell>
                  <TableCell><Badge variant="outline">{evt.status}</Badge></TableCell>
                  <TableCell className="text-right">{evt.registrants} / {evt.capacity}</TableCell>
                  <TableCell className="text-right font-mono">{formatCurrency(evt.revenue)}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="icon"><ChevronRight className="h-4 w-4" /></Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}
    </div>
  );

  const renderEventDetail = () => {
    if (!selectedEvent) return null;

    return (
      <div className="flex flex-col h-[calc(100vh-2rem)] -m-4 md:-m-8 bg-slate-50">
        <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between shrink-0 sticky top-0 z-20 shadow-sm">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setSelectedEventId(null)} className="rounded-full hover:bg-slate-100">
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </Button>
            <div>
              <h1 className="text-xl font-bold text-slate-900 flex items-center gap-3">
                {selectedEvent.name}
                <Badge variant="secondary" className="font-normal text-xs">{selectedEvent.status}</Badge>
              </h1>
              <p className="text-xs text-slate-500 flex items-center gap-3 mt-1">
                <span className="flex items-center gap-1"><CalendarIcon className="h-3 w-3" /> {formatDateRange(selectedEvent.startDate, selectedEvent.endDate)}</span>
                <span className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {selectedEvent.location}</span>
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Button variant="outline" className="hidden md:flex gap-2" onClick={() => setIsKioskOpen(true)}>
              <ScanLine className="h-4 w-4" /> Kiosk Mode
            </Button>
            <Button className="bg-slate-900 text-white shadow-md gap-2">
              <ExternalLink className="h-4 w-4" /> Event Page
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          <div className="w-full md:w-64 bg-white border-r border-slate-200 flex-shrink-0 z-10 overflow-x-auto md:overflow-y-auto">
            <nav className="p-4 space-y-1 flex md:flex-col gap-2 md:gap-1">
              {[
                { id: 'overview', label: 'Overview', icon: Layout },
                { id: 'attendees', label: 'Attendees', icon: Users },
                { id: 'schedule', label: 'Schedule', icon: Clock },
                { id: 'speakers', label: 'Speakers', icon: Mic2 },
                { id: 'forms', label: 'Registration Form', icon: FileText },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all w-full",
                    activeTab === item.id 
                      ? "bg-blue-50 text-blue-700 shadow-sm" 
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <item.icon className={cn("h-4 w-4", activeTab === item.id ? "text-blue-600" : "text-slate-400")} />
                  {item.label}
                </button>
              ))}
            </nav>
            
            <div className="p-4 mt-auto border-t border-slate-100 hidden md:block">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Fund Code</p>
                <div className="flex items-center gap-2 font-mono text-sm bg-white border border-slate-200 px-2 py-1 rounded">
                  {selectedEvent.fundCode}
                </div>
              </div>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 md:p-10">
            <div className="max-w-6xl mx-auto">
              
              {activeTab === 'overview' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Registrants</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-slate-900">{selectedEvent.registrants}</div>
                        <Progress value={(selectedEvent.registrants / selectedEvent.capacity) * 100} className="h-2 mt-3" />
                        <p className="text-xs text-slate-500 mt-2">{selectedEvent.capacity - selectedEvent.registrants} spots remaining</p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Total Revenue</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-emerald-600">{formatCurrency(selectedEvent.revenue)}</div>
                        <p className="text-xs text-slate-500 mt-2 flex items-center gap-1">
                          <TrendingUp className="h-3 w-3 text-emerald-500" /> +12% vs last year
                        </p>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-slate-500">Check-In Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="text-3xl font-bold text-blue-600">
                          {selectedEvent.status === 'Draft' ? 0 : 142}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">Attendees currently on-site</p>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <Card className="h-full">
                      <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-6 relative pl-4 border-l border-slate-100">
                          {[1,2,3].map(i => (
                            <div key={i} className="relative">
                              <div className="absolute -left-[21px] top-1 h-3 w-3 rounded-full bg-blue-500 border-2 border-white shadow-sm" />
                              <p className="text-sm font-medium text-slate-900">New registration: Bob Smith</p>
                              <p className="text-xs text-slate-500">2 minutes ago</p>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                    
                    <Card className="h-full bg-slate-900 text-white border-slate-800">
                      <CardHeader>
                        <CardTitle className="text-white">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="grid grid-cols-2 gap-4">
                        <Button variant="outline" className="h-20 flex-col bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white border-dashed">
                          <Mail className="h-6 w-6 mb-2" />
                          Email Attendees
                        </Button>
                        <Button variant="outline" className="h-20 flex-col bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white border-dashed">
                          <Printer className="h-6 w-6 mb-2" />
                          Print Badges
                        </Button>
                        <Button variant="outline" className="h-20 flex-col bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white border-dashed">
                          <Download className="h-6 w-6 mb-2" />
                          Export List
                        </Button>
                        <Button variant="outline" className="h-20 flex-col bg-slate-800 border-slate-700 hover:bg-slate-700 hover:text-white border-dashed">
                          <Settings className="h-6 w-6 mb-2" />
                          Edit Event
                        </Button>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* ... (Existing Attendees, Schedule, Speakers tabs) */}
              {activeTab === 'attendees' && (
                <Card className="border-slate-200 shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                    <div className="relative max-w-sm w-full">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input placeholder="Search attendees..." className="pl-9 bg-slate-50 border-slate-200" />
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline"><Filter className="h-4 w-4 mr-2" /> Filter</Button>
                      <Button variant="outline"><Download className="h-4 w-4 mr-2" /> Export</Button>
                    </div>
                  </div>
                  <Table>
                    <TableHeader className="bg-slate-50">
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Ticket Type</TableHead>
                        <TableHead>Organization</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {MOCK_ATTENDEES.map(att => (
                        <TableRow key={att.id} className="hover:bg-slate-50/50">
                          <TableCell>
                            <div className="font-medium text-slate-900">{att.name}</div>
                            <div className="text-xs text-slate-500">{att.email}</div>
                          </TableCell>
                          <TableCell><Badge variant="secondary">{att.ticketType}</Badge></TableCell>
                          <TableCell>{att.organization || '-'}</TableCell>
                          <TableCell>
                            <Badge className={cn("font-medium", 
                              att.status === 'Checked In' ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-200" :
                              att.status === 'Cancelled' ? "bg-red-100 text-red-700 hover:bg-red-200" :
                              "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            )}>
                              {att.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon"><MoreHorizontal className="h-4 w-4 text-slate-400" /></Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem>View Profile</DropdownMenuItem>
                                <DropdownMenuItem>Send Email</DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>Manual Check-In</DropdownMenuItem>
                                <DropdownMenuItem className="text-red-600">Cancel Registration</DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              )}

              {activeTab === 'schedule' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <div className="flex justify-between items-center">
                    <h2 className="text-lg font-bold">Event Agenda</h2>
                    <Button className="bg-slate-900 text-white"><Plus className="h-4 w-4 mr-2" /> Add Session</Button>
                  </div>
                  
                  <div className="space-y-4">
                    {MOCK_SESSIONS.map(session => (
                      <div key={session.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 hover:shadow-md transition-shadow cursor-pointer group">
                        <div className="w-32 shrink-0 flex flex-col justify-center border-r border-slate-100 pr-6 md:text-right">
                          <span className="text-lg font-bold text-slate-900">{session.time}</span>
                          <span className="text-xs text-slate-500 font-medium">{session.duration}</span>
                        </div>
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="outline" className="bg-slate-50">{session.track}</Badge>
                            <span className="text-xs text-slate-400">• {session.location}</span>
                          </div>
                          <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-600 transition-colors">{session.title}</h3>
                          <div className="flex items-center gap-2 mt-2">
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-[10px] bg-indigo-100 text-indigo-700">{session.speaker[0]}</AvatarFallback>
                            </Avatar>
                            <span className="text-sm text-slate-600">{session.speaker}</span>
                          </div>
                        </div>
                        <div className="flex items-center">
                          <Button variant="ghost" size="icon" className="text-slate-300 group-hover:text-slate-600"><Settings className="h-4 w-4" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'speakers' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                  {/* Toolbar */}
                  <div className="flex items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-sm">
                      <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                      <Input 
                        placeholder="Search speakers..." 
                        value={speakerSearch}
                        onChange={(e) => setSpeakerSearch(e.target.value)}
                        className="pl-9 bg-white border-slate-200"
                      />
                    </div>
                    <Button onClick={() => { setEditingSpeaker(undefined); setIsSpeakerDialogOpen(true); }} className="bg-slate-900 text-white shadow-md">
                      <Plus className="mr-2 h-4 w-4" /> Add Speaker
                    </Button>
                  </div>

                  {/* Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredSpeakers.map(speaker => (
                      <SpeakerCard key={speaker.id} speaker={speaker} onEdit={(s) => { setEditingSpeaker(s); setIsSpeakerDialogOpen(true); }} />
                    ))}
                    
                    {/* Add New Placeholder */}
                    <button 
                      onClick={() => { setEditingSpeaker(undefined); setIsSpeakerDialogOpen(true); }}
                      className="border-2 border-dashed border-slate-200 rounded-xl flex flex-col items-center justify-center p-8 text-slate-400 hover:border-blue-400 hover:bg-blue-50/30 hover:text-blue-500 transition-all group min-h-[250px]"
                    >
                      <div className="h-12 w-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-blue-100 transition-colors">
                        <Plus className="h-6 w-6" />
                      </div>
                      <span className="font-semibold">Add New Speaker</span>
                    </button>
                  </div>
                </div>
              )}

              {/* NEW: Registration Form Builder */}
              {activeTab === 'forms' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                  <RegistrationFormBuilder />
                </div>
              )}

              {/* NEW: Settings Module */}
              {(activeTab === 'settings') && (
                <EventSettings event={selectedEvent} />
              )}

            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {isKioskOpen ? (
        <CheckInKiosk onClose={() => setIsKioskOpen(false)} />
      ) : selectedEventId ? (
        renderEventDetail()
      ) : (
        renderEventList()
      )}
      
      <CreateEventDialog 
        open={isCreateOpen} 
        onOpenChange={setIsCreateOpen} 
        onCreate={handleCreateEvent} 
      />

      <SpeakerDialog 
        open={isSpeakerDialogOpen}
        onOpenChange={setIsSpeakerDialogOpen}
        speaker={editingSpeaker}
        onSave={handleSaveSpeaker}
      />
    </>
  );
};

export default Events;
