
import React, { useState } from 'react';
import { 
  Search, Plus, MoreVertical, FileText, Image as ImageIcon, 
  Settings, Layout, ArrowLeft, Save, Check, Clock, 
  ChevronDown, Filter, Columns, MoreHorizontal, Globe,
  AlignLeft, Type, Calendar, User, Eye, Box, Database,
  Archive, AlertCircle, ChevronRight, Hash, Link as LinkIcon
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Badge } from '../../components/ui/Badge';
import { Avatar, AvatarFallback } from '../../components/ui/Avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel
} from '../../components/ui/DropdownMenu';
import { Card } from '../../components/ui/Card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/Table";
import { ScrollArea } from '../../components/ui/ScrollArea';
import { cn } from '../../lib/utils';

// --- Types & Mock Data ---

type ViewState = 'list' | 'edit';
type CollectionType = 'pages' | 'posts' | 'team' | 'settings';

interface ContentItem {
  id: string;
  status: 'published' | 'draft' | 'archived';
  title: string;
  slug: string;
  author: string;
  updated: string;
  template?: string;
  views?: number;
}

const MOCK_DATA: Record<string, ContentItem[]> = {
  pages: [
    { id: '1', status: 'published', title: 'Home Page', slug: '/', author: 'Admin', updated: '2 hours ago', template: 'Landing' },
    { id: '2', status: 'published', title: 'About Our Mission', slug: '/our-mission', author: 'Sarah Smith', updated: '1 day ago', template: 'Content' },
    { id: '3', status: 'draft', title: 'Emergency Response Fund', slug: '/campaigns/emergency', author: 'Admin', updated: '3 days ago', template: 'Campaign' },
    { id: '4', status: 'published', title: 'Contact Support', slug: '/contact', author: 'Mike Ross', updated: '1 week ago', template: 'Contact' },
    { id: '5', status: 'archived', title: 'Winter Gala 2023', slug: '/events/winter-gala', author: 'Admin', updated: '4 months ago', template: 'Event' },
  ],
  posts: [
    { id: '101', status: 'published', title: 'Q3 Impact Report: Water Initiative', slug: '/blog/q3-impact', author: 'The Miller Family', updated: '5 hours ago' },
    { id: '102', status: 'draft', title: '5 Ways to Help Refugees Today', slug: '/blog/5-ways-help', author: 'Elena Rossi', updated: '2 days ago' },
    { id: '103', status: 'published', title: 'Field Update: Kenya Medical Camp', slug: '/blog/kenya-update', author: 'Dr. Sarah Smith', updated: '1 week ago' },
  ]
};

const COLLECTIONS = [
  { id: 'pages', label: 'Pages', icon: Layout, count: 12, group: 'Content' },
  { id: 'posts', label: 'Articles', icon: FileText, count: 45, group: 'Content' },
  { id: 'team', label: 'Team Members', icon: User, count: 8, group: 'Content' },
  { id: 'media', label: 'Media Library', icon: ImageIcon, count: 128, group: 'Assets' },
  { id: 'globals', label: 'Global Settings', icon: Globe, count: 0, group: 'System' },
];

// --- Sub-Components ---

const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    published: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    draft: 'bg-amber-100 text-amber-700 border-amber-200',
    archived: 'bg-slate-100 text-slate-600 border-slate-200'
  };
  
  return (
    <div className={cn("inline-flex items-center px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider border", styles[status] || styles.draft)}>
      {status}
    </div>
  );
};

// --- Main WebStudio Component ---

