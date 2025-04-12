'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { codeReferences } from '@/lib/codeReferences';

// Define types for our chat messages
interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// Use the shared CodeReference type from the imported module

export default function CodeHelperPage() {
  // State for search query
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState('');
  const [searchAuthority, setSearchAuthority] = useState('');

  // State for search results
  const [searchResults, setSearchResults] = useState<CodeReference[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // State for chat
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      role: 'assistant',
      content: 'Welcome to the Civil Code Helper! Ask me any question about Sri Lankan civil engineering codes and regulations.',
      timestamp: new Date()
    }
  ]);
  const [currentMessage, setCurrentMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Ref for chat container to auto-scroll
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Use the imported code references data


  // Function to handle search
  const handleSearch = async () => {
    setIsSearching(true);

    try {
      // Build query parameters
      const params = new URLSearchParams();
      if (searchQuery) params.append('query', searchQuery);
      if (searchCategory) params.append('category', searchCategory);
      if (searchAuthority) params.append('authority', searchAuthority);

      // Call the API
      const response = await fetch(`/api/code-search?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`Search failed: ${response.status}`);
      }

      const data = await response.json();
      setSearchResults(data.results);
    } catch (error) {
      console.error('Error searching codes:', error);
      // You could set an error state here to display to the user
    } finally {
      setIsSearching(false);
    }
  };

  // Function to handle chat message submission
  const handleSendMessage = async () => {
    if (!currentMessage.trim() || isProcessing) return;

    // Store the message to send
    const messageToSend = currentMessage;

    // Add user message to chat
    const userMessage: ChatMessage = {
      role: 'user',
      content: messageToSend,
      timestamp: new Date()
    };

    setChatMessages(prev => [...prev, userMessage]);
    setCurrentMessage('');
    setIsProcessing(true);

    try {
      // Call the API
      const response = await fetch('/api/code-assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: messageToSend }),
      });

      if (!response.ok) {
        throw new Error(`API call failed: ${response.status}`);
      }

      const data = await response.json();

      // Add AI response to chat
      const assistantMessage: ChatMessage = {
        role: 'assistant',
        content: data.response,
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);

      // Add error message to chat
      const errorMessage: ChatMessage = {
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your request. Please try again later.',
        timestamp: new Date()
      };

      setChatMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsProcessing(false);
    }
  };



  // Auto-scroll chat to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [chatMessages]);

  // Handle Enter key press in chat input
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Civil Code Helper</h1>
      <div className="bg-white rounded-lg shadow-md p-6">
        <p className="text-lg mb-4">
          Access Sri Lanka-specific civil engineering codes and regulations from ICTAD, NBRO, and UDA.
          Get answers to your design and code queries in English.
        </p>

        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-3">Code Search</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="code-category" className="block text-sm font-medium text-gray-700">Category</label>
              <select
                id="code-category"
                value={searchCategory}
                onChange={(e) => setSearchCategory(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                <option value="building">Building Codes</option>
                <option value="structural">Structural Design</option>
                <option value="geotechnical">Geotechnical Engineering</option>
                <option value="highway">Highway Design</option>
                <option value="water">Water Supply & Drainage</option>
                <option value="electrical">Electrical Engineering</option>
                <option value="urban">Urban Planning</option>
              </select>
            </div>

            <div>
              <label htmlFor="authority" className="block text-sm font-medium text-gray-700">Authority</label>
              <select
                id="authority"
                value={searchAuthority}
                onChange={(e) => setSearchAuthority(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="">All Authorities</option>
                <option value="ICTAD (CIDA)">ICTAD (CIDA)</option>
                <option value="NBRO">NBRO</option>
                <option value="UDA">UDA</option>
                <option value="RDA">RDA</option>
                <option value="SLS">SLS</option>
              </select>
            </div>

            <div>
              <label htmlFor="search-query" className="block text-sm font-medium text-gray-700">Search Query</label>
              <input
                type="text"
                id="search-query"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="e.g., minimum safe distance from slope"
              />
            </div>

            <button
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
              onClick={handleSearch}
              disabled={isSearching}
            >
              {isSearching ? 'Searching...' : 'Search Codes'}
            </button>
          </div>
        </div>

        {/* Search Results */}
        {searchResults.length > 0 && (
          <div className="mb-6 border-t pt-6">
            <h2 className="text-xl font-semibold mb-3">Search Results</h2>
            <div className="space-y-4">
              {searchResults.map((code) => (
                <div key={code.id} className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-medium text-blue-600 text-lg">{code.title}</h3>
                  <p className="text-sm text-gray-500 mb-1">Authority: {code.authority}</p>
                  <p className="text-sm text-gray-500 mb-2">Category: {code.category.charAt(0).toUpperCase() + code.category.slice(1)}</p>
                  <p className="text-gray-700 mb-2">{code.description}</p>
                  {code.url && (
                    <a
                      href={code.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center"
                    >
                      View Official Documentation
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 ml-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                      </svg>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 border-t pt-6">
          <h2 className="text-xl font-semibold mb-3">AI Code Assistant</h2>
          <div
            ref={chatContainerRef}
            className="bg-gray-50 p-4 rounded-lg mb-4 h-64 overflow-y-auto"
          >
            <div className="space-y-4">
              {chatMessages.map((message, index) => (
                <div key={index} className={`flex items-start ${message.role === 'assistant' ? '' : 'justify-end'}`}>
                  <div
                    className={`rounded-lg p-3 max-w-[80%] ${
                      message.role === 'assistant'
                        ? 'bg-blue-100 text-gray-800'
                        : 'bg-blue-600 text-white'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-line">{message.content}</p>
                    <p className="text-xs mt-1 opacity-70">
                      {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              ))}
              {isProcessing && (
                <div className="flex items-start">
                  <div className="bg-blue-100 rounded-lg p-3">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="flex">
            <textarea
              className="flex-grow rounded-l-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 resize-none"
              placeholder="Ask a question about civil engineering codes..."
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              rows={2}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-r-md"
              onClick={handleSendMessage}
              disabled={isProcessing || !currentMessage.trim()}
            >
              Send
            </button>
          </div>

          <div className="mt-2 text-xs text-gray-500">
            <p>Examples: "What is the minimum safe distance from a slope?", "What are the load factors for concrete design?", "UDA setback requirements for residential buildings"</p>
          </div>
        </div>

        <div className="border-t pt-6">
          <h2 className="text-xl font-semibold mb-3">Popular Code References</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">ICTAD Guidelines</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>• SCA/3/1: Standard Specifications for Building Works</li>
                <li>• SCA/4/I: Standard Specifications for Water Supply</li>
                <li>• SCA/4/II: Standard Specifications for Sewerage</li>
                <li>• SCA/8: Standard Specifications for Electrical Works</li>
              </ul>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">NBRO Guidelines</h3>
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                <li>• Landslide Risk Assessment</li>
                <li>• Guidelines for Construction in Hilly Areas</li>
                <li>• Soil Testing Requirements</li>
                <li>• Slope Stability Analysis</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="border-t pt-6 mt-6">
          <h2 className="text-xl font-semibold mb-3">Related CiviWise Tools</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Link href="/site-analyzer" className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <h3 className="font-medium text-blue-600">Site Feasibility Analyzer</h3>
              <p className="text-sm text-gray-600 mt-1">Analyze site conditions to ensure compliance with building codes</p>
            </Link>
            <Link href="/design-assistant" className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <h3 className="font-medium text-blue-600">Civil Design Assistant</h3>
              <p className="text-sm text-gray-600 mt-1">Get design recommendations that comply with local regulations</p>
            </Link>
            <Link href="/climate-explorer" className="bg-gray-50 p-4 rounded-lg hover:bg-gray-100 transition-colors">
              <h3 className="font-medium text-blue-600">Climate Explorer</h3>
              <p className="text-sm text-gray-600 mt-1">Explore climate data to plan according to environmental regulations</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
