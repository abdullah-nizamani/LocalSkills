import React, { useState, useEffect } from 'react';
import { FaWindowClose, FaTools } from 'react-icons/fa';
import { toast } from 'react-toastify';

const AddSkillModal = ({ isOpen, onClose, editingCategory = null, onUpdate = null }) => {
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    hourlyRate: '',
    experience: '',
    availability: 'Flexible',
    images: []
  });
  const [users, setUsers] = useState([]);
  const [selectedProvider, setSelectedProvider] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSkillCategory, setIsSkillCategory] = useState(false);

  const categories = [
    'Plumbing', 'Electrical', 'Carpentry', 'Painting', 'Tailoring',
    'Cleaning', 'Gardening', 'Tutoring', 'Photography', 'Catering', 'Other'
  ];

  const availabilityOptions = ['Full-time', 'Part-time', 'Weekends', 'Flexible'];

  useEffect(() => {
    if (isOpen && editingCategory) {
      // Pre-fill form with editing category data
      setFormData({
        categoryName: editingCategory.name || '',
        description: editingCategory.description || '',
        icon: editingCategory.icon || ''
      });
    } else if (isOpen) {
      // Reset form for new category
      setFormData({
        categoryName: '',
        description: '',
        icon: ''
      });
    }
  }, [isOpen, editingCategory]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      const response = await fetch('http://localhost:5000/api/users?userType=worker', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (data.success) {
        setUsers(data.data.users || []);
      } else {
        toast.error('Failed to load users');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Network error. Please try again.');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.categoryName?.trim()) {
      toast.error('Please enter a skill category name');
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found');
        return;
      }

      // Category creation/update logic is now handled in the if-else block below

      if (editingCategory) {
        // Update existing category
        const existingCategories = JSON.parse(localStorage.getItem('skillCategories') || '[]');
        const updatedCategories = existingCategories.map(cat =>
          cat.id === editingCategory.id
            ? { ...cat, name: formData.categoryName, description: formData.description, icon: formData.icon }
            : cat
        );
        localStorage.setItem('skillCategories', JSON.stringify(updatedCategories));
        toast.success('Skill category updated successfully!');
        if (onUpdate) onUpdate();
      } else {
        // Add new category
        const existingCategories = JSON.parse(localStorage.getItem('skillCategories') || '[]');
        const newCategory = {
          id: Date.now().toString(),
          name: formData.categoryName.trim(),
          description: formData.description?.trim() || '',
          icon: formData.icon?.trim() || '🔧',
          isActive: true,
          createdAt: new Date().toISOString()
        };

        existingCategories.push(newCategory);
        localStorage.setItem('skillCategories', JSON.stringify(existingCategories));
        toast.success('Skill category added successfully!');
      }

      // Reset form
      setFormData({
        categoryName: '',
        description: '',
        icon: ''
      });
      onClose();
      // Refresh the page to show changes
      window.location.reload();
    } catch (error) {
      console.error('Error adding skill category:', error);
      toast.error('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <FaTools className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingCategory ? 'Edit Skill Category' : 'Add New Skill Category'}
                </h3>
                <p className="text-sm text-gray-600">
                  {editingCategory ? 'Update the skill category details' : 'Create a new skill category for workers to select'}
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2"
            >
              <FaWindowClose size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Skill Category Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Skill Category Name *
            </label>
            <input
              type="text"
              name="categoryName"
              value={formData.categoryName || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, categoryName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., Plumbing, Electrical, Carpentry"
              required
            />
            <p className="text-xs text-gray-500 mt-1">Enter the name of the skill category (e.g., Plumbing, Electrical, Carpentry)</p>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Optional description for this skill category..."
            />
          </div>

          {/* Icon Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Icon (Optional)
            </label>
            <input
              type="text"
              name="icon"
              value={formData.icon || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="e.g., 🔧, ⚡, 🛠️"
            />
            <p className="text-xs text-gray-500 mt-1">Add an emoji or icon to represent this skill category</p>
          </div>

          {/* Form Actions */}
          <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              {loading ? (editingCategory ? 'Updating Category...' : 'Adding Category...') : (editingCategory ? 'Update Category' : 'Add Category')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSkillModal;