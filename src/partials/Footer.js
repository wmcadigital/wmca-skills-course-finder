import React from 'react';

const Footer = () => {
  return (
    <footer className="wmcads-footer">
      <div className="wmcads-container wmcads-grid">
        <div className="wmcads-col-1 wmcads-col-md-1-2">
          &COPY; West Midlands Combined Authority 2022
        </div>
        <div className="wmcads-col-1 wmcads-col-md-1-2">
          <a
            href="//www.wmca.org.uk/privacy-cookies-policy/"
            title="Privacy and cookies policy"
            target="_blank"
            rel="noopener noreferrer"
            className="wmcads-footer__link wmcads-link"
          >
            Privacy &amp; Cookies Policy
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
