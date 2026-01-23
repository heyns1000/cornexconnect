
import React, { useState } from 'react';
import { GoogleGenAI } from '@google/genai';

interface AdGeneratorProps {
  onBack: () => void;
}

export const AdGenerator: React.FC<AdGeneratorProps> = ({ onBack }) => {
  const [sourceImage, setSourceImage] = useState<string | null>(null);
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [imageSize, setImageSize] = useState<'1K' | '2K' | '4K'>('1K');
  const [mode, setMode] = useState<'ADS' | 'EDIT'>('ADS');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSourceImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const executeCreativeLogic = async () => {
    if (!prompt.trim()) return;
    
    // MANDATORY: Check for API key for Pro model
    if (mode === 'ADS') {
      const hasKey = await (window as any).aistudio?.hasSelectedApiKey();
      if (!hasKey) {
        alert("SECURITY CLEARANCE REQUIRED: Pro Image models require a paid API key. Opening selection gateway...");
        await (window as any).aistudio?.openSelectKey();
        // Proceeding after dialog trigger to mitigate race conditions per guidelines
      }
    }

    setIsGenerating(true);
    setGeneratedImage(null);

    try {
      // Create new instance right before call to ensure latest API key is used
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      
      if (mode === 'ADS') {
        const contents: any = { parts: [{ text: `Create a professional industrial wholesale advertisement for CornexConnect™. 
          User Prompt: ${prompt}. 
          Style: High-fidelity industrial, blueprint accents, Pretoria Hub branding. 
          Context: Wholesaler L Shared Hub Logic.` }] };
        
        if (sourceImage) {
          contents.parts.unshift({
            inlineData: { data: sourceImage.split(',')[1], mimeType: 'image/jpeg' }
          });
        }

        const response = await ai.models.generateContent({
          model: 'gemini-3-pro-image-preview',
          contents,
          config: {
            imageConfig: {
              aspectRatio: "1:1",
              imageSize: imageSize
            }
          }
        });

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          }
        }
      } else {
        // Image Editing mode (Flash model)
        const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [
              ...(sourceImage ? [{ inlineData: { data: sourceImage.split(',')[1], mimeType: 'image/jpeg' } }] : []),
              { text: prompt }
            ]
          }
        });

        for (const part of response.candidates[0].content.parts) {
          if (part.inlineData) {
            setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          }
        }
      }
    } catch (err: any) {
      console.error("Creative Node Exception:", err);
      // Handle Permission Denied (403) or Not Found by resetting key selection
      if (err.message?.includes("permission") || err.message?.includes("403") || err.message?.includes("not found")) {
        alert("ACCESS DENIED (403): The selected API key does not have permission for this model. Please select a valid paid project key.");
        await (window as any).aistudio?.openSelectKey();
      } else {
        alert("GENERATIVE ERROR: Node failed to respond. Trace: " + err.message);
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const shareAd = (platform: string) => {
    if (!generatedImage) return;
    const text = encodeURIComponent(`CornexConnect™ Official Promo: ${prompt}`);
    let url = "";
    if (platform === 'whatsapp') url = `https://wa.me/?text=${text}`;
    else if (platform === 'email') url = `mailto:?subject=CornexConnect Promo&body=${text}`;
    window.open(url, '_blank');
  };

  return (
    <div className="min-h-screen bg-black text-white -mx-6 -my-12 px-10 py-16 animate-in fade-in duration-500">
      <div className="max-w-[1600px] mx-auto grid lg:grid-cols-12 gap-16">
        <div className="lg:col-span-4 space-y-12">
          <div className="bg-[#0d0d0d] border border-white/5 rounded-[40px] p-12 shadow-2xl">
            <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-8 border-b-4 border-blue-600 pb-4">CREATIVE HUB</h2>
            <div className="flex gap-4 mb-10">
              <button onClick={() => setMode('ADS')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'ADS' ? 'bg-blue-600 text-white' : 'bg-white/5 text-slate-500 hover:text-white'}`}>Ad Generator</button>
              <button onClick={() => setMode('EDIT')} className={`flex-1 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${mode === 'EDIT' ? 'bg-emerald-600 text-white' : 'bg-white/5 text-slate-500 hover:text-white'}`}>Image Lab</button>
            </div>

            <div className="space-y-8">
              <div className="bg-white/5 border-2 border-dashed border-white/10 rounded-3xl p-8 text-center group hover:border-blue-500 transition-all">
                {!sourceImage ? (
                  <label className="cursor-pointer">
                    <input type="file" accept="image/*" onChange={handleImageUpload} className="hidden" />
                    <div className="flex flex-col items-center gap-4">
                      <svg className="w-12 h-12 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                      <p className="text-[11px] font-black uppercase tracking-widest">Input Source (Ad/Item)</p>
                    </div>
                  </label>
                ) : (
                  <div className="relative">
                    <img src={sourceImage} className="max-h-64 mx-auto rounded-2xl" />
                    <button onClick={() => setSourceImage(null)} className="absolute top-2 right-2 bg-red-600 p-2 rounded-full"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
                  </div>
                )}
              </div>

              {mode === 'ADS' && (
                <div>
                  <label className="text-[10px] font-black uppercase text-slate-500 mb-4 block">Fidelity Node Size</label>
                  <div className="grid grid-cols-3 gap-2">
                    {['1K', '2K', '4K'].map(size => (
                      <button key={size} onClick={() => setImageSize(size as any)} className={`py-3 rounded-xl text-[10px] font-black ${imageSize === size ? 'bg-white text-black' : 'bg-white/5 text-slate-400'}`}>{size}</button>
                    ))}
                  </div>
                </div>
              )}

              <textarea 
                value={prompt} 
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={mode === 'ADS' ? "Promo spring R29-00 exl per 2m..." : "Add a retro filter to this image..."}
                className="w-full h-32 bg-white/5 border border-white/10 rounded-2xl p-6 outline-none focus:border-blue-500 transition-all font-bold text-sm text-white placeholder:text-slate-800 italic"
              />

              <button 
                onClick={executeCreativeLogic} 
                disabled={isGenerating}
                className={`w-full py-6 rounded-3xl font-black uppercase text-[11px] tracking-widest transition-all shadow-2xl ${isGenerating ? 'bg-slate-800 text-slate-500' : 'bg-white text-black hover:bg-blue-600 hover:text-white'}`}
              >
                {isGenerating ? 'SYPHONING PIXELS...' : 'EXECUTE GENERATIVE RUN'}
              </button>
            </div>
          </div>
        </div>

        <div className="lg:col-span-8 flex flex-col items-center justify-center">
          {generatedImage ? (
            <div className="animate-in zoom-in-95 duration-700 space-y-10 w-full">
              <div className="bg-white/5 p-4 rounded-[48px] border border-white/10 shadow-2xl relative group">
                <img src={generatedImage} className="w-full rounded-[40px] shadow-2xl" alt="Generated" />
                <div className="absolute inset-0 bg-blue-600/20 opacity-0 group-hover:opacity-100 transition-opacity rounded-[40px] flex items-center justify-center backdrop-blur-sm">
                   <p className="text-4xl font-black italic uppercase text-white tracking-tighter">PRETORIA HUB QUALITY VERIFIED</p>
                </div>
              </div>
              <div className="flex gap-6 justify-center">
                <button onClick={() => shareAd('whatsapp')} className="bg-[#25D366] text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3"><svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>WhatsApp Rep</button>
                <button onClick={() => shareAd('email')} className="bg-blue-600 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3"><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>Email Client</button>
              </div>
            </div>
          ) : (
            <div className="text-center opacity-20">
               <svg className="w-48 h-48 mx-auto mb-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
               <p className="text-4xl font-black italic uppercase tracking-tighter">CREATIVE STAGE READY</p>
               <p className="text-[12px] font-black uppercase tracking-[0.4em] mt-4">Awaiting Generative Prompt Input</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
