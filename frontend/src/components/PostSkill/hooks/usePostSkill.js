import { useState } from 'react';
import { toast } from 'react-toastify';

const usePostSkill = (user) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});

  const submitPost = async (formData) => {
    setIsSubmitting(true);
    setFieldErrors({});

    // Check if user is authenticated
    if (!user) {
      toast.error('Please login to post a skill');
      setIsSubmitting(false);
      return;
    }

    // Basic validation
    if (!formData.title || !formData.category || !formData.description ||
        !formData.location || !formData.hourlyRate) {
      toast.error('Please fill in all required fields');
      setIsSubmitting(false);
      return;
    }

    try {
      const token = user.token || localStorage.getItem('token');
      if (!token) {
        toast.error('Authentication token not found. Please login again.');
        setIsSubmitting(false);
        return;
      }

      const skillData = {
        title: formData.title.trim(),
        category: formData.category,
        description: formData.description.trim(),
        location: formData.location.trim(),
        hourlyRate: parseFloat(formData.hourlyRate),
        experience: formData.experience || '',
        tags: [] // Will be populated from description or category
      };

      const response = await fetch('http://localhost:5000/api/skills', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(skillData),
      });

      const data = await response.json();

      if (data.success) {
        toast.success('Skill posted successfully! It will be reviewed and published soon.');
        return { success: true };
      } else {
        console.error('Validation errors:', data.errors);
        if (data.errors && data.errors.length > 0) {
          // Map validation errors to field-specific errors
          const errors = {};
          data.errors.forEach(err => {
            // Map error messages to field names based on the error message content
            if (err.msg.includes('Title must be between')) {
              errors.title = err.msg;
            } else if (err.msg.includes('Description must be between')) {
              errors.description = err.msg;
            } else if (err.msg.includes('Hourly rate must be at least')) {
              errors.hourlyRate = err.msg;
            } else if (err.msg.includes('Invalid category')) {
              errors.category = err.msg;
            } else if (err.msg.includes('Location is required')) {
              errors.location = err.msg;
            }
          });
          setFieldErrors(errors);
          toast.error('Please check the form for errors and try again.');
        } else {
          toast.error(data.message || 'Failed to create post. Please try again.');
        }
        return { success: false };
      }
    } catch (error) {
      console.error('Post skill error:', error);
      toast.error('Network error. Please try again.');
      return { success: false };
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    submitPost,
    isSubmitting,
    fieldErrors,
    setFieldErrors
  };
};

export default usePostSkill;