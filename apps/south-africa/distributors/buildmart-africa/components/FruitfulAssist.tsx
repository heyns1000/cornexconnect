
import React, { useState, useRef, useEffect } from 'react';
import { GoogleGenAI } from '@google/genai';
import { INDUSTRIAL_DATA_ARCHIVE } from '../dataArchive.ts';
import { TransactionRecord } from '../types.ts';

interface Message {
  role: 'user' | 'model';
  text: string;
  groundingChunks?: any[];
  thread?: string;
}

export const FruitfulAssist: React.FC<{ isOpen: boolean; onClose: () => void; history: TransactionRecord[] }> = ({ isOpen, onClose, history }) => {
  const [activeTab, setActiveTab] = useState<'thinking' | 'grounding' | 'voice'>('thinking');
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isThinking, setIsThinking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleGroundingChat = async (type: 'SEARCH' | 'MAPS') => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);
    const currentInput = input;
    setInput('');
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let response;
      
      if (type === 'SEARCH') {
        response = await ai.models.generateContent({
          model: 'gemini-3-flash-preview',
          contents: currentInput,
          config: { 
            tools: [{ googleSearch: {} }],
            systemInstruction: "You are a logistics expert with real-time web access." 
          }
        });
      } else {
        const pos: any = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        }).catch(() => ({ coords: { latitude: -25.7479, longitude: 28.2293 } }));

        response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: `Locate nearby logistics or hardware nodes: ${currentInput}`,
          config: { 
            tools: [{ googleMaps: {} }],
            toolConfig: { retrievalConfig: { latLng: { latitude: pos.coords.latitude, longitude: pos.coords.longitude } } }
          }
        });
      }

      const text = response.text || 'Sync successful.';
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      
      setMessages(prev => [...prev, { role: 'model', text, groundingChunks: chunks }]);
    } catch (err: any) {
      console.error("Grounding Failure:", err);
      let errorMsg = "Grounding Node Timeout.";
      if (err.message?.includes("permission") || err.message?.includes("403")) {
        errorMsg = "ACCESS DENIED (403): Your API Key is not authorized for Grounding tools. Use a standard project key or check console.";
      }
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }]);
    } finally {
      setIsThinking(false);
    }
  };

  const handleThinkingChat = async () => {
    if (!input.trim()) return;
    const userMsg: Message = { role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setIsThinking(true);
    const currentInput = input;
    setInput('');

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      // Use Pro model for deep industrial reasoning
      const response = await ai.models.generateContent({
        model: 'gemini-3-pro-preview',
        contents: currentInput,
        config: { 
          thinkingConfig: { thinkingBudget: 4000 },
          systemInstruction: `You are the CornexConnect Master Actuary. 
          Use the following industrial data for context: ${JSON.stringify(INDUSTRIAL_DATA_ARCHIVE.metadata)}. 
          Provide deep reasoning on inventory churn, capital preservation, and market trends.` 
        }
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || 'Actuary Node Silence.' }]);
    } catch (err: any) {
      console.error("Thinking Failure:", err);
      setMessages(prev => [...prev, { role: 'model', text: 'Thinking Node failed to initialize: ' + err.message }]);
    } finally {
      setIsThinking(false);
    }
  };

  const startRecording = async () => {
    setIsRecording(true);
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.ondataavailable = (event) => audioChunksRef.current.push(event.data);
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        const reader = new FileReader();
        reader.readAsDataURL(audioBlob);
        reader.onloadend = async () => {
          const base64Audio = (reader.result as string).split(',')[1];
          await handleTranscription(base64Audio);
        };
      };
      mediaRecorder.start();
    } catch (e) {
      alert("Microphone access denied.");
      setIsRecording(false);
    }
  };

  const stopRecording = () => {
    setIsRecording(false);
    mediaRecorderRef.current?.stop();
  };

  const handleTranscription = async (base64Audio: string) => {
    setIsThinking(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: {
          parts: [
            { inlineData: { data: base64Audio, mimeType: 'audio/wav' } },
            { text: "Transcribe this logistics memo accurately." }
          ]
        }
      });
      setMessages(prev => [...prev, { role: 'model', text: `TRANSCRIPTION RECOVERY: ${response.text}` }]);
    } catch (err) {
      console.error(err);
    } finally {
      setIsThinking(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 right-0 h-full w-full max-w-xl z-[500] flex no-print animate-in slide-in-from-right duration-500">
      <div className="flex-1" onClick={onClose}></div>
      <div className="w-full max-w-lg h-full bg-[#0a0a0a] shadow-[-20px_0_100px_rgba(0,0,0,0.8)] flex flex-col border-l border-white/5">
        <div className="p-8 border-b border-white/5 bg-black/50 backdrop-blur-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-[0_0_20px_rgba(37,99,235,0.4)]">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
              </div>
              <h2 className="text-xl font-black uppercase italic text-white tracking-tighter">ASSIST NODE V3.1</h2>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full text-white"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
          </div>
        </div>

        <div className="flex bg-white/5 p-1 mx-8 mt-6 rounded-2xl border border-white/5">
          {(['thinking', 'grounding', 'voice'] as const).map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-white text-black' : 'text-slate-500'}`}>{tab}</button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'}`}>
              <div className={`p-6 rounded-[32px] text-sm font-bold shadow-xl border ${m.role === 'user' ? 'bg-blue-600 text-white border-blue-400 rounded-tr-none' : 'bg-white/5 text-slate-200 border-white/10 rounded-tl-none whitespace-pre-wrap'}`}>
                {m.text}
                {m.groundingChunks && (
                  <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                    <p className="text-[10px] font-black uppercase text-blue-400 italic tracking-widest">Verification Sources:</p>
                    {m.groundingChunks.map((c: any, ci: number) => (
                      <a key={ci} href={c.web?.uri || c.maps?.uri} target="_blank" className="block text-xs text-blue-500 hover:underline">[{ci + 1}] {c.web?.title || c.maps?.title || 'External Proof'}</a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          {isThinking && (
            <div className="flex justify-start">
              <div className="bg-white/5 border border-white/10 p-6 rounded-[32px] rounded-tl-none animate-pulse text-blue-400 text-[10px] font-black uppercase italic">Probing Data Clusters...</div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="p-8 border-t border-white/5 bg-black/50 backdrop-blur-3xl">
          {activeTab === 'voice' ? (
            <div className="flex flex-col items-center gap-6">
              <button 
                onMouseDown={startRecording} 
                onMouseUp={stopRecording}
                className={`w-24 h-24 rounded-full flex items-center justify-center transition-all ${isRecording ? 'bg-red-600 scale-125 animate-pulse' : 'bg-blue-600 hover:bg-blue-500'}`}
              >
                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>
              </button>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">{isRecording ? 'Capturing Logistics Memo...' : 'Hold for Voice Transcription'}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder={`Query ${activeTab === 'grounding' ? 'Market Data...' : 'Master Actuary...'}`}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (activeTab === 'thinking' ? handleThinkingChat() : handleGroundingChat('SEARCH'))}
                  className="flex-1 px-8 py-5 bg-white/5 border border-white/10 rounded-2xl text-white outline-none focus:border-blue-500 font-bold"
                />
                <button 
                  onClick={() => activeTab === 'thinking' ? handleThinkingChat() : handleGroundingChat('SEARCH')} 
                  className="bg-white text-black p-5 rounded-2xl hover:bg-blue-600 hover:text-white transition-all"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg>
                </button>
              </div>
              {activeTab === 'grounding' && (
                <div className="grid grid-cols-2 gap-4">
                  <button onClick={() => handleGroundingChat('SEARCH')} className="py-3 bg-blue-600/10 text-blue-500 rounded-xl text-[9px] font-black uppercase border border-blue-500/20">Market Search</button>
                  <button onClick={() => handleGroundingChat('MAPS')} className="py-3 bg-emerald-600/10 text-emerald-500 rounded-xl text-[9px] font-black uppercase border border-emerald-500/20">Logistics Maps</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
