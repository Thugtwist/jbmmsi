import React, { useState } from 'react';
import './styles/App.css';
import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Programs from './components/Programs.jsx';
import Announcements from './components/Announcements.jsx';
import About from './components/About.jsx';
import Contact from './components/Contact.jsx';
import Footer from './components/Footer.jsx';
import Chatbot from './components/Chatbot.jsx';
import Modal from './components/Modal.jsx';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState('');


  const openModal = (program) => {
    setSelectedProgram(program);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedProgram('');
  };

  return (
    <div className="App">
      <Header />
      <Hero />
      <Programs openModal={openModal} />
      <Announcements />
      <About />
      <Contact />
      <Footer />
      <Chatbot />
      <Modal 
        isOpen={isModalOpen}
        onClose={closeModal}
        selectedProgram={selectedProgram}
      />
    </div>
  );
}

export default App;