
import React, { useState, useMemo } from 'react';
import { 
  Calendar as CalendarIcon, MapPin, Users, DollarSign, 
  Plus, Search, Filter, MoreHorizontal, ChevronRight, 
  Clock, CheckCircle2, QrCode, Printer, X, Layout, 
  FileText, Settings, ArrowLeft, Mic2, List, Grid,
  CreditCard, ExternalLink, Download, BarChart3, ScanLine,
  TrendingUp, Mail, Save, UserPlus, Trash2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { formatCurrency, cn } from '../../lib/utils';

// --- Types & Mock Data ---

type EventStatus = 'Draft' | 'Published' | 'Live' | 'Completed';

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
  speakers?: string[];
  goalRevenue?: number;
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
    speakers: ['Dr. Elena Rostova', 'David Kim']
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

// --- Sub-Components ---

const EventCard: React.FC<{ event: ConferenceEvent; onClick: () => void }> = ({ event, onClick }) => (
  <Card className="group cursor-pointer overflow-hidden hover:shadow-lg transition-all duration-300 border-slate-200" onClick={onClick}>
    <div className="h-32 w-full relative overflow-hidden bg-slate-100">
      <img src={event.image || 'https://images.unsplash.com/photo-1501281668745-f7f57925c3b4?auto=format&fit=crop&q=80&w=1000'} alt={event.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
      <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 to-transparent" />
      <div className="absolute bottom-3 left-3 right-3 flex justify-between items-end">
        <Badge variant="secondary" className="bg-white/90 text-slate-900 shadow-sm backdrop-blur-sm border-none font-bold">
          {event.status}
        </Badge>
      </div>
    </div>
    <CardContent className="p-5">
      <div className="mb-4">
        <h3 className="font-bold text-lg text-slate-900 leading-tight mb-1 group-hover:text-blue-600 transition-colors line-clamp-1">{event.name}</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <CalendarIcon className="h-3.5 w-3.5" /> {formatDateRange(event.startDate, event.endDate)}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-100">
        <div>
          <p className="text-[10px] uppercase font-bold text-slate-400">Registrants</p>
          <div className="flex items-baseline gap-1">
            <span className="text-lg font-bold text-slate-900">{event.registrants}</span>
            <span className="text-xs text-slate-400">/ {event.capacity}</span>
          </div>
        </div>
        <div className="text-right">
          <p className="text-[10px] uppercase font-bold text-slate-400">Revenue</p>
          <span className="text-lg font-bold text-emerald-600">{formatCurrency(event.revenue)}</span>
        </div>
      </div>
    </CardContent>
  </Card>
);

const CheckInKiosk = ({ onClose }: { onClose: () => void }) => {
  const [scannedData, setScannedData] = useState<Attendee | null>(null);
  const [scanStatus, setScanStatus] = useState<'scanning' | 'success' | 'error'>('scanning');

  const simulateScan = () => {
    // Simulating a QR scan find
    setScannedData(MOCK_ATTENDEES[1]);
    setScanStatus('success');
  };

  const resetScan = () => {
    setScannedData(null);
    setScanStatus('scanning');
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950 flex flex-col">
      {/* Kiosk Header */}
      <div className="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-900">
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 bg-white rounded-lg flex items-center justify-center font-bold text-slate-900">GH</div>
          <span className="text-white font-bold tracking-tight">Event Check-In Kiosk</span>
        </div>
        <Button variant="ghost" onClick={onClose} className="text-slate-400 hover:text-white hover:bg-slate-800">
          <X className="h-5 w-5 mr-2" /> Exit Kiosk
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-8">
        {scanStatus === 'scanning' ? (
          <div className="text-center space-y-8 max-w-md w-full">
            <div className="relative mx-auto w-64 h-64 border-4 border-slate-700 rounded-3xl flex items-center justify-center bg-slate-900 overflow-hidden shadow-2xl">
              <ScanLine className="h-full w-full text-blue-500 opacity-20 animate-pulse absolute inset-0" />
              <div className="z-10 text-slate-500">
                <QrCode className="h-24 w-24 opacity-50" />
              </div>
              <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 shadow-[0_0_20px_rgba(59,130,246,0.8)] animate-[scan_2s_ease-in-out_infinite]" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white mb-2">Ready to Scan</h2>
              <p className="text-slate-400">Present attendee QR code to the camera or search manually.</p>
            </div>
            <div className="flex gap-4">
              <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 h-14 text-lg" onClick={simulateScan}>
                Simulate Scan
              </Button>
              <Button size="lg" variant="outline" className="w-full h-14 text-lg border-slate-700 text-slate-300 hover:text-white hover:bg-slate-800">
                Manual Search
              </Button>
            </div>
          </div>
        ) : scannedData ? (
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-8 max-w-md w-full shadow-2xl text-center"
          >
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 text-emerald-600">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-bold text-slate-900 mb-1">{scannedData.name}</h2>
            <p className="text-lg text-slate-500 mb-6">{scannedData.ticketType}</p>
            
            <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left space-y-2 border border-slate-100">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Registration ID</span>
                <span className="font-mono font-bold text-slate-900">#{scannedData.id.toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Organization</span>
                <span className="font-medium text-slate-900">{scannedData.organization || 'N/A'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-500">Status</span>
                <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200">Checked In</Badge>
              </div>
            </div>

            <div className="flex gap-3">
              <Button size="lg" className="flex-1 bg-slate-900 text-white h-12" onClick={resetScan}>
                Next Attendee
              </Button>
              <Button size="lg" variant="outline" className="flex-1 h-12 border-slate-200">
                <Printer className="mr-2 h-4 w-4" /> Print Badge
              </Button>
            </div>
          </motion.div>
        ) : null}
      </div>
    </div>
  );
};

// --- Create Event Wizard Component ---

const CreateEventDialog = ({ open, onOpenChange, onCreate }: { open: boolean, onOpenChange: (open: boolean) => void, onCreate: (event: ConferenceEvent) => void }) => {
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

// --- Main Page Component ---

export const Events = () => {
  const [events, setEvents] = useState<ConferenceEvent[]>(INITIAL_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const [isKioskOpen, setIsKioskOpen] = useState(false);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const selectedEvent = events.find(e => e.id === selectedEventId);

  const handleCreateEvent = (newEvent: ConferenceEvent) => {
    setEvents(prev => [newEvent, ...prev]);
    setSelectedEventId(newEvent.id);
  };

  // --- Views ---

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

      {/* Filters & Stats */}
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

      {/* Grid View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map(evt => (
            <EventCard key={evt.id} event={evt} onClick={() => setSelectedEventId(evt.id)} />
          ))}
          
          {/* New Event Placeholder */}
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
        /* List View */
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
        {/* Detail Header */}
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

        {/* Content Area */}
        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          
          {/* Sidebar Nav */}
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

          {/* Tab Content */}
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

                  {/* Tasks / Timeline Area */}
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

              {/* Placeholders for other tabs */}
              {(activeTab === 'speakers' || activeTab === 'forms' || activeTab === 'settings') && (
                <div className="flex flex-col items-center justify-center h-96 text-slate-400 animate-in fade-in zoom-in-95 duration-500">
                  <div className="h-20 w-20 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Settings className="h-10 w-10 opacity-20" />
                  </div>
                  <h3 className="text-lg font-medium text-slate-900">Module Under Construction</h3>
                  <p className="max-w-sm text-center mt-2">The {activeTab} management interface is being implemented.</p>
                </div>
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
    </>
  );
};
