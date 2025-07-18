import React from 'react';
const Button = ({ children, variant = 'primary', size = 'md', disabled = false, className = '', ...props }) => {
  const base = `btn-${variant} btn-${size}`;
  const disabledClass = disabled ? 'btn-disabled' : '';
  return (
    <button
      className={`${base} ${disabledClass} ${className}`.trim()}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;
