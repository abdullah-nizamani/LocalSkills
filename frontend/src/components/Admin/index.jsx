import React, { useState, useEffect } from 'react';
import { FaUsers, FaTools, FaChartBar, FaShieldAlt, FaSignOutAlt, FaBars, FaTimes } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import AdminDashboard from './components/AdminDashboard';
import UserManagement from './components/UserManagement';
import SkillsManagement from './components/SkillsManagement';
import ContentModeration from './components/ContentModeration';
import StandaloneEditUserModal from './components/StandaloneEditUserModal';

const AdminPanel = () => {
  const { user, logout, isLoading } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { tab, userId } = useParams();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Check if user is admin and handle URL params
  useEffect(() => {
    // Wait for auth loading to complete
    if (isLoading) {
      return;
    }

    // Only redirect if we're sure the user is not logged in
    if (!user) {
      navigate('/auth');
      return;
    }

    // Check if user has admin role or is the admin account
    const isAdmin = user.userType === 'admin' || user.email === 'admin@gmail.com' || user.role === 'admin';

    if (!isAdmin) {
      navigate('/');
      return;
    }

    // Handle URL tab parameter from route or search params
    const urlTab = tab;
    const searchTab = searchParams.get('tab');

    const currentTab = urlTab || searchTab || 'dashboard';

    if (currentTab && ['dashboard', 'users', 'skills', 'moderation'].includes(currentTab)) {
      setActiveTab(currentTab);
    }

    // If we have a userId in the URL, we're editing a user
    if (userId && currentTab === 'users') {
      setActiveTab('users');
    }
  }, [user, isLoading, navigate, searchParams, tab, userId]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: FaChartBar },
    { id: 'users', label: 'User Management', icon: FaUsers },
    { id: 'skills', label: 'Skills Management', icon: FaTools },
    { id: 'moderation', label: 'Content Moderation', icon: FaShieldAlt },
  ];

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <AdminDashboard />;
      case 'users':
        return <UserManagement />;
      case 'skills':
        return <SkillsManagement />;
      case 'moderation':
        return <ContentModeration />;
      default:
        return <AdminDashboard />;
    }
  };

  // Check admin authorization - only show loading/error states when we're certain
  const isAdmin = user && (user.userType === 'admin' || user.email === 'admin@gmail.com' || user.role === 'admin');

  // Show loading state while auth is loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Loading...</h3>
          <p className="text-gray-600">Checking admin access...</p>
        </div>
      </div>
    );
  }

  // Show auth required if not logged in
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaShieldAlt size={48} className="text-gray-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h3>
          <p className="text-gray-600">Please login to access the admin panel.</p>
        </div>
      </div>
    );
  }

  // Show access denied if logged in but not admin
  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <FaShieldAlt size={48} className="text-red-400 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600">You don't have administrator privileges to access this panel.</p>
          <p className="text-sm text-gray-500 mt-2">Required: Admin role or admin@gmail.com account</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 flex overflow-hidden" >
      {/* Sidebar */}
      <aside className={`${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } fixed inset-y-0 left-0 h-[93vh] w-72 bg-white shadow-xl transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 flex flex-col border-r border-gray-200`} >
        <div className="flex flex-col h-full">
          {/* Sidebar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-blue-700">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-white bg-opacity-20 rounded-lg flex items-center justify-center">
                <FaShieldAlt className="text-white" size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Admin Panel</h2>
                <p className="text-xs text-blue-100">Management Console</p>
              </div>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="md:hidden p-2 rounded-lg text-blue-200 hover:text-white hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              <FaTimes size={18} />
            </button>
          </div>

          {/* User Info */}
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">
                  {user.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                <div className="flex items-center mt-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
                  <span className="text-xs text-gray-600">Online</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveTab(item.id);
                    navigate(`/admin/${item.id}`);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 group ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/25 border border-blue-500'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600 border border-transparent'
                  }`}
                >
                  <Icon className={`mr-3 transition-colors ${isActive ? 'text-blue-200' : 'text-gray-500 group-hover:text-blue-600'}`} size={18} />
                  <span className="flex-1 text-left">{item.label}</span>
                  {isActive && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Stats */}
          <div className="px-4 py-4 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">--</div>
                <div className="text-xs text-gray-500">Active Users</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold text-gray-900">--</div>
                <div className="text-xs text-gray-500">Total Skills</div>
              </div>
            </div>
          </div>

          {/* Logout Button */}
          <div className="p-4 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center px-4 py-3 text-sm font-medium text-red-600 hover:text-white hover:bg-red-600 rounded-xl transition-all duration-200 border border-red-200 hover:border-red-600"
            >
              <FaSignOutAlt className="mr-2" size={16} />
              Logout
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile menu button */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-3 rounded-xl bg-white shadow-lg text-gray-600 hover:text-blue-600 border border-gray-200 hover:border-blue-300 transition-all duration-200"
        >
          <FaBars size={20} />
        </button>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black bg-opacity-50 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 flex flex-col overflow-hidden">
        {/* Content Area - Full Height */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {userId ? (
              <StandaloneEditUserModal
                userId={userId}
                onClose={() => navigate('/admin/users')}
                isOpen={true}
              />
            ) : (
              renderContent()
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;