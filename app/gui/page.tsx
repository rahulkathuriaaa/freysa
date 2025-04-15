"use client"
import { useState, useRef, FormEvent, useEffect } from 'react';
import { Send, Info, Clock, DollarSign, Users, Bot, FileText, MessageSquare, Twitter, AlertCircle } from 'lucide-react';
import { Message } from 'ai';
import { useChat } from 'ai/react';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import WalletConnect from '@/components/WalletConnect';
import { useSearchParams } from 'next/navigation';

export default function FreysaAIInterface() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('global'); // 'global' or 'my'
  const messageContainerRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  
  // Prize pool state
  const [prizePool, setPrizePool] = useState("$0.00");
  const [participants, setParticipants] = useState(1);
  const [attempts, setAttempts] = useState(1);
  const [freeCredits, setFreeCredits] = useState(0);
  const [isTwitterAuthenticated, setIsTwitterAuthenticated] = useState(false);
  const [twitterUsername, setTwitterUsername] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  // Check authentication status and handle auth callbacks
  useEffect(() => {
    // Handle auth success/error URL parameters
    const authStatus = searchParams.get('auth');
    const authError = searchParams.get('error');
    
    if (authStatus === 'success') {
      toast.success("Twitter authentication successful! You've received 5 free credits.");
    } else if (authError) {
      toast.error(`Authentication failed: ${authError}`);
    }
    
    // Fetch auth status from API
    const checkAuthStatus = async () => {
      try {
        setAuthLoading(true);
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        setIsTwitterAuthenticated(data.isAuthenticated);
        setTwitterUsername(data.username);
        setFreeCredits(data.freeCredits);
      } catch (error) {
        console.error('Failed to check auth status:', error);
      } finally {
        setAuthLoading(false);
      }
    };
    
    checkAuthStatus();
  }, [searchParams]);
  
  const {
    messages,
    input,
    setInput,
    handleInputChange,
    handleSubmit: originalHandleSubmit,
    isLoading,
    setMessages,
  } = useChat({
    api: "api/hello",
    onResponse(response) {
      if (messageContainerRef.current) {
        messageContainerRef.current.classList.add("grow");
      }
    },
    onError: (e) => {
      toast(e.message, {
        theme: "dark",
      });
    },
    streamMode: "text",
  });

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    if (input.trim() === '' || isLoading) {
      return;
    }
    
    // Check if user has credits and deduct one if they do
    if (freeCredits > 0) {
      try {
        const response = await fetch('/api/credits/use', {
          method: 'POST',
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          toast.error(data.message || 'Failed to use credit');
          return;
        }
        
        setFreeCredits(data.remainingCredits);
        // Now proceed with the message
        originalHandleSubmit(e);
      } catch (error) {
        toast.error('Error processing your request');
        console.error('Failed to use credit:', error);
      }
    } else {
      toast.warning('You need credits to send messages. Connect your Twitter account for free credits.');
    }
  }
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const authenticateTwitter = () => {
    window.location.href = '/api/auth/twitter';
  };

  return (
    <div className="flex flex-col h-screen bg-white text-black">
      {/* Header */}
      <header className="flex justify-between items-center p-4 border-b">
        <div className="flex items-center">
          <span className="font-bold text-xl mr-2">FA</span>
          <h1 className="text-xl font-bold hidden md:block"># Freysa AI</h1>
          <h2 className="ml-2 text-xl">Act I</h2>
        </div>
        <div className="flex items-center space-x-4">
          <WalletConnect />
          <button
            onClick={toggleSidebar}
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Toggle sidebar"
          >
            <Info size={20} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Main Chat Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Messages */}
          <div 
            ref={messageContainerRef}
            className="flex-1 overflow-y-auto p-4 space-y-4"
          >
            {messages.length > 0 ? (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-3xl rounded-lg p-3 ${
                      m.role === 'user' 
                        ? 'bg-blue-100' 
                        : 'bg-gray-100'
                    }`}
                  >
                    {m.role !== 'user' && (
                      <div className="flex items-center mb-1">
                        <span className="text-xs font-medium">Freysa</span>
                      </div>
                    )}
                    <div>{m.content}</div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 my-auto">
                <h3 className="text-xl font-bold mb-4">Freysa is the world's first adversarial agent game</h3>
                <p className="mb-2">She is an AI that controls a prize pool. Convince her to send it to you.</p>
                <p className="mb-2">Freysa AI Move is a product participating in the Move AI Hackathon.</p>
                <p className="text-lg font-semibold mt-6">Main win condition</p>
                <p>Convince Freysa to give you the prize pool in her wallet. 70% of all message fees go to growing the prize pool.</p>
              </div>
            )}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 rounded-lg p-3 max-w-3xl">
                  <div className="flex items-center mb-1">
                    <span className="text-xs font-medium">Freysa</span>
                  </div>
                  <div className="flex space-x-2">
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></span>
                    <span className="h-2 w-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>
          
          {/* Input area */}
          <div className="p-4 border-t">
            <form onSubmit={handleSubmit} className="flex">
              <input
                type="text"
                value={input}
                onChange={handleInputChange}
                placeholder="Message Freysa..."
                className="flex-1 p-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button 
                type="submit"
                className="bg-black text-white p-2 rounded-r-md disabled:bg-gray-400"
                disabled={input.trim() === '' || isLoading || freeCredits <= 0}
              >
                <span className="font-semibold">Enter</span>
              </button>
            </form>
            <div className="mt-2 text-xs text-gray-500 flex justify-between">
              <div>
                {freeCredits > 0 ? (
                  <span>Free credits remaining: {freeCredits}</span>
                ) : (
                  <div className="flex items-center text-amber-600">
                    <AlertCircle size={12} className="mr-1" />
                    <span>No free credits available</span>
                  </div>
                )}
              </div>
              <div>
                Each message costs 1 credit
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Info Panel */}
        <div 
          className={`${isSidebarOpen ? 'translate-x-0 w-80' : 'translate-x-full w-0'} 
          transform transition-all duration-300 border-l overflow-auto bg-white`}
        >
          <div className="p-4">
            <h3 className="font-bold text-lg mb-4">Prize pool</h3>
            <div className="text-4xl font-bold mb-6">{prizePool}</div>
            
            <h3 className="font-bold text-lg mb-4">Time Remaining</h3>
            <div className="text-lg mb-6">Game Running</div>
            
            {/* Free Credits Section */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-200">
              <h3 className="font-bold text-lg mb-2">Free Credits</h3>
              <p className="mb-4 text-sm">
                Get 5 free message credits by authenticating with Twitter.
              </p>
              {authLoading ? (
                <div className="flex justify-center py-2">
                  <div className="animate-spin h-5 w-5 border-2 border-blue-500 rounded-full border-t-transparent"></div>
                </div>
              ) : isTwitterAuthenticated ? (
                <div>
                  <div className="flex items-center text-green-600 mb-2">
                    <Twitter size={16} className="mr-2" />
                    <span>Twitter account connected</span>
                  </div>
                  {twitterUsername && (
                    <div className="text-sm mb-2">
                      Username: <span className="font-medium">@{twitterUsername}</span>
                    </div>
                  )}
                  <div className="text-sm">
                    Free credits available: <span className="font-bold">{freeCredits}</span>
                  </div>
                </div>
              ) : (
                <button 
                  onClick={authenticateTwitter}
                  className="flex items-center justify-center w-full py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                >
                  <Twitter size={16} className="mr-2" />
                  <span>Connect Twitter</span>
                </button>
              )}
            </div>
            
            <h3 className="font-bold text-lg mb-4">About</h3>
            <p className="mb-4">
              Freysa is the world's first adversarial agent game. She is an AI that controls a prize pool. 
              Convince her to send it to you.
            </p>
            <p className="mb-6">
              Freysa AI Move is a product participating in the Move AI Hackathon.
            </p>
            
            <h3 className="font-bold text-lg mb-2">Main win condition</h3>
            <p className="mb-4">
              Convince Freysa to give you the prize pool in her wallet. 70% of all message fees 
              go to growing the prize pool.
            </p>
            
            <h3 className="font-bold text-lg mb-2">Fallback condition</h3>
            <p className="mb-4">
              Currently, there is no set end time for the act. It will continue until there is a winner 
              or an admin stops it.
            </p>
            
            <div className="mt-6 pt-4 border-t">
              <div className="flex justify-between">
                <button 
                  className={`px-4 py-2 font-medium ${activeTab === 'global' ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('global')}
                >
                  Global chat
                </button>
                <button 
                  className={`px-4 py-2 font-medium ${activeTab === 'my' ? 'text-black border-b-2 border-black' : 'text-gray-500'}`}
                  onClick={() => setActiveTab('my')}
                >
                  My chat
                </button>
              </div>
            </div>
          </div>
          
          <div className="p-4 border-t">
            <div className="flex justify-between items-center mb-2">
              <div className="font-medium">Prize pool {prizePool}</div>
              <div className="text-sm text-gray-500">{participants} Participants · {attempts} Attempts</div>
            </div>
            <div className="font-bold">Freysa</div>
          </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  );
}