import React from 'react';
import Header from '../partials/Header';
import Footer from '../partials/Footer';
import Breadcrumbs from '../components/breadcrumbs/index'

const AppLayout = (WrappedComponent, { breadCrumb }) => {
  return (props) => (
    <div>
      <Header />
      <div className={`wmcads-container`}>
        <Breadcrumbs breadCrumb={ breadCrumb } />
      </div>
      <main className="wmcads-container wmcads-container--main">
      {/* eslint-disable-next-line react/jsx-props-no-spreading */}
        <WrappedComponent {...props} />
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
