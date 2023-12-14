import React from "react";
import { Link } from "react-router-dom";

const Breadcrumbs = ({ breadCrumb }) => {
  const generateBreadcrumbLinks = () => {
    return breadCrumb.map((segment, index) => {
      return (
        <li key={index} className="wmcads-breadcrumb__list-item">
          {segment.path === undefined ? (
            <span
              className="wmcads-breadcrumb__link wmcads-breadcrumb__link--current"
              aria-current="page"
            >
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
          <a href="https://www.wmca.org.uk" className="wmcads-breadcrumb__link">
            Home
          </a>
        </li>
        <li className="wmcads-breadcrumb__list-item">
          <a
            href="https://www.wmca.org.uk/what-we-do/"
            className="wmcads-breadcrumb__link"
          >
            What we do
          </a>
        </li>
        <li className="wmcads-breadcrumb__list-item">
          <a
            href="https://www.wmca.org.uk/what-we-do/productivity-and-skills/"
            className="wmcads-breadcrumb__link"
          >
            Productivity and Skills
          </a>
        </li>
        {generateBreadcrumbLinks()}
      </ol>
    </nav>
  );
};

export default Breadcrumbs;
