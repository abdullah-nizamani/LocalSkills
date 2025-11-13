import React, { useState } from 'react';
import { textContent, footerServices } from '../../constants';
import { FaUpload, FaCheck } from 'react-icons/fa';
import { useAuth } from '../../contexts/AuthContext';
import FormSection from './components/FormSection';
import FormField from './components/FormField';
import ImageUpload from './components/ImageUpload';
import usePostSkill from './hooks/usePostSkill';

const PostSkill = () => {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    location: '',
    hourlyRate: '',
    phone: user?.phone || '',
    email: user?.email || '',
    experience: '',
    image: null
  });

  const [imagePreview, setImagePreview] = useState(null);
  const { submitPost, isSubmitting, fieldErrors, setFieldErrors } = usePostSkill(user);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const result = await submitPost(formData);

    if (result.success) {
      // Reset form
      setFormData({
        title: '',
        category: '',
        description: '',
        location: '',
        hourlyRate: '',
        phone: user?.phone || '',
        email: user?.email || '',
        experience: '',
        image: null
      });
      setImagePreview(null);
      setFieldErrors({});
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {textContent.postSkill.title}
            </h1>
            <p className="text-xl text-gray-600">
              {textContent.postSkill.description}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FaUpload size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Please Login</h3>
            <p className="text-gray-600">You need to be logged in as a worker to post skills.</p>
          </div>
        </div>
      </div>
    );
  }

  if (user.userType !== 'worker') {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              {textContent.postSkill.title}
            </h1>
            <p className="text-xl text-gray-600">
              {textContent.postSkill.description}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <FaUpload size={48} className="text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Access Restricted</h3>
            <p className="text-gray-600">Only workers can post skills. Please contact support if you need to change your account type.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-blue-100 border border-blue-200 mb-4">
            <FaUpload className="text-blue-600 mr-2" />
            <span className="text-sm font-medium text-blue-700">Post</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Create Your Post
            </span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            {textContent.postSkill.description}
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            <FormSection title="Post Details">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  className="md:col-span-2"
                  label="Post Title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  placeholder="e.g., Professional Plumbing Services"
                  required
                  error={fieldErrors.title}
                />

                <FormField
                  label="Category"
                  name="category"
                  type="select"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select a category</option>
                  {footerServices.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </FormField>

                <FormField
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="e.g., Karachi, Pakistan"
                  required
                />

                <FormField
                  className="md:col-span-2"
                  label="Description"
                  name="description"
                  type="textarea"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Describe your skills, experience, and services offered..."
                  rows={5}
                  required
                  error={fieldErrors.description}
                />

                <FormField
                  label="Hourly Rate (USD)"
                  name="hourlyRate"
                  type="number"
                  value={formData.hourlyRate}
                  onChange={handleInputChange}
                  placeholder="25"
                  min="1"
                  required
                  error={fieldErrors.hourlyRate}
                >
                  <span className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-500 font-medium">$</span>
                </FormField>

                <FormField
                  label="Years of Experience"
                  name="experience"
                  type="number"
                  value={formData.experience}
                  onChange={handleInputChange}
                  placeholder="5"
                  min="0"
                />
              </div>
            </FormSection>


            <ImageUpload
              onChange={handleImageChange}
              preview={imagePreview}
              onRemove={() => {
                setImagePreview(null);
                setFormData(prev => ({ ...prev, image: null }));
              }}
            />

            {/* Submit Button */}
            <div className="pt-8">
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 px-6 rounded-xl font-semibold text-lg hover:from-purple-600 hover:to-blue-600 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                    Creating Post...
                  </>
                ) : (
                  <>
                    <FaCheck className="mr-3" />
                    Create Post
                  </>
                )}
              </button>

              <div className="mt-4 text-center">
                <p className="text-sm text-gray-500">
                  Your post will be reviewed and published within 24 hours
                </p>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostSkill;