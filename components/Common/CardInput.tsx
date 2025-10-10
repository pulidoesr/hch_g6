// src/components/common/CardInput.tsx
import React from 'react';

/**
 * Reusable input component for the credit card form.
 */
const CardInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label: string }> = ({ label, id, ...props }) => (
    <div className="flex flex-col mb-4">
        <label htmlFor={id} className="text-sm font-medium text-gray-700 mb-1">
            {label} <span className="text-red-500">*</span>
        </label>
        <input
            id={id}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-amber-500 focus:border-amber-500 border-gray-300"
            {...props}
        />
    </div>
);

export default CardInput;