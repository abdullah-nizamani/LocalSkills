import React, { useState, useEffect } from 'react';
import { FaSearch, FaEdit, FaTrash, FaEye, FaCheck, FaTimes, FaFilter } from 'react-icons/fa';
import { toast } from 'react-toastify';
import AddSkillModal from './AddSkillModal';

const SkillsManagement = () => {
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [skillCategories, setSkillCategories] = useState([]);

  useEffect(() => {
    fetchSkills();
    fetchSkillCategories();
  }, []);

  useEffect(() => {
    filterSkills();
  }, [skills, searchTerm, filterCategory, filterStatus]);

  const fetchSkillCategories = () => {
    try {
      const categories = JSON.parse(localStorage.getItem('skillCategories') || '[]');
      setSkillCategories(categories);
    } catch (error) {
      console.error('Error fetching skill categories:', error);
      setSkillCategories([]);
    }
  };

  const fetchSkills = async () => {
    try {
      // Fetch actual skills from API
      const response = await fetch('http://localhost:5000/api/skills');
      const data = await response.json();

      if (data.success) {
        // Transform API data to match component expectations
        const transformedSkills = data.data.skills.map(skill => ({
          id: skill._id,
          title: skill.title,
          category: skill.category,
          description: skill.description,
          provider: skill.provider ? {
            name: skill.provider.name || 'Unknown',
            email: skill.provider.email || 'N/A'
          } : { name: 'Unknown', email: 'N/A' },
          location: skill.location,
          hourlyRate: skill.hourlyRate,
          isActive: skill.isActive,
          isVerified: skill.isVerified,
          rating: skill.rating,
          reviewCount: skill.reviewCount,
          viewCount: skill.viewCount,
          createdAt: new Date(skill.createdAt).toLocaleDateString()
        }));

        setSkills(transformedSkills);
      } else {
        toast.error(data.message || 'Failed to load skills');
        setSkills([]);
      }
    } catch (error) {
      console.error('Error fetching skills:', error);
      toast.error('Network error. Please try again.');
      setSkills([]);
    } finally {
      setLoading(false);
    }
  };

  const filterSkills = () => {
    let filtered = skills;

    if (searchTerm) {
      filtered = filtered.filter(skill =>
        skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.provider.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (filterCategory !== 'all') {
      filtered = filtered.filter(skill => skill.category === filterCategory);
    }

    if (filterStatus !== 'all') {
      const isActive = filterStatus === 'active';
      filtered = filtered.filter(skill => skill.isActive === isActive);
    }

    setFilteredSkills(filtered);
  };

  const handleStatusToggle = async (skillId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/skills/${skillId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          isActive: !currentStatus
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        const updatedSkills = skills.map(skill =>
          skill.id === skillId ? { ...skill, isActive: !currentStatus } : skill
        );
        setSkills(updatedSkills);
        toast.success(`Skill ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      } else {
        toast.error(data.message || 'Failed to update skill status');
      }
    } catch (error) {
      console.error('Error updating skill status:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleVerificationToggle = async (skillId, currentStatus) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/skills/${skillId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          isVerified: !currentStatus
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        const updatedSkills = skills.map(skill =>
          skill.id === skillId ? { ...skill, isVerified: !currentStatus } : skill
        );
        setSkills(updatedSkills);
        toast.success(`Skill ${!currentStatus ? 'verified' : 'unverified'} successfully`);
      } else {
        toast.error(data.message || 'Failed to update skill verification');
      }
    } catch (error) {
      console.error('Error updating skill verification:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setShowEditModal(true);
  };

  const handleDeleteCategory = (categoryId) => {
    if (!window.confirm('Are you sure you want to delete this skill category? This action cannot be undone.')) {
      return;
    }

    try {
      const existingCategories = JSON.parse(localStorage.getItem('skillCategories') || '[]');
      const updatedCategories = existingCategories.filter(cat => cat.id !== categoryId);
      localStorage.setItem('skillCategories', JSON.stringify(updatedCategories));
      setSkillCategories(updatedCategories);
      toast.success('Skill category deleted successfully');
    } catch (error) {
      console.error('Error deleting category:', error);
      toast.error('Failed to delete skill category');
    }
  };

  const handleDeleteSkill = async (skillId) => {
    if (!window.confirm('Are you sure you want to delete this skill? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch(`http://localhost:5000/api/skills/${skillId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        setSkills(skills.filter(skill => skill.id !== skillId));
        toast.success('Skill deleted successfully');
      } else {
        toast.error(data.message || 'Failed to delete skill');
      }
    } catch (error) {
      console.error('Error deleting skill:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const categories = ['Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Tailoring', 'Cleaning', 'Gardening', 'Tutoring', 'Photography', 'Catering', 'Other'];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Skills Management</h2>
        <div className="text-sm text-gray-500">
          Total Skills: {skills.length} | Categories: {skillCategories.length}
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Skill Categories Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Skill Categories</h3>
                <p className="text-sm text-gray-600">Manage available categories</p>
              </div>
              <button
                onClick={() => setShowAddModal(true)}
                className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
              >
                <FaCheck className="mr-2" size={14} />
                Add
              </button>
            </div>
          </div>

          <div className="p-6">
            {skillCategories.length > 0 ? (
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {skillCategories.map((category) => (
                  <div key={category.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="text-xl">{category.icon}</div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm">{category.name}</h4>
                          {category.description && (
                            <p className="text-xs text-gray-600 mt-1 truncate">{category.description}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          onClick={() => handleEditCategory(category)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                          title="Edit Category"
                        >
                          <FaEdit size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteCategory(category.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Category"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <FaSearch size={32} className="text-gray-400 mx-auto mb-3" />
                <h3 className="text-sm font-medium text-gray-900 mb-1">No categories yet</h3>
                <p className="text-xs text-gray-500 mb-3">Add your first skill category</p>
                <button
                  onClick={() => setShowAddModal(true)}
                  className="bg-blue-600 text-white px-3 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Add Category
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Skills Listings Section */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Skills Listings</h3>
            <p className="text-sm text-gray-600">Manage individual skill posts</p>
          </div>

          <div className="p-6">
            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1 relative">
                <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search skills..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
              <div className="relative">
                <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              <div className="relative">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            {/* Skills List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {filteredSkills.length > 0 ? (
                filteredSkills.map((skill) => (
                  <div key={skill.id} className="border border-gray-200 rounded-lg p-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 text-sm">{skill.title}</h4>
                        <p className="text-xs text-gray-600 mt-1 truncate">{skill.description}</p>
                        <div className="flex items-center space-x-4 mt-2">
                          <span className="text-xs text-gray-500">{skill.provider.name}</span>
                          <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800">
                            {skill.category}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                            skill.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {skill.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 ml-4">
                        <button
                          onClick={() => handleStatusToggle(skill.id, skill.isActive)}
                          className={`p-1 rounded transition-colors ${
                            skill.isActive
                              ? 'text-red-600 hover:bg-red-50'
                              : 'text-green-600 hover:bg-green-50'
                          }`}
                          title={skill.isActive ? 'Deactivate Skill' : 'Activate Skill'}
                        >
                          {skill.isActive ? <FaTimes size={14} /> : <FaCheck size={14} />}
                        </button>
                        <button
                          onClick={() => handleVerificationToggle(skill.id, skill.isVerified)}
                          className={`p-1 rounded transition-colors ${
                            skill.isVerified
                              ? 'text-orange-600 hover:bg-orange-50'
                              : 'text-blue-600 hover:bg-blue-50'
                          }`}
                          title={skill.isVerified ? 'Unverify Skill' : 'Verify Skill'}
                        >
                          <FaCheck size={14} />
                        </button>
                        <button
                          onClick={() => handleDeleteSkill(skill.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                          title="Delete Skill"
                        >
                          <FaTrash size={14} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <FaSearch size={32} className="text-gray-400 mx-auto mb-3" />
                  <h3 className="text-sm font-medium text-gray-900 mb-1">No skills found</h3>
                  <p className="text-xs text-gray-500">Try adjusting your search or filter criteria.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      <AddSkillModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
      />

      {/* Edit Skill Modal */}
      <AddSkillModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          setEditingCategory(null);
        }}
        editingCategory={editingCategory}
        onUpdate={() => {
          fetchSkillCategories();
          setShowEditModal(false);
          setEditingCategory(null);
        }}
      />
    </div>
  );
};

export default SkillsManagement;