import React from 'react';
import Header from '../partials/Header';
import Footer from '../partials/Footer';
import Breadcrumbs from '../components/breadcrumbs/index'

const AppLayout = (WrappedComponent) => {
  return (props) => (
    <div>
      <Header />
      <div className="wmcads-container">
        <Breadcrumbs />
        {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <WrappedComponent {...props} />
      </div>
      <Footer />
    </div>
  );
};

export default AppLayout;
