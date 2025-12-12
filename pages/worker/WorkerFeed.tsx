
import React, { useState } from 'react';
import { 
  Image as ImageIcon, Send, Sparkles, MoreHorizontal, 
  MessageCircle, Heart, Share2, PenTool, Loader2,
  Globe, ChevronDown, Wand2, X, Lock, Users,
  ShieldCheck, UserPlus, Check, Settings, CornerDownRight
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Avatar, AvatarFallback, AvatarImage } from '../../components/ui/Avatar';
import { Input } from '../../components/ui/Input';
import { RichTextEditor } from '../../components/ui/RichTextEditor';
import { Badge } from '../../components/ui/Badge';
import { Switch } from '../../components/ui/Switch';
import { Label } from '../../components/ui/Label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs';
import { 
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator 
} from '../../components/ui/DropdownMenu';
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter 
} from '../../components/ui/Dialog';
import { cn } from '../../lib/utils';

// --- Types ---

type Visibility = 'public' | 'partners' | 'private';

interface FollowerRequest {
  id: string;
  name: string;
  email: string;
  avatar: string;
  isDonor: boolean; // If true, they gave money but maybe auto-approve is off
  date: string;
}

// --- Mock Data ---

const MOCK_REQUESTS: FollowerRequest[] = [
  { id: 'req1', name: 'Sarah Connor', email: 'sarah@example.com', avatar: '', isDonor: true, date: '2 hours ago' },
  { id: 'req2', name: 'Kyle Reese', email: 'kyle@future.org', avatar: '', isDonor: false, date: '1 day ago' },
  { id: 'req3', name: 'John Doe', email: 'john@unknown.com', avatar: '', isDonor: false, date: '3 days ago' },
];

const MOCK_POSTS = [
  {
    id: 1,
    type: 'Update',
    content: "<p>We completed the foundation for the new school block today! It was hard work in the heat, but the community turned out in full force to help mix concrete and carry stones. 🙏 This is just the beginning of a safe learning space for <strong>200 children</strong>.</p>",
    time: "2 hours ago",
    likes: 24,
    prayers: 8,
    comments: [
      { 
        id: 'c1', 
        author: 'Sarah Jenkins', 
        text: 'This is amazing progress! So proud of the team.', 
        time: '1h ago', 
        avatar: 'SJ',
        replies: [
            { id: 'r1', author: 'The Miller Family', text: 'Thank you Sarah! The team worked incredibly hard.', time: '45m ago', avatar: 'MF', isWorker: true }
        ]
      },
      { 
        id: 'c2', 
        author: 'Mike Ross', 
        text: 'Praying for strength for the rest of the build.', 
        time: '30m ago', 
        avatar: 'MR',
        replies: []
      }
    ],
    image: "https://images.unsplash.com/photo-1509099836639-18ba1795216d?q=80&w=1000&auto=format&fit=crop"
  },
  {
    id: 2,
    type: 'Prayer Request',
    content: "<p><strong>Urgent prayer request:</strong> Our supply truck is stuck at the border due to new regulations. We have essential medical supplies that need to reach the clinic by Friday.</p><blockquote>Please stand with us in prayer for a quick resolution.</blockquote>",
    time: "Yesterday",
    likes: 15,
    prayers: 42,
    comments: [
      { 
        id: 'c3', 
        author: 'Grace Church', 
        text: 'Praying now! God can move mountains (and trucks).', 
        time: '1d ago', 
        avatar: 'GC',
        replies: [] 
      }
    ],
    image: null
  }
];

// --- Sub-Components ---

