import React from 'react';
import AppLayout from '../../layout/index';

const Page = () => {
  return (
    <main>
      {/* Your dynamic content for different pages goes here */}
      <h1>NVQ Diploma in Professional Cookery (Patisserie and Confectionery) Level 3</h1>
      <form class="wmcads-search-bar">
        <input aria-label="Search" type="text" class="wmcads-search-bar__input wmcads-fe-input" placeholder="Blog search..." />
        <button
          className="wmcads-search-bar__btn"
          type="submit"
          onClick={(e) => {
            e.preventDefault();
          }}
        >
          <svg>
            <title>Search</title>
            <use
              xlinkHref="#wmcads-general-search"
              href="#wmcads-general-search"
            ></use>
          </svg>
        </button>
      </form>
    </main>
  );
};

const Course = () => {
  const WrappedComponent = AppLayout(Page);
  return <WrappedComponent />;
};

export default Course;
