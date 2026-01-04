import '../styles/multiselectcheckbox.css';

export const CheckBox = ({
  id,
  label,
  checked,
  onChange,
  color = "black",
  className = "",
}) => (
  <div
    className={`form-check d-flex align-items-center gap-2 checkbox-container ${className}`}
    onClick={() => onChange({ target: { checked: !checked } })}
  >
    <input
      className={`form-check-input checkbox-input ${color === "black" ? "checkbox-black" : "checkbox-blue"}`}
      type="checkbox"
      id={id}
      checked={checked}
      onChange={onChange}
      onClick={(e) => e.stopPropagation()}
    />
    <label
      className={`form-check-label fw-medium checkbox-label ${color === "black" ? "checkbox-black" : "checkbox-blue"}`}
      htmlFor={id}
    >
      {label}
    </label>
  </div>
);
