
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
  MousePointerClick, Ticket, AlignLeft, CheckSquare, Radio, 
  CalendarDays, Tag, AlertTriangle, ArrowUpRight, Compass,
  DoorOpen, Presentation, Utensils, Accessibility
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
  DropdownMenuLabel,
  DropdownMenuCheckboxItem
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
import { Link } from 'react-router-dom';

// --- Types & Mock Data ---

type EventStatus = 'Draft' | 'Published' | 'Live' | 'Completed';
type SpeakerStatus = 'Confirmed' | 'Invited' | 'Pending' | 'Declined';

interface Track {
  id: string;
  name: string;
  color: string;
  description?: string;
}

interface Room {
  id: string;
  name: string;
  capacity: number;
  locationDescription?: string; // e.g. "2nd Floor, West Wing"
}

interface SessionType {
  id: string;
  name: string; // e.g. "Keynote", "Workshop", "Panel"
  icon?: string;
  color?: string;
}

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
  // Event Specific Configuration
  tracks: Track[];
  rooms: Room[];
  sessionTypes: SessionType[];
  sessions: Session[]; 
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
  phone?: string;
  ticketType: string;
  status: 'Registered' | 'Checked In' | 'Cancelled' | 'Waitlist';
  paymentStatus: 'Paid' | 'Pending' | 'Refunded' | 'Due';
  checkInTime?: string;
  organization?: string;
  jobTitle?: string;
  registrationDate: string;
  dietaryRestrictions?: string; // e.g., "Vegan, Gluten Free"
  accessibilityNeeds?: string; // e.g., "Wheelchair Access"
  tshirtSize?: string;
  notes?: string;
  assignedSessions: string[]; // IDs of sessions they registered for
  avatar?: string;
  isVip?: boolean;
}

interface Session {
  id: string;
  title: string;
  description?: string;
  date: string; // ISO Date YYYY-MM-DD
  startTime: string; // HH:MM 24h
  endTime: string; // HH:MM 24h
  locationId: string;
  speakerIds: string[];
  trackId: string;
  typeId: string;
  capacity?: number;
  isPublished: boolean;
}

// --- Form Builder Types --- (Preserved)

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
];

const MOCK_ROOMS: Room[] = [
    { id: 'rm-1', name: 'Grand Ballroom', capacity: 1000, locationDescription: 'Level 1, Main Entrance' },
    { id: 'rm-2', name: 'Breakout A', capacity: 50, locationDescription: 'Level 2, East Wing' },
    { id: 'rm-3', name: 'Breakout B', capacity: 50, locationDescription: 'Level 2, West Wing' },
];

const MOCK_SESSIONS: Session[] = [
    { id: 'sess-1', title: 'Opening Keynote: The Future of Aid', description: 'Welcome to GIC 2025', date: '2025-10-15', startTime: '09:00', endTime: '10:30', locationId: 'rm-1', speakerIds: ['spk-1'], trackId: 'tr-1', typeId: 'typ-1', isPublished: true },
    { id: 'sess-2', title: 'Tech for Good Workshop', description: 'AI in humanitarian aid', date: '2025-10-15', startTime: '11:00', endTime: '12:00', locationId: 'rm-2', speakerIds: ['spk-2'], trackId: 'tr-3', typeId: 'typ-2', isPublished: true },
    { id: 'sess-3', title: 'Leadership Panel', description: 'Leading through crisis', date: '2025-10-15', startTime: '11:00', endTime: '12:00', locationId: 'rm-3', speakerIds: ['spk-1'], trackId: 'tr-1', typeId: 'typ-3', isPublished: true },
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
    tracks: [
        { id: 'tr-1', name: 'Leadership', color: 'bg-purple-100 text-purple-700', description: 'For executive directors and board members.' },
        { id: 'tr-2', name: 'Field Ops', color: 'bg-emerald-100 text-emerald-700', description: 'Practical skills for on-ground work.' },
        { id: 'tr-3', name: 'Technology', color: 'bg-blue-100 text-blue-700', description: 'Digital transformation in aid.' }
    ],
    rooms: MOCK_ROOMS,
    sessionTypes: [
        { id: 'typ-1', name: 'Keynote' },
        { id: 'typ-2', name: 'Workshop' },
        { id: 'typ-3', name: 'Panel' },
        { id: 'typ-4', name: 'Networking' },
    ],
    sessions: MOCK_SESSIONS
  },
];

const MOCK_SPEAKERS: Speaker[] = [
  {
    id: 'spk-1', eventId: 'evt-1', firstName: 'Elena', lastName: 'Rostova', email: 'elena.r@givehope.org', jobTitle: 'Executive Director', company: 'GiveHope', bio: '<p>Dr. Elena Rostova has over 20 years of experience.</p>', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=200', status: 'Confirmed', sessions: ['sess-1']
  },
  {
    id: 'spk-2', eventId: 'evt-1', firstName: 'David', lastName: 'Kim', email: 'david.kim@agritech.io', jobTitle: 'Founder', company: 'AgriTech', bio: '<p>David pioneers sustainable farming.</p>', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&q=80&w=200', status: 'Confirmed', sessions: []
  }
];

