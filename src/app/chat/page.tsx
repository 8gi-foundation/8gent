'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Send, Mic, Loader2, ArrowLeft, Trash2, Volume2, VolumeX, Menu } from 'lucide-react';
import { ClawAIAvatar } from '@/components/claw-ai/ClawAIAvatar';
import Link from 'next/link';
import { Streamdown } from 'streamdown';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { useVoiceChat } from '@/hooks/useVoiceChat';
import { useChatThreads } from '@/hooks/useChatThreads';
import { VoiceRecordingIndicator } from '@/components/claw-ai/VoiceRecordingIndicator';
import { ChatThreadsSidebar } from '@/components/claw-ai/ChatThreadsSidebar';
import { ContextReferenceInput } from '@/components/ui/ContextReferenceInput';
import { ArtifactRenderer } from '@/components/claw-ai/ArtifactRenderer';
import { ClawAIUIRenderer, parseUITree } from '@/lib/8gent/json-render-provider';
import { useAppContext, formatAppContextForAI } from '@/context/AppContext';
import { usePauseMusicForVoice } from '@/hooks/usePauseMusicForVoice';
import { ToolProviderSelector, SelectedToolsChips, type SelectedTool } from '@/components/claw-ai/ToolProviderSelector';
import { useDaemon } from '@/hooks/useDaemon';
import '@/lib/themes/themes.css';

// Check at module level — only true when the env var is set
const DAEMON_ENABLED = !!process.env.NEXT_PUBLIC_DAEMON_URL;

// ============================================================================
// Types
// ============================================================================

interface Message {
  id: string;
  role: 'assistant' | 'user';
  content: string;
  timestamp: number;
  uiTree?: unknown; // For render_ui tool results
}

// ============================================================================
// Initial Message
// ============================================================================

const INITIAL_MESSAGE: Message = {
  id: 'initial',
  role: 'assistant',
  content: "Ready to assist. What's on your mind?",
  timestamp: Date.now(),
};

// ============================================================================
// Time-based greeting
// ============================================================================

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 6) return 'Good evening';
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  if (hour < 21) return 'Good evening';
  return 'Good evening';
}

// ============================================================================
// Chat Page Component
// ============================================================================

