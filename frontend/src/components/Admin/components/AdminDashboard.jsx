import React, { useState, useEffect } from 'react';
import { FaUsers, FaTools, FaEye, FaStar, FaChartLine, FaCalendarAlt } from 'react-icons/fa';

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalSkills: 0,
    totalViews: 0,
    averageRating: 0,
    recentUsers: [],
    recentSkills: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Fetch real data from APIs
      const [usersRes, skillsRes] = await Promise.all([
        fetch('http://localhost:5000/api/users'),
        fetch('http://localhost:5000/api/skills')
      ]);

      const usersData = usersRes.ok ? await usersRes.json() : { data: { users: [] } };
      const skillsData = skillsRes.ok ? await skillsRes.json() : { data: { skills: [] } };

      const users = usersData.data?.users || [];
      const skills = skillsData.data?.skills || [];

      // Calculate statistics
      const totalUsers = users.length;
      const totalSkills = skills.length;
      const totalViews = skills.reduce((sum, skill) => sum + (skill.viewCount || 0), 0);
      const averageRating = skills.length > 0
        ? skills.reduce((sum, skill) => sum + (skill.provider?.profile?.rating || 0), 0) / skills.length
        : 0;

      // Get recent users (last 5)
      const recentUsers = users
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(user => ({
          id: user._id,
          name: user.name,
          email: user.email,
          userType: user.userType,
          createdAt: new Date(user.createdAt).toLocaleDateString()
        }));

      // Get recent skills (last 5)
      const recentSkills = skills
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(skill => ({
          id: skill._id,
          title: skill.title,
          provider: skill.provider?.name || 'Unknown',
          category: skill.category,
          createdAt: new Date(skill.createdAt).toLocaleDateString()
        }));

      setStats({
        totalUsers,
        totalSkills,
        totalViews,
        averageRating: parseFloat(averageRating.toFixed(1)),
        recentUsers,
        recentSkills
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Fallback to mock data if APIs fail
      setStats({
        totalUsers: 0,
        totalSkills: 0,
        totalViews: 0,
        averageRating: 0,
        recentUsers: [],
        recentSkills: []
      });
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: FaUsers,
      color: 'bg-blue-500',
      change: '+12%'
    },
    {
      title: 'Total Skills',
      value: stats.totalSkills.toLocaleString(),
      icon: FaTools,
      color: 'bg-green-500',
      change: '+8%'
    },
    {
      title: 'Total Views',
      value: stats.totalViews.toLocaleString(),
      icon: FaEye,
      color: 'bg-purple-500',
      change: '+15%'
    },
    {
      title: 'Average Rating',
      value: stats.averageRating.toFixed(1),
      icon: FaStar,
      color: 'bg-yellow-500',
      change: '+0.2'
    }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <div className="flex items-center text-sm text-gray-500">
          <FaCalendarAlt className="mr-2" />
          Last updated: {new Date().toLocaleDateString()}
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">{stat.value}</p>
                  <p className="text-sm text-green-600 mt-1">{stat.change} from last month</p>
                </div>
                <div className={`p-3 rounded-full ${stat.color}`}>
                  <Icon className="text-white" size={20} />
                </div>
              </div>
            </div>
          );
        })}
      </div>


      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentUsers.map((user) => (
              <div key={user.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{user.name}</p>
                    <p className="text-sm text-gray-600">{user.email}</p>
                  </div>
                  <div className="text-right">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      user.userType === 'worker' ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.userType}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{user.createdAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Skills */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Skills</h3>
          </div>
          <div className="divide-y divide-gray-200">
            {stats.recentSkills.map((skill) => (
              <div key={skill.id} className="p-4 hover:bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium text-gray-900">{skill.title}</p>
                    <p className="text-sm text-gray-600">by {skill.provider}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                      {skill.category}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">{skill.createdAt}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button
            onClick={() => window.location.href = '/admin/users'}
            className="flex items-center justify-center px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaUsers className="mr-2" />
            View All Users
          </button>
          <button
            onClick={() => window.location.href = '/admin/skills'}
            className="flex items-center justify-center px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <FaTools className="mr-2" />
            Manage Skills
          </button>
          <button
            onClick={() => window.location.href = '/admin/moderation'}
            className="flex items-center justify-center px-4 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <FaChartLine className="mr-2" />
            View Reports
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;