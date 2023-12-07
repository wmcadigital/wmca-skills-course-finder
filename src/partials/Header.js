import React from 'react';

const Header = () => {
  return (
    <header className="wmcads-header">
      <div className="wmcads-container wmcads-grid wmcads-grid--align-center wmcads-grid--justify-between">
        <div className="wmcads-header__vertical-align wmcads-col-auto">
          <a
            className="wmcads-header__logo-link"
            href="//wmca.org.uk"
            title="West Midlands Combined Authority Home"
          >
            <img
              className="wmcads-header__logo"
              alt="West Midlands Combined Authority logo"
              src="https://cloudcdn.wmca.org.uk/wmcaassets/ds/1.5.0/img/logo.svg"
            />
          </a>
        </div>
        <h1 className="wmcads-header__title wmcads-col-1 wmcads-col-sm-auto"></h1>
      </div>
    </header>
  );
};

export default Header;
