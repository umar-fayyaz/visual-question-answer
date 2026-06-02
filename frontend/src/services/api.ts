export const askQuestion = async (image: File, question: string): Promise<string> => {
  const formData = new FormData();
  formData.append('image', image);
  formData.append('question', question);

  const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';
  
  try {
    const response = await fetch(`${baseUrl}/api/v1/vqa/`, {
      method: 'POST',
      headers: {
        'ngrok-skip-browser-warning': 'true'
      },
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.detail || 'Failed to fetch response');
    }

    const data = await response.json();
    return data.answer;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
};
