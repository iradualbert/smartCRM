import React, { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input: React.FC<InputProps> = (props) => {
    return (
        <input
            {...props}
            className="p-2 border border-gray-300 rounded mb-4"
        />
    );
};
