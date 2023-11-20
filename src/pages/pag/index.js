import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import AppLayout from '../../layout/index';


const itemsPerPage = 3;
const totalItems = 30;
const totalPages = Math.ceil(totalItems / itemsPerPage);

const maxIndexButtons = 5;

const Page = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;

  const [currentPage, setCurrentPage] = useState(initialPage);

  useEffect(() => {
    // Update the URL when the page changes
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('page', currentPage);
    // Use replaceState to prevent adding a new entry to the history stack
    window.history.replaceState({}, '', `?${newSearchParams.toString()}`);
  }, [currentPage]);

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleJumpToPage = (page) => {
    setCurrentPage(page);
  };

  const generatePageIndexButtons = () => {
    const buttons = [];
    const halfMaxButtons = Math.floor(maxIndexButtons / 2);

    let startPage = Math.max(currentPage - halfMaxButtons, 1);
    let endPage = Math.min(startPage + maxIndexButtons - 1, totalPages);

    if (endPage - startPage < maxIndexButtons - 1) {
      startPage = Math.max(endPage - maxIndexButtons + 1, 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button key="prevDots" disabled>
          ...
        </button>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button key={i} onClick={() => handleJumpToPage(i)} disabled={i === currentPage}>
          {i}
        </button>
      );
    }

    if (endPage < totalPages) {
      buttons.push(
        <button key="nextDots" disabled>
          ...
        </button>
      );
    }

    return buttons;
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, totalItems);
  const currentItems = Array.from({ length: endIndex - startIndex }, (_, index) => `Item ${startIndex + index + 1}`);

  return (
    <div>
      <div>
        {currentItems.map((item, index) => (
          <div key={index}>{item}</div>
        ))}
      </div>
      <div>
        <button onClick={handlePrevPage} disabled={currentPage === 1}>
          Previous
        </button>
        {generatePageIndexButtons()}
        <button onClick={handleNextPage} disabled={currentPage === totalPages}>
          Next
        </button>
      </div>
    </div>
  );
};


const Pag = () => {
  const WrappedComponent = AppLayout(Page);
  return <WrappedComponent />;
};

export default Pag;
