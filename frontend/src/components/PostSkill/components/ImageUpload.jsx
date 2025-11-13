import React from 'react';
import { FaUpload } from 'react-icons/fa';

const ImageUpload = ({
  onChange,
  preview,
  onRemove,
  label = "Service Image (Optional)",
  className = ""
}) => {
  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="flex items-center space-x-4">
        <div className="flex-1">
          <input
            type="file"
            accept="image/*"
            onChange={onChange}
            className="hidden"
            id="image-upload"
          />
          <label
            htmlFor="image-upload"
            className="flex items-center justify-center w-full px-6 py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-all duration-200"
          >
            <FaUpload className="mr-3 text-gray-400 text-lg" />
            <div className="text-center">
              <div className="text-gray-600 font-medium">Choose an image</div>
              <div className="text-sm text-gray-500">PNG, JPG up to 5MB</div>
            </div>
          </label>
        </div>
        {preview && (
          <div className="relative">
            <div className="w-24 h-24 rounded-xl overflow-hidden shadow-lg">
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            </div>
            <button
              onClick={onRemove}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600 transition-colors"
            >
              ×
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImageUpload;