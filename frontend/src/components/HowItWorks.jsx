import React from 'react';
import { howItWorksSteps, textContent } from '../constants';

const HowItWorks = () => {
  const { howItWorks } = textContent;

  return (
    <section id="how-it-works" className="py-16 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            {howItWorks.title}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {howItWorks.description}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {howItWorksSteps.map((step, index) => (
            <div key={index} className="text-center">
              <div className={`w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-r ${step.color} flex items-center justify-center text-3xl`}>
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                {step.title}
              </h3>
              <p className="text-gray-600">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="bg-gray-50 rounded-lg p-8">
          <h3 className="text-2xl font-bold text-gray-900 text-center mb-8">
            {howItWorks.additionalTitle}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold text-blue-600 mb-2">
                {howItWorks.stats.availability}
              </div>
              <div className="text-gray-600">
                {howItWorks.stats.availabilityLabel}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-600 mb-2">
                {howItWorks.stats.satisfaction}
              </div>
              <div className="text-gray-600">
                {howItWorks.stats.satisfactionLabel}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-600 mb-2">
                {howItWorks.stats.deliveryTime}
              </div>
              <div className="text-gray-600">
                {howItWorks.stats.deliveryTimeLabel}
              </div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-orange-600 mb-2">
                1000+
              </div>
              <div className="text-gray-600">
                Active Users
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;