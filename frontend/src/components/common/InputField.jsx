/**
 * @file components/common/InputField.jsx
 * @description Reusable input field component
 */

const InputField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  error,
  touched,
  placeholder,
  disabled = false,
  autoComplete,
}) => {
  const hasError = error && touched;

  return (
    <div className="mb-4">
      {label && (
        <label
          htmlFor={name}
          className="block text-sm font-medium text-gray-700 mb-1.5"
        >
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        className={`
          w-full px-4 py-2.5 rounded-lg border-2 transition-all duration-200
          focus:outline-none focus:ring-2 focus:ring-offset-0
          ${
            hasError
              ? 'border-red-500 focus:border-red-500 focus:ring-red-200'
              : 'border-gray-200 focus:border-blue-500 focus:ring-blue-200'
          }
          ${disabled ? 'bg-gray-50 cursor-not-allowed' : 'bg-white'}
        `}
      />
      {hasError && (
        <p className="text-red-500 text-sm mt-1.5">{error}</p>
      )}
    </div>
  );
};

export default InputField;
