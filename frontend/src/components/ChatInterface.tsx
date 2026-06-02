import React, { useState } from 'react';
import { Send, Loader2, MessageSquare } from 'lucide-react';
import { askQuestion } from '../services/api';
import './ChatInterface.css';

interface ChatInterfaceProps {
  selectedImage: File | null;
}

const ChatInterface: React.FC<ChatInterfaceProps> = ({ selectedImage }) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedImage || !question.trim()) return;

    setIsLoading(true);
    setError(null);
    setAnswer(null);

    try {
      const response = await askQuestion(selectedImage, question);
      setAnswer(response);
    } catch (err: any) {
      setError(err.message || 'An error occurred while communicating with the model.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="glass-panel animate-fade-in" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <MessageSquare size={24} color="var(--accent)" />
        Question Answering
      </h2>

      <div className="chat-history">
        {error && (
          <div className="error-message animate-fade-in">
            {error}
          </div>
        )}

        {answer && (
          <div className="answer-box animate-fade-in">
            <h4>Answer:</h4>
            <p>{answer}</p>
          </div>
        )}

        {!answer && !isLoading && !error && (
          <div className="empty-state">
            <p style={{ color: 'var(--text-muted)' }}>
              {selectedImage 
                ? "Image loaded! Ask a question about it below." 
                : "Please select an image first to start asking questions."}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="loading-state animate-pulse">
            <Loader2 size={32} className="spinner" />
            <p>Analyzing image and generating answer...</p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="chat-input-form">
        <input
          type="text"
          className="input-field"
          placeholder="e.g. What does the text in this image say?"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          disabled={isLoading || !selectedImage}
        />
        <button 
          type="submit" 
          className="btn-primary" 
          disabled={isLoading || !selectedImage || !question.trim()}
        >
          <Send size={18} />
          Ask
        </button>
      </form>
    </div>
  );
};

export default ChatInterface;
