import React from 'react';

const Programs = ({ openModal }) => {
  const programs = [
    {
      title: "Nursery",
      icon: "fas fa-baby",
      description: "Focus on a Safe & Nurturing Start. More than a first step in education: A caring home away from home where little hearts feel safe and imaginations soar.",
      program: "Nursery"
    },
    {
      title: "Kindergarten",
      icon: "fas fa-pencil-alt",
      description: "Focus on Curiosity & Discovery. Where tiny hands explore big wonders and little minds ignite a lifelong love of learning.",
      program: "Kindergarten"
    },
    {
      title: "Elementary",
      icon: "fas fa-book",
      description: "Focus on Growth & Nurturing. Planting seeds of confidence, kindness, and curiosity in a garden where every child blossoms.",
      program: "Elementary"
    },
     {
      title: "Junior Highschool",
      icon: "fa-solid fa-chalkboard",
      description: "Focus on actively trying to figure out who they are, which leads to exploring different styles, interests, and social groups.",
      program: "Junior Highschool"
    },
     {
      title: "Summer Class",
      icon: "fa-solid fa-cubes-stacked",
      description: "We don't stop exploring just because it's summer. Let's find some cool knowledge!",
      program: "Summer Class"
    },
     {
      title: "One On One Tutorial",
      icon: "fa-solid fa-children",
      description: "The most powerful learning happens when one voice guides one mind. Today, we focus only on your brilliant potential.",
      program: "One On One Tutorial"
    }
  ];
  

  return (
    <section id="programs" className="section programs">
      <div className="container">
        <h2 className="section-title">Our <span>Programs</span></h2>
        
        <div className="programs-grid">
          {programs.map((program, index) => (
            <div key={index} className="program-card">
              <div className="program-content">
                <div className="program-icon">
                  <i className={program.icon}></i>
                </div>
                <h3 className="program-title">{program.title}</h3>
                <p className="program-desc">{program.description}</p>
                <button 
                  className="btn btn-outline" 
                  onClick={() => openModal(program.program)}
                >
                  Inquire Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Programs;