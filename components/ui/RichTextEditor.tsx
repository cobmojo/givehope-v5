
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { 
  Bold, Italic, List, Underline, Heading1, Heading2, Quote, ListOrdered, Link as LinkIcon, Image as ImageIcon
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface RichTextEditorProps {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    className?: string;
    contentClassName?: string;
    disabled?: boolean;
    toolbarPosition?: 'top' | 'bottom';
    actions?: React.ReactNode;
    onImageClick?: () => void;
}

export function RichTextEditor({ 
    value, 
    onChange, 
    placeholder, 
    className,
    contentClassName,
    disabled,
    toolbarPosition = 'top',
    actions,
    onImageClick
}: RichTextEditorProps) {
    const editorRef = useRef<HTMLDivElement>(null);
    const [activeFormats, setActiveFormats] = useState<string[]>([]);
    
    const isEmpty = !value || value === '<br>' || value === '<p><br></p>' || value.trim() === '';

    useEffect(() => {
        if (editorRef.current && value !== editorRef.current.innerHTML) {
            if (document.activeElement !== editorRef.current) {
                editorRef.current.innerHTML = value;
            }
        }
    }, [value]);

    const updateActiveFormats = useCallback(() => {
        if (typeof document === 'undefined') return;
        
        const formats: string[] = [];
        if (document.queryCommandState('bold')) formats.push('bold');
        if (document.queryCommandState('italic')) formats.push('italic');
        if (document.queryCommandState('underline')) formats.push('underline');
        if (document.queryCommandState('insertUnorderedList')) formats.push('ul');
        if (document.queryCommandState('insertOrderedList')) formats.push('ol');
        
        const block = document.queryCommandValue('formatBlock');
        if (block && block.toLowerCase() === 'h1') formats.push('h1');
        if (block && block.toLowerCase() === 'h2') formats.push('h2');
        if (block && block.toLowerCase() === 'blockquote') formats.push('blockquote');

        setActiveFormats(formats);
    }, []);

    const onSelectionChange = useCallback(() => {
        if (document.activeElement === editorRef.current || editorRef.current?.contains(document.activeElement)) {
            updateActiveFormats();
        }
    }, [updateActiveFormats]);

    useEffect(() => {
        document.addEventListener('selectionchange', onSelectionChange);
        return () => document.removeEventListener('selectionchange', onSelectionChange);
    }, [onSelectionChange]);

    const exec = (command: string, val?: string) => {
        document.execCommand(command, false, val);
        editorRef.current?.focus();
        updateActiveFormats();
        handleInput();
    };

    const handleLink = () => {
        const url = prompt('Enter URL:');
        if (url) exec('createLink', url);
    };

    const handleInput = () => {
        if (editorRef.current) {
            const html = editorRef.current.innerHTML;
            onChange(html === '<br>' ? '' : html);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Tab') {
            e.preventDefault();
            document.execCommand('insertHTML', false, '&nbsp;&nbsp;&nbsp;&nbsp;');
        }
    };

    const Toolbar = () => (
        <div className={cn(
            "flex items-center gap-2 px-3 py-2 bg-transparent",
            toolbarPosition === 'top' ? "border-b border-slate-100" : "border-t border-slate-100"
        )}>
            <div className="flex items-center gap-1 flex-1 overflow-x-auto no-scrollbar">
                {/* Formatting Group */}
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg">
                    <ToolbarBtn active={activeFormats.includes('bold')} onClick={() => exec('bold')} icon={<Bold size={16} />} title="Bold" />
                    <ToolbarBtn active={activeFormats.includes('italic')} onClick={() => exec('italic')} icon={<Italic size={16} />} title="Italic" />
                    <ToolbarBtn active={activeFormats.includes('underline')} onClick={() => exec('underline')} icon={<Underline size={16} />} title="Underline" />
                </div>

                <div className="w-px h-4 bg-slate-200 mx-1" />

                {/* Headers Group */}
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg">
                    <ToolbarBtn active={activeFormats.includes('h1')} onClick={() => exec('formatBlock', 'H1')} icon={<Heading1 size={16} />} title="Heading 1" />
                    <ToolbarBtn active={activeFormats.includes('h2')} onClick={() => exec('formatBlock', 'H2')} icon={<Heading2 size={16} />} title="Heading 2" />
                    <ToolbarBtn active={activeFormats.includes('blockquote')} onClick={() => exec('formatBlock', 'BLOCKQUOTE')} icon={<Quote size={16} />} title="Quote" />
                </div>

                <div className="w-px h-4 bg-slate-200 mx-1" />

                {/* Lists Group */}
                <div className="flex items-center gap-0.5 p-0.5 rounded-lg">
                    <ToolbarBtn active={activeFormats.includes('ul')} onClick={() => exec('insertUnorderedList')} icon={<List size={16} />} title="Bullet List" />
                    <ToolbarBtn active={activeFormats.includes('ol')} onClick={() => exec('insertOrderedList')} icon={<ListOrdered size={16} />} title="Numbered List" />
                </div>

                <div className="w-px h-4 bg-slate-200 mx-1" />

                {/* Media Group */}
                <div className="flex items-center gap-0.5 p-0.5 text-slate-400">
                    <button type="button" onClick={handleLink} className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"><LinkIcon size={16} /></button>
                    {onImageClick && (
                        <button type="button" onClick={onImageClick} className="p-1.5 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"><ImageIcon size={16} /></button>
                    )}
                </div>
            </div>

            {/* Actions Slot */}
            {actions && (
                <div className="flex items-center gap-2 pl-2">
                    {actions}
                </div>
            )}
        </div>
    );

    return (
        <div className={cn(
            "border border-input rounded-xl bg-background transition-all flex flex-col shadow-sm focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 overflow-hidden",
            disabled && "opacity-60 pointer-events-none bg-muted",
            className
        )}>
            {toolbarPosition === 'top' && <Toolbar />}
            
            <div className="relative flex-1 cursor-text group bg-white" onClick={() => editorRef.current?.focus()}>
                {isEmpty && placeholder && (
                    <div 
                        className={cn(
                            "absolute top-0 left-0 right-0 pointer-events-none select-none text-slate-400 truncate",
                            contentClassName ? contentClassName : "p-4"
                        )}
                        style={{ height: 'fit-content' }}
                    >
                        {placeholder}
                    </div>
                )}
                
                <div
                    ref={editorRef}
                    contentEditable={!disabled}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    className={cn(
                        "min-h-[140px] p-4 outline-none text-base text-slate-900 leading-relaxed",
                        "prose prose-sm max-w-none",
                        "prose-p:my-2 prose-p:leading-relaxed",
                        "prose-headings:font-bold prose-headings:text-slate-900 prose-headings:mb-2 prose-headings:mt-4",
                        "prose-h1:text-2xl prose-h2:text-xl",
                        "prose-blockquote:border-l-4 prose-blockquote:border-blue-200 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-slate-600",
                        "prose-ul:list-disc prose-ul:pl-5",
                        "prose-ol:list-decimal prose-ol:pl-5",
                        "prose-a:text-blue-600 prose-a:underline",
                        "prose-img:rounded-xl prose-img:shadow-sm prose-img:max-w-full prose-img:h-auto",
                        contentClassName
                    )}
                />
            </div>

            {toolbarPosition === 'bottom' && <Toolbar />}
        </div>
    );
}

const ToolbarBtn = ({ active, onClick, icon, title }: { active: boolean, onClick: () => void, icon: React.ReactNode, title: string }) => (
    <button
        type="button"
        onMouseDown={(e) => { e.preventDefault(); onClick(); }}
        className={cn(
            "p-1.5 rounded-md transition-all duration-200 flex items-center justify-center text-slate-400 hover:text-slate-900 hover:bg-slate-100",
            active && "bg-slate-100 text-blue-600 shadow-none"
        )}
        title={title}
    >
        {icon}
    </button>
);
