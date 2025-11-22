import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

const ChatInterface = () => {
  // State
  const [messages, setMessages] = useState([
    { role: 'system', content: 'Welcome to TechCorp Support. How can I help you?' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isEscalated, setIsEscalated] = useState(false);
  
  // Create a session ID once on mount
  const [sessionId] = useState(() => `session_${Math.random().toString(36).substr(2, 9)}`);

  // Auto-scroll to bottom
  const messagesEndRef = useRef(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(scrollToBottom, [messages]);

  // Handle Send
  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    // 1. Add User Message to UI
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
      // 2. API Call to Backend
      const response = await axios.post('http://localhost:5000/api/chat', {
        sessionId: sessionId,
        message: userMsg.content
      });

      const data = response.data;

      // 3. Handle Response
      const botMsg = { role: 'assistant', content: data.answer };
      setMessages(prev => [...prev, botMsg]);

      // 4. Handle Escalation (Visual Trigger)
      if (data.escalate) {
        setIsEscalated(true);
        setMessages(prev => [...prev, { 
          role: 'system', 
          content: `⚠️ TICKET #992CREATED: Reason - ${data.reason || "Support Needed"}` 
        }]);
      }

    } catch (error) {
      console.error("Error:", error);
      setMessages(prev => [...prev, { role: 'system', content: "Error connecting to server." }]);
    } finally {
      setIsLoading(false);
    }
  };

  // UI Logic
  const borderColor = isEscalated ? 'border-red-500 shadow-red-200' : 'border-gray-200 shadow-lg';
  const headerColor = isEscalated ? 'bg-red-600' : 'bg-blue-600';

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className={`w-full max-w-md bg-white rounded-xl border-2 ${borderColor} shadow-2xl overflow-hidden transition-all duration-500`}>
        
        {/* Header */}
        <div className={`${headerColor} p-4 text-white transition-colors duration-500`}>
          <h1 className="font-bold text-xl flex items-center gap-2">
            {isEscalated ? '⚠️ Escalated Support' : '🤖 TechCorp AI'}
          </h1>
          <p className="text-xs opacity-80">Session: {sessionId}</p>
        </div>

        {/* Chat Log */}
        <div className="h-96 overflow-y-auto p-4 bg-gray-50 space-y-4 chat-scroll">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div 
                className={`max-w-[80%] p-3 rounded-lg text-sm ${
                  msg.role === 'user' 
                    ? 'bg-blue-500 text-white rounded-br-none' 
                    : msg.role === 'system'
                    ? 'bg-gray-800 text-red-400 font-mono text-xs w-full text-center'
                    : 'bg-white border border-gray-200 text-gray-800 rounded-bl-none shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {isLoading && (
             <div className="flex justify-start">
               <div className="bg-gray-200 text-gray-500 text-xs p-2 rounded-lg animate-pulse">
                 Typing...
               </div>
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t border-gray-100">
          {!isEscalated ? (
            <form onSubmit={sendMessage} className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your issue..."
                className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 transition-colors"
              />
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg disabled:opacity-50 transition-colors"
              >
                Send
              </button>
            </form>
          ) : (
            <div className="text-center p-2 bg-red-50 text-red-600 border border-red-100 rounded-lg">
              <span className="font-bold">Chat Locked.</span> A human agent is reviewing your case.
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default ChatInterface;