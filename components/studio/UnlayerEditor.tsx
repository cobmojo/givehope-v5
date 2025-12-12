
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  Type, Image as ImageIcon, MousePointer2, Layout, 
  Settings2, Download, Save, Undo, Redo, Smartphone, 
  Monitor, Plus, Trash2, GripVertical, Wand2, Sparkles,
  Move, Palette, Link as LinkIcon, AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Label } from '../ui/Label';
import { Textarea } from '../ui/Textarea';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../ui/Tabs';
import { ScrollArea } from '../ui/ScrollArea';
import { Card } from '../ui/Card';
import { Separator } from '../ui/separator';
import { cn } from '../../lib/utils';
import { Badge } from '../ui/Badge';
import { Select } from '../ui/Select';

// --- Types ---

interface Block {
  id: string;
  type: 'heading' | 'text' | 'image' | 'button' | 'divider';
  content: {
    text?: string;
    src?: string;
    alt?: string;
    url?: string;
    label?: string;
    align?: 'left' | 'center' | 'right';
    color?: string;
    backgroundColor?: string;
    padding?: string;
  };
}

interface UnlayerEditorProps {
    mode: 'email' | 'pdf';
    onSave: () => void;
    onExport: (type: string) => void;
}

const INITIAL_BLOCKS: Block[] = [
    { 
        id: 'header_1', 
        type: 'heading', 
        content: { text: 'Monthly Impact Report', align: 'center', color: '#1e293b' } 
    },
    { 
        id: 'hero_img', 
        type: 'image', 
        content: { src: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=800&auto=format&fit=crop', alt: 'Field Work', align: 'center' } 
    },
    { 
        id: 'intro_text', 
        type: 'text', 
        content: { text: "Thank you for your continued partnership. Here is a look at what we've accomplished together this month.", align: 'left', color: '#475569' } 
    }
];

export const UnlayerEditor = ({ mode, onSave, onExport }: UnlayerEditorProps) => {
    // --- State ---
    const [blocks, setBlocks] = useState<Block[]>(INITIAL_BLOCKS);
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop');
    const [isAiGenerating, setIsAiGenerating] = useState(false);
    const [aiPrompt, setAiPrompt] = useState('');
    const [isSaving, setIsSaving] = useState(false);

    // --- Helpers ---
    const selectedBlock = blocks.find(b => b.id === selectedBlockId);

    const updateBlock = (id: string, updates: Partial<Block['content']>) => {
        setBlocks(prev => prev.map(b => b.id === id ? { ...b, content: { ...b.content, ...updates } } : b));
    };

    const addBlock = (type: Block['type']) => {
        const newBlock: Block = {
            id: `block_${Date.now()}`,
            type,
            content: {
                text: type === 'heading' ? 'New Heading' : type === 'text' ? 'Start typing your text here...' : undefined,
                label: type === 'button' ? 'Click Me' : undefined,
                align: 'left',
                src: type === 'image' ? 'https://via.placeholder.com/600x300?text=Select+Image' : undefined,
                color: type === 'button' ? '#ffffff' : '#0f172a',
                backgroundColor: type === 'button' ? '#2563eb' : undefined
            }
        };
        setBlocks([...blocks, newBlock]);
        setSelectedBlockId(newBlock.id);
    };

    const deleteBlock = (id: string) => {
        setBlocks(prev => prev.filter(b => b.id !== id));
        if (selectedBlockId === id) setSelectedBlockId(null);
    };

    const moveBlock = (id: string, direction: 'up' | 'down') => {
        const index = blocks.findIndex(b => b.id === id);
        if (index < 0) return;
        if (direction === 'up' && index === 0) return;
        if (direction === 'down' && index === blocks.length - 1) return;

        const newBlocks = [...blocks];
        const swapIndex = direction === 'up' ? index - 1 : index + 1;
        [newBlocks[index], newBlocks[swapIndex]] = [newBlocks[swapIndex], newBlocks[index]];
        setBlocks(newBlocks);
    };

    // --- AI Handlers ---
    const handleMagicGenerate = async () => {
        if (!aiPrompt) return;
        setIsAiGenerating(true);
        
        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) {
                // Mock
                await new Promise(r => setTimeout(r, 1500));
                setBlocks([
                    { id: 'ai_1', type: 'heading', content: { text: 'Urgent: Flood Relief Needed', align: 'center' } },
                    { id: 'ai_2', type: 'text', content: { text: 'Heavy rains have displaced thousands in the region. We are mobilizing immediately.', align: 'left' } },
                    { id: 'ai_3', type: 'button', content: { label: 'Donate to Emergency Fund', backgroundColor: '#dc2626', color: '#ffffff', align: 'center' } }
                ]);
            } else {
                const ai = new GoogleGenAI({ apiKey });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Create a JSON structure for an email based on: "${aiPrompt}". Return an array of blocks with type (heading, text, button) and content.`,
                    config: { responseMimeType: "application/json" }
                });
                const data = JSON.parse(response.text || "[]");
                if (Array.isArray(data)) {
                    setBlocks(data.map((b: any) => ({ ...b, id: `ai_${Math.random()}` })));
                }
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsAiGenerating(false);
            setAiPrompt('');
        }
    };

    const handleSmartRewrite = async () => {
        if (!selectedBlock || !selectedBlock.content.text) return;
        setIsAiGenerating(true);
        
        try {
            const apiKey = process.env.API_KEY;
            const currentText = selectedBlock.content.text;
            
            if (!apiKey) {
                await new Promise(r => setTimeout(r, 1000));
                updateBlock(selectedBlock.id, { text: `[Polished] ${currentText}` });
            } else {
                const ai = new GoogleGenAI({ apiKey });
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Rewrite this text to be more professional and engaging for a donor update: "${currentText}"`
                });
                if (response.text) updateBlock(selectedBlock.id, { text: response.text.trim() });
            }
        } catch (e) {
            console.error(e);
        } finally {
            setIsAiGenerating(false);
        }
    };

    const handleSaveInternal = () => {
        setIsSaving(true);
        setTimeout(() => {
            setIsSaving(false);
            onSave();
        }, 800);
    };

    // --- Renderers ---

    const renderBlock = (block: Block) => {
        const isSelected = selectedBlockId === block.id;
        
        let content = null;
        switch (block.type) {
            case 'heading':
                content = <h2 style={{ textAlign: block.content.align, color: block.content.color }} className="text-2xl font-bold leading-tight">{block.content.text}</h2>;
                break;
            case 'text':
                content = <p style={{ textAlign: block.content.align, color: block.content.color }} className="text-base leading-relaxed whitespace-pre-wrap">{block.content.text}</p>;
                break;
            case 'image':
                content = (
                    <div style={{ textAlign: block.content.align }}>
                        <img src={block.content.src} alt={block.content.alt} className="max-w-full h-auto rounded-md shadow-sm inline-block" />
                    </div>
                );
                break;
            case 'button':
                content = (
                    <div style={{ textAlign: block.content.align }}>
                        <button style={{ backgroundColor: block.content.backgroundColor, color: block.content.color }} className="px-6 py-3 rounded-md font-bold text-sm inline-block transition-opacity hover:opacity-90">
                            {block.content.label}
                        </button>
                    </div>
                );
                break;
            case 'divider':
                content = <hr className="border-t border-slate-200 my-4" />;
                break;
        }

        return (
            <div 
                key={block.id}
                onClick={(e) => { e.stopPropagation(); setSelectedBlockId(block.id); }}
                className={cn(
                    "relative group px-8 py-4 transition-all border-2 border-transparent hover:border-slate-200 cursor-pointer",
                    isSelected && "border-blue-500 bg-blue-50/10 ring-4 ring-blue-500/10 z-10"
                )}
            >
                {isSelected && (
                    <div className="absolute -top-3 right-2 flex gap-1 bg-white border border-slate-200 rounded-md shadow-sm p-1 z-20">
                        <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'up') }} className="p-1 hover:bg-slate-100 rounded text-slate-500"><Move className="w-3 h-3 rotate-180" /></button>
                        <button onClick={(e) => { e.stopPropagation(); moveBlock(block.id, 'down') }} className="p-1 hover:bg-slate-100 rounded text-slate-500"><Move className="w-3 h-3" /></button>
                        <div className="w-px bg-slate-200 mx-1" />
                        <button onClick={(e) => { e.stopPropagation(); deleteBlock(block.id) }} className="p-1 hover:bg-red-50 text-slate-500 hover:text-red-600 rounded"><Trash2 className="w-3 h-3" /></button>
                    </div>
                )}
                {content}
            </div>
        );
    };

    return (
        <div className="flex flex-col h-full bg-slate-50 border-t border-slate-200">
            
            {/* --- Toolbar --- */}
            <div className="h-14 bg-white border-b border-slate-200 flex items-center justify-between px-4 shrink-0 z-20">
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-slate-900 font-bold px-2">
                        <div className={cn("p-1.5 rounded-md", mode === 'email' ? "bg-blue-100 text-blue-700" : "bg-red-100 text-red-700")}>
                            {mode === 'email' ? <Layout className="w-4 h-4" /> : <Settings2 className="w-4 h-4" />}
                        </div>
                        {mode === 'email' ? 'Email Studio' : 'PDF Builder'}
                    </div>
                    <div className="h-6 w-px bg-slate-200" />
                    <div className="flex items-center bg-slate-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setViewMode('desktop')}
                            className={cn("p-1.5 rounded-md transition-all", viewMode === 'desktop' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
                        >
                            <Monitor className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => setViewMode('mobile')}
                            className={cn("p-1.5 rounded-md transition-all", viewMode === 'mobile' ? "bg-white shadow-sm text-slate-900" : "text-slate-500 hover:text-slate-700")}
                        >
                            <Smartphone className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="flex gap-1 ml-2">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Undo className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400"><Redo className="w-4 h-4" /></Button>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => onExport('html')} className="hidden sm:flex">
                        <Download className="w-4 h-4 mr-2" /> Export
                    </Button>
                    <Button size="sm" onClick={handleSaveInternal} disabled={isSaving} className="bg-slate-900 text-white shadow-sm min-w-[100px]">
                        {isSaving ? "Saving..." : <><Save className="w-4 h-4 mr-2" /> Save</>}
                    </Button>
                </div>
            </div>

            {/* --- Main Workspace --- */}
            <div className="flex-1 flex overflow-hidden">
                
                {/* Left Sidebar: Toolbox */}
                <div className="w-72 bg-white border-r border-slate-200 flex flex-col z-10">
                    <Tabs defaultValue="blocks" className="flex-1 flex flex-col">
                        <div className="px-4 pt-4 pb-0">
                            <TabsList className="w-full bg-slate-100 p-1">
                                <TabsTrigger value="blocks" className="flex-1 text-xs">Blocks</TabsTrigger>
                                <TabsTrigger value="magic" className="flex-1 text-xs gap-1"><Sparkles className="w-3 h-3 text-purple-500" /> AI Magic</TabsTrigger>
                            </TabsList>
                        </div>

                        <TabsContent value="blocks" className="flex-1 overflow-y-auto p-4 mt-0 space-y-6">
                            <div className="space-y-3">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider ml-1">Content</p>
                                <div className="grid grid-cols-2 gap-2">
                                    <button onClick={() => addBlock('heading')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all bg-white group">
                                        <Type className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                                        <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700">Heading</span>
                                    </button>
                                    <button onClick={() => addBlock('text')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all bg-white group">
                                        <AlignLeft className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                                        <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700">Text</span>
                                    </button>
                                    <button onClick={() => addBlock('image')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all bg-white group">
                                        <ImageIcon className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                                        <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700">Image</span>
                                    </button>
                                    <button onClick={() => addBlock('button')} className="flex flex-col items-center justify-center gap-2 p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all bg-white group">
                                        <MousePointer2 className="w-6 h-6 text-slate-400 group-hover:text-blue-500" />
                                        <span className="text-xs font-medium text-slate-600 group-hover:text-blue-700">Button</span>
                                    </button>
                                </div>
                                <button onClick={() => addBlock('divider')} className="w-full flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50 transition-all bg-white group">
                                    <div className="w-full h-px bg-slate-300 group-hover:bg-blue-400" />
                                    <span className="text-xs font-medium text-slate-600 whitespace-nowrap group-hover:text-blue-700">Divider</span>
                                    <div className="w-full h-px bg-slate-300 group-hover:bg-blue-400" />
                                </button>
                            </div>
                        </TabsContent>

                        <TabsContent value="magic" className="flex-1 p-4 mt-0 space-y-4">
                            <div className="space-y-2">
                                <Label>What would you like to build?</Label>
                                <Textarea 
                                    placeholder="e.g., A quarterly update email about our water project in Ghana..." 
                                    className="min-h-[100px] resize-none"
                                    value={aiPrompt}
                                    onChange={(e) => setAiPrompt(e.target.value)}
                                />
                            </div>
                            <Button 
                                className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white border-none shadow-md"
                                onClick={handleMagicGenerate}
                                disabled={isAiGenerating || !aiPrompt}
                            >
                                <Wand2 className="w-4 h-4 mr-2" />
                                {isAiGenerating ? 'Generating...' : 'Generate Layout'}
                            </Button>
                            
                            <div className="bg-blue-50 p-3 rounded-lg text-xs text-blue-700 border border-blue-100 mt-4">
                                <p><strong>Tip:</strong> Be specific about tone and content. AI will generate a draft layout for you.</p>
                            </div>
                        </TabsContent>
                    </Tabs>
                </div>

                {/* Center: Canvas */}
                <div 
                    className="flex-1 bg-slate-100 overflow-y-auto p-8 flex justify-center" 
                    onClick={() => setSelectedBlockId(null)}
                >
                    <div 
                        className={cn(
                            "bg-white shadow-xl min-h-[800px] transition-all duration-300 origin-top",
                            viewMode === 'mobile' ? "w-[375px]" : "w-[600px]"
                        )}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {blocks.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-slate-400 p-8 text-center border-2 border-dashed border-slate-100 m-8 rounded-xl">
                                <Layout className="w-12 h-12 mb-3 text-slate-200" />
                                <p>Drag blocks here or use AI to start.</p>
                            </div>
                        ) : (
                            <div className="py-8">
                                {blocks.map(block => renderBlock(block))}
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar: Inspector */}
                <div className="w-80 bg-white border-l border-slate-200 flex flex-col z-10 shrink-0">
                    <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                        <h3 className="font-bold text-sm text-slate-900">Properties</h3>
                        {selectedBlockId && (
                            <Badge variant="outline" className="text-[10px] uppercase font-bold">{selectedBlock?.type}</Badge>
                        )}
                    </div>

                    <ScrollArea className="flex-1">
                        <div className="p-5 space-y-6">
                            {selectedBlock ? (
                                <>
                                    {/* Common: Alignment */}
                                    <div className="space-y-3">
                                        <Label className="text-xs uppercase text-slate-500">Alignment</Label>
                                        <div className="flex bg-slate-100 p-1 rounded-md">
                                            <button onClick={() => updateBlock(selectedBlock.id, { align: 'left' })} className={cn("flex-1 p-1 rounded hover:bg-white transition-all text-slate-500", selectedBlock.content.align === 'left' && "bg-white shadow-sm text-slate-900")}><AlignLeft className="w-4 h-4 mx-auto" /></button>
                                            <button onClick={() => updateBlock(selectedBlock.id, { align: 'center' })} className={cn("flex-1 p-1 rounded hover:bg-white transition-all text-slate-500", selectedBlock.content.align === 'center' && "bg-white shadow-sm text-slate-900")}><AlignCenter className="w-4 h-4 mx-auto" /></button>
                                            <button onClick={() => updateBlock(selectedBlock.id, { align: 'right' })} className={cn("flex-1 p-1 rounded hover:bg-white transition-all text-slate-500", selectedBlock.content.align === 'right' && "bg-white shadow-sm text-slate-900")}><AlignRight className="w-4 h-4 mx-auto" /></button>
                                        </div>
                                    </div>

                                    {/* Text Content */}
                                    {(selectedBlock.type === 'heading' || selectedBlock.type === 'text') && (
                                        <div className="space-y-3">
                                            <div className="flex justify-between items-center">
                                                <Label className="text-xs uppercase text-slate-500">Content</Label>
                                                <Button variant="ghost" size="sm" className="h-5 text-[10px] px-1.5 text-purple-600 hover:bg-purple-50 hover:text-purple-700" onClick={handleSmartRewrite} disabled={isAiGenerating}>
                                                    <Sparkles className="w-3 h-3 mr-1" /> Rewrite
                                                </Button>
                                            </div>
                                            <Textarea 
                                                value={selectedBlock.content.text} 
                                                onChange={(e) => updateBlock(selectedBlock.id, { text: e.target.value })} 
                                                className="min-h-[100px] text-sm"
                                            />
                                            
                                            <div className="space-y-2 pt-2">
                                                <Label className="text-xs uppercase text-slate-500">Color</Label>
                                                <div className="flex gap-2">
                                                    <Input type="color" value={selectedBlock.content.color} onChange={(e) => updateBlock(selectedBlock.id, { color: e.target.value })} className="w-10 p-1 h-9 cursor-pointer" />
                                                    <Input value={selectedBlock.content.color} onChange={(e) => updateBlock(selectedBlock.id, { color: e.target.value })} className="flex-1 font-mono uppercase" />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Image Content */}
                                    {selectedBlock.type === 'image' && (
                                        <div className="space-y-3">
                                            <Label className="text-xs uppercase text-slate-500">Image Source</Label>
                                            <div className="flex gap-2">
                                                <Input value={selectedBlock.content.src} onChange={(e) => updateBlock(selectedBlock.id, { src: e.target.value })} className="text-xs" />
                                                <Button size="icon" variant="outline" className="shrink-0"><ImageIcon className="w-4 h-4" /></Button>
                                            </div>
                                            <div className="space-y-1">
                                                <Label className="text-xs">Alt Text</Label>
                                                <Input value={selectedBlock.content.alt} onChange={(e) => updateBlock(selectedBlock.id, { alt: e.target.value })} />
                                            </div>
                                        </div>
                                    )}

                                    {/* Button Content */}
                                    {selectedBlock.type === 'button' && (
                                        <div className="space-y-4">
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase text-slate-500">Label</Label>
                                                <Input value={selectedBlock.content.label} onChange={(e) => updateBlock(selectedBlock.id, { label: e.target.value })} />
                                            </div>
                                            <div className="space-y-2">
                                                <Label className="text-xs uppercase text-slate-500">URL</Label>
                                                <Input value={selectedBlock.content.url} onChange={(e) => updateBlock(selectedBlock.id, { url: e.target.value })} placeholder="https://" />
                                            </div>
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase text-slate-500">Background</Label>
                                                    <div className="flex gap-2">
                                                        <Input type="color" value={selectedBlock.content.backgroundColor} onChange={(e) => updateBlock(selectedBlock.id, { backgroundColor: e.target.value })} className="w-8 p-0 h-8 border-0" />
                                                    </div>
                                                </div>
                                                <div className="space-y-2">
                                                    <Label className="text-xs uppercase text-slate-500">Text Color</Label>
                                                    <div className="flex gap-2">
                                                        <Input type="color" value={selectedBlock.content.color} onChange={(e) => updateBlock(selectedBlock.id, { color: e.target.value })} className="w-8 p-0 h-8 border-0" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </>
                            ) : (
                                <div className="text-center text-slate-400 py-12">
                                    <MousePointer2 className="w-10 h-10 mx-auto mb-3 opacity-20" />
                                    <p className="text-sm">Select a block on the canvas to edit its properties.</p>
                                </div>
                            )}
                        </div>
                    </ScrollArea>
                </div>
            </div>
        </div>
    );
};
