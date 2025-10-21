import React, { useState, useRef, useEffect } from 'react';
import './Chatbot.css';

const Chatbot = () => {
  const [isChatActive, setIsChatActive] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: Date.now(),
      text: "Hi there! I'm JBMMSI FAQ Assistant. I can help answer common questions about our school. What would you like to know?",
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showCategories, setShowCategories] = useState(false);
  const messagesEndRef = useRef(null);

  // FAQ Data Structure
  const faqData = {
    admission: {
      question: "What are the admission requirements?",
      answer: "Admission requirements include:\n• Completed application form\n• Transcript of records or Form 137\n• 2x2 ID pictures\n• Interview with the principal\n• Birth certificate (PSA)\n\nSpecific requirements may vary by program level.",
      followUp: ["Application process", "Required documents", "Interview details"],
      icon: "📝"
    },
    programs: {
      question: "What programs do you offer?",
      answer: "We offer the following educational programs:\n\n🏫 **Preschool Level**\n• Nursery (3-4 years old)\n• Kindergarten (5-6 years old)\n\n🎒 **Elementary Level**\n• Grade 1 to Grade 6\n\n📚 **Tutorial Services**\n• One-on-One tutoring (Online & Face-to-Face)\n• All subjects coverage\n\n☀️ **Summer Programs**\n• Enrichment classes\n• Remedial sessions",
      followUp: ["Preschool curriculum", "Elementary subjects", "Tutorial rates"],
      icon: "🏫"
    },
    fees: {
      question: "How much is the tuition fee?",
      answer: "Our fee structure is as follows:\n\n• **Preschool**: ₱5,000 per grading period\n• **Elementary**: ₱5,000 per grading period\n• **Tutorial**: ₱300-₱500 per hour (depending on subject)\n\n💡 *We offer sibling discounts and scholarship programs for qualified students.*",
      followUp: ["Payment options", "Scholarship details", "Additional fees"],
      icon: "💲"
    },
    schedule: {
      question: "What are the school hours and schedule?",
      answer: "**Regular School Schedule:**\n• Morning session: 7:30 AM - 12:00 PM\n• Afternoon session: 1:00 PM - 4:30 PM\n\n**School Calendar:**\n• Academic year: June to March\n• Summer classes: April to May\n\n*Tutorial sessions can be scheduled flexibly based on student and tutor availability.*",
      followUp: ["School calendar", "Holiday schedule", "Summer program dates"],
      icon: "⏰"
    },
    contact: {
      question: "How can we contact the school?",
      answer: "**Contact Information:**\n\n📞 Phone: +63993 617 8050\n📧 Email: jemmonte926@gmail.com\n📍 Address: Phase 6 Blk 3 Lot 4 Eastwood Residences San Isidro, Rodriguez, Philippines, 1860\n\n**Office Hours:**\nMonday to Friday, 7:00 AM - 5:00 PM",
      followUp: ["Map location", "Social media", "Visit schedule"],
      icon: "📞"
    },
    facilities: {
      question: "What facilities are available?",
      answer: "Our campus features:\n\n🏫 Air-conditioned classrooms\n💻 Modern teaching aids and technology\n🔬 Science learning corner\n📚 Reading area and library\n🎨 Arts and crafts station\n🏃 Outdoor play area\n🍽️ Snack area\n\n*All facilities are designed for safe and effective learning.*",
      followUp: ["Classroom photos", "Safety measures", "Facility tour"],
      icon: "🏢"
    },
    enrollment: {
      question: "When is the enrollment period?",
      answer: "**Enrollment Schedule:**\n\n📅 **Regular Enrollment**: April 1 - May 31\n📅 **Late Enrollment**: June 1 - 15 (with late fee)\n📅 **Summer Program Enrollment**: March 1 - 31\n\n*Early enrollment is encouraged to secure your slot. Limited slots available per class.*",
      followUp: ["Enrollment process", "Required documents", "Class size"],
      icon: "📅"
    }
  };

  // Auto-scroll to bottom
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Find the best matching FAQ
  const findMatchingFAQ = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    const keywordMapping = {
      admission: ['admission', 'requirement', 'apply', 'enroll', 'application', 'requirements', 'how to apply', 'documents'],
      programs: ['program', 'course', 'curriculum', 'offer', 'grade', 'level', 'preschool', 'elementary', 'tutorial', 'class'],
      fees: ['fee', 'tuition', 'cost', 'payment', 'how much', 'price', 'bayad', 'scholarship'],
      schedule: ['schedule', 'time', 'hour', 'calendar', 'class schedule', 'school time', 'when'],
      contact: ['contact', 'email', 'phone', 'address', 'location', 'visit', 'map', 'call'],
      facilities: ['facility', 'campus', 'classroom', 'room', 'building', 'equipment', 'lab'],
      enrollment: ['enrollment', 'enrol', 'enroll', 'period', 'when to enroll', 'registration', 'sign up']
    };

    for (const [category, keywords] of Object.entries(keywordMapping)) {
      if (keywords.some(keyword => lowerMessage.includes(keyword))) {
        return category;
      }
    }

    return null;
  };

  const getBotResponse = (userMessage) => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Handle greetings
    if (lowerMessage.includes('hi') || lowerMessage.includes('hello') || lowerMessage.includes('hey') || 
        lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon') || 
        lowerMessage.includes('good evening')) {
      return {
        answer: getRandomResponse([
          "Hello! 👋 Welcome to JBMMSI! How can I assist you today?",
          "Hi there! 😊 I'm here to help you with information about JBMMSI. What would you like to know?",
          "Greetings! 🌟 I'm the JBMMSI assistant. How can I make your day better?",
          "Hello! 🎒 Ready to explore JBMMSI? What questions can I answer for you?"
        ]),
        followUp: ["Admission requirements", "Programs offered", "Tuition fees", "Contact information"],
        icon: "👋"
      };
    }

    // Handle thank you messages
    if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('ty')) {
      return {
        answer: getRandomResponse([
          "You're welcome! 😊 I'm glad I could help. Is there anything else you'd like to know about JBMMSI?",
          "You're very welcome! 🌟 Feel free to ask if you have any other questions!",
          "My pleasure! 🎒 I'm here whenever you need more information about our school.",
          "Happy to help! 😄 Don't hesitate to ask if you have more questions!"
        ]),
        followUp: ["Ask another question", "View all categories", "Contact school"],
        icon: "🙏"
      };
    }

    // Handle goodbye messages
    if (lowerMessage.includes('bye') || lowerMessage.includes('goodbye') || lowerMessage.includes('see you')) {
      return {
        answer: getRandomResponse([
          "Goodbye! 👋 Thank you for chatting with me. Have a wonderful day!",
          "See you later! 😊 Best wishes from JBMMSI!",
          "Take care! 🌟 Hope to see you at JBMMSI soon!",
          "Bye bye! 🎒 Feel free to come back if you have more questions!"
        ]),
        followUp: [],
        icon: "👋"
      };
    }

    // Handle how are you
    if (lowerMessage.includes('how are you') || lowerMessage.includes("how're you")) {
      return {
        answer: "I'm doing great, thank you! 😊 I'm here and ready to help you with all your JBMMSI questions. What can I assist you with today?",
        followUp: ["School programs", "Admission process", "Contact details"],
        icon: "😊"
      };
    }

    const matchedCategory = findMatchingFAQ(userMessage);
    
    if (matchedCategory && faqData[matchedCategory]) {
      return {
        answer: faqData[matchedCategory].answer,
        followUp: faqData[matchedCategory].followUp,
        icon: faqData[matchedCategory].icon
      };
    }

    // Default response for unmatched questions
    return {
      answer: "I'm sorry, I don't have information about that specific question. Here are some common topics I can help with:\n\n" +
        Object.values(faqData).map(faq => `• ${faq.question}`).join('\n') +
        "\n\nFor specific inquiries, please contact us directly at +63993 617 8050.",
      followUp: ["Admission requirements", "Program offerings", "Tuition fees", "Contact information"],
      icon: "❓"
    };
  };

  // Helper function for random responses
  const getRandomResponse = (responses) => {
    return responses[Math.floor(Math.random() * responses.length)];
  };

  const sendMessage = async () => {
    const trimmedValue = inputValue.trim();
    if (!trimmedValue) return;

    // Add user message
    const newUserMessage = {
      id: Date.now(),
      text: trimmedValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, newUserMessage]);
    setInputValue('');
    setIsTyping(true);
    setShowCategories(false); // Close dropdown when sending message

    // Simulate typing delay
    await new Promise(resolve => setTimeout(resolve, 800));

    // Get and add bot response
    const response = getBotResponse(trimmedValue);
    const newBotMessage = {
      id: Date.now() + 1,
      text: response.answer,
      sender: 'bot',
      timestamp: new Date(),
      followUp: response.followUp,
      icon: response.icon
    };
    
    setMessages(prev => [...prev, newBotMessage]);
    setIsTyping(false);
  };

  const handleFAQClick = (faqKey) => {
    const faq = faqData[faqKey];
    const userMessage = { 
      id: Date.now(), 
      text: faq.question, 
      sender: 'user', 
      timestamp: new Date() 
    };
    
    setMessages(prev => [...prev, userMessage]);
    setIsTyping(true);
    setShowCategories(false); // Close dropdown after selection

    setTimeout(() => {
      const botMessage = {
        id: Date.now() + 1,
        text: faq.answer,
        sender: 'bot',
        timestamp: new Date(),
        followUp: faq.followUp,
        icon: faq.icon
      };
      setMessages(prev => [...prev, botMessage]);
      setIsTyping(false);
    }, 800);
  };

  const handleFollowUpClick = (followUpQuestion) => {
    setInputValue(followUpQuestion);
    setShowCategories(false);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (date) => {
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const mainCategories = Object.entries(faqData).map(([key, data]) => ({
    key,
    icon: data.icon,
    label: data.question.split('?')[0],
    shortLabel: data.question.split('?')[0].split(' ').slice(0, 3).join(' ')
  }));

  return (
    <div className="chatbot-container">
      {/* Chat Icon */}
      <div 
        className={`chatbot-icon ${isChatActive ? 'active' : ''}`} 
        onClick={() => setIsChatActive(!isChatActive)}
        aria-label="Open FAQ chat"
      >
        <i className="fas fa-question-circle"></i>
      </div>
      
      {/* Chat Box */}
      <div className={`chatbox ${isChatActive ? 'active' : ''}`}>
        <div className="chat-header">
          <div className="chat-header-content">
            <h3>JBMMSI FAQ Assistant</h3>
            <span className="chat-subtitle">Ask me anything about our school</span>
          </div>
          <button 
            className="close-btn" 
            onClick={() => setIsChatActive(false)}
            aria-label="Close chat"
          >
            ×
          </button>
        </div>

        {/* Chat Messages */}
        <div className="chat-messages">
          {messages.map((message) => (
            <div key={message.id}>
              <div 
                className={`message ${message.sender === 'bot' ? 'bot-message' : 'user-message'}`}
              >
                {message.sender === 'bot' && message.icon && (
                  <div className="message-icon">{message.icon}</div>
                )}
                <div className="message-content">
                  <div className="message-text">
                    {message.text.split('\n').map((line, i) => (
                      <div key={i}>{line}</div>
                    ))}
                  </div>
                  <div className="message-time">
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
              
              {/* Follow-up questions */}
              {message.sender === 'bot' && message.followUp && message.followUp.length > 0 && (
                <div className="follow-up-questions">
                  <div className="follow-up-label">Related questions:</div>
                  <div className="follow-up-buttons">
                    {message.followUp.map((question, index) => (
                      <button
                        key={index}
                        className="suggested-btn follow-up-btn"
                        onClick={() => handleFollowUpClick(question)}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
          
          {isTyping && (
            <div className="message bot-message typing-indicator">
              <div className="typing-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Categories Dropdown */}
        <div className="categories-dropdown-container">
          <button 
            className="categories-toggle"
            onClick={() => setShowCategories(!showCategories)}
          >
            <i className={`fas fa-chevron-${showCategories ? 'up' : 'down'}`}></i>
            <span>Quick Categories</span>
          </button>
          
          {showCategories && (
            <div className="categories-dropdown">
              <div className="categories-list">
                {mainCategories.map((category) => (
                  <button
                    key={category.key}
                    className="category-item"
                    onClick={() => handleFAQClick(category.key)}
                  >
                    <span className="category-item-icon">{category.icon}</span>
                    <span className="category-item-text">{category.label}</span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Chat Input */}
        <div className="chat-input">
          <input 
            type="text" 
            placeholder="Ask a question about JBMMSI..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isTyping}
          />
          <button 
            onClick={sendMessage} 
            disabled={!inputValue.trim() || isTyping}
            aria-label="Send question"
          >
            <i className="fas fa-paper-plane"></i>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;