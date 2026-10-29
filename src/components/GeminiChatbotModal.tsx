/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Bot,
  User,
  Send,
  Sparkles,
  Camera,
  Mic,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Building,
  GraduationCap,
  Compass,
  X,
  Trash2,
  CheckCircle2,
  RefreshCw,
  Cpu,
  Layers
} from 'lucide-react';
import { ChatMessage, ChatRole, ChatModel, GroundingMapSource } from '../types.js';
import { LiveCameraCapture, LiveCameraCaptureResult } from './LiveCameraCapture.js';
import { AudioRecorderButton } from './AudioRecorderButton.js';

interface GeminiChatbotModalProps {
  onClose: () => void;
  initialChallengeContext?: {
    id: string;
    title: string;
    description: string;
    district: string;
    domain?: string;
  };
}

export const GeminiChatbotModal: React.FC<GeminiChatbotModalProps> = ({
  onClose,
  initialChallengeContext
}) => {
  // Chat configuration
  const [selectedRole, setSelectedRole] = useState<ChatRole>(
    initialChallengeContext ? 'GOVT_LIAISON' : 'GOVT_LIAISON'
  );
  const [selectedModel, setSelectedModel] = useState<ChatModel>('gemini-3.5-flash');
  const [useMapsGrounding, setUseMapsGrounding] = useState<boolean>(false);

  // Live Camera inside Chat state (Strictly Camera only, no local file input)
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [attachedCameraImage, setAttachedCameraImage] = useState<LiveCameraCaptureResult | null>(null);

  // Messages History
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    if (initialChallengeContext) {
      return [
        {
          id: 'welcome-context',
          role: 'model',
          text: `Namaste! I am the **SETU Government & Technical Problem Liaison**. I see you are inquiring about Challenge **${initialChallengeContext.id}**: *"${initialChallengeContext.title}"* located in **${initialChallengeContext.district}** (Domain: ${initialChallengeContext.domain || 'Community Infrastructure'}).\n\nHow can I assist you? You can ask about government department routing, university R&D feasibility at BIT Mesra or NIT Jamshedpur, or click the **Live Camera** button to inspect real-time physical evidence.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: 'gemini-3.5-flash'
        }
      ];
    }
    return [
      {
        id: 'welcome-default',
        role: 'model',
        text: `Namaste! Welcome to **SETU AI Assistant** — bridging Jharkhand's societal challenges with 31 State Government Departments and Higher Education Institution (HEI) research labs.\n\nI can help you with:\n- **Government Scheme & Department Validation** (Jal Jeevan Mission, PMGSY, JREDA solar)\n- **University Engineering R&D Solutions** (IIT ISM Dhanbad, BIT Mesra, NIT Jamshedpur)\n- **Google Maps Geo-Spatial Grounding** (locate district collectorates, water testing labs)\n- **Live Camera Evidence Verification** (direct real-time hardware capture)\n\nWhat would you like to explore?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        modelUsed: 'gemini-3.5-flash'
      }
    ];
  });

  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  // Suggested Prompt Chips
  const suggestedChips = [
    'How does Department of Drinking Water & Sanitation validate village hand-pump drying?',
    'What engineering sensor prototype could BIT Mesra students build for rural culvert floods?',
    'Find nearby government offices & water testing labs in Khunti district via Google Maps',
    'Which budget scheme under Government of Jharkhand supports solar microgrids for schools?'
  ];

  const handleSendMessage = async (textToSend?: string) => {
    const messageContent = (textToSend || inputMessage).trim();
    if (!messageContent && !attachedCameraImage) return;

    const userMessageId = 'msg-' + Date.now();
    const userTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    const newUserMsg: ChatMessage = {
      id: userMessageId,
      role: 'user',
      text: messageContent || 'Attached live camera evidence frame for AI inspection.',
      timestamp: userTimestamp,
      liveImage: attachedCameraImage?.dataUrl
    };

    // Update state immediately with user message
    const updatedMessages = [...messages, newUserMsg];
    setMessages(updatedMessages);
    setInputMessage('');
    const currentAttachment = attachedCameraImage;
    setAttachedCameraImage(null); // clear attachment after sending
    setIsLoading(true);

    try {
      // Format payload for server
      const payloadMessages = updatedMessages.map((m) => ({
        role: m.role,
        text: m.text,
        liveImage: m.liveImage
      }));

      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: payloadMessages,
          role: selectedRole,
          model: selectedModel,
          useMapsGrounding: useMapsGrounding || selectedRole === 'GEO_EXPLORER',
          userLocation: currentAttachment?.lat && currentAttachment?.lng
            ? { lat: currentAttachment.lat, lng: currentAttachment.lng }
            : { lat: 23.3441, lng: 85.3096 }
        })
      });

      const data = await res.json();
      const botMessageId = 'bot-' + Date.now();
      const botTimestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      if (data.success && data.text) {
        setMessages((prev) => [
          ...prev,
          {
            id: botMessageId,
            role: 'model',
            text: data.text,
            timestamp: botTimestamp,
            modelUsed: data.modelUsed || selectedModel,
            mapsSources: data.mapsSources
          }
        ]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: botMessageId,
            role: 'model',
            text: data.error || 'Unable to generate response. Please verify network connection.',
            timestamp: botTimestamp,
            modelUsed: selectedModel
          }
        ]);
      }
    } catch (err: any) {
      console.error('Chat query error:', err);
      setMessages((prev) => [
        ...prev,
        {
          id: 'bot-err-' + Date.now(),
          role: 'model',
          text: 'Encountered an issue communicating with the AI service. Please try again.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedModel
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = () => {
    if (confirm('Clear this chat conversation history?')) {
      setMessages([
        {
          id: 'cleared-welcome',
          role: 'model',
          text: 'Conversation cleared. How can I assist you today with Jharkhand societal challenges or university R&D?',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: selectedModel
        }
      ]);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4">
      <div className="bg-white w-full max-w-4xl h-[90vh] max-h-[850px] rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header with Title, Role Selector, Model Switcher */}
        <div className="bg-stone-900 text-white p-3.5 sm:p-4 border-b border-stone-800 flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center text-white shadow-md">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-stone-100">
                    SETU AI Collaboration Assistant
                  </h3>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-300 border border-emerald-800">
                    Multi-Turn &bull; Maps Grounding
                  </span>
                </div>
                <p className="text-xs text-stone-400 hidden sm:block">
                  Jharkhand Department Validation &bull; Academic Feasibility (IIT/BIT/NIT) &bull; Live Camera Vision
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleClearHistory}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                title="Clear chat history"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-lg text-stone-400 hover:text-stone-200 hover:bg-stone-800 transition-colors"
                title="Close chat"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Controls Bar: Role Selector, Model Switcher, Maps Grounding Toggle */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs pt-1 border-t border-stone-800">
            {/* Role Selection */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-400 text-[11px] whitespace-nowrap">Role:</span>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as ChatRole)}
                className="w-full bg-stone-800 text-stone-200 border border-stone-700 rounded-lg px-2 py-1 text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                <option value="GOVT_LIAISON">🏛️ Govt Liaison &amp; Schemes</option>
                <option value="RESEARCH_ADVISOR">🔬 University Academic R&amp;D</option>
                <option value="GEO_EXPLORER">📍 Ground &amp; Geo Explorer</option>
                <option value="CITIZEN_GUIDE">📋 Citizen Problem Reporter</option>
              </select>
            </div>

            {/* Model Selection */}
            <div className="flex items-center gap-1.5">
              <span className="text-stone-400 text-[11px] whitespace-nowrap">Model:</span>
              <select
                value={selectedModel}
                onChange={(e) => setSelectedModel(e.target.value as ChatModel)}
                className="w-full bg-stone-800 text-stone-200 border border-stone-700 rounded-lg px-2 py-1 text-xs focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              >
                <option value="gemini-3.5-flash">gemini-3.5-flash (General + Maps)</option>
                <option value="gemini-3.1-flash-lite">gemini-3.1-flash-lite (Fast)</option>
                <option value="gemini-3.1-pro-preview">gemini-3.1-pro-preview (Complex)</option>
              </select>
            </div>

            {/* Maps Grounding Toggle */}
            <div className="flex items-center justify-between sm:justify-end gap-2">
              <label
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border cursor-pointer transition-colors ${
                  useMapsGrounding || selectedRole === 'GEO_EXPLORER'
                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700 font-semibold'
                    : 'bg-stone-800 text-stone-400 border-stone-700 hover:text-stone-200'
                }`}
              >
                <input
                  type="checkbox"
                  checked={useMapsGrounding || selectedRole === 'GEO_EXPLORER'}
                  onChange={(e) => setUseMapsGrounding(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-0"
                />
                <MapPin className="w-3.5 h-3.5 text-emerald-400" />
                <span>Google Maps Grounding</span>
              </label>
            </div>
          </div>
        </div>

        {/* Live Camera Modal (if activated within chat) */}
        {isCameraActive && (
          <div className="fixed inset-0 z-60 bg-black/80 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
              <LiveCameraCapture
                districtHint={initialChallengeContext?.district || 'Jharkhand'}
                onCapture={(result) => {
                  setAttachedCameraImage(result);
                  setIsCameraActive(false);
                }}
                onCancel={() => setIsCameraActive(false)}
              />
            </div>
          </div>
        )}

        {/* Scrollable Message Thread */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-stone-50 text-xs">
          {messages.map((msg) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : 'flex-row'}`}
              >
                {/* Avatar */}
                <div
                  className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 shadow-2xs ${
                    isUser
                      ? 'bg-emerald-600 text-white'
                      : 'bg-stone-900 text-emerald-400 border border-stone-800'
                  }`}
                >
                  {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                </div>

                {/* Message Bubble */}
                <div
                  className={`max-w-[85%] sm:max-w-[75%] rounded-2xl px-4 py-3 shadow-2xs space-y-2 ${
                    isUser
                      ? 'bg-emerald-600 text-white rounded-tr-none'
                      : 'bg-white text-stone-800 border border-stone-200 rounded-tl-none'
                  }`}
                >
                  {/* Attached Live Camera Frame */}
                  {msg.liveImage && (
                    <div className="rounded-xl overflow-hidden border border-emerald-400/40 relative max-w-sm mb-2">
                      <img
                        src={msg.liveImage}
                        alt="Live Camera Snapshot"
                        className="w-full h-auto object-cover max-h-48"
                      />
                      <div className="absolute bottom-1 left-1 px-2 py-0.5 rounded bg-black/75 text-[10px] text-emerald-300 font-semibold flex items-center gap-1">
                        <Camera className="w-3 h-3" />
                        <span>Live Camera Evidence</span>
                      </div>
                    </div>
                  )}

                  {/* Text Content */}
                  <div className="leading-relaxed whitespace-pre-wrap font-sans text-xs">
                    {msg.text}
                  </div>

                  {/* Google Maps Grounding Sources Display */}
                  {msg.mapsSources && msg.mapsSources.length > 0 && (
                    <div className="mt-3 pt-2 border-t border-stone-200 space-y-1.5">
                      <div className="flex items-center gap-1 text-[11px] font-bold text-emerald-700">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Google Maps Grounded Locations:</span>
                      </div>
                      <div className="grid grid-cols-1 gap-1.5">
                        {msg.mapsSources.map((source, sIdx) => (
                          <a
                            key={sIdx}
                            href={source.uri}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-start justify-between gap-2 p-2 rounded-lg bg-stone-100 hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-stone-800 transition-colors group"
                          >
                            <div className="space-y-0.5">
                              <div className="font-semibold text-emerald-900 group-hover:text-emerald-700 flex items-center gap-1">
                                <span>{source.title}</span>
                              </div>
                              {source.reviewSnippets && source.reviewSnippets.length > 0 && (
                                <div className="text-[10px] text-stone-600 line-clamp-1 italic">
                                  "{source.reviewSnippets[0]}"
                                </div>
                              )}
                            </div>
                            <ExternalLink className="w-3.5 h-3.5 text-stone-400 group-hover:text-emerald-600 shrink-0 mt-0.5" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Message Meta Info */}
                  <div
                    className={`flex items-center justify-between text-[10px] pt-1 ${
                      isUser ? 'text-emerald-100' : 'text-stone-400'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {msg.modelUsed && <span>{msg.modelUsed}</span>}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Loading Indicator */}
          {isLoading && (
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 rounded-lg bg-stone-900 text-emerald-400 flex items-center justify-center shrink-0 border border-stone-800">
                <Bot className="w-4 h-4 animate-pulse" />
              </div>
              <div className="bg-white border border-stone-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-2xs text-stone-600 flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin text-emerald-600" />
                <span>SETU AI reasoning with {selectedModel}...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggested Chips (if conversation is fresh) */}
        {messages.length <= 2 && (
          <div className="px-4 py-2 bg-stone-100 border-t border-stone-200 flex items-center gap-2 overflow-x-auto text-[11px]">
            <span className="text-stone-500 font-semibold shrink-0">Suggestions:</span>
            {suggestedChips.map((chip, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSendMessage(chip)}
                className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white hover:bg-emerald-50 text-stone-700 hover:text-emerald-900 border border-stone-200 hover:border-emerald-300 transition-colors shrink-0 shadow-2xs"
              >
                {chip}
              </button>
            ))}
          </div>
        )}

        {/* Attached Camera Image Preview Banner */}
        {attachedCameraImage && (
          <div className="px-4 py-2 bg-emerald-50 border-t border-emerald-200 flex items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-2">
              <img
                src={attachedCameraImage.dataUrl}
                alt="Live Camera Thumbnail"
                className="w-10 h-10 rounded-lg object-cover border border-emerald-300 shadow-2xs"
              />
              <div>
                <div className="font-bold text-emerald-950 flex items-center gap-1">
                  <Camera className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Live Camera Frame Attached</span>
                </div>
                <div className="text-[11px] text-emerald-800">
                  {attachedCameraImage.analysis?.observations
                    ? attachedCameraImage.analysis.observations.slice(0, 70) + '...'
                    : 'Direct camera feed capture ready for AI review'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setAttachedCameraImage(null)}
              className="text-stone-400 hover:text-rose-600 p-1"
              title="Remove attachment"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Input Bar with Live Camera Button & Audio Microphone Transcription */}
        <div className="p-3 sm:p-4 bg-white border-t border-stone-200 space-y-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="flex items-center gap-2"
          >
            {/* Live Camera Button (Strictly Camera, No file selection!) */}
            <button
              type="button"
              onClick={() => setIsCameraActive(true)}
              className="p-2.5 rounded-xl bg-stone-100 hover:bg-emerald-50 text-stone-700 hover:text-emerald-800 border border-stone-200 hover:border-emerald-300 transition-colors shadow-2xs flex items-center gap-1.5 shrink-0"
              title="Capture Live Camera photo (Local file selection disabled)"
            >
              <Camera className="w-4 h-4 text-emerald-600" />
              <span className="hidden md:inline text-xs font-semibold">Live Camera</span>
            </button>

            {/* Audio Transcription Button via gemini-3.5-transcribe */}
            <AudioRecorderButton
              onTranscribe={(transcribed) => {
                setInputMessage((prev) => (prev ? `${prev} ${transcribed}` : transcribed));
              }}
              promptHint="Transcribe user question for SETU chatbot verbatim in Hindi or English."
              buttonLabel="Voice"
            />

            {/* Main Text Input */}
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about Jharkhand departments, university R&D feasibility, or ground locations..."
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-stone-200 text-xs focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-stone-50"
            />

            {/* Send Button */}
            <button
              type="submit"
              disabled={isLoading || (!inputMessage.trim() && !attachedCameraImage)}
              className="p-2.5 sm:px-4 sm:py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 text-white font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>

          {/* Compliance & Mode Notice */}
          <div className="flex items-center justify-between text-[11px] text-stone-400 px-1">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Live Camera Only &bull; Local file uploads prohibited for field veracity</span>
            </span>
            <span className="font-mono text-[10px]">
              Active: {selectedModel} | {selectedRole}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
