
import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Message {
    id: string;
    role: 'user' | 'ai';
    text: string;
    timestamp: Date;
}

export const Automations = () => {
    const [chatInput, setChatInput] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [workflow, setWorkflow] = useState<any>({});

    // --- AI HANDLER ---
    const handleSendMessage = async () => {
        if (!chatInput.trim()) return;
        const text = chatInput;
        setChatInput('');
        setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text, timestamp: new Date() }]);
        setIsTyping(true);

        try {
            const apiKey = process.env.API_KEY;
            if (!apiKey) {
                await new Promise(r => setTimeout(r, 1500));
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: "I'm in demo mode. Try 'Add a text message action after Slack'.", timestamp: new Date() }]);
                setIsTyping(false);
                return;
            }

            const ai = new GoogleGenAI({ apiKey });
            const systemPrompt = `
                You are a Workflow Architect. Modifying this JSON graph:
                ${JSON.stringify(workflow)}
                User request: "${text}"
                Return a JSON object with: { message: string, workflow: Workflow }.
                Rules:
                - Auto-calculate node positions (x,y) to keep it tree-like.
                - Ensure all node IDs are unique strings.
                - Valid node types: trigger, action, condition, delay.
                - Icons: stripe, slack, mail, crm, webhook, zap, condition, delay.
            `;

            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: systemPrompt,
                config: { responseMimeType: "application/json" }
            });

            try {
                const data = JSON.parse(response.text || "{}");
                if (data.workflow) setWorkflow(data.workflow);
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: data.message || "Updated workflow.", timestamp: new Date() }]);
            } catch (parseError) {
                console.error("AI Parse Error", parseError);
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: "I had trouble formatting the response. Please try again.", timestamp: new Date() }]);
            }

        } catch (e: any) {
            console.error(e);
            if (e.message?.includes('429') || e.status === 429 || JSON.stringify(e).includes('RESOURCE_EXHAUSTED')) {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: "⚠️ API Quota Exceeded. I can't process new instructions right now, but you can continue editing manually.", timestamp: new Date() }]);
            } else {
                setMessages(prev => [...prev, { id: Date.now().toString(), role: 'ai', text: "Error connecting to architect.", timestamp: new Date() }]);
            }
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <div className="p-6">
            <h1 className="text-2xl font-bold">Automations</h1>
            <p>Use AI to build your workflows.</p>
            {/* Placeholder for actual chat interface */}
        </div>
    );
};
