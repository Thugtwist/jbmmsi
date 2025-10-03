import React, { useState } from 'react';

const Chatbot = () => {
  const [isChatActive, setIsChatActive] = useState(false);
  const [messages, setMessages] = useState([
    {
      text: "Hi there! I'm JBMMSI Assistant. How can I help you today?",
      sender: 'bot'
    },
    {
      text: "Here are some things I can help with:\n• Admission requirements\n• Program information\n• Application deadlines\n• Campus facilities",
      sender: 'bot'
    }
  ]);
  const [inputValue, setInputValue] = useState('');

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    if (lowerMessage.includes('admission') || lowerMessage.includes('requirement')) {
      return "Admission requirements include: Completed application form, Transcript of records or Form 137, and interview. Specific requirements may vary by program.";
    } else if (lowerMessage.includes('program') || lowerMessage.includes('course')) {
      return "We offer programs in Preschool: (Nursery, Kinder Garten), Elementary Level, One on One tutorial Services(Online & Face to Face), and also Summer Class. Each program has specialized tracks for advanced study.";
    } else if (lowerMessage.includes('fee') || lowerMessage.includes('tuition') || lowerMessage.includes('cost')) {
      return "Tuition fees may vary by program. On average, programs cost ₱5,000 per grading. We offer scholarships and financial aid to qualified students.";
    } else if (lowerMessage.includes('deadline') || lowerMessage.includes('apply')) {
      return "The application deadline for the next academic year is June 15. Late applications may be accepted based on availability.";
    } else if (lowerMessage.includes('contact') || lowerMessage.includes('email') || lowerMessage.includes('phone')) {
      return "You can reach us at: Phone: +63993 617 8050, Email: jemmonte926@gmail.com, or visit our School at Phase 6 Blk 3 Lot 4 Eastwood Residences San Isidro , Rodriguez, Philippines, 1860.";
    } else if (lowerMessage.includes('facility') || lowerMessage.includes('campus')) {
      return "Our campus features air conditioned classrooms, modern classrooms, science labs, computer labs, a library, sports facilities, and student lounges. We also have a cafeteria and health center.";
    } else if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey')) {
      return "Hello! How can I assist you with JBMMSI information today?";
    } else {
      return "I'm sorry, I don't have information about that. For specific questions, please contact our admissions office at +63993 617 8050  or email us @ jemmonte926@gmail.com";
    }
  };

  const sendMessage = () => {
    if (inputValue.trim()) {
      const newUserMessage = { text: inputValue, sender: 'user' };
      setMessages(prev => [...prev, newUserMessage]);
      setInputValue('');

      setTimeout(() => {
        const botResponse = getBotResponse(inputValue);
        const newBotMessage = { text: botResponse, sender: 'bot' };
        setMessages(prev => [...prev, newBotMessage]);
      }, 500);
    }
  };

  const handleSuggestedQuestion = (question) => {
    setInputValue(question);
    sendMessage();
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-icon" onClick={() => setIsChatActive(!isChatActive)}>
        <i className="fas fa-comments"></i>
      </div>
      
      <div className={`chatbox ${isChatActive ? 'active' : ''}`}>
        <div className="chat-header">
          <h3>JBMMSI Assistant</h3>
          <button className="close-btn" onClick={() => setIsChatActive(false)}>×</button>
        </div>
        <div className="chat-messages">
          {messages.map((message, index) => (
            <div key={index} className={`message ${message.sender === 'bot' ? 'bot-message' : 'user-message'}`}>
              {message.text.split('\n').map((line, i) => (
                <div key={i}>{line}</div>
              ))}
            </div>
          ))}
        </div>
        <div className="suggested-questions">
          <button className="suggested-btn" onClick={() => handleSuggestedQuestion('Admission requirements')}>Admission requirements</button>
          <button className="suggested-btn" onClick={() => handleSuggestedQuestion('Programs offered')}>Programs offered</button>
          <button className="suggested-btn" onClick={() => handleSuggestedQuestion('Tuition fees')}>Tuition fees</button>
          <button className="suggested-btn" onClick={() => handleSuggestedQuestion('Contact information')}>Contact information</button>
        </div>
        <div className="chat-input">
          <input 
            type="text" 
            placeholder="Ask about JBMMSI..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
          />
          <button onClick={sendMessage}><i className="fas fa-paper-plane"></i></button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;