/**
 * @file components/Auth/LoginFormField.jsx
 * @description Reusable form field with icon and validation
 */

const LoginFormField = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  onBlur,
  placeholder,
  icon: Icon,
  error,
  touched,
  rightElement,
  className = '',
}) => {
  const hasError = error && touched;

  return (
    <div className={`lp-field fade-up ${className}`}>
      <label className="lp-label">{label}</label>
      <div className="lp-input-wrap">
        {Icon && <span className="lp-input-icon"><Icon /></span>}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          placeholder={placeholder}
          className={`lp-input${hasError ? ' has-error' : ''}`}
          style={rightElement ? { paddingRight: 48 } : {}}
        />
        {rightElement}
      </div>
      {hasError && <p className="lp-error">⚠ {error}</p>}
    </div>
  );
};

export default LoginFormField;