const WorkerCommentSection = ({ comments, onAddComment }: { comments: any[], onAddComment: (text: string, parentId?: string) => void }) => {
  const [text, setText] = useState('');
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async (tone: 'Gratitude' | 'Encouragement' | 'Update') => {
    setIsGenerating(true);
    try {
      const apiKey = process.env.API_KEY;
      if (!apiKey) {
        await new Promise(r => setTimeout(r, 1000));
        if (tone === 'Gratitude') setText("Thank you so much for your kind words and support!");
        else if (tone === 'Encouragement') setText("Your encouragement keeps us going. Thank you!");
        else setText("We will keep you posted as things progress.");
        return;
      }

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: `Draft a short (1 sentence) reply to a donor's comment. Tone: ${tone}.`,
      });
      setText(response.text?.trim() || "");
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const submitReply = (parentId: string) => {
    if (replyText.trim()) {
        onAddComment(replyText, parentId);
        setReplyText('');
        setReplyingTo(null);
    }
  };

  return (
    <div className="bg-slate-50/50 rounded-b-xl border-t border-slate-100 p-4 space-y-6">
      {comments.length > 0 ? (
        <div className="space-y-6">
          {comments.map((comment) => (
            <div key={comment.id} className="group">
                {/* Main Comment */}
                <div className="flex gap-3 text-sm">
                    <Avatar className="h-8 w-8 bg-white border border-slate-200 mt-1">
                        <AvatarFallback className="text-[10px] text-slate-500 font-bold">{comment.avatar}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1">
                        <div className="bg-white p-3 rounded-2xl rounded-tl-none border border-slate-100 shadow-sm inline-block min-w-[200px]">
                            <div className="flex items-center justify-between gap-4 mb-1">
                                <span className="font-semibold text-slate-900 text-xs">{comment.author}</span>
                                <span className="text-[10px] text-slate-400">{comment.time}</span>
                            </div>
                            <p className="text-slate-600 leading-relaxed text-sm">{comment.text}</p>
                        </div>
                        <div className="flex items-center gap-3 pl-2">
                            <button 
                                className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 transition-colors"
                                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                            >
                                Reply
                            </button>
                            <button className="text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors">
                                Like
                            </button>
                        </div>
                    </div>
                </div>

                {/* Replies */}
                {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-8 mt-3 space-y-3 pl-3 border-l-2 border-slate-100/80">
                        {comment.replies.map((reply: any) => (
                            <div key={reply.id} className="flex gap-3 text-sm">
                                <Avatar className="h-6 w-6 bg-white border border-slate-200 mt-1">
                                    <AvatarFallback className="text-[9px] text-slate-500 font-bold">{reply.avatar}</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                    <div className={cn(
                                        "p-2.5 rounded-2xl rounded-tl-none inline-block",
                                        reply.isWorker ? "bg-blue-50/50 border border-blue-100 text-blue-900" : "bg-white border border-slate-100"
                                    )}>
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <span className="font-bold text-xs">{reply.author}</span>
                                            {reply.isWorker && <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-blue-100 text-blue-700">Author</Badge>}
                                        </div>
                                        <p className="text-sm leading-relaxed opacity-90">{reply.text}</p>
                                    </div>
                                    <div className="flex items-center gap-3 pl-2 mt-1">
                                        <span className="text-[10px] text-slate-400">{reply.time}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Reply Input */}
                {replyingTo === comment.id && (
                    <div className="ml-11 mt-3 flex gap-2 animate-in fade-in slide-in-from-top-1 duration-200">
                        <div className="relative flex-1">
                            <Input 
                                autoFocus
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && submitReply(comment.id)}
                                placeholder={`Reply to ${comment.author}...`}
                                className="h-9 text-xs bg-white pr-8"
                            />
                            <button 
                                onClick={() => submitReply(comment.id)}
                                disabled={!replyText}
                                className="absolute right-1 top-1 p-1.5 text-blue-600 hover:bg-blue-50 rounded-md disabled:opacity-50 disabled:hover:bg-transparent"
                            >
                                <CornerDownRight className="h-3.5 w-3.5" />
                            </button>
                        </div>
                    </div>
                )}
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-slate-400 italic text-center py-2">No comments yet.</p>
      )}

      {/* Main Comment Input */}
      <div className="pt-2 space-y-3">
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
           <Button variant="outline" size="sm" onClick={() => handleGenerate('Gratitude')} disabled={isGenerating} className="h-7 text-xs bg-white border-slate-200 text-slate-600 gap-1.5 hover:bg-slate-50">
              <Heart className="h-3 w-3 text-rose-500" /> Gratitude
           </Button>
           <Button variant="outline" size="sm" onClick={() => handleGenerate('Encouragement')} disabled={isGenerating} className="h-7 text-xs bg-white border-slate-200 text-slate-600 gap-1.5 hover:bg-slate-50">
              <Sparkles className="h-3 w-3 text-amber-500" /> Encouragement
           </Button>
        </div>
        <div className="relative">
          <Input 
            value={text} 
            onChange={(e) => setText(e.target.value)} 
            placeholder="Write a comment..." 
            className="pr-10 bg-white shadow-sm border-slate-200 focus:border-blue-300 transition-colors"
            onKeyDown={(e) => e.key === 'Enter' && (onAddComment(text), setText(''))}
          />
          <Button 
            size="icon" 
            className="absolute right-1 top-1 h-7 w-7 bg-slate-900 hover:bg-slate-800 transition-colors"
            onClick={() => { if(text) { onAddComment(text); setText(''); }}}
          >
            <Send className="h-3 w-3" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export const WorkerFeed = () => {
  // Feed State
  const [activeTab, setActiveTab] = useState('write');
  const [postType, setPostType] = useState('Update');
  const [postContent, setPostContent] = useState('');
  const [magicPrompt, setMagicPrompt] = useState('');
  const [magicTone, setMagicTone] = useState('Inspiring');
  const [isDrafting, setIsDrafting] = useState(false);
  const [posts, setPosts] = useState(MOCK_POSTS);
  const [expandedComments, setExpandedComments] = useState<number | null>(null);
  const [postPrivacy, setPostPrivacy] = useState<'Public' | 'Partners Only'>('Public');

  // Audience Settings State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [visibility, setVisibility] = useState<Visibility>('public');
  const [autoApproveDonors, setAutoApproveDonors] = useState(true);
  const [allowFollowRequests, setAllowFollowRequests] = useState(true);
  const [requests, setRequests] = useState<FollowerRequest[]>(MOCK_REQUESTS);

  const handleMagicDraft = async () => {
    if (!magicPrompt) return;
    setIsDrafting(true);
    try {
        const apiKey = process.env.API_KEY;
        if (!apiKey) {
            await new Promise(r => setTimeout(r, 1500));
            setPostContent("<p>We had an incredible breakthrough today! After weeks of planning, the <strong>new clean water system</strong> is finally operational. Seeing the joy on the faces of the children as they tasted fresh water for the first time was a moment I will never forget. Thank you for making this possible!</p>");
            setActiveTab('write');
            setIsDrafting(false);
            return;
        }

        const ai = new GoogleGenAI({ apiKey });
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Write a short, engaging social media update for a humanitarian field worker. 
            Topic: ${magicPrompt}
            Tone: ${magicTone}
            Length: 2-3 sentences. Return result in HTML format (using <p>, <strong>, etc) suitable for a rich text editor. Include 1 relevant emoji.`
        });

        if (response.text) {
            setPostContent(response.text.trim());
            setActiveTab('write');
        }
    } catch (e) {
        console.error(e);
    } finally {
        setIsDrafting(false);
    }
  };

  const handlePost = () => {
    const plainText = postContent.replace(/<[^>]*>?/gm, '').trim();
    if (!plainText && !postContent.includes('<img')) return;

    const newPost = {
        id: Date.now(),
        type: postType,
        content: postContent,
        time: 'Just now',
        likes: 0,
        prayers: 0,
        comments: [],
        image: null
    };
    setPosts([newPost, ...posts]);
    setPostContent('');
    setMagicPrompt('');
  };

  const handleApproveRequest = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
    // In real app, make API call to approve
  };

  const handleDenyRequest = (id: string) => {
    setRequests(requests.filter(r => r.id !== id));
    // In real app, make API call to deny
  };

  const getVisibilityIcon = () => {
    switch(visibility) {
        case 'public': return <Globe className="h-4 w-4" />;
        case 'partners': return <Users className="h-4 w-4" />;
        case 'private': return <Lock className="h-4 w-4" />;
    }
  };

  const getVisibilityLabel = () => {
    switch(visibility) {
        case 'public': return 'Public Feed';
        case 'partners': return 'Partners Only';
        case 'private': return 'Private';
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 pb-20 animate-in fade-in duration-500">
      
      {/* Header with Audience Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
            <h1 className="text-3xl font-bold text-slate-900 tracking-tight">My Feed</h1>
            <p className="text-slate-500 mt-1">Share updates and manage your community.</p>
        </div>
        <div className="flex items-center gap-2">
            <Button 
                variant="outline" 
                onClick={() => setIsSettingsOpen(true)}
                className="bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm gap-2 h-9 px-4 rounded-full transition-all hover:border-slate-300"
            >
                {getVisibilityIcon()}
                <span className="font-medium">{getVisibilityLabel()}</span>
                {requests.length > 0 && (
                    <Badge className="ml-1 h-5 px-1.5 bg-blue-600 hover:bg-blue-600 text-white border-none rounded-full text-[10px]">
                        {requests.length}
                    </Badge>
                )}
            </Button>
            <Button variant="outline" size="icon" className="hidden sm:flex rounded-full h-9 w-9">
                <Share2 className="h-4 w-4" />
            </Button>
        </div>
      </div>

      {/* --- AUDIENCE SETTINGS DIALOG --- */}
      <Dialog open={isSettingsOpen} onOpenChange={setIsSettingsOpen}>
        <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
            <DialogHeader className="p-6 pb-2 border-b border-slate-100 bg-slate-50/50">
                <DialogTitle>Audience & Visibility</DialogTitle>
                <DialogDescription>Control who can see your updates and manage access.</DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="settings" className="w-full">
                <div className="px-6 pt-2">
                    <TabsList className="bg-transparent w-full justify-start h-10 p-0 border-b border-transparent">
                        <TabsTrigger value="settings" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none px-2 pb-2 text-slate-500 font-medium">Settings</TabsTrigger>
                        <TabsTrigger value="requests" className="data-[state=active]:bg-transparent data-[state=active]:shadow-none data-[state=active]:border-b-2 data-[state=active]:border-slate-900 rounded-none px-2 pb-2 text-slate-500 font-medium ml-4">
                            Requests 
                            {requests.length > 0 && <span className="ml-1.5 bg-blue-100 text-blue-700 px-1.5 rounded-full text-[10px]">{requests.length}</span>}
                        </TabsTrigger>
                    </TabsList>
                </div>

                <div className="p-6">
                    <TabsContent value="settings" className="mt-0 space-y-6">
                        
                        {/* Visibility Section */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Feed Visibility</h4>
                            <div className="grid gap-3">
                                <div 
                                    onClick={() => setVisibility('public')}
                                    className={cn(
                                        "flex items-start gap-4 p-3 rounded-xl border cursor-pointer transition-all hover:bg-slate-50",
                                        visibility === 'public' ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900" : "border-slate-200"
                                    )}
                                >
                                    <div className="p-2 bg-white rounded-full border border-slate-100 shadow-sm mt-0.5"><Globe className="h-4 w-4 text-blue-500" /></div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Public</p>
                                        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">Visible to anyone with the link. Best for general fundraising pages.</p>
                                    </div>
                                    {visibility === 'public' && <div className="ml-auto text-slate-900"><Check className="h-4 w-4" /></div>}
                                </div>

                                <div 
                                    onClick={() => setVisibility('partners')}
                                    className={cn(
                                        "flex items-start gap-4 p-3 rounded-xl border cursor-pointer transition-all hover:bg-slate-50",
                                        visibility === 'partners' ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900" : "border-slate-200"
                                    )}
                                >
                                    <div className="p-2 bg-white rounded-full border border-slate-100 shadow-sm mt-0.5"><Users className="h-4 w-4 text-emerald-500" /></div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Partners Only</p>
                                        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">Restricted to donors and approved followers. Updates appear in the Donor Portal.</p>
                                    </div>
                                    {visibility === 'partners' && <div className="ml-auto text-slate-900"><Check className="h-4 w-4" /></div>}
                                </div>

                                <div 
                                    onClick={() => setVisibility('private')}
                                    className={cn(
                                        "flex items-start gap-4 p-3 rounded-xl border cursor-pointer transition-all hover:bg-slate-50",
                                        visibility === 'private' ? "border-slate-900 bg-slate-50 ring-1 ring-slate-900" : "border-slate-200"
                                    )}
                                >
                                    <div className="p-2 bg-white rounded-full border border-slate-100 shadow-sm mt-0.5"><Lock className="h-4 w-4 text-slate-500" /></div>
                                    <div>
                                        <p className="font-bold text-slate-900 text-sm">Private</p>
                                        <p className="text-xs text-slate-500 leading-relaxed mt-0.5">Only you and organization admins can view. Use for drafting or hiatus.</p>
                                    </div>
                                    {visibility === 'private' && <div className="ml-auto text-slate-900"><Check className="h-4 w-4" /></div>}
                                </div>
                            </div>
                        </div>

                        <div className="h-px bg-slate-100 w-full" />

                        {/* Access Control Section */}
                        <div className="space-y-4">
                            <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wide">Access Control</h4>
                            
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium text-slate-900">Allow Follow Requests</Label>
                                    <p className="text-xs text-slate-500">Let non-donors (e.g. prayer partners) request access.</p>
                                </div>
                                <Switch checked={allowFollowRequests} onCheckedChange={setAllowFollowRequests} />
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-medium text-slate-900 flex items-center gap-2">
                                        Auto-Approve Donors 
                                        <Badge variant="secondary" className="text-[9px] h-4 px-1 bg-emerald-100 text-emerald-700">Recommended</Badge>
                                    </Label>
                                    <p className="text-xs text-slate-500">Automatically grant access to anyone who gives financially.</p>
                                </div>
                                <Switch checked={autoApproveDonors} onCheckedChange={setAutoApproveDonors} />
                            </div>
                        </div>

                    </TabsContent>

                    <TabsContent value="requests" className="mt-0">
                        {requests.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-center">
                                <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mb-3">
                                    <UserPlus className="h-6 w-6 text-slate-300" />
                                </div>
                                <p className="font-medium text-slate-900">No pending requests</p>
                                <p className="text-xs text-slate-500 mt-1">New follow requests will appear here.</p>
                            </div>
                        ) : (
                            <div className="space-y-1">
                                {requests.map(req => (
                                    <div key={req.id} className="flex items-center justify-between p-3 bg-white border border-slate-100 rounded-xl hover:border-slate-200 transition-all">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9 border border-slate-100">
                                                <AvatarFallback className="bg-slate-100 text-slate-600 text-xs font-bold">{req.name.substring(0,2).toUpperCase()}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900 leading-none">{req.name}</p>
                                                <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-2">
                                                    {req.email}
                                                    {req.isDonor && <Badge variant="outline" className="h-4 px-1 text-[9px] bg-emerald-50 text-emerald-700 border-emerald-200">Donor</Badge>}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button size="icon" variant="ghost" className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50" onClick={() => handleDenyRequest(req.id)}>
                                                <X className="h-4 w-4" />
                                            </Button>
                                            <Button size="icon" className="h-8 w-8 bg-slate-900 hover:bg-slate-800 text-white shadow-sm" onClick={() => handleApproveRequest(req.id)}>
                                                <Check className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </TabsContent>
                </div>
            </Tabs>
            <DialogFooter className="p-4 border-t border-slate-100 bg-slate-50">
                <Button variant="outline" onClick={() => setIsSettingsOpen(false)}>Close</Button>
            </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modern Composer Card */}
      <Card className="overflow-hidden border-slate-200 shadow-sm">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
            
            {/* Context Tabs */}
            <div className="px-6 pt-5 pb-2">
               <div className="flex gap-2 flex-wrap items-center">
                  {['Update', 'Prayer Request', 'Story', 'Newsletter'].map((type) => (
                    <button 
                        key={type}
                        onClick={() => { setPostType(type); setActiveTab('write'); }}
                        className={cn(
                            "px-4 py-1.5 text-xs font-bold rounded-full transition-all border",
                            postType === type && activeTab === 'write'
                                ? "bg-slate-900 text-white border-slate-900 shadow-md transform scale-105" 
                                : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                        )}
                    >
                        {type}
                    </button>
                  ))}
                  
                  <div className="w-px h-6 bg-slate-200 mx-2 hidden sm:block" />
                  
                  <button onClick={() => setActiveTab('magic')} className={cn("px-4 py-1.5 text-xs font-bold rounded-full transition-all flex items-center gap-1.5 border border-dashed", activeTab === 'magic' ? "bg-purple-50 text-purple-700 border-purple-300" : "bg-white border-purple-200 text-purple-600 hover:bg-purple-50")}>
                     <Wand2 className="h-3 w-3" /> Magic Draft
                  </button>
               </div>
            </div>

            <CardContent className="p-0">
                <TabsContent value="write" className="p-0 mt-0">
                    <div className="flex items-start gap-4 p-6 pt-4 pb-0">
                        <Avatar className="h-10 w-10 border border-slate-200 shrink-0 mt-2 hidden md:block">
                            <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80" />
                            <AvatarFallback>MF</AvatarFallback>
                        </Avatar>
                        <div className="flex-1 min-w-0">
                            <RichTextEditor 
                                value={postContent}
                                onChange={setPostContent}
                                placeholder={`Share your latest ${postType.toLowerCase()}...`}
                                className="border-none shadow-none rounded-none focus-within:ring-0 focus-within:border-transparent px-0 py-0"
                                contentClassName="py-2 text-lg text-slate-700 placeholder:text-slate-300 min-h-[120px]"
                                toolbarPosition="bottom"
                                onImageClick={() => alert("Image upload modal would open here")}
                                actions={
                                    <div className="flex items-center gap-4 ml-auto">
                                        <div className="h-4 w-px bg-slate-200 hidden sm:block" />
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" size="sm" className="h-8 text-slate-500 gap-1.5 font-semibold text-xs hover:bg-slate-100 hover:text-slate-700">
                                                    {postPrivacy === 'Public' ? <Globe className="h-3.5 w-3.5" /> : <Users className="h-3.5 w-3.5" />}
                                                    {postPrivacy} 
                                                    <ChevronDown className="h-3 w-3 opacity-50" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuItem onClick={() => setPostPrivacy('Public')}>Public Feed</DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => setPostPrivacy('Partners Only')}>Partners Only</DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                        
                                        <Button 
                                            onClick={handlePost} 
                                            disabled={!postContent || postContent === '<p><br></p>'} 
                                            size="sm"
                                            className="bg-slate-900 text-white hover:bg-slate-800 shadow-md h-9 px-6 rounded-full font-bold transition-all hover:scale-105 active:scale-95"
                                        >
                                            Publish <Send className="h-3.5 w-3.5 ml-2 opacity-90" />
                                        </Button>
                                    </div>
                                }
                            />
                        </div>
                    </div>
                </TabsContent>

                <TabsContent value="magic" className="p-6 space-y-6 mt-0 bg-gradient-to-br from-purple-50/50 to-blue-50/50 min-h-[220px]">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">What do you want to post about?</label>
                            <Input 
                                placeholder="e.g., We finished the well today..." 
                                className="bg-white border-slate-200 h-11"
                                value={magicPrompt}
                                onChange={(e) => setMagicPrompt(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-slate-700">Tone</label>
                            <div className="flex gap-2 overflow-x-auto pb-2">
                                {['Inspiring', 'Urgent', 'Grateful', 'Professional'].map(tone => (
                                    <button
                                        key={tone}
                                        onClick={() => setMagicTone(tone)}
                                        className={cn(
                                            "px-4 py-2 rounded-full text-xs font-medium border transition-all",
                                            magicTone === tone 
                                                ? "bg-purple-600 text-white border-purple-600 shadow-sm" 
                                                : "bg-white text-slate-600 border-slate-200 hover:border-purple-300"
                                        )}
                                    >
                                        {tone}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <Button 
                            onClick={handleMagicDraft} 
                            disabled={!magicPrompt || isDrafting} 
                            className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white border-none shadow-md hover:opacity-90 transition-opacity h-11 font-bold"
                        >
                            {isDrafting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Sparkles className="h-4 w-4 mr-2" />}
                            Generate Draft
                        </Button>
                    </div>
                </TabsContent>
            </CardContent>
        </Tabs>
      </Card>

      {/* Feed Stream */}
      <div className="space-y-6">
        {posts.map((post) => (
            <Card key={post.id} className="overflow-hidden border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-300">
                <CardHeader className="p-5 pb-3 flex flex-row items-start justify-between space-y-0">
                    <div className="flex gap-3">
                        <Avatar className="h-10 w-10 border border-slate-200">
                            <AvatarImage src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?fit=facearea&facepad=2&w=256&h=256&q=80" />
                            <AvatarFallback>MF</AvatarFallback>
                        </Avatar>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="font-bold text-slate-900 text-sm">The Miller Family</h3>
                                {post.type && <Badge variant="secondary" className="text-[10px] h-5 px-1.5 font-medium border-slate-100 bg-slate-50 text-slate-600">{post.type}</Badge>}
                            </div>
                            <p className="text-xs text-slate-500 font-medium">{post.time}</p>
                        </div>
                    </div>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-slate-700 -mr-2">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem>Pin to Top</DropdownMenuItem>
                            <DropdownMenuItem>Edit Post</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </CardHeader>
                
                <CardContent className="p-0">
                    <div className="px-5 pb-4 space-y-4">
                        <div 
                            className="prose prose-slate prose-sm sm:prose-base max-w-none text-slate-700 leading-relaxed
                            prose-headings:font-bold prose-headings:text-slate-900
                            prose-a:text-blue-600 hover:prose-a:text-blue-700
                            prose-img:rounded-xl prose-img:shadow-sm"
                            dangerouslySetInnerHTML={{ __html: post.content }}
                        />
                        {post.image && (
                            <div className="rounded-xl overflow-hidden border border-slate-100 shadow-sm">
                                <img src={post.image} alt="Update" className="w-full h-auto object-cover max-h-[400px]" />
                            </div>
                        )}
                    </div>

                    {/* Stats Bar */}
                    <div className="px-5 py-3 border-t border-slate-100 bg-slate-50/30 flex items-center justify-between text-xs text-slate-500 font-medium">
                        <div className="flex gap-4">
                            <span className="flex items-center gap-1.5"><Heart className="h-3.5 w-3.5 fill-rose-500 text-rose-500" /> {post.likes}</span>
                            <span className="flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5 fill-amber-400 text-amber-400" /> {post.prayers} prayers</span>
                        </div>
                        <button 
                            className="hover:text-slate-900 transition-colors"
                            onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                        >
                            {post.comments.length} comments
                        </button>
                    </div>

                    {/* Interactive Footer */}
                    <div className="px-2 py-2 border-t border-slate-100 flex gap-1">
                        <Button variant="ghost" size="sm" className="flex-1 text-slate-500 hover:text-rose-600 hover:bg-rose-50 gap-2">
                            <Heart className="h-4 w-4" /> Like
                        </Button>
                        <Button 
                            variant="ghost" 
                            size="sm" 
                            className={cn(
                                "flex-1 gap-2", 
                                expandedComments === post.id ? "text-blue-600 bg-blue-50" : "text-slate-500 hover:text-blue-600 hover:bg-blue-50"
                            )}
                            onClick={() => setExpandedComments(expandedComments === post.id ? null : post.id)}
                        >
                            <MessageCircle className="h-4 w-4" /> Comment
                        </Button>
                    </div>

                    {/* Comments Area */}
                    <AnimatePresence>
                        {expandedComments === post.id && (
                            <motion.div 
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: 'auto', opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                className="overflow-hidden"
                            >
                                <WorkerCommentSection 
                                    comments={post.comments} 
                                    onAddComment={(text, parentId) => {
                                        // Mock adding comment
                                        const newComment = { id: Date.now(), author: 'You', text, time: 'Just now', avatar: 'ME', replies: [] };
                                        
                                        const updatedPosts = posts.map(p => {
                                            if (p.id === post.id) {
                                                if (parentId) {
                                                    // Add as reply
                                                    const updatedComments = p.comments.map(c => {
                                                        if (c.id === parentId) {
                                                            return { ...c, replies: [...(c.replies || []), { ...newComment, isWorker: true }] };
                                                        }
                                                        return c;
                                                    });
                                                    return { ...p, comments: updatedComments };
                                                } else {
                                                    // Add as root comment
                                                    return { ...p, comments: [...p.comments, newComment] };
                                                }
                                            }
                                            return p;
                                        });
                                        setPosts(updatedPosts);
                                    }} 
                                />
                            </motion.div>
                        )}
                    </AnimatePresence>
                </CardContent>
            </Card>
        ))}
      </div>
    </div>
  );
};
