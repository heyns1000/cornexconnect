import { useState, useRef, useEffect } from "react";
import { Send, X, Maximize2, Minimize2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

interface Message {
  id: string;
  text: string;
  isBot: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface FruitfulAssistChatbotProps {
  isOpen: boolean;
  onToggle: () => void;
}

export function FruitfulAssistChatbot({ isOpen, onToggle }: FruitfulAssistChatbotProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: "✨ 🍎 Hello! I'm 🍎 Fruitful Assist, your intelligent companion for the CornexConnect Manufacturing Portal. I can help you with:",
      isBot: true,
      timestamp: new Date(),
      suggestions: [
        "Production Optimization",
        "Inventory Analysis", 
        "Factory Performance",
        "Sales Insights",
        "Route Planning",
        "Market Analysis"
      ]
    }
  ]);
  
  const [inputMessage, setInputMessage] = useState("");
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (!inputMessage.trim()) return;

    const newUserMessage: Message = {
      id: Date.now().toString(),
      text: inputMessage,
      isBot: false,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, newUserMessage]);
    setInputMessage("");

    // Simulate bot response
    setTimeout(() => {
      const botResponse: Message = {
        id: (Date.now() + 1).toString(),
        text: "🍎 I'm analyzing your request and preparing insights for the CornexConnect platform. How can I assist you further with manufacturing optimization?",
        isBot: true,
        timestamp: new Date(),
        suggestions: ["View Factory Status", "Check Inventory Levels", "Optimize Production", "Sales Analytics"]
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const handleSuggestionClick = (suggestion: string) => {
    setInputMessage(suggestion);
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { 
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <Card className={`w-96 shadow-2xl border-0 transition-all duration-300 ${isMinimized ? 'h-16' : 'h-[600px]'}`}>
        {/* Header */}
        <CardHeader className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-4 rounded-t-lg">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2 text-lg font-semibold">
              <span className="text-xl">🍎</span>
              <span>Fruitful Assist</span>
              <Badge variant="secondary" className="bg-white/20 text-white border-0 text-xs">
                AI
              </Badge>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 p-1 h-8 w-8"
                onClick={() => setIsMinimized(!isMinimized)}
              >
                {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-white hover:bg-white/20 p-1 h-8 w-8"
                onClick={onToggle}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        {/* Messages Area */}
        {!isMinimized && (
          <>
            <CardContent className="p-0 h-[460px] bg-slate-800 text-white overflow-hidden flex flex-col">
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="space-y-2">
                    <div className={`flex ${message.isBot ? 'justify-start' : 'justify-end'}`}>
                      <div className={`max-w-[80%] p-3 rounded-lg ${
                        message.isBot 
                          ? 'bg-slate-700 text-white' 
                          : 'bg-orange-500 text-white'
                      }`}>
                        {message.isBot && (
                          <div className="flex items-center space-x-2 mb-2">
                            <Sparkles className="w-4 h-4 text-orange-400" />
                            <span className="text-xs text-slate-300">
                              {formatTime(message.timestamp)}
                            </span>
                          </div>
                        )}
                        <p className="text-sm leading-relaxed">{message.text}</p>
                      </div>
                    </div>
                    
                    {/* Suggestions */}
                    {message.suggestions && message.suggestions.length > 0 && (
                      <div className="flex flex-wrap gap-2 ml-2">
                        {message.suggestions.map((suggestion, index) => (
                          <Button
                            key={index}
                            size="sm"
                            variant="outline"
                            className="bg-slate-700 border-slate-600 text-white hover:bg-slate-600 text-xs py-1 px-2 h-auto"
                            onClick={() => handleSuggestionClick(suggestion)}
                          >
                            {suggestion}
                          </Button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              {/* Input Area */}
              <div className="p-4 border-t border-slate-700">
                <div className="flex items-center space-x-2">
                  <Input
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Ask 🍎 Fruitful Assist anything..."
                    className="bg-slate-700 border-slate-600 text-white placeholder-slate-400 focus:border-orange-500"
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  />
                  <Button
                    size="sm"
                    className="bg-orange-500 hover:bg-orange-600 text-white px-3"
                    onClick={handleSendMessage}
                  >
                    <Send className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-slate-400">
                  <span className="flex items-center space-x-1">
                    <span>🍎</span>
                    <span>Fruitful Assist</span>
                  </span>
                  <div className="flex items-center space-x-1">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Connected</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}

// Floating Chat Button
export function FruitfulAssistFloatingButton({ onClick, isOpen }: { onClick: () => void; isOpen: boolean }) {
  if (isOpen) return null;

  return (
    <Button
      onClick={onClick}
      className="fixed bottom-6 right-6 z-50 w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 shadow-2xl border-0 transition-all duration-300 hover:scale-110"
    >
      <div className="flex flex-col items-center">
        <span className="text-2xl">🍎</span>
        <span className="text-xs font-medium">AI</span>
      </div>
    </Button>
  );
}