export const WebStudio = () => {
  const [activeCollection, setActiveCollection] = useState<string>('pages');
  const [view, setView] = useState<ViewState>('list');
  const [selectedItem, setSelectedItem] = useState<ContentItem | null>(null);
  const [collectionSearch, setCollectionSearch] = useState('');
  const [itemSearch, setItemSearch] = useState('');

  // Derived Data
  const data = MOCK_DATA[activeCollection] || [];
  const filteredCollections = COLLECTIONS.filter(c => c.label.toLowerCase().includes(collectionSearch.toLowerCase()));
  const groupedCollections = filteredCollections.reduce((acc, col) => {
    (acc[col.group] = acc[col.group] || []).push(col);
    return acc;
  }, {} as Record<string, typeof COLLECTIONS>);

  // Handlers
  const handleEdit = (item: ContentItem) => {
    setSelectedItem(item);
    setView('edit');
  };

  const handleCreate = () => {
    setSelectedItem({
      id: 'new',
      status: 'draft',
      title: '',
      slug: '',
      author: 'Current User',
      updated: 'Just now'
    });
    setView('edit');
  };

  const handleBack = () => {
    setView('list');
    setSelectedItem(null);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] -m-4 md:-m-8 bg-slate-100 overflow-hidden font-sans">
      
      {/* 1. Navigation Rail (Directus Style) */}
      <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 z-20">
        {/* Sidebar Header */}
        <div className="h-14 flex items-center px-4 border-b border-slate-100">
          <div className="relative w-full">
             <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
             <input 
                placeholder="Search collections..." 
                value={collectionSearch}
                onChange={(e) => setCollectionSearch(e.target.value)}
                className="w-full h-9 pl-9 pr-4 bg-slate-50 border-transparent rounded-md text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-200 transition-all outline-none placeholder:text-slate-400"
             />
          </div>
        </div>

        {/* Collections List */}
        <ScrollArea className="flex-1">
          <div className="p-3 space-y-6">
            {Object.entries(groupedCollections).map(([group, items]) => (
              <div key={group}>
                <h3 className="px-3 mb-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">{group}</h3>
                <div className="space-y-0.5">
                  {items.map(col => (
                    <button
                      key={col.id}
                      onClick={() => { setActiveCollection(col.id); setView('list'); }}
                      className={cn(
                        "w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all group",
                        activeCollection === col.id 
                          ? "bg-blue-50 text-blue-700" 
                          : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <col.icon className={cn("h-4 w-4 opacity-70", activeCollection === col.id ? "text-blue-600 opacity-100" : "group-hover:opacity-100")} />
                        {col.label}
                      </div>
                      {col.count > 0 && (
                        <span className={cn(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded-md min-w-[20px] text-center",
                            activeCollection === col.id ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500 group-hover:bg-white"
                        )}>
                          {col.count}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Sidebar Footer */}
        <div className="p-3 border-t border-slate-100 bg-slate-50/50">
           <button className="flex items-center gap-3 px-3 py-2 w-full text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white rounded-lg transition-all">
              <Settings className="h-4 w-4 opacity-70" /> Project Settings
           </button>
        </div>
      </div>

      {/* 2. Main Content Stage */}
      <div className="flex-1 flex flex-col min-w-0 bg-slate-100 relative">
        
        {/* --- VIEW: LIST --- */}
        {view === 'list' && (
          <div className="flex flex-col h-full">
            {/* Header / Control Bar */}
            <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-10 sticky top-0">
              <div className="flex items-center gap-4 flex-1">
                <div className="flex items-center gap-2 text-slate-500">
                    <Database className="h-4 w-4" />
                    <ChevronRight className="h-4 w-4 opacity-50" />
                    <span className="font-bold text-slate-900 capitalize">{activeCollection}</span>
                </div>
                <div className="h-6 w-px bg-slate-200 mx-2" />
                
                <div className="relative max-w-sm w-full">
                   <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                   <input 
                      placeholder={`Search ${activeCollection}...`} 
                      value={itemSearch}
                      onChange={(e) => setItemSearch(e.target.value)}
                      className="w-full h-9 pl-9 pr-4 bg-slate-100 border-none rounded-md text-sm focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all outline-none" 
                   />
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200 mr-2">
                    <button className="p-1.5 bg-white shadow-sm rounded-md text-slate-900"><AlignLeft className="h-4 w-4" /></button>
                    <button className="p-1.5 text-slate-500 hover:text-slate-900"><Layout className="h-4 w-4" /></button>
                </div>
                <Button onClick={handleCreate} className="bg-slate-900 hover:bg-slate-800 text-white h-9 shadow-sm gap-2 rounded-lg font-semibold">
                   <Plus className="h-4 w-4" /> Create Item
                </Button>
              </div>
            </header>

            {/* Data Table Area */}
            <div className="flex-1 overflow-auto p-6">
                <Card className="border-slate-200 shadow-sm overflow-hidden bg-white">
                    <Table>
                        <TableHeader className="bg-slate-50 border-b border-slate-200">
                            <TableRow className="hover:bg-transparent border-none">
                                <TableHead className="w-[50px] pl-4 text-center"><input type="checkbox" className="rounded border-slate-300 accent-blue-600" /></TableHead>
                                <TableHead className="w-[120px] font-bold text-xs uppercase tracking-wider text-slate-500">Status</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500">Title</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500 hidden md:table-cell">Slug</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500 hidden md:table-cell">Author</TableHead>
                                <TableHead className="font-bold text-xs uppercase tracking-wider text-slate-500 hidden lg:table-cell">Updated</TableHead>
                                <TableHead className="w-[50px]"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {data.length > 0 ? data.map((item) => (
                                <TableRow 
                                    key={item.id} 
                                    className="cursor-pointer hover:bg-slate-50/80 transition-colors border-b border-slate-100 last:border-0 group"
                                    onClick={() => handleEdit(item)}
                                >
                                    <TableCell className="pl-4 text-center"><input type="checkbox" className="rounded border-slate-300 accent-blue-600" onClick={e => e.stopPropagation()} /></TableCell>
                                    <TableCell><StatusBadge status={item.status} /></TableCell>
                                    <TableCell>
                                        <span className="font-semibold text-slate-900 text-sm">{item.title}</span>
                                    </TableCell>
                                    <TableCell className="hidden md:table-cell text-slate-500 font-mono text-xs">{item.slug}</TableCell>
                                    <TableCell className="hidden md:table-cell">
                                        <div className="flex items-center gap-2">
                                            <Avatar className="h-6 w-6">
                                                <AvatarFallback className="text-[9px] bg-indigo-100 text-indigo-700 font-bold">{item.author[0]}</AvatarFallback>
                                            </Avatar>
                                            <span className="text-sm text-slate-600">{item.author}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="hidden lg:table-cell text-slate-400 text-xs font-medium">{item.updated}</TableCell>
                                    <TableCell>
                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-900">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={7} className="h-32 text-center text-slate-400">
                                        <Box className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                        No items found in this collection.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </Card>
            </div>
          </div>
        )}

        {/* --- VIEW: EDIT (Form) --- */}
        {view === 'edit' && selectedItem && (
          <div className="flex flex-col h-full bg-slate-100">
             
             {/* Edit Header */}
             <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 z-30 shadow-sm sticky top-0">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={handleBack} className="-ml-2 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-full">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="flex flex-col">
                        <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                            <span>{activeCollection}</span>
                            <ChevronRight className="h-3 w-3" />
                            <span>Editing Item</span>
                        </div>
                        <span className="text-sm font-bold text-slate-900 leading-none mt-0.5">
                            {selectedItem.title || 'Untitled Item'}
                        </span>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-medium hidden sm:block">Last saved: Just now</span>
                    <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-600">
                        <Archive className="h-5 w-5" />
                    </Button>
                    <div className="h-6 w-px bg-slate-200" />
                    <Button className="bg-slate-900 hover:bg-slate-800 text-white rounded-full h-10 w-10 p-0 shadow-md">
                        <Check className="h-5 w-5" />
                    </Button>
                </div>
             </header>

             <div className="flex-1 overflow-hidden flex">
                
                {/* Main Form Area (Center) */}
                <ScrollArea className="flex-1">
                    <div className="p-8 lg:p-12 max-w-4xl mx-auto space-y-8">
                        
                        <div className="space-y-6">
                            {/* Title Field - Prominent */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Title</label>
                                <Input 
                                    defaultValue={selectedItem.title} 
                                    className="text-xl font-bold border-slate-200 bg-white shadow-sm h-12 px-4 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all"
                                    placeholder="Enter title..."
                                />
                            </div>

                            {/* Slug Field */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                    Slug <span className="text-[10px] font-normal text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">Unique</span>
                                </label>
                                <div className="flex rounded-md shadow-sm">
                                    <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-slate-200 bg-slate-50 text-slate-500 text-sm">
                                        <LinkIcon className="h-3 w-3 mr-2" /> /
                                    </span>
                                    <Input 
                                        defaultValue={selectedItem.slug} 
                                        className="rounded-l-none border-slate-200 bg-white font-mono text-sm text-slate-600"
                                    />
                                </div>
                            </div>

                            {/* Grid Fields */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Template</label>
                                    <div className="relative">
                                        <Layout className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                                        <Input defaultValue={selectedItem.template || 'Default'} className="pl-9 bg-white border-slate-200" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Hero Image</label>
                                    <div className="h-10 bg-white border border-slate-200 border-dashed rounded-md flex items-center px-3 cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all group">
                                        <ImageIcon className="h-4 w-4 text-slate-400 group-hover:text-blue-500 mr-2" />
                                        <span className="text-sm text-slate-500 group-hover:text-blue-600">Select from Library...</span>
                                    </div>
                                </div>
                            </div>

                            <div className="h-px bg-slate-200 my-8" />

                            {/* WYSIWYG Placeholder */}
                            <div className="space-y-2">
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Content Body</label>
                                <div className="min-h-[500px] bg-white border border-slate-200 rounded-lg shadow-sm flex flex-col overflow-hidden group focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                                    {/* Toolbar */}
                                    <div className="h-10 border-b border-slate-100 bg-slate-50 flex items-center px-2 gap-1">
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:bg-white"><AlignLeft className="h-3.5 w-3.5" /></Button>
                                        <div className="w-px h-4 bg-slate-300 mx-1" />
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:bg-white"><Type className="h-3.5 w-3.5" /></Button>
                                        <Button variant="ghost" size="icon" className="h-7 w-7 text-slate-500 hover:bg-white"><ImageIcon className="h-3.5 w-3.5" /></Button>
                                    </div>
                                    <div className="flex-1 p-6 prose prose-slate max-w-none">
                                        <p className="text-slate-400 italic">Start typing your content here...</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>
                </ScrollArea>

                {/* Right Sidebar (Metadata Drawer) */}
                <div className="w-[320px] bg-white border-l border-slate-200 flex flex-col shrink-0 z-20 shadow-[rgba(0,0,0,0.05)_0px_0px_15px] overflow-y-auto">
                    
                    {/* Status Field */}
                    <div className="p-6 border-b border-slate-100 space-y-3">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status</label>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <button className={cn(
                                    "w-full flex items-center justify-between px-3 py-2.5 rounded-md border text-sm font-bold uppercase tracking-wide transition-all",
                                    selectedItem.status === 'published' ? "bg-emerald-50 border-emerald-200 text-emerald-700" : "bg-amber-50 border-amber-200 text-amber-700"
                                )}>
                                    <div className="flex items-center gap-2">
                                        <div className={cn("w-2 h-2 rounded-full", selectedItem.status === 'published' ? "bg-emerald-500" : "bg-amber-500")} />
                                        {selectedItem.status}
                                    </div>
                                    <ChevronDown className="h-4 w-4 opacity-50" />
                                </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent className="w-[270px]" align="end">
                                <DropdownMenuItem className="gap-2 font-medium text-emerald-700 bg-emerald-50 mb-1"><div className="w-2 h-2 rounded-full bg-emerald-500" /> Published</DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 font-medium text-amber-700 bg-amber-50 mb-1"><div className="w-2 h-2 rounded-full bg-amber-500" /> Draft</DropdownMenuItem>
                                <DropdownMenuItem className="gap-2 font-medium text-slate-600 bg-slate-50"><div className="w-2 h-2 rounded-full bg-slate-400" /> Archived</DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>

                    <div className="p-6 space-y-8">
                        {/* System Info */}
                        <div className="space-y-4">
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <User className="h-3 w-3" /> User Created
                                </label>
                                <div className="flex items-center gap-3 p-2 rounded-md hover:bg-slate-50 transition-colors cursor-default -ml-2">
                                    <Avatar className="h-8 w-8 border border-slate-200">
                                        <AvatarFallback className="text-[10px] bg-slate-100 text-slate-600 font-bold">AD</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-700">Admin User</span>
                                        <span className="text-[10px] text-slate-400">2 months ago</span>
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <Calendar className="h-3 w-3" /> Date Updated
                                </label>
                                <div className="relative">
                                    <input 
                                        disabled 
                                        value={new Date().toLocaleDateString()} 
                                        className="w-full bg-slate-50 border border-slate-200 rounded-md px-3 py-2 text-sm text-slate-600 font-medium"
                                    />
                                </div>
                            </div>
                            
                            <div className="space-y-1">
                                <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                                    <Hash className="h-3 w-3" /> Unique ID
                                </label>
                                <div className="flex items-center gap-2">
                                    <code className="text-[10px] bg-slate-100 px-2 py-1 rounded text-slate-500 font-mono w-full block border border-slate-200">
                                        {selectedItem.id}-{Math.random().toString(36).substr(2, 6)}
                                    </code>
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100" />

                        {/* Revisions */}
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Revisions</label>
                            <div className="relative pl-3 border-l-2 border-slate-100 space-y-4 py-1">
                                <div className="relative">
                                    <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-blue-500 ring-4 ring-white" />
                                    <p className="text-xs text-slate-900 font-bold">Current Version</p>
                                    <p className="text-[10px] text-slate-400">Just now by You</p>
                                </div>
                                <div className="relative opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                                    <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-slate-300 ring-4 ring-white" />
                                    <p className="text-xs text-slate-700 font-medium">Draft Saved</p>
                                    <p className="text-[10px] text-slate-400">10 mins ago by You</p>
                                </div>
                                <div className="relative opacity-50 hover:opacity-100 transition-opacity cursor-pointer">
                                    <div className="absolute -left-[17px] top-1.5 w-2 h-2 rounded-full bg-slate-300 ring-4 ring-white" />
                                    <p className="text-xs text-slate-700 font-medium">Initial Publish</p>
                                    <p className="text-[10px] text-slate-400">2 days ago by Sarah</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

             </div>
          </div>
        )}

      </div>
    </div>
  );
};
