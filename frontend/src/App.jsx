import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './contexts/AuthContext';
import { SocketProvider } from './contexts/SocketContext';
import Navbar from './components/Navbar/index';
import Hero from './components/Hero';
import AboutUs from './components/AboutUs';
import OurTeam from './components/OurTeam';
import HowItWorks from './components/HowItWorks';
import SkillsList from './components/SkillsList/index';
import PostSkill from './components/PostSkill/index';
import Profile from './components/profile/Profile';
import Messages from './components/Messages';
import Auth from './components/Auth/index';
import Admin from './components/Admin/index';
import Contact from './components/Contact';
import Footer from './components/Footer';
import NotFound from './components/NotFound'; // Import the NotFound component

const ScrollToSection = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash) {
      const element = document.getElementById(location.hash.substring(1));
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      window.scrollTo(0, 0);
    }
  }, [location]);

  return null;
};

const App = () => {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <ScrollToSection />
          <div className="App">
            <Navbar />
            <Routes>
              <Route path="/" element={
                <>
                  <Hero />
                  <AboutUs />
                  <OurTeam />
                  <HowItWorks />
                  <Contact />
                  <Footer />
                </>
              } />
              <Route path="/skills" element={<SkillsList />} />
              <Route path="/post-skill" element={<PostSkill />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/profile/:userId" element={<Profile />} />
              <Route path="/messages" element={<Messages />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/:tab" element={<Admin />} />
              <Route path="/admin/users/:userId/edit" element={<Admin />} />
              
              {/* Catch-all route for 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
            <ToastContainer
              position="top-right"
              autoClose={5000}
              hideProgressBar={false}
              newestOnTop={false}
              closeOnClick
              rtl={false}
              pauseOnFocusLoss
              draggable
              pauseOnHover
              theme="colored"
            />
          </div>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
};

export default App;