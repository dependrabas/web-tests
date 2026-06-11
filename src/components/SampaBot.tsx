import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Sparkles, RefreshCw, User, HelpCircle } from 'lucide-react';
import { ChatMessage } from '../types';

export default function SampaBot() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Initial welcome greeting
    setChatHistory([
      {
        id: 'welcome',
        sender: 'bot',
        text: "Tashi Delek! I am **Sampa**, your digital guide to the Trongsa College of Heritage and Contemporary Studies (CLCS), Royal University of Bhutan. How can I help you find information about academic programs, residential life, or research admissions today?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isOpen]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || message.trim();
    if (!text) return;

    if (!textToSend) {
      setMessage('');
    }

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory(prev => [...prev, userMsg]);
    setLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, history: chatHistory })
      });
      const data = await response.json();
      
      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        text: data.reply || "I am currently processing academic applications. How may I guide you on our degrees?",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, botMsg]);
    } catch (e) {
      const errorMsg: ChatMessage = {
        id: `err-${Date.now()}`,
        sender: 'bot',
        text: "Apologies, I encountered a temporary connection issue. Please feel free to check out admissions via our Main Menu details.",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setChatHistory(prev => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setChatHistory([
      {
        id: 'welcome-reset',
        sender: 'bot',
        text: "Chat restart successful. Ask me anything about CLCS / Trongsa College programs or admission requirements!",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      }
    ]);
  };

  const sampleQuestions = [
    { text: "What BA courses are offered?", label: "BA Courses" },
    { text: "How can I apply for July intake?", label: "Admissions Eligibility" },
    { text: "Tell me about hostels and student canteens.", label: "Campus Hostels" },
    { text: "What is Rigzoed Journal?", label: "Rigzoed Journal" }
  ];

  return (
    <>
      {/* Floating Action Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-[#b68a2a] hover:bg-[#0b2341] text-white rounded-full shadow-2xl flex items-center justify-center cursor-pointer transition-all hover:scale-105 z-50 border-2 border-white ring-4 ring-[#b68a2a]/20"
        title="Chat with Sampa"
        id="sampa-bot-toggle"
      >
        {isOpen ? <X className="w-6 h-6" /> : <MessageSquare className="w-6 h-6" />}
      </button>

      {/* Main Panel Box */}
      {isOpen && (
        <div 
          id="sampa-bot-panel"
          className="fixed bottom-24 left-4 right-4 w-auto sm:left-auto sm:right-6 sm:w-96 rounded-2xl border border-slate-200 bg-white shadow-2xl overflow-hidden flex flex-col z-50 animate-fade-in max-h-[500px]"
        >
          {/* Header */}
          <div className="bg-[#0b2341] p-4 text-white flex justify-between items-center border-b border-[#b68a2a]/30">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center border border-[#b68a2a]/40">
                <Sparkles className="w-4 h-4 text-[#b68a2a] animate-pulse" />
              </div>
              <div>
                <h4 className="font-display font-bold text-sm tracking-wide text-[#b68a2a]">Sampa (བསམ་པ།)</h4>
                <p className="text-[10px] text-slate-300">CLCS Digital Assistant</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <button 
                onClick={clearChat} 
                className="text-slate-300 hover:text-white hover:bg-white/10 p-1.5 rounded cursor-pointer transition"
                title="Restart helper chat"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
              <button 
                onClick={() => setIsOpen(false)} 
                className="text-slate-300 hover:text-white hover:bg-white/10 p-1.5 rounded cursor-pointer transition"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Chat Messages Log */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50 min-h-[250px] max-h-[320px] text-xs">
            {chatHistory.map((m) => {
              const matchesUser = m.sender === 'user';
              return (
                <div key={m.id} className={`flex ${matchesUser ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-3 rounded-lg max-w-[85%] ${
                    matchesUser 
                      ? 'bg-[#0b2341] text-white rounded-br-none' 
                      : 'bg-white text-slate-800 border border-slate-200 shadow-sm rounded-bl-none'
                  }`}>
                    {/* Simple rendering with limited bold parsing */}
                    <div className="space-y-1 whitespace-pre-line leading-relaxed">
                      {m.text.split('**').map((part, i) => i % 2 === 1 ? <strong key={i} className="text-[#b68a2a] font-semibold">{part}</strong> : part)}
                    </div>
                    <span className="block mt-1 text-[9px] text-right opacity-60">
                      {m.timestamp}
                    </span>
                  </div>
                </div>
              );
            })}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-slate-200 text-slate-600 px-3 py-2 rounded-lg flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick FAQ Selector */}
          <div className="p-2 border-t border-slate-100 bg-white flex flex-wrap gap-1.5">
            {sampleQuestions.map((q, idx) => (
              <button
                key={idx}
                onClick={() => handleSend(q.text)}
                className="text-[10px] bg-slate-100 hover:bg-[#b68a2a]/20 hover:text-[#0b2341] text-slate-700 font-medium px-2 py-1 rounded-full cursor-pointer transition"
              >
                {q.label}
              </button>
            ))}
          </div>

          {/* Input Panel */}
          <div className="p-2.5 border-t border-slate-100 bg-white flex gap-2">
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Ask Sampa about admissions or syllabus..."
              className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-xs focus:outline-none focus:border-[#0b2341]"
            />
            <button
              onClick={() => handleSend()}
              className="bg-[#0b2341] hover:bg-[#7a1f2b] text-white p-2 rounded-lg transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
