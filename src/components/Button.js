import React from 'react';

function Button({ children, className = '', ...rest }) {
  return (
    <button
      className={`bg-primary text-white px-10 py-2 rounded-md hover:bg-primary ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;