
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Message {
    sender: string;
    text: string;
}

interface Ticket {
    id: string;
    subject: string;
    messages: Message[];
    tags: string[];
}

export const SupportHub = () => {
    const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [aiSummary, setAiSummary] = useState('');
    const [isGeneratingReply, setIsGeneratingReply] = useState(false);
    const [replyText, setReplyText] = useState('');
    const [isSignatureEnabled, setIsSignatureEnabled] = useState(true);
    const [signatureHtml, setSignatureHtml] = useState('');
    const [isGeneratingSig, setIsGeneratingSig] = useState(false);
    const [sigConfig, setSigConfig] = useState<any>({});
    const [sigLogo, setSigLogo] = useState('');
    const [activeSigTab, setActiveSigTab] = useState('config');
    const [editorMode, setEditorMode] = useState('visual');
    const [isGeneratingTags, setIsGeneratingTags] = useState(false);
    const [tickets, setTickets] = useState<Ticket[]>([]);
    const [sentiment, setSentiment] = useState<'Positive' | 'Neutral' | 'Negative'>('Neutral');

    const getAIClient = () => {
        if (!process.env.API_KEY) return null;
        return new GoogleGenAI({ apiKey: process.env.API_KEY });
    };

    const updateTicketProperty = (id: string, prop: string, value: any) => {
        setTickets(prev => prev.map(t => t.id === id ? { ...t, [prop]: value } : t));
    };

    // --- AI Actions ---

    const handleAISummarize = async () => {
        if (!selectedTicket) return;
        setIsGeneratingSummary(true);
        const ai = getAIClient();
        
        try {
        if (ai) {
            const conversation = selectedTicket.messages.map(m => `${m.sender}: ${m.text}`).join('\n');
            const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Summarize this support ticket conversation in 3 concise bullet points. Focus on the core issue, actions taken, and current status.\n\nConversation:\n${conversation}`,
            });
            setAiSummary(response.text || "Could not generate summary.");
        } else {
            // Fallback for demo without key
            await new Promise(r => setTimeout(r, 1500));
            setAiSummary("• User reported payment failure on Visa card ending in 4242.\n• Agent confirmed 'Do Not Honor' error from bank.\n• Waiting for user to contact their bank or try a new card.");
        }
        } catch (e: any) {
        console.error(e);
        if (e.message?.includes('429') || e.status === 429 || JSON.stringify(e).includes('RESOURCE_EXHAUSTED')) {
            setAiSummary("• (Demo) User reported payment failure.\n• (Demo) Agent confirmed error.\n• (Demo) Waiting for bank resolution.");
        } else {
            setAiSummary("Error generating summary.");
        }
        } finally {
        setIsGeneratingSummary(false);
        }
    };

    const handleAIDraft = async (tone: 'Professional' | 'Empathetic' | 'Concise') => {
        if (!selectedTicket) return;
        setIsGeneratingReply(true);
        const ai = getAIClient();

        try {
        if (ai) {
            const conversation = selectedTicket.messages.map(m => `${m.sender}: ${m.text}`).join('\n');
            const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Draft a ${tone.toLowerCase()} response for the support agent to the following conversation. Do not include subject lines or placeholders like [Your Name]. Format as HTML paragraphs. Just the message body.\n\nConversation:\n${conversation}`,
            });
            const draft = response.text?.trim() || "";
            // Append signature if enabled
            setReplyText(isSignatureEnabled ? `${draft}${signatureHtml}` : draft);
        } else {
            // Fallback
            await new Promise(r => setTimeout(r, 1000));
            const drafts = {
            Professional: "<p>Hello,</p><p>Thank you for providing that information. I have reviewed the logs and can confirm the error code. Please contact your bank to authorize the transaction, or try a different payment method.</p><p>Best regards,</p>",
            Empathetic: "<p>Hi there,</p><p>I completely understand how frustrating payment issues can be! 😟 I've looked into it, and it seems your bank declined the transaction. Could you please give them a quick call? We want to get this sorted for you as soon as possible!</p>",
            Concise: "<p>Hi, the error is 'Do Not Honor'. Please contact your bank or use a different card. Thanks.</p>"
            };
            const draft = drafts[tone];
            setReplyText(isSignatureEnabled ? `${draft}${signatureHtml}` : draft);
        }
        } catch (e: any) {
        console.error(e);
        if (e.message?.includes('429') || e.status === 429 || JSON.stringify(e).includes('RESOURCE_EXHAUSTED')) {
            setReplyText(`<p>We are currently experiencing high support volume. Please contact your bank regarding the transaction.</p>${isSignatureEnabled ? signatureHtml : ''}`);
        }
        } finally {
        setIsGeneratingReply(false);
        }
    };

    const handleGenerateSignature = async () => {
        setIsGeneratingSig(true);
        const ai = getAIClient();
        try {
            if (ai) {
                let prompt = `Create a sophisticated, professional, pixel-perfect HTML email signature using the following details.
                
                Name: ${sigConfig.name}
                Role: ${sigConfig.role}
                Phone: ${sigConfig.phone}
                Email: ${sigConfig.email}
                Website: ${sigConfig.website}
                Tagline: ${sigConfig.tagline}
                Preferred Layout: ${sigConfig.layout} (Use best practices for this layout)
                Brand Primary Color: ${sigConfig.color}
                
                Requirements:
                - Use inline CSS for ALL styling (crucial for email client compatibility).
                - Use a modern sans-serif font stack (Inter, Helvetica, Arial).
                - Layout: Use a table-based layout or flex-like structure using table cells for max compatibility.
                - The design should be clean, modern, and trustworthy.
                - Return ONLY the raw HTML code starting with <div or <table. Do not wrap in markdown block symbols.
                `;

                const parts: any[] = [{ text: prompt }];
                
                if (sigLogo) {
                    const base64Data = sigLogo.split(',')[1];
                    const mimeType = sigLogo.split(';')[0].split(':')[1];
                    
                    parts.push({
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType
                        }
                    });
                    parts.push({ text: `IMPORTANT: Use this EXACT data URI for the logo image source in the HTML: ${sigLogo}`});
                } else {
                parts.push({ text: `Do not include an image tag as no logo was provided.`});
                }

                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: { parts }
                });

                const html = response.text?.replace(/```html/g, '').replace(/```/g, '').trim();
                if (html) {
                    setSignatureHtml(html);
                    setActiveSigTab('editor');
                    setEditorMode('visual');
                }
            }
        } catch (e: any) {
            console.error("Sig Gen Error", e);
            if (e.message?.includes('429') || e.status === 429 || JSON.stringify(e).includes('RESOURCE_EXHAUSTED')) {
                const fallbackHtml = `<div style="font-family: sans-serif; color: #334155; margin-top: 20px; border-top: 1px solid #e2e8f0; padding-top: 20px;">
                    <p style="font-weight: bold; margin: 0; color: ${sigConfig.color};">${sigConfig.name}</p>
                    <p style="margin: 2px 0; font-size: 12px;">${sigConfig.role}</p>
                    <p style="margin: 0; font-size: 12px; color: #64748b;">${sigConfig.email}</p>
                </div>`;
                setSignatureHtml(fallbackHtml);
                setActiveSigTab('editor');
                setEditorMode('visual');
            }
        } finally {
            setIsGeneratingSig(false);
        }
    };

    const handleAIAutoTag = async () => {
        if (!selectedTicket) return;
        setIsGeneratingTags(true);
        const ai = getAIClient();

        try {
        if (ai) {
            const content = selectedTicket.subject + "\n" + selectedTicket.messages[0]?.text;
            const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Analyze this support ticket and suggest 3 short, relevant tags (e.g., 'billing', 'urgent', 'bug'). Return ONLY a comma-separated list of tags.\n\nTicket:\n${content}`,
            });
            const tags = response.text?.split(',').map(t => t.trim()) || [];
            if (tags.length > 0) {
            const newTags = Array.from(new Set([...selectedTicket.tags, ...tags]));
            updateTicketProperty(selectedTicket.id, 'tags', newTags);
            }
        } else {
            // Fallback
            await new Promise(r => setTimeout(r, 1000));
            const newTags = Array.from(new Set([...selectedTicket.tags, "payment-error", "stripe-decline"]));
            updateTicketProperty(selectedTicket.id, 'tags', newTags);
        }
        } catch (e: any) {
        console.error(e);
        if (e.message?.includes('429') || e.status === 429 || JSON.stringify(e).includes('RESOURCE_EXHAUSTED')) {
            const newTags = Array.from(new Set([...selectedTicket.tags, "urgent", "review-needed"]));
            updateTicketProperty(selectedTicket.id, 'tags', newTags);
        }
        } finally {
        setIsGeneratingTags(false);
        }
    };

    const handleAISentiment = async (ticketId: string) => {
        const ticket = tickets.find(t => t.id === ticketId);
        if (!ticket) return;
        
        const ai = getAIClient();
        try {
            if (ai) {
                const lastMessage = ticket.messages.filter(m => m.sender !== 'Me' && m.sender !== 'System').pop()?.text || ticket.subject;
                const response = await ai.models.generateContent({
                    model: 'gemini-2.5-flash',
                    contents: `Analyze the sentiment of this customer message. Return ONLY one word: "Positive", "Neutral", or "Negative".\n\nMessage: "${lastMessage}"`
                });
                const sentimentText = response.text?.trim();
                if (['Positive', 'Neutral', 'Negative'].includes(sentimentText || '')) {
                    setSentiment(sentimentText as any);
                } else {
                    setSentiment('Neutral');
                }
            } else {
                // Mock result
                const text = ticket.messages[ticket.messages.length - 1]?.text.toLowerCase() || "";
                if (text.includes('thanks') || text.includes('great')) setSentiment('Positive');
                else if (text.includes('error') || text.includes('fail') || text.includes('upset')) setSentiment('Negative');
                else setSentiment('Neutral');
            }
        } catch (e: any) {
            console.error(e);
            if (e.message?.includes('429') || e.status === 429 || JSON.stringify(e).includes('RESOURCE_EXHAUSTED')) {
                setSentiment('Neutral');
            }
        }
    }

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Support Hub</h1>
            <p>Manage tickets and use AI tools.</p>
        </div>
    );
};
