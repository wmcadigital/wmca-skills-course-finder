import React from 'react';

const Breadcrumbs = () => {
  return (
    <nav aria-label="Breadcrumbs" className="wmcads-breadcrumb">
      <ol className="wmcads-breadcrumb__list">
        <li className="wmcads-breadcrumb__list-item">
          <a href="/" className="wmcads-breadcrumb__link">
            Home
          </a>
        </li>
        <li className="wmcads-breadcrumb__list-item">
          <a href="/components" className="wmcads-breadcrumb__link wmcads-breadcrumb__link--current" aria-current="page">
            Components
          </a>
        </li>
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
