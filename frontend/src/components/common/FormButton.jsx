/**
 * @file components/common/FormButton.jsx
 * @description Button component with loading state
 */

const FormButton = ({
  type = 'submit',
  isLoading = false,
  disabled = false,
  children,
  className = '',
  variant = 'primary',
}) => {
  const baseClass = `
    w-full py-2.5 px-4 rounded-lg font-medium transition-all duration-200
    focus:outline-none focus:ring-2 focus:ring-offset-2
    flex items-center justify-center gap-2
  `;

  const variants = {
    primary: `
      bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500
      disabled:bg-gray-400 disabled:cursor-not-allowed
    `,
    secondary: `
      bg-gray-200 text-gray-800 hover:bg-gray-300 focus:ring-gray-500
      disabled:bg-gray-100 disabled:cursor-not-allowed disabled:text-gray-400
    `,
  };

  return (
    <button
      type={type}
      disabled={disabled || isLoading}
      className={`${baseClass} ${variants[variant]} ${className}`}
    >
      {isLoading ? (
        <>
          <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" opacity="0.25" />
            <path
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {children}
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default FormButton;
