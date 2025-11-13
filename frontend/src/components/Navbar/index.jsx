// Navbar.jsx
import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { navLinks } from '../../constants';
import { FaBars, FaTimes, FaUser, FaSignOutAlt, FaComments, FaShieldAlt, FaCircle } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useSocket } from '../../contexts/SocketContext';

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { isConnected, authenticate } = useSocket();

  // Fetch unread message count
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!user) return;
      
      try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:5000/api/messages/unread-count', {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();
        if (data.success) {
          setUnreadCount(data.data.unreadCount);
        }
      } catch (error) {
        console.error('Error fetching unread count:', error);
      }
    };

    fetchUnreadCount();

    // Set up an interval to refresh the count periodically
    const interval = setInterval(fetchUnreadCount, 30000); // Every 30 seconds

    // Listen for new messages to update the count
    const handleNewMessage = () => {
      fetchUnreadCount();
    };

    window.addEventListener('newMessage', handleNewMessage);
    window.addEventListener('messageRead', handleNewMessage);

    return () => {
      clearInterval(interval);
      window.removeEventListener('newMessage', handleNewMessage);
      window.removeEventListener('messageRead', handleNewMessage);
    };
  }, [user]);

  // Authenticate with socket when user is available and socket is connected
  useEffect(() => {
    if (user && isConnected && authenticate) {
      authenticate({ userId: user.id });
    }
  }, [user, isConnected, authenticate]);

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
    setShowUserMenu(false);
  };

  // Filter navigation links based on user status and type
  const getFilteredNavLinks = () => {
    return navLinks.filter(link => {
      // If user is not logged in, hide profile, messages, and post-skill
      if (!user) {
        return !['/profile', '/messages', '/post-skill'].includes(link.href);
      }
      
      // If user is logged in, show all links except:
      // - Clients don't see "Post Skill" link
      // - All users see profile and messages in the user menu instead of main nav
      return link.href !== '/post-skill' && !['/profile', '/messages'].includes(link.href);
    });
  };

  return (
    <nav className={`bg-white/95 backdrop-blur-lg shadow-xl border-b border-gray-100 ${
      location.pathname === '/messages' ? 'relative' : 'sticky top-0 z-50'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 group">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:to-blue-600 transition-all duration-300">
                LocalSkills
              </h1>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {getFilteredNavLinks().map((link) => (
              <Link
                key={link.href}
                to={link.href}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  location.pathname === link.href
                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* User Menu */}
          <div className="hidden md:flex items-center space-x-3">
            {user ? (
              <div className="flex items-center space-x-2">
                <Link
                  to="/messages"
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 relative ${
                    location.pathname === '/messages'
                      ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <div className="relative">
                    <FaComments size={16} />
                    {unreadCount > 0 && (
                      <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                  <span>Messages</span>
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
                  >
                    <div className="relative">
                      <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-bold">
                          {user.name?.charAt(0)?.toUpperCase() || 'U'}
                        </span>
                      </div>
                      {/* Online status indicator */}
                      {isConnected && (
                        <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="text-sm font-medium max-w-24 truncate flex items-center">
                      <span>{user.name}</span>
                      {isConnected && (
                        <span className="ml-2 text-xs text-green-600 font-medium flex items-center">
                          <FaCircle size={8} className="mr-1" /> Online
                        </span>
                      )}
                    </div>
                  </button>
                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-2xl py-2 z-50 border border-gray-100">
                      <Link
                        to="/profile"
                        onClick={() => setShowUserMenu(false)}
                        className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 flex items-center"
                      >
                        <FaUser className="inline mr-3" />
                        Profile
                      </Link>
                      {user?.userType === 'worker' && (
                        <Link
                          to="/post-skill"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 flex items-center"
                        >
                          <FaUser className="inline mr-3" />
                          Post Skill
                        </Link>
                      )}
                      {user?.email === 'admin@gmail.com' && (
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="block px-4 py-3 text-sm text-gray-700 hover:bg-blue-50 hover:text-blue-600 transition-colors duration-200 flex items-center"
                        >
                          <FaShieldAlt className="inline mr-3" />
                          Admin Panel
                        </Link>
                      )}
                      <div className="border-t border-gray-200 my-1"></div>
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-3 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors duration-200 flex items-center"
                      >
                        <FaSignOutAlt className="inline mr-3" />
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  to="/auth?mode=login"
                  className="text-gray-700 hover:text-blue-600 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200 hover:bg-blue-50"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-lg font-semibold text-sm hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors duration-200"
            >
              {isOpen ? <FaTimes size={24} /> : <FaBars size={24} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isOpen && (
        <div className="md:hidden bg-white/95 backdrop-blur-lg border-t border-gray-100">
          <div className="px-4 pt-4 pb-6 space-y-2">
            {/* Main Navigation Links */}
            {getFilteredNavLinks().map((link) => (
              <Link
                key={link.href}
                to={link.href}
                onClick={closeMenu}
                className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                  location.pathname === link.href
                    ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                }`}
              >
                {link.label}
              </Link>
            ))}

            {/* User Section */}
            {user ? (
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                <div className="flex items-center px-4 py-2">
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center mr-3">
                      <span className="text-white text-sm font-bold">
                        {user.name?.charAt(0)?.toUpperCase() || 'U'}
                      </span>
                    </div>
                    {/* Online status indicator for mobile */}
                    {isConnected && (
                      <div className="absolute bottom-0 right-3 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-900 flex items-center">
                      {user.name}
                      {isConnected && (
                        <span className="ml-2 text-xs text-green-600 font-medium flex items-center">
                          <FaCircle size={8} className="mr-1" /> Online
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500 capitalize">{user.userType}</div>
                  </div>
                </div>

                <Link
                  to="/messages"
                  onClick={closeMenu}
                  className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 relative ${
                    location.pathname === '/messages'
                      ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                  }`}
                >
                  <div className="flex items-center">
                    <FaComments className="inline mr-3" />
                    <span>Messages</span>
                    {unreadCount > 0 && (
                      <span className="ml-2 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount > 99 ? '99+' : unreadCount}
                      </span>
                    )}
                  </div>
                </Link>

                <Link
                  to="/profile"
                  onClick={closeMenu}
                  className="block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                >
                  <FaUser className="inline mr-3" />
                  Profile
                </Link>

                {user?.userType === 'worker' && (
                  <Link
                    to="/post-skill"
                    onClick={closeMenu}
                    className="block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 flex items-center text-gray-700 hover:text-blue-600 hover:bg-blue-50"
                  >
                    <FaUser className="inline mr-3" />
                    Post Skill
                  </Link>
                )}

                {user?.email === 'admin@gmail.com' && (
                  <Link
                    to="/admin"
                    onClick={closeMenu}
                    className={`block px-4 py-3 rounded-lg text-base font-medium transition-all duration-200 ${
                      location.pathname === '/admin'
                        ? 'text-white bg-gradient-to-r from-blue-600 to-purple-600 shadow-lg'
                        : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
                    }`}
                  >
                    <FaShieldAlt className="inline mr-3" />
                    Admin Panel
                  </Link>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    closeMenu();
                  }}
                  className="block w-full text-left px-4 py-3 text-base font-medium text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors duration-200"
                >
                  <FaSignOutAlt className="inline mr-3" />
                  Logout
                </button>
              </div>
            ) : (
              <div className="border-t border-gray-200 pt-4 mt-4 space-y-2">
                <Link
                  to="/auth?mode=login"
                  onClick={closeMenu}
                  className="block px-4 py-3 text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors duration-200"
                >
                  Sign In
                </Link>
                <Link
                  to="/auth?mode=signup"
                  onClick={closeMenu}
                  className="block px-4 py-3 text-base font-medium bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  Sign Up
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;