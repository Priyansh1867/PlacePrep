import React, { useEffect, useRef, useState } from 'react';
import { Bot, ChevronDown, MessageCircle, Send, Sparkles, Square, User } from 'lucide-react';
import { getAuthToken } from '../services/api';
import { streamAiChat } from '../services/aiChatService';

const starterPrompts = [
  'Show my upcoming placement drives',
  'Check my placement eligibility',
  'Show my attendance summary'
];
const CHAT_WIDTH_KEY = 'placeprep_ai_chat_width';
const DEFAULT_CHAT_WIDTH = 390;
const MIN_CHAT_WIDTH = 320;

function formatReadableText(text) {
  return text
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2');
}

function renderInlineMarkdown(text) {
  const tokens = text.split(/(`[^`]*`|\*\*[^*]+\*\*|__[^_]+__|\*[^*]+\*|_[^_]+_|https?:\/\/\S+)/g);
  return tokens.map((token, index) => {
    if (!token) return null;
    if (token.startsWith('`') && token.endsWith('`')) {
      return <code key={index} className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[0.9em] text-indigo-700">{token.slice(1, -1)}</code>;
    }
    if ((token.startsWith('**') && token.endsWith('**')) || (token.startsWith('__') && token.endsWith('__'))) {
      return <strong key={index}>{formatReadableText(token.slice(2, -2))}</strong>;
    }
    if ((token.startsWith('*') && token.endsWith('*')) || (token.startsWith('_') && token.endsWith('_'))) {
      return <em key={index}>{formatReadableText(token.slice(1, -1))}</em>;
    }
    if (/^https?:\/\/\S+$/.test(token)) {
      return <a key={index} href={token} target="_blank" rel="noreferrer" className="break-all text-indigo-600 underline">{token}</a>;
    }
    return <React.Fragment key={index}>{formatReadableText(token)}</React.Fragment>;
  });
}

function MarkdownContent({ content }) {
  const lines = content.replace(/\r\n/g, '\n').split('\n');
  const blocks = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    if (!line.trim()) {
      index += 1;
      continue;
    }

    if (line.trim().startsWith('```')) {
      const language = line.trim().slice(3).trim();
      const codeLines = [];
      index += 1;
      while (index < lines.length && !lines[index].trim().startsWith('```')) {
        codeLines.push(lines[index]);
        index += 1;
      }
      if (index < lines.length) index += 1;
      blocks.push(
        <pre key={`code-${index}`} className="my-2 max-w-full overflow-x-auto rounded-lg bg-slate-900 p-2.5 text-[10px] leading-relaxed text-slate-100">
          {language && <span className="mb-1 block text-[9px] uppercase text-slate-400">{language}</span>}
          <code>{codeLines.join('\n')}</code>
        </pre>
      );
      continue;
    }

    const heading = line.match(/^(#{1,3})\s+(.+)$/);
    if (heading) {
      blocks.push(
        <p key={`heading-${index}`} className="mb-1.5 font-bold text-slate-900">
          {renderInlineMarkdown(heading[2])}
        </p>
      );
      index += 1;
      continue;
    }

    const tableSeparator = index + 1 < lines.length
      && /^\s*\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?\s*$/.test(lines[index + 1]);
    if (line.includes('|') && tableSeparator) {
      const parseRow = (row) => row.trim().replace(/^\|/, '').replace(/\|$/, '').split('|').map((cell) => cell.trim());
      const headers = parseRow(line);
      const rows = [];
      index += 2;
      while (index < lines.length && lines[index].includes('|') && lines[index].trim()) {
        rows.push(parseRow(lines[index]));
        index += 1;
      }
      blocks.push(
        <div key={`table-${index}`} className="my-2 max-w-full overflow-x-auto rounded-lg border border-slate-200">
          <table className="w-full min-w-max border-collapse text-left text-[10px]">
            <thead className="bg-slate-100 text-slate-700">
              <tr>{headers.map((cell, cellIndex) => <th key={cellIndex} className="border-b border-slate-200 px-2 py-1.5 font-bold">{renderInlineMarkdown(cell)}</th>)}</tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex} className="even:bg-slate-50">
                  {headers.map((_, cellIndex) => <td key={cellIndex} className="border-b border-slate-100 px-2 py-1.5 align-top">{renderInlineMarkdown(row[cellIndex] || '')}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      continue;
    }

    if (line.trim().startsWith('>')) {
      const quoteLines = [];
      while (index < lines.length && lines[index].trim().startsWith('>')) {
        quoteLines.push(lines[index].trim().replace(/^>\s?/, ''));
        index += 1;
      }
      blocks.push(
        <blockquote key={`quote-${index}`} className="my-2 border-l-2 border-indigo-300 pl-2 text-slate-600">
          {quoteLines.map((quote, quoteIndex) => <p key={quoteIndex}>{renderInlineMarkdown(quote)}</p>)}
        </blockquote>
      );
      continue;
    }

    const listMatch = line.match(/^\s*([-*+])\s+(.+)$/) || line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (listMatch) {
      const ordered = /^\s*\d+[.)]/.test(line);
      const items = [];
      while (index < lines.length) {
        const match = ordered
          ? lines[index].match(/^\s*\d+[.)]\s+(.+)$/)
          : lines[index].match(/^\s*[-*+]\s+(.+)$/);
        if (!match) break;
        items.push(<li key={`${index}-${match[1]}`}>{renderInlineMarkdown(match[1])}</li>);
        index += 1;
      }
      const List = ordered ? 'ol' : 'ul';
      blocks.push(<List key={`list-${index}`} className={`my-1.5 space-y-0.5 pl-5 ${ordered ? 'list-decimal' : 'list-disc'}`}>{items}</List>);
      continue;
    }

    const paragraph = [line.trim()];
    index += 1;
    while (index < lines.length && lines[index].trim()
      && !/^```/.test(lines[index].trim())
      && !/^(#{1,3})\s+/.test(lines[index])
      && !/^\s*([-*+])\s+/.test(lines[index])
      && !/^\s*\d+[.)]\s+/.test(lines[index])) {
      paragraph.push(lines[index].trim());
      index += 1;
    }
    blocks.push(<p key={`paragraph-${index}`} className="mb-2 last:mb-0">{renderInlineMarkdown(paragraph.join(' '))}</p>);
  }

  return <div className="min-w-0 break-words">{blocks}</div>;
}

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(Boolean(getAuthToken()));
  const [chatWidth, setChatWidth] = useState(() => {
    try {
      const savedWidth = Number(localStorage.getItem(CHAT_WIDTH_KEY));
      return Number.isFinite(savedWidth) && savedWidth >= MIN_CHAT_WIDTH
        ? Math.min(savedWidth, 640)
        : DEFAULT_CHAT_WIDTH;
    } catch {
      return DEFAULT_CHAT_WIDTH;
    }
  });
  const abortRef = useRef(null);
  const endRef = useRef(null);
  const inputRef = useRef(null);
  const resizeRef = useRef(null);

  useEffect(() => {
    const refreshAuth = () => setIsAuthenticated(Boolean(getAuthToken()));
    window.addEventListener('storage', refreshAuth);
    window.addEventListener('auth-state-changed', refreshAuth);
    return () => {
      window.removeEventListener('storage', refreshAuth);
      window.removeEventListener('auth-state-changed', refreshAuth);
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  useEffect(() => () => abortRef.current?.abort(), []);

  const getMaxChatWidth = () => (
    typeof window === 'undefined'
      ? 640
      : Math.max(MIN_CHAT_WIDTH, Math.min(640, window.innerWidth - 32))
  );

  const resizeChat = (event) => {
    if (!resizeRef.current) return;
    const nextWidth = resizeRef.current.startWidth - (event.clientX - resizeRef.current.startX);
    const boundedWidth = Math.min(getMaxChatWidth(), Math.max(MIN_CHAT_WIDTH, nextWidth));
    setChatWidth(boundedWidth);
  };

  const stopResizing = () => {
    resizeRef.current = null;
    document.body.style.removeProperty('cursor');
    document.body.style.removeProperty('user-select');
    window.removeEventListener('pointermove', resizeChat);
    window.removeEventListener('pointerup', stopResizing);
  };

  const startResizing = (event) => {
    event.preventDefault();
    resizeRef.current = { startX: event.clientX, startWidth: chatWidth };
    document.body.style.cursor = 'ew-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('pointermove', resizeChat);
    window.addEventListener('pointerup', stopResizing);
  };

  useEffect(() => {
    try {
      localStorage.setItem(CHAT_WIDTH_KEY, String(chatWidth));
    } catch {
      // Width persistence is optional.
    }
  }, [chatWidth]);

  useEffect(() => () => stopResizing(), []);

  const submit = async (event) => {
    event?.preventDefault();
    const text = message.trim();
    if (!text || isStreaming) return;
    if (!isAuthenticated) {
      setError('Please sign in to use PlacePrep AI.');
      return;
    }

    setMessage('');
    setError('');
    const assistantId = `${Date.now()}-assistant`;
    setMessages((current) => [
      ...current,
      { id: `${Date.now()}-user`, role: 'user', content: text },
      { id: assistantId, role: 'assistant', content: '' }
    ]);
    setIsStreaming(true);
    const controller = new AbortController();
    abortRef.current = controller;

    try {
      await streamAiChat(text, {
        signal: controller.signal,
       onText: (chunk) => {
  console.log("AI CHUNK:", JSON.stringify(chunk));

  setMessages((current) =>
    current.map((item) =>
      item.id === assistantId
        ? { ...item, content: item.content + chunk }
        : item
    )
  );
},
        onError: (streamError) => setError(streamError)
      });
    } catch (requestError) {
      if (requestError.name !== 'AbortError') {
        setError(requestError.message || 'Unable to contact PlacePrep AI.');
        setMessages((current) => current.filter((item) => item.id !== assistantId));
      }
    } finally {
      abortRef.current = null;
      setIsStreaming(false);
    }
  };

  return (
    <div className="fixed bottom-5 right-5 z-[70] sm:bottom-7 sm:right-7">
      {isOpen && (
        <section
          aria-label="PlacePrep AI chat"
          style={{ width: `${chatWidth}px`, maxWidth: 'calc(100vw - 2rem)' }}
          className="relative mb-3 flex h-[min(620px,calc(100vh-7rem))] max-w-[640px] flex-col overflow-hidden rounded-3xl border border-white/70 bg-white/95 shadow-2xl shadow-indigo-950/20 backdrop-blur-xl"
        >
          <button
            type="button"
            aria-label="Resize chat width"
            title="Drag to resize chat"
            onPointerDown={startResizing}
            className="absolute left-0 top-1/2 z-10 hidden h-16 w-2 -translate-x-1/2 -translate-y-1/2 cursor-ew-resize rounded-full bg-indigo-300/70 transition hover:bg-indigo-500 sm:block"
          />
          <header className="bg-brand-gradient px-5 py-4 text-white">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15">
                  <Sparkles className="h-5 w-5 text-indigo-200" />
                </div>
                <div>
                  <h2 className="text-sm font-bold">PlacePrep AI</h2>
                  <p className="mt-0.5 flex items-center gap-1.5 text-[11px] text-indigo-100">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-300" />
                    Your placement assistant
                  </p>
                </div>
              </div>
              <button
                type="button"
                aria-label="Close PlacePrep AI"
                onClick={() => setIsOpen(false)}
                className="rounded-xl p-2 text-indigo-100 hover:bg-white/10 hover:text-white"
              >
                <ChevronDown className="h-5 w-5" />
              </button>
            </div>
          </header>

          <div className="flex-1 space-y-3 overflow-y-auto bg-[#F8F8F9] p-4" aria-live="polite">
            {messages.length === 0 && (
              <div className="flex h-full flex-col items-center justify-center text-center">
                <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
                  <Bot className="h-7 w-7" />
                </div>
                <h3 className="text-sm font-bold text-[#111439]">How can I help?</h3>
                <p className="mt-1 max-w-[260px] text-xs leading-relaxed text-slate-500">
                  {isAuthenticated
                    ? 'Ask about your PlacePrep drives, applications, eligibility, attendance, and preparation.'
                    : 'Sign in to ask about your personal PlacePrep data and workflows.'}
                </p>
                {isAuthenticated && (
                  <div className="mt-5 flex w-full flex-col gap-2">
                    {starterPrompts.map((prompt) => (
                      <button
                        type="button"
                        key={prompt}
                        onClick={() => setMessage(prompt)}
                        className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-left text-xs font-medium text-slate-600 hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {messages.map((item) => (
              <div key={item.id} className={`flex gap-2 ${item.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {item.role === 'assistant' && (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-indigo-100 text-indigo-600">
                    <Bot className="h-4 w-4" />
                  </div>
                )}
                <div className={`max-w-[82%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  item.role === 'user'
                    ? 'rounded-br-md bg-indigo-600 text-white'
                    : 'rounded-bl-md border border-slate-200 bg-white text-slate-700 shadow-sm'
                }`}>
                  {item.content
                    ? (item.role === 'assistant' ? <MarkdownContent content={item.content} /> : <span className="whitespace-pre-wrap">{item.content}</span>)
                    : (isStreaming && <span className="inline-flex gap-1"><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" /><i className="h-1.5 w-1.5 animate-bounce rounded-full bg-indigo-400" /></span>)}
                </div>
                {item.role === 'user' && (
                  <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-xl bg-slate-200 text-slate-600">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ))}
            <div ref={endRef} />
          </div>

          {error && <div className="border-t border-red-100 bg-red-50 px-4 py-2 text-[11px] text-red-600">{error}</div>}

          <form onSubmit={submit} className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-end gap-2 rounded-2xl border border-slate-200 bg-slate-50 p-1.5 focus-within:border-indigo-400">
              <textarea
                ref={inputRef}
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter' && !event.shiftKey) {
                    event.preventDefault();
                    submit(event);
                  }
                }}
                rows={1}
                maxLength={2000}
                disabled={!isAuthenticated}
                placeholder="Ask PlacePrep AI..."
                aria-label="Message PlacePrep AI"
                className="max-h-24 min-h-9 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-xs text-slate-700 outline-none placeholder:text-slate-400"
              />
              <button
                type={isStreaming ? 'button' : 'submit'}
                onClick={isStreaming ? () => abortRef.current?.abort() : undefined}
                disabled={!isAuthenticated || (!isStreaming && !message.trim())}
                aria-label={isStreaming ? 'Stop response' : 'Send message'}
                className="mb-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-indigo-600 text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {isStreaming ? <Square className="h-3.5 w-3.5 fill-current" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <p className="mt-1.5 text-center text-[10px] text-slate-400">PlacePrep data and workflows only</p>
          </form>
        </section>
      )}

      <button
        type="button"
        aria-label={isOpen ? 'Close PlacePrep AI' : 'Open PlacePrep AI'}
        onClick={() => setIsOpen((open) => !open)}
        className="group ml-auto flex items-center gap-2 rounded-full bg-accent-gradient px-4 py-3 text-sm font-bold text-white shadow-lg shadow-indigo-600/30 transition hover:-translate-y-0.5 focus:outline-none focus:ring-4 focus:ring-indigo-200"
      >
        <MessageCircle className="h-5 w-5" />
        <span className="hidden sm:inline">Ask PlacePrep AI</span>
      </button>
    </div>
  );
}
