import React, { useState, useEffect } from 'react';
import SkillCard from './components/SkillCard';
import { textContent, footerServices } from '../../constants';
import { FaSearch, FaFilter, FaTools } from 'react-icons/fa';
import { toast } from 'react-toastify';

const SkillsList = () => {
  const [skills, setSkills] = useState([]);
  const [filteredSkills, setFilteredSkills] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch real skills from API
  useEffect(() => {
    const fetchSkills = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch('http://localhost:5000/api/skills');
        const data = await response.json();

        if (data.success) {
          // Transform API data to match component expectations
          const transformedSkills = data.data.skills.map(skill => ({
            id: skill._id,
            title: skill.title,
            category: skill.category,
            description: skill.description,
            location: skill.location,
            rating: skill.provider?.profile?.rating || 0,
            reviews: skill.provider?.profile?.reviewCount || 0,
            hourlyRate: skill.hourlyRate,
            image: skill.images?.[0] || '/api/placeholder/400/250',
            contact: {
              phone: skill.provider?.phone,
              email: skill.provider?.email
            },
            provider: skill.provider,
            createdAt: skill.createdAt
          }));

          setSkills(transformedSkills);
          setFilteredSkills(transformedSkills);
        } else {
          setError(data.message || 'Failed to load skills');
          toast.error('Failed to load skills');
        }
      } catch (error) {
        console.error('Error fetching skills:', error);
        setError('Network error. Please try again.');
        toast.error('Network error. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchSkills();
  }, []);

  useEffect(() => {
    let filtered = skills;

    if (searchTerm) {
      filtered = filtered.filter(skill =>
        skill.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        skill.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(skill => skill.category === selectedCategory);
    }

    setFilteredSkills(filtered);
  }, [searchTerm, selectedCategory, skills]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F3F2EF] py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-8">
            <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 border border-blue-200 mb-4">
              <FaTools className="text-blue-600 mr-2" />
              <span className="text-sm font-medium text-blue-700">Loading Skills</span>
            </div>
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-lg text-gray-600">Finding the best local skills for you...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F3F2EF] py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaTools size={28} className="text-red-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">Unable to Load Skills</h3>
            <p className="text-gray-600 mb-6">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="bg-[#0A66C2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#004182] transition-colors duration-200"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F3F2EF] py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header
        <div className="text-center mb-8">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 border border-blue-200 mb-4">
            <FaTools className="text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-700">Available Skills</span>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            <span className="text-[#0A66C2]">
              Find Local Experts
            </span>
          </h1>
          <p className="text-lg text-gray-600">
            {textContent.skillsList.description}
          </p>
        </div> */}

        {/* Search and Filter */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6 border border-gray-200">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1 relative">
              <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder={textContent.skillsList.searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent bg-gray-50 hover:bg-white transition-colors"
              />
            </div>
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="pl-10 pr-8 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0A66C2] focus:border-transparent appearance-none bg-gray-50 hover:bg-white transition-colors min-w-48"
              >
                <option value="All">{textContent.skillsList.filterByCategory}</option>
                {footerServices.map(category => (
                  <option key={category} value={category}>{category}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <p className="text-gray-600 font-medium">
              Showing {filteredSkills.length} of {skills.length} skills
            </p>
            {filteredSkills.length > 0 && (
              <div className="flex items-center text-sm text-gray-500">
                <FaTools className="mr-2" />
                <span>Verified professionals</span>
              </div>
            )}
          </div>
        </div>

        {/* Skills Feed */}
        {filteredSkills.length > 0 ? (
          <div className="space-y-4">
            {filteredSkills.map((skill, index) => (
              <SkillCard key={skill.id || index} skill={skill} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <FaSearch size={28} className="text-gray-400" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">No skills found</h3>
            <p className="text-gray-600 mb-6">Try adjusting your search or filter criteria.</p>
            <button
              onClick={() => {
                setSearchTerm('');
                setSelectedCategory('All');
              }}
              className="bg-[#0A66C2] text-white px-6 py-3 rounded-lg font-semibold hover:bg-[#004182] transition-colors duration-200"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SkillsList;