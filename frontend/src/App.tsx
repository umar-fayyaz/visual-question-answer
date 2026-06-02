import { useState } from 'react';
import ImageUpload from './components/ImageUpload';
import ChatInterface from './components/ChatInterface';
import { Eye } from 'lucide-react';

function App() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);

  return (
    <>
      <header style={{ textAlign: 'center', marginBottom: '3rem' }} className="animate-fade-in">
        <h1 style={{ display: 'inline-flex', alignItems: 'center', gap: '0.75rem', fontSize: '2.5rem', background: 'linear-gradient(to right, #fff, #94a3b8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          <Eye size={40} color="var(--accent)" style={{ WebkitTextFillColor: 'initial' }} />
          Vision Q/A
        </h1>
        <p style={{ color: 'var(--text-muted)', marginTop: '0.5rem', fontSize: '1.1rem' }}>
          Upload an image and ask questions using our fine-tuned Qwen3-VL model.
        </p>
      </header>

      <main className="grid-layout">
        <ImageUpload 
          selectedImage={selectedImage} 
          onImageSelect={setSelectedImage} 
        />
        <ChatInterface 
          selectedImage={selectedImage} 
        />
      </main>
    </>
  );
}

export default App;
