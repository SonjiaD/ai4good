import React, { useState } from 'react';
import './MyClass.css';
import bearPfp from '../assets/bear-pfp.png'; 
import logo from '../assets/logo.png';
import { Link } from 'react-router-dom';

const MyClass: React.FC = () => {
  const [students, setStudents] = useState<string[]>(['Lily', 'Ashley']);
  const [showModal, setShowModal] = useState(false);
  const [newStudentEmail, setNewStudentEmail] = useState('');

  const handleAdd = () => {
    const name = newStudentEmail.split('@')[0]; // just splits email to get a name for simplicity
    if (name && !students.includes(name)) {
      setStudents([...students, name]);
    }
    setShowModal(false);
    setNewStudentEmail('');
  };

  const handleRemove = (name: string) => {
    setStudents(students.filter((student) => student !== name));
  };

  return (
    <><div className="myclass-header">
          <header className="navbar">
              <div className="logo">
                  <img src={logo} alt="Logo" className="logo-img" />
              </div>
              <nav>
                  <a href="#">Home</a>
                  <a href="#">Assignment</a>
                  <a href="#">Troubleshoot</a>
                  <a href="#">Settings</a>
              </nav>
          </header>
      </div>

      <div className="myclass-container">
              <div className="class-card">
                  <h2>My Class</h2>
                  <ul className="student-list">
                      {students.map((name) => (
                          <li key={name} className="student-item">
                              <img src={bearPfp} alt="Student Icon" />
                              <Link to={'/StudentOverview'} className="student-link">
                                {name}
                              </Link>
                              <button className="remove-btn" onClick={() => handleRemove(name)}>Remove</button>
                          </li>
                      ))}
                  </ul>

                  <div className="bottom-buttons">
                      <button className="add-btn" onClick={() => setShowModal(true)}>Add</button>
                      <button className="next-page-btn">Next Page</button>
                  </div>
              </div>

              {showModal && (
                  <div className="modal">
                      <div className="modal-box">
                          <h3>Enroll student to your class</h3>
                          <input
                              type="email"
                              value={newStudentEmail}
                              onChange={(e) => setNewStudentEmail(e.target.value)}
                              placeholder="student@email.com" />
                          <button className="enroll-btn" onClick={handleAdd}>Enroll</button>
                      </div>
                  </div>
              )}
          </div></>
  );
};

export default MyClass;
