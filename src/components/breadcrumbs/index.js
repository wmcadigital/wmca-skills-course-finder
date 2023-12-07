import React from 'react';
import { Link} from 'react-router-dom';

const Breadcrumbs = ({ breadCrumb }) => {
  
  const generateBreadcrumbLinks = () => {
    return breadCrumb.map((segment, index) => {
      return (
        <li key={index} className="wmcads-breadcrumb__list-item">
          {segment.path === undefined ? (
            <span className="wmcads-breadcrumb__link wmcads-breadcrumb__link--current" aria-current="page">
              {segment.name}
            </span>
          ) : (
            <Link to={segment.path} className="wmcads-breadcrumb__link">
              {segment.name}
            </Link>
          )}
        </li>
      );
    });
  };

  return (
    <nav aria-label="Breadcrumbs" className="wmcads-breadcrumb">
      <ol className="wmcads-breadcrumb__list">
        <li className="wmcads-breadcrumb__list-item">
          <Link to="/" className="wmcads-breadcrumb__link">
            Home
          </Link>
        </li>
        {generateBreadcrumbLinks()}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;