export default function ChatPage() {
  // App context for contextual prompts
  const { suggestedPrompts, currentApp, contextHints } = useAppContext();

  // Chat threads management
  const {
    threads,
    activeThread,
    activeThreadId,
    isLoaded,
    createThread,
    switchThread,
    deleteThread,
    addMessage,
    clearActiveThread,
    ensureThread,
  } = useChatThreads();

  // Daemon connection (no-ops when NEXT_PUBLIC_DAEMON_URL is not set)
  const daemon = useDaemon();
  const useDaemonChat = DAEMON_ENABLED && daemon.isConnected;

  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedTools, setSelectedTools] = useState<SelectedTool[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [activeTool, setActiveTool] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Voice recorder for voice messages
  const voiceRecorder = useVoiceRecorder({
    maxDuration: 120,
    levelsCount: 20,
  });

  // Voice chat for TTS responses
  const voiceChat = useVoiceChat({
    voice: 'nova',
    autoSpeak: false,
  });

  // Pause music when recording or AI is speaking
  usePauseMusicForVoice({
    isRecording: voiceRecorder.isRecording,
    isSpeaking: voiceChat.mode === 'speaking',
    isTranscribing,
  });

  // Load chat history from active thread
  useEffect(() => {
    if (!isLoaded) return;

    if (activeThread && activeThread.messages.length > 0) {
      setMessages(activeThread.messages.map(msg => ({
        ...msg,
        role: msg.role as 'assistant' | 'user',
      })));
    } else {
      setMessages([INITIAL_MESSAGE]);
    }
  }, [isLoaded, activeThread, activeThreadId]);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  // ---------------------------------------------------------------------------
  // Daemon event subscriptions — stream chunks, tool calls, errors
  // ---------------------------------------------------------------------------
  useEffect(() => {
    if (!DAEMON_ENABLED) return;

    const unsubs: (() => void)[] = [];

    unsubs.push(daemon.on('agent:thinking', () => {
      setIsTyping(true);
      setStreamingContent('');
      setActiveTool(null);
    }));

    unsubs.push(daemon.on('agent:stream', (payload) => {
      if (payload.final) {
        // Final chunk — commit the full message
        const finalText = payload.chunk;
        const assistantMessage = addMessage('assistant', finalText);
        if (assistantMessage) {
          setMessages((prev) => [
            ...prev,
            {
              id: assistantMessage.id,
              role: 'assistant',
              content: finalText,
              timestamp: assistantMessage.timestamp,
            },
          ]);
        }
        setStreamingContent('');
        setIsTyping(false);
        setActiveTool(null);

        if (voiceChat.isVoiceEnabled) {
          voiceChat.speakResponse(finalText);
        }
      } else {
        // Partial chunk — append to streaming buffer
        setStreamingContent((prev) => prev + payload.chunk);
      }
    }));

    unsubs.push(daemon.on('tool:start', (payload) => {
      setActiveTool(payload.tool);
    }));

    unsubs.push(daemon.on('tool:result', () => {
      setActiveTool(null);
    }));

    unsubs.push(daemon.on('agent:error', (payload) => {
      const errContent = `Error: ${payload.error}`;
      const assistantMessage = addMessage('assistant', errContent);
      if (assistantMessage) {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessage.id,
            role: 'assistant',
            content: errContent,
            timestamp: assistantMessage.timestamp,
          },
        ]);
      }
      setStreamingContent('');
      setIsTyping(false);
      setActiveTool(null);
    }));

    return () => unsubs.forEach((u) => u());
  }, [daemon, addMessage, voiceChat]);

  // Send message with specific text
  const handleSendWithText = useCallback(async (text: string) => {
    if (!text.trim()) return;

    const userContent = text.trim();

    // Ensure we have an active thread
    ensureThread();

    // Add user message
    const userMessage = addMessage('user', userContent);
    if (userMessage) {
      setMessages((prev) => [
        ...prev,
        {
          id: userMessage.id,
          role: 'user',
          content: userContent,
          timestamp: userMessage.timestamp,
        },
      ]);
    }

    // ---- Daemon path: send via WebSocket and return (events handle the rest)
    if (useDaemonChat) {
      setIsTyping(true);
      daemon.sendPrompt(userContent);
      return;
    }

    // ---- API route path (existing behavior) ----
    setIsTyping(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: userContent },
          ],
          model: 'default',
          // Pass app context to 8gent
          appContext: currentApp ? {
            appId: currentApp.id,
            appName: currentApp.name,
            route: currentApp.route,
            description: currentApp.description,
            contextHints,
          } : null,
          // Pass selected tools to filter available tools
          selectedTools: selectedTools.length > 0 ? selectedTools.map((t) => ({
            name: t.name,
            provider: t.provider,
          })) : undefined,
        }),
      });

      let assistantContent = "I'm having trouble connecting right now. Please try again in a moment.";
      let uiTree: unknown = null;

      if (response.ok) {
        const data = await response.json();
        assistantContent = data.message || data.content || assistantContent;

        // Extract UI tree from render_ui actions
        if (data.actions && Array.isArray(data.actions)) {
          const renderAction = data.actions.find(
            (a: { type: string }) => a.type === 'render_ui'
          );
          if (renderAction?.payload?.ui_tree) {
            uiTree = renderAction.payload.ui_tree;
          }
        }
      } else {
        // Log error for debugging but show user-friendly message
        try {
          const errorData = await response.json();
          console.error('[Chat] API error:', errorData);
          if (errorData.error?.includes('API key')) {
            assistantContent = "I'm not fully configured yet. James needs to set up the AI connection. In the meantime, feel free to explore the site!";
          }
        } catch {
          console.error('[Chat] Failed to parse error response');
        }
      }

      const assistantMessage = addMessage('assistant', assistantContent);
      if (assistantMessage) {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessage.id,
            role: 'assistant',
            content: assistantContent,
            timestamp: assistantMessage.timestamp,
            uiTree,
          },
        ]);
      }

      // Speak response if voice is enabled
      if (voiceChat.isVoiceEnabled) {
        voiceChat.speakResponse(assistantContent);
      }
    } catch {
      const fallbackContent = "I'm having trouble connecting right now. Please try again in a moment.";
      const assistantMessage = addMessage('assistant', fallbackContent);
      if (assistantMessage) {
        setMessages((prev) => [
          ...prev,
          {
            id: assistantMessage.id,
            role: 'assistant',
            content: fallbackContent,
            timestamp: assistantMessage.timestamp,
          },
        ]);
      }
    }

    setIsTyping(false);
  }, [messages, addMessage, voiceChat, ensureThread, useDaemonChat, daemon]);

  // Handle form submit
  const handleSend = async () => {
    if (!inputValue.trim()) return;
    const text = inputValue;
    setInputValue('');
    await handleSendWithText(text);
  };

  // Handle voice recording complete
  const handleVoiceRecordingComplete = useCallback(async () => {
    const audioBlob = await voiceRecorder.stopRecording();
    if (!audioBlob || audioBlob.size === 0) {
      return;
    }

    setIsTranscribing(true);

    try {
      const formData = new FormData();
      formData.append('audio', audioBlob, 'recording.webm');
      formData.append('language', 'en');

      const response = await fetch('/api/whisper', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const { text } = await response.json();

      if (text && text.trim()) {
        await handleSendWithText(text.trim());
      }
    } catch (error) {
      console.error('[Voice] Transcription error:', error);
    } finally {
      setIsTranscribing(false);
    }
  }, [voiceRecorder, handleSendWithText]);

  // Toggle voice recording
  const handleMicToggle = useCallback(async () => {
    if (voiceRecorder.isRecording) {
      await handleVoiceRecordingComplete();
    } else {
      await voiceRecorder.startRecording();
    }
  }, [voiceRecorder, handleVoiceRecordingComplete]);

  // Handle Enter key
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Clear chat
  const handleClearChat = () => {
    clearActiveThread();
    setMessages([INITIAL_MESSAGE]);
  };

  // Handle new thread
  const handleNewThread = () => {
    createThread();
    setMessages([INITIAL_MESSAGE]);
  };

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(to bottom, hsl(var(--theme-background)), hsl(var(--theme-card) / 0.5), hsl(var(--theme-background)))',
      }}
    >
      {/* Chat Threads Sidebar */}
      <ChatThreadsSidebar
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        threads={threads}
        activeThreadId={activeThreadId}
        onNewThread={handleNewThread}
        onSelectThread={switchThread}
        onDeleteThread={deleteThread}
      />

      {/* Header */}
      <header
        className="sticky top-0 z-10 backdrop-blur-xl"
        style={{
          borderBottom: '1px solid hsl(var(--theme-border))',
          background: 'hsl(var(--theme-background) / 0.8)',
          paddingTop: 'env(safe-area-inset-top, 0px)',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Menu button for sidebar */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 rounded-full transition-colors"
              aria-label="Open conversations"
              style={{ color: 'hsl(var(--theme-muted-foreground))' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--theme-muted) / 0.5)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              href="/"
              className="p-2 rounded-full transition-colors"
              aria-label="Back to home"
              style={{ color: 'hsl(var(--theme-muted-foreground))' }}
              onMouseEnter={(e) => e.currentTarget.style.background = 'hsl(var(--theme-muted) / 0.5)'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <div className="flex items-center gap-3">
              <ClawAIAvatar
                size={40}
                isActive={isTyping || voiceChat.mode === 'speaking'}
              />
              <div>
                <h1
                  className="font-semibold"
                  style={{ color: 'hsl(var(--theme-foreground))' }}
                >
                  8gent
                </h1>
                <p
                  className="text-xs flex items-center gap-1.5"
                  style={{ color: 'hsl(var(--theme-muted-foreground))' }}
                >
                  {voiceRecorder.isRecording ? 'Recording...' :
                    isTranscribing ? 'Transcribing...' :
                      voiceChat.mode === 'speaking' ? 'Speaking...' :
                        activeTool ? `Running ${activeTool}...` :
                          isTyping ? 'Thinking...' :
                            'Online'}
                  {DAEMON_ENABLED && (
                    <span
                      className="inline-block w-1.5 h-1.5 rounded-full flex-shrink-0"
                      title={`Daemon: ${daemon.status}`}
                      style={{
                        background: daemon.isConnected
                          ? 'hsl(142 71% 45%)'   // green
                          : daemon.status === 'connecting'
                            ? 'hsl(45 93% 47%)'   // amber
                            : 'hsl(0 84% 60%)',    // red
                      }}
                    />
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Voice toggle */}
            <button
              onClick={voiceChat.toggleVoice}
              className="p-2 rounded-full transition-colors"
              title={voiceChat.isVoiceEnabled ? 'Voice responses on' : 'Voice responses off'}
              style={{
                background: voiceChat.isVoiceEnabled ? 'hsl(var(--theme-primary) / 0.2)' : 'transparent',
                color: voiceChat.isVoiceEnabled ? 'hsl(var(--theme-primary))' : 'hsl(var(--theme-muted-foreground))',
              }}
            >
              {voiceChat.isVoiceEnabled ? (
                <Volume2 className="w-5 h-5" />
              ) : (
                <VolumeX className="w-5 h-5" />
              )}
            </button>

            {/* Clear chat */}
            {messages.length > 1 && (
              <button
                onClick={handleClearChat}
                className="p-2 rounded-full transition-colors"
                title="Clear chat"
                style={{ color: 'hsl(var(--theme-muted-foreground))' }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'hsl(var(--theme-muted) / 0.5)';
                  e.currentTarget.style.color = 'hsl(var(--theme-foreground))';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'transparent';
                  e.currentTarget.style.color = 'hsl(var(--theme-muted-foreground))';
                }}
              >
                <Trash2 className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Chat Area */}
      <main className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 py-6">
          {/* Welcome message on empty state */}
          {messages.length <= 1 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12"
            >
              <div className="mx-auto mb-6">
                <ClawAIAvatar size={64} isActive={false} />
              </div>
              <h2
                className="text-2xl font-semibold mb-2"
                style={{ color: 'hsl(var(--theme-foreground))' }}
              >
                {getGreeting()}!
              </h2>
              <p
                className="max-w-md mx-auto"
                style={{ color: 'hsl(var(--theme-muted-foreground))' }}
              >
                Welcome back. How can I help you today?
              </p>

              {/* Suggested Prompts */}
              {suggestedPrompts.length > 0 && (
                <div className="mt-8 flex flex-wrap justify-center gap-2">
                  {suggestedPrompts.map((prompt, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.2 + idx * 0.1 }}
                      onClick={() => {
                        setInputValue(prompt.prompt);
                        inputRef.current?.focus();
                      }}
                      className="px-4 py-2 rounded-full text-sm transition-all hover:scale-105"
                      style={{
                        background: 'hsl(var(--theme-muted))',
                        color: 'hsl(var(--theme-foreground))',
                        border: '1px solid hsl(var(--theme-border))',
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'hsl(var(--theme-primary) / 0.1)';
                        e.currentTarget.style.borderColor = 'hsl(var(--theme-primary) / 0.3)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = 'hsl(var(--theme-muted))';
                        e.currentTarget.style.borderColor = 'hsl(var(--theme-border))';
                      }}
                    >
                      {prompt.label}
                    </motion.button>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* Messages */}
          <div className="space-y-6">
            {messages.map((message, index) => (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] md:max-w-[75%] ${message.role === 'user' ? '' : 'flex gap-3'
                    }`}
                >
                  {message.role === 'assistant' && (
                    <ClawAIAvatar size={32} isActive={false} className="mt-1" />
                  )}
                  <div
                    className="px-4 py-3"
                    style={{
                      background: message.role === 'user'
                        ? 'var(--theme-chat-user-bg, linear-gradient(135deg, hsl(var(--theme-primary)), hsl(var(--theme-accent))))'
                        : 'var(--theme-chat-assistant-bg, hsl(var(--theme-card)))',
                      color: message.role === 'user'
                        ? 'var(--theme-chat-user-fg, hsl(var(--theme-primary-foreground)))'
                        : 'var(--theme-chat-assistant-fg, hsl(var(--theme-card-foreground)))',
                      boxShadow: message.role === 'user'
                        ? '0 4px 12px hsl(var(--theme-primary) / 0.2)'
                        : undefined,
                      borderRadius: message.role === 'user'
                        ? 'var(--theme-chat-bubble-radius, 1.25rem) var(--theme-chat-bubble-radius, 1.25rem) var(--theme-chat-bubble-radius-tail, 0.25rem) var(--theme-chat-bubble-radius, 1.25rem)'
                        : 'var(--theme-chat-bubble-radius-tail, 0.25rem) var(--theme-chat-bubble-radius, 1.25rem) var(--theme-chat-bubble-radius, 1.25rem) var(--theme-chat-bubble-radius, 1.25rem)',
                    }}
                  >
                    {message.role === 'assistant' ? (
                      <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-3 [&_*]:!text-inherit">
                        <div>
                          <Streamdown>{message.content}</Streamdown>
                        </div>
                        {/* Render artifacts (code blocks, references) */}
                        <ArtifactRenderer content={message.content} />
                        {/* Render UI tree from render_ui tool */}
                        {message.uiTree ? (
                          <div className="mt-4 not-prose">
                            <ClawAIUIRenderer tree={parseUITree(message.uiTree)} />
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}

            {/* Daemon streaming message */}
            {streamingContent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="max-w-[85%] md:max-w-[75%] flex gap-3">
                  <ClawAIAvatar size={32} isActive={true} className="mt-1" />
                  <div
                    className="px-4 py-3"
                    style={{
                      background: 'var(--theme-chat-assistant-bg, hsl(var(--theme-card)))',
                      color: 'var(--theme-chat-assistant-fg, hsl(var(--theme-card-foreground)))',
                      borderRadius: 'var(--theme-chat-bubble-radius-tail, 0.25rem) var(--theme-chat-bubble-radius, 1.25rem) var(--theme-chat-bubble-radius, 1.25rem) var(--theme-chat-bubble-radius, 1.25rem)',
                    }}
                  >
                    <div className="prose prose-sm max-w-none prose-p:my-2 prose-headings:my-3 [&_*]:!text-inherit">
                      <Streamdown>{streamingContent}</Streamdown>
                    </div>
                    {activeTool && (
                      <div
                        className="mt-2 flex items-center gap-2 text-xs"
                        style={{ color: 'hsl(var(--theme-muted-foreground))' }}
                      >
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>Using {activeTool}...</span>
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Typing indicator */}
            {isTyping && !streamingContent && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="flex gap-3">
                  <ClawAIAvatar size={32} isActive={true} />
                  <div
                    className="px-4 py-3"
                    style={{
                      background: 'hsl(var(--theme-chat-assistant-bg, var(--theme-card)))',
                      borderRadius: 'var(--theme-chat-bubble-radius-tail, 0.25rem) var(--theme-chat-bubble-radius, 1.25rem) var(--theme-chat-bubble-radius, 1.25rem) var(--theme-chat-bubble-radius, 1.25rem)',
                    }}
                  >
                    <div className="flex gap-1.5">
                      <motion.span
                        className="w-2 h-2 rounded-full"
                        style={{ background: 'hsl(var(--theme-chat-typing-dot, var(--theme-muted-foreground)))' }}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
                      />
                      <motion.span
                        className="w-2 h-2 rounded-full"
                        style={{ background: 'hsl(var(--theme-chat-typing-dot, var(--theme-muted-foreground)))' }}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.15 }}
                      />
                      <motion.span
                        className="w-2 h-2 rounded-full"
                        style={{ background: 'hsl(var(--theme-chat-typing-dot, var(--theme-muted-foreground)))' }}
                        animate={{ y: [0, -4, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, delay: 0.3 }}
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>

      {/* Input Area */}
      <footer
        className="sticky bottom-0 backdrop-blur-xl"
        style={{
          borderTop: '1px solid hsl(var(--theme-border))',
          background: 'hsl(var(--theme-background) / 0.9)',
          paddingBottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))',
        }}
      >
        <div className="max-w-4xl mx-auto px-4 py-4">
          {/* Selected Tools Chips */}
          <SelectedToolsChips
            tools={selectedTools}
            onRemove={(tool) => setSelectedTools(selectedTools.filter((t) => !(t.name === tool.name && t.provider === tool.provider)))}
          />

          {/* Transcribing indicator */}
          <AnimatePresence>
            {isTranscribing && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mb-3"
              >
                <div
                  className="rounded-xl px-4 py-3"
                  style={{
                    background: 'hsl(var(--theme-card))',
                    border: '1px solid hsl(var(--theme-border))',
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Loader2
                      className="w-4 h-4 animate-spin"
                      style={{ color: 'hsl(var(--theme-primary))' }}
                    />
                    <span
                      className="text-sm"
                      style={{ color: 'hsl(var(--theme-muted-foreground))' }}
                    >
                      Transcribing your message...
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="flex items-center gap-3">
            {/* Tool Provider Selector */}
            <ToolProviderSelector
              selectedTools={selectedTools}
              onToolsChange={setSelectedTools}
            />

            {/* Microphone button */}
            {voiceRecorder.isSupported && (
              <motion.button
                onClick={handleMicToggle}
                disabled={isTranscribing || isTyping}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="p-3 rounded-full transition-all flex-shrink-0"
                style={{
                  background: voiceRecorder.isRecording
                    ? 'hsl(0 84% 60%)'
                    : isTranscribing
                      ? 'hsl(var(--theme-primary) / 0.2)'
                      : 'hsl(var(--theme-chat-input-bg, var(--theme-muted)))',
                  color: voiceRecorder.isRecording
                    ? 'white'
                    : isTranscribing
                      ? 'hsl(var(--theme-primary))'
                      : 'hsl(var(--theme-chat-input-fg, var(--theme-muted-foreground)))',
                }}
                aria-label={voiceRecorder.isRecording ? 'Stop recording' : 'Start voice message'}
              >
                {isTranscribing ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <Mic className="w-5 h-5" />
                )}
              </motion.button>
            )}

            {/* Recording indicator or input field */}
            <AnimatePresence mode="wait">
              {voiceRecorder.isRecording ? (
                <motion.div
                  key="recording"
                  className="flex-1 flex items-center rounded-full px-4 py-3"
                  style={{ background: 'hsl(var(--theme-card))' }}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <VoiceRecordingIndicator
                    isRecording={voiceRecorder.isRecording}
                    duration={voiceRecorder.duration}
                    audioLevels={voiceRecorder.audioLevels}
                    className="flex-1"
                  />
                </motion.div>
              ) : (
                <motion.div
                  key="input"
                  className="flex-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <ContextReferenceInput
                    value={inputValue}
                    onChange={setInputValue}
                    onKeyDown={handleKeyPress}
                    placeholder="Message 8gent... Use @ to reference data"
                    disabled={isTranscribing}
                    className="w-full rounded-full px-4 py-3 text-base transition-all focus:outline-none focus:ring-2"
                    style={{
                      background: 'hsl(var(--theme-chat-input-bg, var(--theme-muted)))',
                      color: 'hsl(var(--theme-chat-input-fg, var(--theme-foreground)))',
                      border: '1px solid hsl(var(--theme-chat-input-border, var(--theme-border)) / 0.5)',
                      // @ts-expect-error CSS custom property for focus ring
                      '--tw-ring-color': 'hsl(var(--theme-primary) / 0.5)',
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Send button */}
            <AnimatePresence>
              {!voiceRecorder.isRecording && (
                <motion.button
                  onClick={handleSend}
                  disabled={!inputValue.trim() || isTranscribing}
                  whileHover={inputValue.trim() && !isTranscribing ? { scale: 1.05 } : {}}
                  whileTap={inputValue.trim() && !isTranscribing ? { scale: 0.95 } : {}}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="p-3 rounded-full transition-all flex-shrink-0"
                  style={{
                    background: inputValue.trim() && !isTranscribing
                      ? 'hsl(var(--theme-chat-send-bg, var(--theme-primary)))'
                      : 'hsl(var(--theme-chat-send-disabled-bg, var(--theme-muted)))',
                    color: inputValue.trim() && !isTranscribing
                      ? 'hsl(var(--theme-chat-send-fg, var(--theme-primary-foreground)))'
                      : 'hsl(var(--theme-chat-send-disabled-fg, var(--theme-muted-foreground)))',
                    boxShadow: inputValue.trim() && !isTranscribing
                      ? '0 4px 15px hsl(var(--theme-primary) / 0.3)'
                      : undefined,
                  }}
                  aria-label="Send message"
                >
                  {isTyping ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <Send className="w-5 h-5" />
                  )}
                </motion.button>
              )}
            </AnimatePresence>
          </div>

          {/* Voice error */}
          <AnimatePresence>
            {voiceRecorder.error && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-2 text-xs text-center"
                style={{ color: 'hsl(0 84% 60%)' }}
              >
                {voiceRecorder.error.message}
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </footer>
    </div>
  );
}
