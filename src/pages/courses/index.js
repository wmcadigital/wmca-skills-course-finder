import React from 'react';
import AppLayout from '../../layout/index';

const Page = () => {
  return (
    <main>
      {/* Your dynamic content for different pages goes here */}
      <h1>Find courses for jobs</h1>
    </main>
  );
};

const Courses = () => {
  const WrappedComponent = AppLayout(Page);
  return <WrappedComponent />;
};

export default Courses;
