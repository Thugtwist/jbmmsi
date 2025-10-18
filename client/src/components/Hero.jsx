import React from 'react';

const Hero = () => {
  return (
    <section 
      id="hero" 
      className="hero"
      style={{
        backgroundImage: `url('/image/Heading2.png')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        position: 'relative'
      }}
    >
      <div className="container">
        <div className="hero-content">
          <h1 className="hero-title">Jem Brillant Mind Montissori School Inc.</h1>
          <p className="hero-subtitle"> Provides quality education that nurtures young minds and prepares them for a bright future.</p>
          <a href="#programs" className="btn1">Explore Our Programs</a>
        </div>
      </div>
    </section>
  );
};

export default Hero;