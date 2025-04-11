"use client"
import { useState, useRef, FormEvent } from 'react';
import { Send, Globe, Sparkles, Settings, User, Bot, FileText, Save, DownloadCloud, Plus, Menu, Star, Filter } from 'lucide-react';
import { Message } from 'ai';
import { useChat } from 'ai/react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Implementing the IntermediateStep component functionality
function IntermediateStep({ message }: { message: Message }) {
  let step;
  try {
    step = JSON.parse(message.content);
  } catch (e) {
    return <div className="text-red-500">Error parsing step: {message.content}</div>;
  }
  
  const action = step.action;
  const observation = step.observation;
  
  return (
    <div className="flex justify-start">
      <div className="bg-gray-700 bg-opacity-60 italic text-gray-300 rounded-lg p-3 max-w-3xl">
        <div className="flex items-center mb-1">
          <Globe size={14} className="mr-1 text-gray-400" />
          <span className="text-xs font-medium text-gray-400">System</span>
        </div>
        <div className="font-bold mb-2">Intermediate Step</div>
        {action && (
          <div className="mb-2">
            <div className="font-semibold">Action:</div>
            <pre className="whitespace-pre-wrap">{JSON.stringify(action, null, 2)}</pre>
          </div>
        )}
        {observation && (
          <div>
            <div className="font-semibold">Observation:</div>
            <div className="whitespace-pre-wrap">{observation}</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function PremiumChatGPTInterface() {
  const [isMenuOpen, setIsMenuOpen] = useState(true);
  const [activeConversation, setActiveConversation] = useState('new');
  const [conversationTitle, setConversationTitle] = useState('New Conversation');
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Add intermediate steps functionality
  const [showIntermediateSteps, setShowIntermediateSteps] = useState(false);
  const [intermediateStepsLoading, setIntermediateStepsLoading] = useState(false);
  const [sourcesForMessages, setSourcesForMessages] = useState<Record<string, any>>({});
  
  const recentConversations = [
    { id: 'cosmic-1', title: 'Quantum Physics Exploration' },
    { id: 'cosmic-2', title: 'Space Travel Technologies' },
    { id: 'cosmic-3', title: 'Neural Network Design' }
  ];

  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit,
    isLoading: chatEndpointIsLoading,
    setMessages,
  } = useChat({
    api: "api/hello", // Changed to match ChatWindow endpoint
    onResponse(response) {
      if (messageContainerRef.current) {
        messageContainerRef.current.classList.add("grow");
      }
      
      // Add source tracking from headers like in ChatWindow
      const sourcesHeader = response.headers.get("x-sources");
      const sources = sourcesHeader ? JSON.parse(Buffer.from(sourcesHeader, "base64").toString("utf8")) : [];
      const messageIndexHeader = response.headers.get("x-message-index");
      if (sources.length && messageIndexHeader !== null) {
        setSourcesForMessages({
          ...sourcesForMessages,
          [messageIndexHeader]: sources,
        });
      }
    },
    onError: (e) => {
      toast(e.message, {
        theme: "dark",
      });
    },
    streamMode: "text", // Added to match ChatWindow
  });

  // Updated to match ChatWindow's sendMessage functionality
  async function sendMessage(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (messageContainerRef.current) {
      messageContainerRef.current.classList.add("grow");
    }
    if (!messages.length) {
      await new Promise((resolve) => setTimeout(resolve, 300));
    }
    if (chatEndpointIsLoading || intermediateStepsLoading) {
      return;
    }
    
    if (!showIntermediateSteps) {
      handleSubmit(e);
    } else {
      // Handle intermediate steps like in ChatWindow
      setIntermediateStepsLoading(true);
      setInput("");
      const messagesWithUserReply = messages.concat({
        id: messages.length.toString(),
        content: input,
        role: "user",
      });
      setMessages(messagesWithUserReply);
      
      const response = await fetch("api/hello", {
        method: "POST",
        body: JSON.stringify({
          messages: messagesWithUserReply,
          show_intermediate_steps: true,
        }),
      });
      
      const json = await response.json();
      setIntermediateStepsLoading(false);
      
      if (response.status === 200) {
        const responseMessages: Message[] = json.messages;
        // Represent intermediate steps as system messages for display purposes
        const toolCallMessages = responseMessages.filter((responseMessage: Message) => {
          return (
            (responseMessage.role === "assistant" && !!responseMessage.tool_calls?.length) ||
            responseMessage.role === "tool"
          );
        });
        
        const intermediateStepMessages = [];
        for (let i = 0; i < toolCallMessages.length; i += 2) {
          const aiMessage = toolCallMessages[i];
          const toolMessage = toolCallMessages[i + 1];
          intermediateStepMessages.push({
            id: (messagesWithUserReply.length + i / 2).toString(),
            role: "system" as const,
            content: JSON.stringify({
              action: aiMessage.tool_calls?.[0],
              observation: toolMessage.content,
            }),
          });
        }
        
        const newMessages = messagesWithUserReply;
        for (const message of intermediateStepMessages) {
          newMessages.push(message);
          setMessages([...newMessages]);
          await new Promise((resolve) => setTimeout(resolve, 1000 + Math.random() * 1000));
        }
        
        setMessages([
          ...newMessages,
          {
            id: newMessages.length.toString(),
            content: responseMessages[responseMessages.length - 1].content,
            role: "assistant",
          },
        ]);
      } else {
        if (json.error) {
          toast(json.error, {
            theme: "dark",
          });
          throw new Error(json.error);
        }
      }
    }
  }
  
  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };
  
  const selectConversation = (id: string, title: string) => {
    setActiveConversation(id);
    setConversationTitle(title);
    
    // Reset messages for demo
    if (id !== 'new') {
      // Example of setting custom messages for demo
      setMessages([
        { id: '1', content: `Loading conversation: ${title}...`, role: "system" },
        { id: '2', content: "How does quantum entanglement work?", role: "user" },
        { id: '3', content: "Quantum entanglement is a physical phenomenon that occurs when a pair or group of particles are generated, interact, or share spatial proximity in a way such that the quantum state of each particle cannot be described independently of the others, even when the particles are separated by a large distance.", role: "assistant" }
      ]);
    } else {
      setMessages([
        { id: '1', content: "Welcome to NeuroCosmos AI. How can I assist you today?", role: "assistant" },
      ]);
    }
  };
  
  // Random floating particles for background effect
  const particles = Array.from({ length: 15 }, (_, i) => ({
    id: i,
    size: Math.random() * 8 + 2,
    x: Math.random() * 100,
    y: Math.random() * 100,
    animationDuration: Math.random() * 40 + 20
  }));

  return (
    <div className="flex h-screen w-full bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 text-white font-sans overflow-hidden relative">
      {/* Background particles */}
      {particles.map((particle) => (
        <div 
          key={particle.id}
          className="absolute rounded-full bg-purple-300 opacity-20"
          style={{
            width: `${particle.size}px`,
            height: `${particle.size}px`,
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            boxShadow: '0 0 10px rgba(216, 180, 254, 0.8)',
            animation: `float ${particle.animationDuration}s infinite ease-in-out`
          }}
        />
      ))}
      
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-transparent to-black opacity-30" />
      
      {/* Left sidebar */}
      <div 
        className={`${isMenuOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-black bg-opacity-40 backdrop-blur-md border-r border-purple-600 border-opacity-30 flex flex-col h-full`}
      >
        {isMenuOpen && (
          <>
            <div className="p-4 border-b border-purple-600 border-opacity-30">
              <div className="flex items-center">
                <Sparkles className="text-purple-400 mr-2" size={20} />
                <h1 className="text-xl font-bold bg-gradient-to-r from-purple-400 to-pink-300 text-transparent bg-clip-text">
                  NeuroCosmos AI
                </h1>
              </div>
              <button 
                className="mt-4 w-full py-2 px-4 bg-gradient-to-r from-purple-600 to-pink-500 rounded-lg text-white flex items-center justify-center hover:opacity-90 transition-all duration-200"
                onClick={() => selectConversation('new', 'New Conversation')}
              >
                <Plus size={16} className="mr-2" />
                New Chat
              </button>
            </div>
            
            <div className="p-4 border-b border-purple-600 border-opacity-30">
              <div className="flex items-center mb-2">
                <h2 className="text-sm font-medium text-gray-300">Recent Conversations</h2>
                <button className="ml-auto text-purple-400 hover:text-purple-300">
                  <Filter size={14} />
                </button>
              </div>
              
              <div className="space-y-1">
                {recentConversations.map(convo => (
                  <button 
                    key={convo.id}
                    onClick={() => selectConversation(convo.id, convo.title)}
                    className={`w-full text-left p-2 rounded-lg flex items-center text-sm hover:bg-purple-900 hover:bg-opacity-30 transition-colors ${activeConversation === convo.id ? 'bg-purple-800 bg-opacity-30 border-l-2 border-purple-400' : ''}`}
                  >
                    <FileText size={14} className="mr-2 text-gray-400" />
                    <span className="truncate">{convo.title}</span>
                    <Star size={14} className="ml-auto text-gray-500 hover:text-yellow-400" />
                  </button>
                ))}
              </div>
            </div>
            
            <div className="mt-auto p-4 border-t border-purple-600 border-opacity-30">
              <button className="w-full text-left p-2 rounded-lg flex items-center text-sm hover:bg-purple-900 hover:bg-opacity-30 transition-colors">
                <Settings size={16} className="mr-2 text-gray-400" />
                Settings
              </button>
              <button className="w-full text-left p-2 rounded-lg flex items-center text-sm hover:bg-purple-900 hover:bg-opacity-30 transition-colors">
                <User size={16} className="mr-2 text-gray-400" />
                My Account
              </button>
            </div>
          </>
        )}
      </div>
      
      {/* Main chat area */}
      <div className="flex-1 flex flex-col h-full relative">
        {/* Header */}
        <div className="p-4 border-b border-purple-600 border-opacity-30 backdrop-blur-sm bg-black bg-opacity-20 flex items-center">
          <button onClick={toggleMenu} className="mr-4 text-gray-300 hover:text-white">
            <Menu size={20} />
          </button>
          <h2 className="font-medium">{conversationTitle}</h2>
          <div className="ml-auto flex items-center space-x-3">
            <button className="text-gray-300 hover:text-white p-1">
              <Save size={18} />
            </button>
            <button className="text-gray-300 hover:text-white p-1">
              <DownloadCloud size={18} />
            </button>
          </div>
        </div>
        
        {/* Messages */}
        <div 
          ref={messageContainerRef}
          className="flex-1 overflow-y-auto p-4 space-y-4 flex flex-col-reverse transition-[flex-grow] ease-in-out"
        >
          {messages.length > 0
            ? [...messages].reverse().map((m, i) => {
                const sourceKey = (messages.length - 1 - i).toString();
                return m.role === "system" ? (
                  <IntermediateStep key={m.id} message={m} />
                ) : (
                  <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div 
                      className={`max-w-3xl rounded-lg p-3 ${
                        m.role === 'user' 
                          ? 'bg-purple-600 bg-opacity-70' 
                          : 'bg-black bg-opacity-40 border border-purple-600 border-opacity-40'
                      }`}
                    >
                      {m.role !== 'user' && (
                        <div className="flex items-center mb-1">
                          <Bot size={16} className="mr-1 text-purple-400" />
                          <span className="text-xs font-medium text-purple-400">NeuroCosmos AI</span>
                        </div>
                      )}
                      <div>{m.content}</div>
                    </div>
                  </div>
                );
              })
            : <div className="text-center text-gray-400 my-auto">Ready to begin your cosmic journey...</div>}
          
          {(chatEndpointIsLoading || intermediateStepsLoading) && (
            <div className="flex justify-start">
              <div className="bg-black bg-opacity-40 border border-purple-600 border-opacity-40 rounded-lg p-3 max-w-3xl">
                <div className="flex items-center mb-1">
                  <Bot size={16} className="mr-1 text-purple-400" />
                  <span className="text-xs font-medium text-purple-400">NeuroCosmos AI</span>
                </div>
                <div className="flex space-x-2">
                  <span className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                  <span className="h-2 w-2 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Input area */}
        <div className="p-4 backdrop-blur-sm bg-black bg-opacity-30 border-t border-purple-600 border-opacity-30">
          <form onSubmit={sendMessage} className="flex flex-col w-full">
            {/* Show intermediate steps toggle */}
            <div className="flex mb-2">
              <div>
                <input
                  type="checkbox"
                  id="show_intermediate_steps"
                  name="show_intermediate_steps"
                  checked={showIntermediateSteps}
                  onChange={(e) => setShowIntermediateSteps(e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="show_intermediate_steps" className="text-xs text-gray-300">Show intermediate steps</label>
              </div>
            </div>
            
            <div className="relative">
              <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Speak your cosmic truth..."
                className="w-full bg-black bg-opacity-60 border border-purple-500 border-opacity-50 rounded-lg p-3 pl-4 pr-10 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                rows={2}
              />
              <button 
                type="submit"
                className="absolute right-3 bottom-3 text-purple-400 hover:text-purple-300 disabled:text-gray-500"
                disabled={input.trim() === '' || chatEndpointIsLoading || intermediateStepsLoading}
              >
                <Send size={20} />
              </button>
            </div>
          
            <div className="mt-2 flex justify-between items-center text-xs text-gray-400">
              <div>
                <span className="mr-2">Model: NeuroCosmos 5.0</span>
                <span>Context: 12K</span>
              </div>
              <div>
                <span>Powered by Quantum Processing</span>
              </div>
            </div>
          </form>
        </div>
        <ToastContainer />
      </div>
    </div>
  );
}