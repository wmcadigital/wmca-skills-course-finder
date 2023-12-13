import React from 'react';

const CheckboxComponent = ({ options, accordionIndex, onCheckboxChange }) => {
  return (
    <div className="wmcads-accordion__content" id={`accordion-Date-${accordionIndex}`}>
      <fieldset className="wmcads-fe-fieldset">
        <div className="wmcads-fe-checkboxes">
          {options.map((option, checkboxIndex) => (
            <label key={checkboxIndex} className="wmcads-fe-checkboxes__container">
              {option.name}
              <input
                className="wmcads-fe-checkboxes__input"
                checked={option.checked}
                value={option}
                type="checkbox"
                onChange={() => onCheckboxChange(accordionIndex, checkboxIndex)}
              />
              <span className="wmcads-fe-checkboxes__checkmark">
                <svg className="wmcads-fe-checkboxes__icon">
                  <use href="#wmcads-general-checkmark"></use>
                </svg>
              </span>
            </label>
          ))}
        </div>
      </fieldset>
    </div>
  );
};

export default CheckboxComponent;