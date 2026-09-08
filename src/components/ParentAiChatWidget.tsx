import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, X, Send, Bot, User, HelpCircle, Clock, AlertTriangle } from 'lucide-react';
import parentAiChatService, {
  type ChatMessage,
  type QuickPromptItem,
  type StudentAiContext,
} from '../services/parent-ai-chat.service';

interface ParentAiChatWidgetProps {
  activeStudent?: any;
}

export const ParentAiChatWidget: React.FC<ParentAiChatWidgetProps> = ({ activeStudent }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputQuestion, setInputQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [quickPrompts, setQuickPrompts] = useState<QuickPromptItem[]>([]);
  const [studentContext, setStudentContext] = useState<StudentAiContext | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const studentName = activeStudent?.firstName
    ? `${activeStudent.lastName || ''} ${activeStudent.firstName}`.trim()
    : studentContext?.studentName || 'Học sinh';

  useEffect(() => {
    parentAiChatService.getQuickPrompts().then(setQuickPrompts).catch(() => {});
    parentAiChatService.getStudentContext(activeStudent?.id).then((ctx) => {
      if (ctx) setStudentContext(ctx);
    }).catch(() => {});
  }, [activeStudent?.id]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([
        {
          id: 'welcome-msg',
          sender: 'ai',
          text: `Dạ chào phụ huynh! Em là **Trợ lý Sư phạm AI của Educare** đồng hành cùng em **${studentName}**.\n\nEm nắm đầy đủ hồ sơ điểm danh, bài tập, mức độ tiếp thu và nhận xét giáo viên các buổi học gần nhất. Phụ huynh có thể bấm câu hỏi gợi ý bên dưới hoặc nhắn tin trực tiếp để em hỗ trợ nhé!`,
          createdAt: new Date(),
          suggestions: [
            'Con tôi đang yếu phần nào?',
            'Tôi nên cho con học thêm bao nhiêu?',
            'Con có nguy cơ không đạt mục tiêu không?',
          ],
        },
      ]);
    }
  }, [isOpen, studentName]);

  useEffect(() => {
    if (isOpen) messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading, isOpen]);

  const handleSend = async (questionToSend?: string) => {
    const text = (questionToSend || inputQuestion).trim();
    if (!text || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`, sender: 'user', text, createdAt: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuestion('');
    setLoading(true);

    try {
      const history = messages
        .filter((m) => m.id !== 'welcome-msg')
        .slice(-4)
        .map((m) => ({
          role: (m.sender === 'user' ? 'user' : 'model') as 'user' | 'model',
          text: m.text,
        }));

      const res = await parentAiChatService.sendMessage(text, activeStudent?.id, history);
      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`, sender: 'ai', text: res.answer, createdAt: new Date(),
        suggestions: res.followUpSuggestions, groundedSummary: res.groundedDataSummary,
      };
      setMessages((prev) => [...prev, aiMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `err-${Date.now()}`, sender: 'ai', createdAt: new Date(),
          text: 'Xin lỗi phụ huynh, hệ thống kết nối AI tạm thời gián đoạn. Phụ huynh vui lòng thử lại sau ít giây ạ!',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderPromptIcon = (icon: string) => {
    if (icon === 'help-circle') return <HelpCircle size={13} style={{ color: '#a855f7' }} />;
    if (icon === 'clock') return <Clock size={13} style={{ color: '#3b82f6' }} />;
    if (icon === 'alert-triangle') return <AlertTriangle size={13} style={{ color: '#f59e0b' }} />;
    return <Sparkles size={13} style={{ color: '#10b981' }} />;
  };

  return (
    <>
      {!isOpen && (
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          style={{
            position: 'fixed', bottom: '24px', right: '24px', zIndex: 9999,
            display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 18px',
            borderRadius: '999px', background: 'linear-gradient(135deg, #7c3aed, #2563eb)',
            color: '#fff', border: '1px solid rgba(255,255,255,0.25)',
            boxShadow: '0 8px 24px rgba(124,58,237,0.45)', cursor: 'pointer', outline: 'none',
          }}
        >
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Bot size={20} />
            <span style={{
              position: 'absolute', top: '-3px', right: '-3px', width: '8px', height: '8px',
              borderRadius: '50%', backgroundColor: '#10b981', boxShadow: '0 0 8px #10b981',
            }} />
          </div>
          <span style={{ fontWeight: 600, fontSize: '0.88rem' }}>Hỏi Trợ Lý AI</span>
        </button>
      )}

      {isOpen && (
        <div
          style={{
            position: 'fixed', bottom: '24px', right: '24px', width: '410px',
            maxWidth: 'calc(100vw - 32px)', height: '620px', maxHeight: 'calc(100vh - 48px)',
            zIndex: 10000, borderRadius: '20px', background: 'var(--card-bg, #0f172a)',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            boxShadow: '0 20px 50px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.2)',
            display: 'flex', flexDirection: 'column', overflow: 'hidden', backdropFilter: 'blur(20px)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '14px 16px', borderBottom: '1px solid rgba(255,255,255,0.08)',
              background: 'linear-gradient(135deg, rgba(124,58,237,0.25), rgba(37,99,235,0.15))',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '38px', height: '38px', borderRadius: '12px',
                background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
              }}>
                <Bot size={20} />
              </div>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <span style={{ fontWeight: 700, fontSize: '0.92rem', color: '#f8fafc' }}>
                    Trợ Lý AI Phụ Huynh
                  </span>
                  <span style={{ fontSize: '0.65rem', padding: '1px 6px', borderRadius: '4px', background: 'rgba(16,185,129,0.2)', color: '#10b981', fontWeight: 600 }}>
                    Online
                  </span>
                </div>
                <div style={{ fontSize: '0.74rem', color: '#94a3b8', marginTop: '2px' }}>
                  Học sinh: <strong style={{ color: '#fff' }}>{studentName}</strong>
                  {studentContext?.currentSqiScore && (
                    <span style={{ marginLeft: '8px', color: '#a855f7', fontWeight: 600 }}>
                      (SQI: {studentContext.currentSqiScore}/100)
                    </span>
                  )}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '6px' }}
            >
              <X size={20} />
            </button>
          </div>

          {/* Messages Area */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {messages.map((m) => (
              <div key={m.id} style={{ display: 'flex', flexDirection: 'column', alignItems: m.sender === 'user' ? 'flex-end' : 'flex-start' }}>
                <div style={{
                  display: 'flex', alignItems: 'flex-start', gap: '8px', maxWidth: '90%',
                  flexDirection: m.sender === 'user' ? 'row-reverse' : 'row',
                }}>
                  <div style={{
                    width: '26px', height: '26px', borderRadius: '50%', flexShrink: 0, marginTop: '2px',
                    background: m.sender === 'user' ? '#6366f1' : 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                  }}>
                    {m.sender === 'user' ? <User size={14} /> : <Bot size={14} />}
                  </div>

                  <div style={{
                    padding: '10px 14px', fontSize: '0.84rem', lineHeight: '1.5', whiteSpace: 'pre-wrap',
                    borderRadius: m.sender === 'user' ? '14px 14px 2px 14px' : '14px 14px 14px 2px',
                    background: m.sender === 'user' ? 'linear-gradient(135deg, #6366f1, #7c3aed)' : 'rgba(255,255,255,0.05)',
                    border: m.sender === 'user' ? 'none' : '1px solid rgba(255,255,255,0.08)',
                    color: '#f8fafc',
                  }}>
                    {m.text}
                  </div>
                </div>

                {m.sender === 'ai' && m.suggestions && m.suggestions.length > 0 && (
                  <div style={{ marginTop: '8px', paddingLeft: '34px', display: 'flex', flexDirection: 'column', gap: '5px' }}>
                    <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600 }}>
                      Gợi ý câu hỏi tiếp theo:
                    </div>
                    {m.suggestions.map((s, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSend(s)}
                        disabled={loading}
                        style={{
                          background: 'rgba(139, 92, 246, 0.12)', border: '1px solid rgba(139, 92, 246, 0.3)',
                          borderRadius: '8px', padding: '4px 10px', color: '#c4b5fd', fontSize: '0.75rem',
                          textAlign: 'left', cursor: loading ? 'not-allowed' : 'pointer',
                        }}
                      >
                        💬 {s}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {loading && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '26px', height: '26px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #8b5cf6, #3b82f6)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff',
                }}>
                  <Bot size={14} />
                </div>
                <div style={{
                  padding: '8px 14px', borderRadius: '12px', background: 'rgba(255,255,255,0.05)',
                  border: '1px solid rgba(255,255,255,0.08)', fontSize: '0.78rem', color: '#94a3b8',
                }}>
                  AI đang phân tích dữ liệu thực tế...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Prompts Carousel */}
          {quickPrompts.length > 0 && (
            <div style={{
              padding: '8px 12px', borderTop: '1px solid rgba(255,255,255,0.06)',
              background: 'rgba(255,255,255,0.01)', display: 'flex', gap: '6px',
              overflowX: 'auto', whiteSpace: 'nowrap',
            }}>
              {quickPrompts.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSend(p.question)}
                  disabled={loading}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '4px 10px',
                    borderRadius: '99px', background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.1)', color: '#e2e8f0', fontSize: '0.74rem',
                    cursor: loading ? 'not-allowed' : 'pointer', flexShrink: 0,
                  }}
                >
                  {renderPromptIcon(p.icon)}
                  <span>{p.title}</span>
                </button>
              ))}
            </div>
          )}

          {/* Input Box */}
          <div style={{
            padding: '12px 14px', borderTop: '1px solid rgba(255,255,255,0.08)',
            background: 'rgba(0,0,0,0.2)', display: 'flex', gap: '8px', alignItems: 'center',
          }}>
            <input
              type="text"
              placeholder={`Hỏi về tình hình học của ${studentName}...`}
              value={inputQuestion}
              disabled={loading}
              onChange={(e) => setInputQuestion(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleSend();
                }
              }}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '10px',
                background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)',
                color: '#f8fafc', fontSize: '0.84rem', outline: 'none',
              }}
            />
            <button
              type="button"
              disabled={loading || !inputQuestion.trim()}
              onClick={() => handleSend()}
              style={{
                width: '38px', height: '38px', borderRadius: '10px',
                background: inputQuestion.trim()
                  ? 'linear-gradient(135deg, #7c3aed, #2563eb)'
                  : 'rgba(255,255,255,0.08)',
                border: 'none', color: '#fff', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                cursor: inputQuestion.trim() && !loading ? 'pointer' : 'not-allowed',
              }}
            >
              <Send size={16} />
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ParentAiChatWidget;