const MOCK_ATTENDEES: Attendee[] = [
  { 
    id: 'att-1', name: 'Alice Johnson', email: 'alice@example.com', ticketType: 'General Admission', status: 'Registered', paymentStatus: 'Paid', organization: 'First Baptist', 
    registrationDate: '2025-08-10', assignedSessions: ['sess-1', 'sess-3'], avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=100', jobTitle: 'Outreach Coordinator' 
  },
  { 
    id: 'att-2', name: 'Bob Smith', email: 'bob@example.com', ticketType: 'VIP', status: 'Checked In', paymentStatus: 'Paid', checkInTime: '2025-10-15T08:45:00', organization: 'Grace Community', 
    registrationDate: '2025-07-22', dietaryRestrictions: 'Gluten Free', assignedSessions: ['sess-1', 'sess-2'], isVip: true, notes: 'Seat in front row for Keynote.' 
  },
  { 
    id: 'att-3', name: 'Charlie Davis', email: 'charlie@example.com', ticketType: 'General Admission', status: 'Cancelled', paymentStatus: 'Refunded', 
    registrationDate: '2025-09-01', assignedSessions: [] 
  },
  { 
    id: 'att-4', name: 'Diana Evans', email: 'diana@example.com', ticketType: 'Speaker', status: 'Registered', paymentStatus: 'Paid', organization: 'GiveHope HQ', 
    registrationDate: '2025-06-15', assignedSessions: ['sess-1'], jobTitle: 'Director of Programs', isVip: true 
  },
  { 
    id: 'att-5', name: 'Evan Wright', email: 'evan@example.com', ticketType: 'Volunteer', status: 'Checked In', paymentStatus: 'Paid', checkInTime: '2025-10-15T07:30:00', 
    registrationDate: '2025-09-10', assignedSessions: [], accessibilityNeeds: 'Wheelchair access required for breakouts.' 
  },
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

const formatTime = (time: string) => {
  const [hours, minutes] = time.split(':');
  const h = parseInt(hours);
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 || 12;
  return `${h12}:${minutes} ${ampm}`;
};

const getDuration = (start: string, end: string) => {
  const [sH, sM] = start.split(':').map(Number);
  const [eH, eM] = end.split(':').map(Number);
  const totalMinutes = (eH * 60 + eM) - (sH * 60 + sM);
  return totalMinutes + 'm';
};

// --- Sub-Components ---

const EventCard = ({ event, onClick }: { event: ConferenceEvent; onClick: () => void }) => (
  <Card className="overflow-hidden cursor-pointer hover:shadow-md transition-all group" onClick={onClick}>
    <div className="aspect-video w-full overflow-hidden bg-slate-100 relative">
      <img 
        src={event.image} 
        alt={event.name} 
        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" 
      />
      <div className="absolute top-3 right-3">
        <Badge className={cn("shadow-sm bg-white/90 backdrop-blur-sm text-slate-800 border-none hover:bg-white", 
          event.status === 'Live' && "text-red-600 bg-white/90"
        )}>
          {event.status === 'Live' && <span className="w-2 h-2 rounded-full bg-red-500 mr-1.5 animate-pulse" />}
          {event.status}
        </Badge>
      </div>
    </div>
    <CardContent className="p-5">
      <h3 className="font-bold text-lg text-slate-900 mb-2 leading-tight group-hover:text-blue-600 transition-colors">{event.name}</h3>
      <div className="space-y-1.5 mb-4">
        <div className="flex items-center text-xs text-slate-500 gap-2">
          <CalendarIcon className="h-3.5 w-3.5" />
          {formatDateRange(event.startDate, event.endDate)}
        </div>
        <div className="flex items-center text-xs text-slate-500 gap-2">
          <MapPin className="h-3.5 w-3.5" />
          {event.location}
        </div>
      </div>
      <div className="flex items-center justify-between pt-4 border-t border-slate-100">
        <div className="text-xs font-medium text-slate-600">
          <span className="text-slate-900 font-bold">{event.registrants}</span> registered
        </div>
        <div className="text-xs font-medium text-slate-600">
          <span className="text-emerald-600 font-bold">{formatCurrency(event.revenue)}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const SpeakerCard = ({ speaker, onEdit }: { speaker: Speaker; onEdit: (s: Speaker) => void }) => (
  <Card className="group overflow-hidden hover:shadow-md transition-all">
    <CardContent className="p-5 flex items-start gap-4">
      <Avatar className="h-16 w-16 border-2 border-slate-100 shrink-0">
        <AvatarImage src={speaker.avatar} />
        <AvatarFallback className="bg-slate-100 text-slate-500 font-bold text-lg">{speaker.firstName[0]}{speaker.lastName[0]}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <h4 className="font-bold text-slate-900 truncate">{speaker.firstName} {speaker.lastName}</h4>
            <p className="text-xs text-slate-500 truncate">{speaker.jobTitle}</p>
            <p className="text-xs text-slate-500 truncate">{speaker.company}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 -mr-2 text-slate-400 hover:text-slate-700">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit(speaker)}>Edit Details</DropdownMenuItem>
              <DropdownMenuItem>Send Invite</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-red-600">Remove</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="mt-3 flex items-center justify-between">
          <Badge variant="secondary" className={cn("text-[10px] h-5 px-1.5 font-medium border border-transparent", getStatusColor(speaker.status))}>
            {speaker.status}
          </Badge>
          <div className="flex gap-2">
            {speaker.linkedin && <Linkedin className="h-3.5 w-3.5 text-slate-400 hover:text-[#0077b5] cursor-pointer transition-colors" />}
            {speaker.twitter && <Twitter className="h-3.5 w-3.5 text-slate-400 hover:text-sky-500 cursor-pointer transition-colors" />}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const CreateEventDialog = ({ open, onOpenChange, onCreate }: { open: boolean, onOpenChange: (open: boolean) => void, onCreate: (evt: ConferenceEvent) => void }) => {
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [location, setLocation] = useState('');

  const handleSubmit = () => {
    if (!name) return;
    const newEvent: ConferenceEvent = {
      id: `evt-${Date.now()}`,
      name,
      slug: name.toLowerCase().replace(/ /g, '-'),
      startDate: date,
      endDate: date,
      location: location || 'TBD',
      status: 'Draft',
      registrants: 0,
      capacity: 100,
      revenue: 0,
      image: '',
      fundCode: 'NEW-EVT',
      tracks: [],
      rooms: [],
      sessionTypes: [{ id: 'typ-1', name: 'General' }],
      sessions: []
    };
    onCreate(newEvent);
    onOpenChange(false);
    setName('');
    setDate('');
    setLocation('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Event</DialogTitle>
          <DialogDescription>
            Add basic details to get started. You can configure tracks and rooms later.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="name">Event Name</Label>
            <Input id="name" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Annual Summit 2025" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="date">Start Date</Label>
            <Input id="date" type="date" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="location">Location</Label>
            <Input id="location" value={location} onChange={e => setLocation(e.target.value)} placeholder="Venue City, State" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleSubmit} disabled={!name} className="bg-slate-900 text-white">Create Event</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// --- CONFIGURATION COMPONENT (Tracks, Rooms, Types) ---
const EventConfiguration = ({ event, onUpdate }: { event: ConferenceEvent; onUpdate: (e: ConferenceEvent) => void }) => {
    
    // --- Handlers for Tracks ---
    const addTrack = () => {
        const newTrack: Track = { id: `tr-${Date.now()}`, name: 'New Track', color: 'bg-slate-100 text-slate-700' };
        onUpdate({ ...event, tracks: [...event.tracks, newTrack] });
    };
    const updateTrack = (id: string, updates: Partial<Track>) => {
        onUpdate({ ...event, tracks: event.tracks.map(t => t.id === id ? { ...t, ...updates } : t) });
    };
    const deleteTrack = (id: string) => {
        onUpdate({ ...event, tracks: event.tracks.filter(t => t.id !== id) });
    };

    // --- Handlers for Rooms ---
    const addRoom = () => {
        const newRoom: Room = { id: `rm-${Date.now()}`, name: 'New Room', capacity: 100 };
        onUpdate({ ...event, rooms: [...event.rooms, newRoom] });
    };
    const updateRoom = (id: string, updates: Partial<Room>) => {
        onUpdate({ ...event, rooms: event.rooms.map(r => r.id === id ? { ...r, ...updates } : r) });
    };
    const deleteRoom = (id: string) => {
        onUpdate({ ...event, rooms: event.rooms.filter(r => r.id !== id) });
    };

    // --- Handlers for Types ---
    const addType = () => {
        const newType: SessionType = { id: `typ-${Date.now()}`, name: 'Workshop' };
        onUpdate({ ...event, sessionTypes: [...event.sessionTypes, newType] });
    };
    const updateType = (id: string, updates: Partial<SessionType>) => {
        onUpdate({ ...event, sessionTypes: event.sessionTypes.map(t => t.id === id ? { ...t, ...updates } : t) });
    };
    const deleteType = (id: string) => {
        onUpdate({ ...event, sessionTypes: event.sessionTypes.filter(t => t.id !== id) });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-2">
                <h2 className="text-xl font-bold text-slate-900">Event Configuration</h2>
                <p className="text-slate-500 text-sm">Define the structure, locations, and categorization for this specific event.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* --- TRACKS CONFIG --- */}
                <Card className="border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-base">Tracks & Themes</CardTitle>
                            <CardDescription>Categorize sessions for attendee interest.</CardDescription>
                        </div>
                        <Button size="sm" variant="outline" onClick={addTrack}><Plus className="h-3 w-3 mr-2" /> Add Track</Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {event.tracks.length === 0 && <p className="text-sm text-slate-400 italic text-center py-4">No tracks defined.</p>}
                        {event.tracks.map(track => (
                            <div key={track.id} className="flex gap-3 items-start p-3 bg-slate-50 border border-slate-100 rounded-lg group">
                                <div className="grid gap-2 flex-1">
                                    <div className="flex gap-2">
                                        <Input 
                                            value={track.name} 
                                            onChange={(e) => updateTrack(track.id, { name: e.target.value })}
                                            className="h-8 bg-white" 
                                            placeholder="Track Name"
                                        />
                                        <Select 
                                            value={track.color} 
                                            onChange={(e) => updateTrack(track.id, { color: e.target.value })}
                                            className="w-32 h-8"
                                        >
                                            <option value="bg-slate-100 text-slate-700">Gray</option>
                                            <option value="bg-blue-100 text-blue-700">Blue</option>
                                            <option value="bg-purple-100 text-purple-700">Purple</option>
                                            <option value="bg-emerald-100 text-emerald-700">Emerald</option>
                                            <option value="bg-amber-100 text-amber-700">Amber</option>
                                            <option value="bg-rose-100 text-rose-700">Rose</option>
                                        </Select>
                                    </div>
                                    <Input 
                                        value={track.description || ''} 
                                        onChange={(e) => updateTrack(track.id, { description: e.target.value })}
                                        className="h-7 text-xs bg-white text-slate-500" 
                                        placeholder="Description (optional)"
                                    />
                                </div>
                                <div className="flex flex-col gap-1 items-center">
                                    <Badge variant="secondary" className={cn("text-[10px] w-full justify-center", track.color)}>Preview</Badge>
                                    <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => deleteTrack(track.id)}>
                                        <Trash2 className="h-3 w-3" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                {/* --- ROOMS CONFIG --- */}
                <Card className="border-slate-200">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-base">Venues & Rooms</CardTitle>
                            <CardDescription>Define physical spaces and capacities.</CardDescription>
                        </div>
                        <Button size="sm" variant="outline" onClick={addRoom}><Plus className="h-3 w-3 mr-2" /> Add Room</Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {event.rooms.length === 0 && <p className="text-sm text-slate-400 italic text-center py-4">No rooms defined.</p>}
                        {event.rooms.map(room => (
                            <div key={room.id} className="flex gap-3 items-start p-3 bg-slate-50 border border-slate-100 rounded-lg group">
                                <div className="p-2 bg-white rounded border border-slate-200 text-slate-400 mt-1">
                                    <DoorOpen className="h-4 w-4" />
                                </div>
                                <div className="grid gap-2 flex-1">
                                    <div className="flex gap-2">
                                        <Input 
                                            value={room.name} 
                                            onChange={(e) => updateRoom(room.id, { name: e.target.value })}
                                            className="h-8 bg-white font-medium" 
                                            placeholder="Room Name"
                                        />
                                        <div className="relative w-24">
                                            <Users className="absolute left-2 top-2 h-3 w-3 text-slate-400" />
                                            <Input 
                                                type="number"
                                                value={room.capacity} 
                                                onChange={(e) => updateRoom(room.id, { capacity: parseInt(e.target.value) })}
                                                className="h-8 bg-white pl-7 text-xs" 
                                                placeholder="Cap."
                                            />
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Compass className="h-3 w-3 text-slate-400" />
                                        <Input 
                                            value={room.locationDescription || ''} 
                                            onChange={(e) => updateRoom(room.id, { locationDescription: e.target.value })}
                                            className="h-7 text-xs bg-white text-slate-500 border-dashed" 
                                            placeholder="Location Details (e.g. 2nd Floor, West Wing)"
                                        />
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-red-500" onClick={() => deleteRoom(room.id)}>
                                    <Trash2 className="h-3 w-3" />
                                </Button>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                 {/* --- SESSION TYPES CONFIG --- */}
                 <Card className="border-slate-200 lg:col-span-2">
                    <CardHeader className="flex flex-row items-center justify-between pb-4">
                        <div>
                            <CardTitle className="text-base">Session Types</CardTitle>
                            <CardDescription>Custom labels for different schedule items.</CardDescription>
                        </div>
                        <Button size="sm" variant="outline" onClick={addType}><Plus className="h-3 w-3 mr-2" /> Add Type</Button>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap gap-4">
                            {event.sessionTypes.map(type => (
                                <div key={type.id} className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg p-2 pr-3">
                                    <div className="p-1.5 bg-white rounded border border-slate-100 shadow-sm text-blue-600">
                                        <Presentation className="h-3.5 w-3.5" />
                                    </div>
                                    <Input 
                                        value={type.name} 
                                        onChange={(e) => updateType(type.id, { name: e.target.value })}
                                        className="h-7 w-32 bg-transparent border-none text-sm font-medium focus:ring-0 px-0" 
                                        placeholder="Type Name"
                                    />
                                    <button onClick={() => deleteType(type.id)} className="text-slate-400 hover:text-red-500 transition-colors ml-2">
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

const AttendeeManager = ({ attendees, event }: { attendees: Attendee[], event: ConferenceEvent }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('All');
    const [selectedAttendee, setSelectedAttendee] = useState<Attendee | null>(null);

    const filteredAttendees = attendees.filter(att => {
        const matchesSearch = att.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                              att.email.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'All' || att.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const stats = {
        total: attendees.length,
        checkedIn: attendees.filter(a => a.status === 'Checked In').length,
        vip: attendees.filter(a => a.isVip).length,
        revenue: attendees.filter(a => a.paymentStatus === 'Paid').length * 100 // Mock calc
    };

    return (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Registered</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{stats.total}</p>
                        </div>
                        <div className="h-10 w-10 bg-blue-50 rounded-full flex items-center justify-center text-blue-600">
                            <Users className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Checked In</p>
                            <div className="flex items-baseline gap-2 mt-1">
                                <p className="text-2xl font-bold text-emerald-700">{stats.checkedIn}</p>
                                <span className="text-xs text-slate-400">/ {stats.total}</span>
                            </div>
                        </div>
                        <div className="h-10 w-10 bg-emerald-50 rounded-full flex items-center justify-center text-emerald-600">
                            <CheckCircle2 className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">VIP / Speaker</p>
                            <p className="text-2xl font-bold text-purple-700 mt-1">{stats.vip}</p>
                        </div>
                        <div className="h-10 w-10 bg-purple-50 rounded-full flex items-center justify-center text-purple-600">
                            <Tag className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
                <Card className="border-slate-200 shadow-sm bg-white">
                    <CardContent className="p-4 flex items-center justify-between">
                        <div>
                            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Est. Revenue</p>
                            <p className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(stats.revenue)}</p>
                        </div>
                        <div className="h-10 w-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-500">
                            <DollarSign className="h-5 w-5" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Main Content */}
            <Card className="border-slate-200 shadow-sm overflow-hidden flex flex-col bg-white min-h-[500px]">
                {/* Toolbar */}
                <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col md:flex-row justify-between items-center gap-4">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <Input 
                                placeholder="Search by name, email..." 
                                className="pl-9 bg-white border-slate-200 h-9" 
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="outline" className="h-9 border-slate-200 bg-white text-slate-700">
                                    <Filter className="h-3.5 w-3.5 mr-2" /> {statusFilter === 'All' ? 'Filter' : statusFilter}
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                <DropdownMenuLabel>Filter Status</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                {['All', 'Registered', 'Checked In', 'Cancelled', 'Waitlist'].map(status => (
                                    <DropdownMenuCheckboxItem 
                                        key={status}
                                        checked={statusFilter === status}
                                        onCheckedChange={() => setStatusFilter(status)}
                                    >
                                        {status}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" className="h-9 border-slate-200 bg-white text-slate-700">
                            <Download className="h-3.5 w-3.5 mr-2" /> Export
                        </Button>
                        <Button variant="outline" className="h-9 border-slate-200 bg-white text-slate-700">
                            <Printer className="h-3.5 w-3.5 mr-2" /> Badges
                        </Button>
                        <Button className="h-9 bg-slate-900 text-white shadow-sm">
                            <Plus className="h-3.5 w-3.5 mr-2" /> Register Attendee
                        </Button>
                    </div>
                </div>

                {/* Table */}
                <div className="flex-1 overflow-auto">
                    <Table>
                        <TableHeader className="bg-slate-50 sticky top-0 z-10">
                            <TableRow className="hover:bg-transparent">
                                <TableHead className="w-[250px]">Attendee</TableHead>
                                <TableHead>Ticket Type</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Sessions</TableHead>
                                <TableHead>Payment</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredAttendees.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-64 text-center text-slate-400">
                                        No attendees found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredAttendees.map(att => (
                                    <TableRow 
                                        key={att.id} 
                                        className="hover:bg-slate-50/50 cursor-pointer group"
                                        onClick={() => setSelectedAttendee(att)}
                                    >
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Avatar className="h-9 w-9 border border-slate-100">
                                                    <AvatarImage src={att.avatar} />
                                                    <AvatarFallback className="bg-slate-100 text-slate-600 font-bold text-xs">{getInitials(att.name)}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <div className="font-semibold text-slate-900 flex items-center gap-2">
                                                        {att.name}
                                                        {att.isVip && <Badge variant="secondary" className="h-4 px-1 text-[9px] bg-purple-100 text-purple-700 border-purple-200">VIP</Badge>}
                                                    </div>
                                                    <div className="text-xs text-slate-500">{att.email}</div>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-medium bg-slate-50 text-slate-600 border-slate-200">{att.ticketType}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className={cn("inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border", 
                                                att.status === 'Checked In' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                                                att.status === 'Cancelled' ? "bg-red-50 text-red-700 border-red-200" :
                                                "bg-blue-50 text-blue-700 border-blue-200"
                                            )}>
                                                {att.status === 'Checked In' && <CheckCircle2 className="h-3 w-3 mr-1" />}
                                                {att.status}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="text-sm text-slate-600">
                                                {att.assignedSessions.length} registered
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className={cn("text-xs font-bold", att.paymentStatus === 'Paid' ? "text-emerald-600" : "text-amber-600")}>
                                                {att.paymentStatus}
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 group-hover:text-slate-600">
                                                <ChevronRight className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </Card>

            {/* Attendee Detail Sheet */}
            <Sheet open={!!selectedAttendee} onOpenChange={(open) => !open && setSelectedAttendee(null)}>
                <SheetContent className="w-full sm:max-w-2xl p-0 gap-0 overflow-hidden flex flex-col bg-slate-50 border-l border-slate-200">
                    {selectedAttendee && (
                        <>
                            <div className="bg-white border-b border-slate-200 p-6 pb-0 z-10 shrink-0">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex gap-5">
                                        <div className="relative">
                                            <Avatar className="h-20 w-20 border-4 border-slate-50 shadow-sm">
                                                <AvatarImage src={selectedAttendee.avatar} />
                                                <AvatarFallback className="text-xl bg-slate-100 text-slate-600 font-bold">{getInitials(selectedAttendee.name)}</AvatarFallback>
                                            </Avatar>
                                            {selectedAttendee.status === 'Checked In' && (
                                                <div className="absolute -bottom-1 -right-1 bg-emerald-500 text-white p-1 rounded-full border-4 border-white" title="Checked In">
                                                    <CheckCircle2 className="h-4 w-4" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="pt-1">
                                            <h2 className="text-2xl font-bold text-slate-900">{selectedAttendee.name}</h2>
                                            <div className="flex items-center gap-2 text-slate-500 mt-1 text-sm">
                                                {selectedAttendee.jobTitle && <span>{selectedAttendee.jobTitle}</span>}
                                                {selectedAttendee.organization && (
                                                    <>
                                                        <span className="text-slate-300">•</span>
                                                        <span className="font-medium text-slate-700">{selectedAttendee.organization}</span>
                                                    </>
                                                )}
                                            </div>
                                            <div className="flex gap-2 mt-3">
                                                <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-100">{selectedAttendee.ticketType}</Badge>
                                                {selectedAttendee.isVip && <Badge className="bg-purple-100 text-purple-700 hover:bg-purple-100 border-purple-200">VIP</Badge>}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Button variant="outline" size="sm" className="h-9 gap-2">
                                            <Mail className="h-3.5 w-3.5" /> Message
                                        </Button>
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="icon" className="h-9 w-9">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem asChild><Link to="/mission-control/crm">View CRM Profile</Link></DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem className="text-red-600">Cancel Registration</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </div>
                                </div>

                                <Tabs defaultValue="overview" className="w-full">
                                    <TabsList className="bg-transparent h-auto p-0 gap-6 w-full border-b border-transparent">
                                        <TabsTrigger value="overview" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-1 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 transition-all">Overview</TabsTrigger>
                                        <TabsTrigger value="schedule" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-1 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 transition-all">My Agenda</TabsTrigger>
                                        <TabsTrigger value="financials" className="bg-transparent border-b-2 border-transparent data-[state=active]:border-blue-600 data-[state=active]:shadow-none rounded-none px-1 py-3 text-sm font-medium text-slate-500 data-[state=active]:text-blue-600 transition-all">Financials</TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            <ScrollArea className="flex-1">
                                <div className="p-8 space-y-8">
                                    
                                    {/* --- OVERVIEW TAB CONTENT --- */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        
                                        {/* Left Column: Info */}
                                        <div className="space-y-6">
                                            {/* Needs & Alerts */}
                                            {(selectedAttendee.dietaryRestrictions || selectedAttendee.accessibilityNeeds) && (
                                                <div className="bg-amber-50 border border-amber-100 rounded-xl p-4 space-y-3">
                                                    <h4 className="text-amber-900 font-bold text-sm uppercase tracking-wide flex items-center gap-2">
                                                        <AlertTriangle className="h-4 w-4" /> Important Needs
                                                    </h4>
                                                    {selectedAttendee.dietaryRestrictions && (
                                                        <div className="flex items-start gap-3 text-sm text-amber-800">
                                                            <Utensils className="h-4 w-4 mt-0.5 opacity-60" />
                                                            <span><strong>Dietary:</strong> {selectedAttendee.dietaryRestrictions}</span>
                                                        </div>
                                                    )}
                                                    {selectedAttendee.accessibilityNeeds && (
                                                        <div className="flex items-start gap-3 text-sm text-amber-800">
                                                            <Accessibility className="h-4 w-4 mt-0.5 opacity-60" />
                                                            <span><strong>Accessibility:</strong> {selectedAttendee.accessibilityNeeds}</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}

                                            <Card>
                                                <CardHeader className="pb-3 border-b border-slate-100">
                                                    <CardTitle className="text-sm font-bold uppercase tracking-wider text-slate-500">Contact Details</CardTitle>
                                                </CardHeader>
                                                <CardContent className="pt-4 space-y-4">
                                                    <div className="space-y-1">
                                                        <label className="text-xs text-slate-400 font-medium uppercase">Email</label>
                                                        <div className="text-sm font-medium text-slate-900">{selectedAttendee.email}</div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-xs text-slate-400 font-medium uppercase">Registration Date</label>
                                                        <div className="text-sm font-medium text-slate-900">{selectedAttendee.registrationDate}</div>
                                                    </div>
                                                    {selectedAttendee.tshirtSize && (
                                                        <div className="space-y-1">
                                                            <label className="text-xs text-slate-400 font-medium uppercase">T-Shirt Size</label>
                                                            <div className="text-sm font-medium text-slate-900">{selectedAttendee.tshirtSize}</div>
                                                        </div>
                                                    )}
                                                </CardContent>
                                            </Card>

                                            {selectedAttendee.notes && (
                                                <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 text-sm text-yellow-900 italic">
                                                    "{selectedAttendee.notes}"
                                                </div>
                                            )}
                                        </div>

                                        {/* Right Column: Badge Preview & Checkin */}
                                        <div className="space-y-6">
                                            <Card className="border-slate-200 shadow-sm bg-slate-50/50">
                                                <CardContent className="p-6 flex flex-col items-center text-center gap-4">
                                                    {selectedAttendee.status === 'Checked In' ? (
                                                        <div className="h-16 w-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                                                            <CheckCircle2 className="h-8 w-8" />
                                                        </div>
                                                    ) : (
                                                        <div className="h-16 w-16 bg-white border-2 border-slate-200 rounded-full flex items-center justify-center text-slate-300 mb-2">
                                                            <ScanLine className="h-8 w-8" />
                                                        </div>
                                                    )}
                                                    <div>
                                                        <h3 className="font-bold text-slate-900">
                                                            {selectedAttendee.status === 'Checked In' ? `Checked in at ${formatTime(selectedAttendee.checkInTime?.split('T')[1] || '09:00')}` : 'Not Checked In'}
                                                        </h3>
                                                        <p className="text-sm text-slate-500 mt-1">
                                                            {selectedAttendee.status === 'Checked In' ? 'Access granted.' : 'Ready for arrival.'}
                                                        </p>
                                                    </div>
                                                    <Button 
                                                        className={cn("w-full shadow-md", selectedAttendee.status === 'Checked In' ? "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50" : "bg-emerald-600 hover:bg-emerald-700 text-white")}
                                                    >
                                                        {selectedAttendee.status === 'Checked In' ? 'Print Badge' : 'Check In Now'}
                                                    </Button>
                                                </CardContent>
                                            </Card>

                                            {/* Badge Visual */}
                                            <div className="border border-slate-200 bg-white rounded-xl shadow-sm p-4 relative overflow-hidden group">
                                                <div className="absolute top-0 left-0 w-full h-2 bg-blue-600" />
                                                <div className="flex justify-between items-start mb-8 mt-2">
                                                    <div className="font-bold text-lg tracking-tight text-slate-900">GIC<span className="text-blue-600">2025</span></div>
                                                    <div className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Attendee</div>
                                                </div>
                                                <div className="text-center mb-8">
                                                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{selectedAttendee.name}</h2>
                                                    <p className="text-sm text-slate-500 font-medium mt-1 uppercase tracking-wide">{selectedAttendee.organization || 'Guest'}</p>
                                                </div>
                                                <div className="flex justify-between items-end">
                                                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{selectedAttendee.ticketType}</div>
                                                    <QrCode className="h-12 w-12 text-slate-900" />
                                                </div>
                                                
                                                {/* Hover Overlay */}
                                                <div className="absolute inset-0 bg-white/90 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <Button variant="outline" className="gap-2">
                                                        <Printer className="h-4 w-4" /> Print Preview
                                                    </Button>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                    
                                    {/* My Agenda Section (Visual only for now) */}
                                    <div className="pt-8 border-t border-slate-100">
                                        <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <CalendarDays className="h-5 w-5 text-slate-500" /> Personal Agenda
                                        </h3>
                                        {selectedAttendee.assignedSessions.length > 0 ? (
                                            <div className="space-y-3">
                                                {selectedAttendee.assignedSessions.map(sessionId => {
                                                    const session = event.sessions.find(s => s.id === sessionId);
                                                    if (!session) return null;
                                                    const room = event.rooms.find(r => r.id === session.locationId);
                                                    return (
                                                        <div key={sessionId} className="flex gap-4 p-3 bg-white border border-slate-200 rounded-lg shadow-sm">
                                                            <div className="w-16 text-center border-r border-slate-100 pr-4 flex flex-col justify-center">
                                                                <span className="text-xs font-bold text-slate-900">{formatTime(session.startTime)}</span>
                                                                <span className="text-[10px] text-slate-400">{getDuration(session.startTime, session.endTime)}</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <h4 className="font-bold text-slate-900 text-sm">{session.title}</h4>
                                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                                    <MapPin className="h-3 w-3" /> {room?.name || 'TBD'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        ) : (
                                            <p className="text-sm text-slate-500 italic">No sessions selected yet.</p>
                                        )}
                                    </div>
                                </div>
                            </ScrollArea>

                            {/* Sticky Footer */}
                            <div className="p-4 bg-white border-t border-slate-200 flex justify-between items-center text-xs text-slate-500 shrink-0">
                                <span>Ref ID: {selectedAttendee.id}</span>
                                <Button variant="link" className="text-blue-600 p-0 h-auto font-semibold">View in Donor Portal</Button>
                            </div>
                        </>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
};

const RegistrationFormBuilder = () => {
  const [fields, setFields] = useState<FormField[]>(DEFAULT_FORM_FIELDS);
  return (
    <div className="flex h-[calc(100vh-14rem)] gap-6">
      {/* Canvas */}
      <div className="flex-1 bg-slate-100 rounded-xl border border-slate-200 overflow-y-auto p-8 flex justify-center">
        <div className="w-full max-w-2xl bg-white shadow-sm rounded-lg border border-slate-200 min-h-[600px] flex flex-col">
          <div className="p-8 border-b border-slate-100 bg-slate-50/50 rounded-t-lg">
            <div className="h-8 w-32 bg-slate-200 rounded mb-4" />
            <div className="h-4 w-64 bg-slate-200 rounded" />
          </div>
          <div className="p-8 space-y-6">
            {fields.map((field) => (
              <div key={field.id} className="group relative p-4 border border-transparent hover:border-blue-200 hover:bg-blue-50/30 rounded-lg transition-all cursor-pointer -mx-4">
                <Label className="mb-2 block text-sm font-semibold text-slate-700">
                  {field.label} {field.required && <span className="text-red-500">*</span>}
                </Label>
                
                {field.type === 'text' || field.type === 'email' || field.type === 'date' ? (
                  <Input disabled placeholder={field.placeholder || ''} className="bg-slate-50 pointer-events-none" />
                ) : field.type === 'textarea' ? (
                  <Textarea disabled className="bg-slate-50 min-h-[80px] pointer-events-none" />
                ) : field.type === 'select' ? (
                  <Select disabled className="pointer-events-none">
                    <option>Select an option...</option>
                  </Select>
                ) : (
                  <div className="h-10 bg-slate-50 rounded border border-slate-200 flex items-center px-3 text-sm text-slate-400 italic">
                    {field.type} input preview
                  </div>
                )}
                
                {field.helpText && <p className="text-xs text-slate-500 mt-1.5">{field.helpText}</p>}

                <div className="absolute right-2 top-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <Button variant="ghost" size="icon" className="h-7 w-7"><Settings className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-600"><Trash2 className="h-3.5 w-3.5" /></Button>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full border-dashed border-slate-300 text-slate-500 hover:border-slate-400 hover:text-slate-700 h-12">
              <Plus className="h-4 w-4 mr-2" /> Add Field
            </Button>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-white rounded-xl border border-slate-200 flex flex-col overflow-hidden shrink-0">
        <div className="p-4 border-b border-slate-100 font-semibold text-sm">Form Elements</div>
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">Basic Fields</p>
            <div className="grid grid-cols-2 gap-2">
              {['Text', 'Email', 'Number', 'Date', 'Select', 'Checkbox'].map(type => (
                <div key={type} className="flex items-center gap-2 p-2 rounded border border-slate-200 bg-slate-50 hover:border-blue-300 hover:bg-blue-50 cursor-grab active:cursor-grabbing transition-colors">
                  <div className="w-4 h-4 bg-white border border-slate-200 rounded flex items-center justify-center text-[8px] font-bold text-slate-400">Aa</div>
                  <span className="text-xs font-medium text-slate-700">{type}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const CheckInKiosk = ({ onClose }: { onClose: () => void }) => {
  const [search, setSearch] = useState('');
  const [attendee, setAttendee] = useState<Attendee | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock search
    const found = MOCK_ATTENDEES.find(a => a.email.toLowerCase() === search.toLowerCase() || a.name.toLowerCase().includes(search.toLowerCase()));
    setAttendee(found || null);
  };

  const handleCheckIn = () => {
    if (attendee) {
      // In real app, update state/DB
      alert(`${attendee.name} Checked In!`);
      setAttendee(null);
      setSearch('');
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col items-center justify-center p-4">
      <Button 
        variant="ghost" 
        onClick={onClose} 
        className="absolute top-4 right-4 text-white/50 hover:text-white hover:bg-white/10"
      >
        <X className="h-6 w-6" />
      </Button>

      <div className="w-full max-w-md space-y-8">
        <div className="text-center space-y-2 text-white">
          <div className="w-16 h-16 bg-white rounded-2xl mx-auto flex items-center justify-center mb-6">
            <ScanLine className="h-8 w-8 text-slate-900" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Event Check-In</h1>
          <p className="text-slate-400">Scan QR code or search by name/email.</p>
        </div>

        {!attendee ? (
          <form onSubmit={handleSearch} className="relative">
            <Search className="absolute left-4 top-4 h-6 w-6 text-slate-400" />
            <input 
              autoFocus
              className="w-full h-14 pl-12 pr-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white/20 transition-all text-lg"
              placeholder="Search attendee..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </form>
        ) : (
          <div className="bg-white rounded-2xl p-6 animate-in zoom-in-95 duration-300">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-blue-50 text-blue-600 rounded-full mx-auto flex items-center justify-center text-2xl font-bold mb-3 border-4 border-blue-100">
                {getInitials(attendee.name)}
              </div>
              <h2 className="text-2xl font-bold text-slate-900">{attendee.name}</h2>
              <p className="text-slate-500">{attendee.email}</p>
              <div className="mt-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                {attendee.ticketType}
              </div>
            </div>

            <div className="space-y-3">
              {attendee.status === 'Checked In' ? (
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-xl flex items-center justify-center gap-2 font-bold border border-emerald-100">
                  <CheckCircle2 className="h-5 w-5" /> Already Checked In
                </div>
              ) : (
                <Button onClick={handleCheckIn} className="w-full h-14 text-lg font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-900/20">
                  Check In
                </Button>
              )}
              <Button variant="outline" onClick={() => { setAttendee(null); setSearch(''); }} className="w-full h-12">
                Cancel
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const ScheduleManager = ({ event, speakers, onUpdateSession }: { event: ConferenceEvent, speakers: Speaker[], onUpdateSession: (s: Session) => void }) => {
  const [sessions, setSessions] = useState<Session[]>(event.sessions || []);
  const [selectedDate, setSelectedDate] = useState(event.startDate);
  const [editSession, setEditSession] = useState<Session | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Helper to get dates between start and end
  const getEventDates = () => {
    const dates = [];
    const curr = new Date(event.startDate);
    const end = new Date(event.endDate);
    while (curr <= end) {
      dates.push(curr.toISOString().split('T')[0]);
      curr.setDate(curr.getDate() + 1);
    }
    return dates;
  };

  const dates = getEventDates();

  const handleSaveSession = (session: Session) => {
    let updatedSessions;
    if (session.id && sessions.find(s => s.id === session.id)) {
      updatedSessions = sessions.map(s => s.id === session.id ? session : s);
    } else {
      const newSession = { ...session, id: `sess-${Date.now()}` };
      updatedSessions = [...sessions, newSession];
    }
    setSessions(updatedSessions);
    // In a real app, propagate this up to the event object
    // onUpdateSession(session); 
    setIsEditorOpen(false);
  };

  const handleDeleteSession = (id: string) => {
    setSessions(prev => prev.filter(s => s.id !== id));
    setIsEditorOpen(false);
  };

  const filteredSessions = sessions
    .filter(s => s.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="flex flex-col h-[calc(100vh-14rem)] bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
      
      {/* Schedule Toolbar */}
      <div className="flex flex-col md:flex-row justify-between items-center p-4 border-b border-slate-100 gap-4 bg-slate-50/50">
        <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-1 md:pb-0 scrollbar-hide">
          {dates.map(date => {
            const d = new Date(date);
            return (
              <button
                key={date}
                onClick={() => setSelectedDate(date)}
                className={cn(
                  "flex flex-col items-center px-4 py-2 rounded-lg border transition-all min-w-[80px]",
                  selectedDate === date 
                    ? "bg-slate-900 text-white border-slate-900 shadow-md" 
                    : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                )}
              >
                <span className="text-[10px] font-bold uppercase tracking-wider opacity-70">{d.toLocaleDateString('en-US', { weekday: 'short' })}</span>
                <span className="text-lg font-bold leading-none">{d.getDate()}</span>
              </button>
            )
          })}
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
           <Button variant="outline" className="bg-white" onClick={() => {/* Filter logic */}}>
             <Filter className="h-4 w-4 mr-2" /> Filter
           </Button>
           <Button className="bg-slate-900 text-white" onClick={() => { setEditSession(null); setIsEditorOpen(true); }}>
             <Plus className="h-4 w-4 mr-2" /> Add Session
           </Button>
        </div>
      </div>

      {/* Timeline View */}
      <div className="flex-1 overflow-y-auto p-4 bg-slate-50/30">
         <div className="space-y-4 max-w-5xl mx-auto">
            {filteredSessions.length === 0 && (
               <div className="text-center py-20 text-slate-400">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-20" />
                  <p>No sessions scheduled for this day.</p>
                  <Button variant="link" onClick={() => { setEditSession(null); setIsEditorOpen(true); }}>Schedule First Session</Button>
               </div>
            )}

            {filteredSessions.map(session => {
               const track = event.tracks.find(t => t.id === session.trackId);
               const room = event.rooms.find(r => r.id === session.locationId);
               const type = event.sessionTypes.find(t => t.id === session.typeId);
               const sessionSpeakers = speakers.filter(s => session.speakerIds.includes(s.id));
               
               // Check conflicts (simplistic check for demo)
               const hasConflict = sessions.some(s => 
                 s.id !== session.id && 
                 s.date === session.date &&
                 s.locationId === session.locationId && 
                 ((s.startTime >= session.startTime && s.startTime < session.endTime) || 
                  (s.endTime > session.startTime && s.endTime <= session.endTime))
               );

               return (
                  <div 
                    key={session.id} 
                    onClick={() => { setEditSession(session); setIsEditorOpen(true); }}
                    className="flex group relative pl-20 py-2 cursor-pointer"
                  >
                     {/* Time Column */}
                     <div className="absolute left-0 top-2 w-16 text-right">
                        <span className="text-sm font-bold text-slate-900 block">{formatTime(session.startTime)}</span>
                        <span className="text-xs text-slate-400 font-medium">{getDuration(session.startTime, session.endTime)}</span>
                     </div>

                     {/* Connector */}
                     <div className="absolute left-[70px] top-0 bottom-0 w-px bg-slate-200 group-hover:bg-slate-300 transition-colors">
                        <div className="absolute top-4 -left-1.5 w-3 h-3 rounded-full bg-slate-300 ring-4 ring-white group-hover:bg-blue-500 transition-colors" />
                     </div>

                     {/* Card */}
                     <div className={cn(
                       "flex-1 ml-4 bg-white rounded-xl border p-4 shadow-sm transition-all hover:shadow-md hover:border-blue-300 relative overflow-hidden",
                       hasConflict ? "border-red-300 bg-red-50/30" : "border-slate-200"
                     )}>
                        {track && <div className={cn("absolute left-0 top-0 bottom-0 w-1", track.color.split(' ')[0].replace('bg-', 'bg-'))} />}
                        
                        <div className="flex justify-between items-start mb-2 pl-2">
                           <div className="flex gap-2 items-center">
                              {track && <Badge variant="secondary" className={cn("text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 border-transparent", track.color)}>{track.name}</Badge>}
                              {type && <Badge variant="outline" className="text-[10px] text-slate-500 border-slate-200">{type.name}</Badge>}
                              {hasConflict && <Badge variant="destructive" className="text-[10px] h-5 gap-1"><AlertTriangle className="h-3 w-3" /> Room Conflict</Badge>}
                           </div>
                           <div className="text-xs text-slate-400 flex items-center gap-1">
                              <MapPin className="h-3 w-3" /> 
                              <span title={room?.locationDescription}>{room?.name || 'TBD'}</span>
                           </div>
                        </div>
                        
                        <h3 className="text-lg font-bold text-slate-900 mb-1 pl-2">{session.title}</h3>
                        
                        <div className="flex items-center gap-4 mt-4 pl-2">
                           {sessionSpeakers.length > 0 ? (
                              <div className="flex -space-x-2">
                                 {sessionSpeakers.map(s => (
                                    <Avatar key={s.id} className="h-8 w-8 border-2 border-white ring-1 ring-slate-100" title={`${s.firstName} ${s.lastName}`}>
                                       <AvatarImage src={s.avatar} />
                                       <AvatarFallback className="bg-slate-100 text-[10px]">{s.firstName[0]}{s.lastName[0]}</AvatarFallback>
                                    </Avatar>
                                 ))}
                              </div>
                           ) : (
                              <div className="flex items-center gap-2 text-xs text-slate-400 italic">
                                 <User className="h-3 w-3" /> No speakers assigned
                              </div>
                           )}
                           
                           {session.description && (
                              <p className="text-sm text-slate-500 line-clamp-1 flex-1">{session.description}</p>
                           )}
                        </div>
                     </div>
                  </div>
               )
            })}
         </div>
      </div>

      {/* --- SESSION EDITOR SHEET --- */}
      <Sheet open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <SheetContent className="w-full sm:max-w-xl p-0 gap-0 flex flex-col h-full bg-slate-50">
          <SheetHeader className="px-6 py-4 bg-white border-b border-slate-100 shrink-0">
             <SheetTitle className="flex items-center gap-2 text-lg">
                {editSession ? <><FileText className="h-4 w-4 text-blue-600" /> Edit Session</> : <><Plus className="h-4 w-4 text-blue-600" /> New Session</>}
             </SheetTitle>
             <SheetDescription>Configure details using the event's defined tracks and rooms.</SheetDescription>
          </SheetHeader>
          
          {/* Scrollable Form */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
             <SessionForm 
                initialData={editSession} 
                defaultDate={selectedDate}
                event={event} // Pass the full event config
                speakers={speakers}
                onSave={handleSaveSession}
                onDelete={handleDeleteSession}
             />
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

const SessionForm = ({ initialData, defaultDate, event, speakers, onSave, onDelete }: any) => {
   const [formData, setFormData] = useState<Partial<Session>>(initialData || {
      title: '',
      description: '',
      date: defaultDate,
      startTime: '09:00',
      endTime: '10:00',
      locationId: '',
      speakerIds: [],
      trackId: '',
      typeId: '',
      isPublished: true
   });

   const toggleSpeaker = (id: string) => {
      const current = formData.speakerIds || [];
      if (current.includes(id)) {
         setFormData({ ...formData, speakerIds: current.filter(sid => sid !== id) });
      } else {
         setFormData({ ...formData, speakerIds: [...current, id] });
      }
   };

   return (
      <div className="space-y-6">
         <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200 shadow-sm">
            <div className="space-y-2">
               <Label>Session Title</Label>
               <Input 
                  value={formData.title} 
                  onChange={e => setFormData({ ...formData, title: e.target.value })} 
                  placeholder="e.g. The Future of Fundraising"
                  className="font-semibold"
               />
            </div>
            <div className="space-y-2">
               <Label>Abstract / Description</Label>
               <Textarea 
                  value={formData.description} 
                  onChange={e => setFormData({ ...formData, description: e.target.value })} 
                  className="min-h-[80px]"
                  placeholder="What will attendees learn?"
               />
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <Label>Date</Label>
               <Input 
                  type="date" 
                  value={formData.date} 
                  onChange={e => setFormData({ ...formData, date: e.target.value })} 
               />
            </div>
            <div className="space-y-2">
               <Label>Type</Label>
               <Select 
                  value={formData.typeId} 
                  onChange={e => setFormData({ ...formData, typeId: e.target.value })}
               >
                  <option value="">Select Type...</option>
                  {event.sessionTypes.map((t: SessionType) => (
                      <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
               </Select>
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <Label>Start Time</Label>
               <Input 
                  type="time" 
                  value={formData.startTime} 
                  onChange={e => setFormData({ ...formData, startTime: e.target.value })} 
               />
            </div>
            <div className="space-y-2">
               <Label>End Time</Label>
               <Input 
                  type="time" 
                  value={formData.endTime} 
                  onChange={e => setFormData({ ...formData, endTime: e.target.value })} 
               />
            </div>
         </div>

         <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
               <Label>Track</Label>
               <Select 
                  value={formData.trackId} 
                  onChange={e => setFormData({ ...formData, trackId: e.target.value })}
               >
                  <option value="">Select Track...</option>
                  {event.tracks.map((t: Track) => <option key={t.id} value={t.id}>{t.name}</option>)}
               </Select>
            </div>
            <div className="space-y-2">
               <Label>Location</Label>
               <Select 
                  value={formData.locationId} 
                  onChange={e => setFormData({ ...formData, locationId: e.target.value })}
               >
                  <option value="">Select Room...</option>
                  {event.rooms.map((r: Room) => (
                      <option key={r.id} value={r.id}>{r.name} ({r.capacity} cap)</option>
                  ))}
               </Select>
            </div>
         </div>
         
         {/* Show location description if selected */}
         {formData.locationId && (
             <div className="bg-slate-50 p-2 rounded text-xs text-slate-500 flex items-center gap-2">
                 <Compass className="h-3 w-3" />
                 {event.rooms.find((r: Room) => r.id === formData.locationId)?.locationDescription || 'No location details'}
             </div>
         )}

         <div className="space-y-3">
            <Label>Speakers</Label>
            <div className="border border-slate-200 rounded-lg max-h-48 overflow-y-auto bg-white divide-y divide-slate-100">
               {speakers.map((s: Speaker) => (
                  <div 
                     key={s.id} 
                     onClick={() => toggleSpeaker(s.id)}
                     className="flex items-center gap-3 p-2 hover:bg-slate-50 cursor-pointer"
                  >
                     <div className={cn(
                        "w-4 h-4 border rounded flex items-center justify-center transition-colors",
                        formData.speakerIds?.includes(s.id) ? "bg-blue-600 border-blue-600 text-white" : "border-slate-300 bg-white"
                     )}>
                        {formData.speakerIds?.includes(s.id) && <Check className="w-3 h-3" />}
                     </div>
                     <Avatar className="h-6 w-6">
                        <AvatarImage src={s.avatar} />
                        <AvatarFallback>{s.firstName[0]}</AvatarFallback>
                     </Avatar>
                     <span className="text-sm font-medium">{s.firstName} {s.lastName}</span>
                  </div>
               ))}
            </div>
         </div>

         <div className="flex items-center justify-between p-3 border rounded-lg bg-white">
            <Label className="cursor-pointer" htmlFor="publish-switch">Publish to App</Label>
            <Switch 
               id="publish-switch"
               checked={formData.isPublished}
               onCheckedChange={c => setFormData({ ...formData, isPublished: c })}
            />
         </div>

         <div className="pt-6 flex justify-between border-t border-slate-200">
            {initialData?.id ? (
               <Button variant="ghost" onClick={() => onDelete(initialData.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                  <Trash2 className="h-4 w-4 mr-2" /> Delete
               </Button>
            ) : <div />}
            <Button onClick={() => onSave(formData)} className="bg-slate-900 text-white shadow-md">
               <Save className="h-4 w-4 mr-2" /> Save Session
            </Button>
         </div>
      </div>
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
                                    <p className="text-xs text-slate-500">{session.startTime} • {MOCK_ROOMS.find(r=>r.id === session.locationId)?.name}</p>
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

  const handleUpdateEvent = (updatedEvent: ConferenceEvent) => {
      setEvents(prev => prev.map(e => e.id === updatedEvent.id ? updatedEvent : e));
  };

  const handleUpdateSession = (session: Session) => {
      if(!selectedEvent) return;
      // Deep update of session inside event
      const updatedSessions = selectedEvent.sessions.map(s => s.id === session.id ? session : s);
      handleUpdateEvent({ ...selectedEvent, sessions: updatedSessions });
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
            <React.Fragment key={evt.id}>
              <EventCard event={evt} onClick={() => setSelectedEventId(evt.id)} />
            </React.Fragment>
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
                { id: 'config', label: 'Configuration', icon: Compass }, // New Tab
                { id: 'schedule', label: 'Schedule', icon: Clock },
                { id: 'speakers', label: 'Speakers', icon: Mic2 },
                { id: 'attendees', label: 'Attendees', icon: Users },
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

              {/* Configuration Tab */}
              {activeTab === 'config' && (
                  <EventConfiguration event={selectedEvent} onUpdate={handleUpdateEvent} />
              )}

              {/* ... (Existing Attendees, Schedule, Speakers tabs) */}
              {activeTab === 'attendees' && (
                <AttendeeManager attendees={MOCK_ATTENDEES} event={selectedEvent} />
              )}

              {activeTab === 'schedule' && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <ScheduleManager event={selectedEvent} speakers={speakers} onUpdateSession={handleUpdateSession} />
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
                      <React.Fragment key={speaker.id}>
                        <SpeakerCard speaker={speaker} onEdit={(s) => { setEditingSpeaker(s); setIsSpeakerDialogOpen(true); }} />
                      </React.Fragment>
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
