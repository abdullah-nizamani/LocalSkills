import React from 'react';
import { FaStar } from 'react-icons/fa';

const OurTeam = () => {
  const teamMembers = [
    {
      name: 'Abdullah Nizamani',
      role: 'Founder & CEO',
      image: '/api/placeholder/150/150',
      bio: 'Experienced entrepreneur with a passion for connecting local communities.',
      rating: 5.0,
      skills: ['Leadership', 'Business Development', 'Community Building']
    },
    {
      name: 'Imtiaz Ali',
      role: 'Head of Operations',
      image: '/api/placeholder/150/150',
      bio: 'Ensures smooth operations and excellent user experience across the platform.',
      rating: 4.9,
      skills: ['Operations', 'Customer Service', 'Process Optimization']
    },
    {
      name: 'Muhammad Ahmed',
      role: 'Technical Lead',
      image: '/api/placeholder/150/150',
      bio: 'Full-stack developer passionate about creating innovative solutions.',
      rating: 4.8,
      skills: ['Full-Stack Development', 'System Architecture', 'Problem Solving']
    }
  ];

  return (
    <section id="our-team" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Meet Our Team
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            The passionate individuals behind LocalSkills, dedicated to connecting communities and empowering local professionals.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {teamMembers.map((member, index) => (
            <div key={index} className="bg-gray-50 rounded-lg shadow-md p-6 text-center hover:shadow-lg transition-shadow duration-300">
              <div className="w-32 h-32 mx-auto mb-4 rounded-full overflow-hidden">
                <img
                  src={member.image}
                  alt={member.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-1">
                {member.name}
              </h3>
              <p className="text-blue-600 font-medium mb-3">
                {member.role}
              </p>
              <div className="flex items-center justify-center mb-3">
                <FaStar className="text-yellow-400 mr-1" />
                <span className="text-sm font-medium">{member.rating}</span>
              </div>
              <p className="text-gray-600 mb-4 text-sm">
                {member.bio}
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                {member.skills.map((skill, skillIndex) => (
                  <span
                    key={skillIndex}
                    className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-xs"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <div className="bg-gradient-to-r from-blue-600 to-purple-700 rounded-lg p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">
              Join Our Growing Community
            </h3>
            <p className="text-xl mb-6 opacity-90">
              Whether you're a skilled professional or looking for services, LocalSkills is here to help you succeed.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors duration-200">
                Become a Service Provider
              </button>
              <button className="border-2 border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors duration-200">
                Find Local Services
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default OurTeam;