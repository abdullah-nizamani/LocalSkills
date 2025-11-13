import React from 'react';

const BioSkills = ({ 
  profile, 
  isEditing, 
  editForm, 
  onInputChange, 
  onSkillsChange, 
  addSkill, 
  removeSkill,
  isOwnProfile
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-6 border border-gray-200">
      <h3 className="text-xl font-semibold text-gray-900 mb-4">About Me</h3>
      {isEditing ? (
        <textarea
          name="bio"
          value={editForm.bio}
          onChange={onInputChange}
          rows={4}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-6"
          placeholder="Tell us about yourself..."
        />
      ) : (
        <p className="text-gray-700 mb-6">{profile.bio}</p>
      )}

      {profile.userType === 'worker' && (
        <>
          <h3 className="text-xl font-semibold text-gray-900 mb-4">Skills</h3>
          <div className="space-y-2">
            {editForm.skills.map((skill, index) => (
              <div key={index} className="flex items-center">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      value={skill}
                      onChange={(e) => onSkillsChange(index, e.target.value)}
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Skill"
                    />
                    <button
                      onClick={() => removeSkill(index)}
                      className="ml-2 text-red-600 hover:text-red-800 w-8 h-8 flex items-center justify-center"
                    >
                      ×
                    </button>
                  </>
                ) : (
                  <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
                    {skill}
                  </span>
                )}
              </div>
            ))}
            {isEditing && (
              <button
                onClick={addSkill}
                className="text-blue-600 hover:text-blue-800 font-medium flex items-center mt-2"
              >
                + Add Skill
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default BioSkills;