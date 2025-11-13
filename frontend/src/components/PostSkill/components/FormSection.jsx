import React from 'react';

const FormSection = ({ title, children, className = "" }) => {
  return (
    <div className={`space-y-6 ${className}`}>
      {title && (
        <h2 className="text-2xl font-semibold text-gray-900 mb-6">
          {title}
        </h2>
      )}
      {children}
    </div>
  );
};

export default FormSection;