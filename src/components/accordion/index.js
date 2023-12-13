import PropTypes from "prop-types";
import React, { useState } from 'react';

const Accordion = ({ChildComponent, title, isOpenByDefault, index }) => {
  const [isOpen, setIsOpen] = useState(isOpenByDefault);

  const toggleAccordion = () => {
    setIsOpen((prevIsOpen) => !prevIsOpen);
  };

  return (
    <div className={`wmcads-accordion ${!isOpen ? 'wmcads-is--open' : ''}`}>
      <button
        onClick={toggleAccordion}
        aria-controls={`accordion-${index}`}
        className="wmcads-accordion__summary-wrapper"
        aria-expanded={isOpen}
      >
        {/* accordion summary */}
        <div className="wmcads-accordion__summary">
          <h4 className="wmcads-m-b-none">{title}</h4>
        </div>
        {/* plus icon */}
        <svg className="wmcads-accordion__icon">
          <use xlinkHref="#wmcads-general-expand" href="#wmcads-general-expand"></use>
        </svg>
        {/* minus icon */}
        <svg className="wmcads-accordion__icon wmcads-accordion__icon--minimise">
          <use xlinkHref="#wmcads-general-minimise" href="#wmcads-general-minimise"></use>
        </svg>
      </button>

      {/* accordion content */}

      { ChildComponent }
    </div>
  );
};

const AccordionComponent = ({ ChildComponent, data }) => {
  return (
    <>
      <Accordion ChildComponent={ChildComponent} title={data.title} index={data.index} isOpenByDefault={data.isOpen} />
    </>
  );
};


AccordionComponent.propTypes = {
  content: PropTypes.string,
  data: PropTypes.array,
  isOpenByDefault: PropTypes.bool,
};

Accordion.propTypes = {
  index: PropTypes.number,
  content: PropTypes.string,
  isOpenByDefault: PropTypes.bool,
  title: PropTypes.string,
};

export default AccordionComponent;
