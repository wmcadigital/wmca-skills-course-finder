import React, { useState, useEffect } from 'react';
import { useLocation, useHistory } from 'react-router-dom';
import AppLayout from '../../layout/index';
import apiCourses from '../../services/apiCourses';


const itemsPerPage = 10;
const maxIndexButtons = 5;

const Page = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);

  const [searchTerm, setSearchTerm] = useState('');
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    // Update the URL when the page or search term changes
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('page', currentPage);
    newSearchParams.set('search', searchTerm);
    // Use replaceState to prevent adding a new entry to the history stack
    window.history.replaceState({}, '', `?${newSearchParams.toString()}`);
  }, [currentPage, searchTerm]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await apiCourses.getData();
        setCourses(data);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []); // The empty dependency array means this effect runs once after the initial render

  const handleNextPage = () => {
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePrevPage = () => {
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleJumpToPage = (page) => {
    setCurrentPage(page);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1); // Reset to the first page when the search term changes
  };

  const generatePageIndexButtons = () => {
    const buttons = [];
    const totalPagesForCourses = Math.ceil(courses.length / itemsPerPage);
    const halfMaxButtons = Math.floor(maxIndexButtons / 2);

    let startPage = Math.max(currentPage - halfMaxButtons, 1);
    let endPage = Math.min(startPage + maxIndexButtons - 1, totalPagesForCourses);

    if (endPage - startPage < maxIndexButtons - 1) {
      startPage = Math.max(endPage - maxIndexButtons + 1, 1);
    }

    if (startPage > 1) {
      buttons.push(
        <button key={1} onClick={() => handleJumpToPage(1)} disabled={1 === currentPage}>
          1
        </button>
      );

      if (startPage > 2) {
        buttons.push(
          <button key="prevDots" disabled>
            ...
          </button>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button key={i} onClick={() => handleJumpToPage(i)} disabled={i === currentPage}>
          {i}
        </button>
      );
    }

    if (endPage < totalPagesForCourses) {
      if (endPage < totalPagesForCourses - 1) {
        buttons.push(
          <button key="nextDots" disabled>
            ...
          </button>
        );
      }

      buttons.push(
        <button key={totalPagesForCourses} onClick={() => handleJumpToPage(totalPagesForCourses)} disabled={totalPagesForCourses === currentPage}>
          {totalPagesForCourses}
        </button>
      );
    }

    return buttons;
  };

  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, courses.length);
  const currentItems = courses.slice(startIndex, endIndex);
  const totalPages = Math.ceil(courses.length / itemsPerPage);


  return (
    <div>
      <div>
        <input type="text" placeholder="Search" value={searchTerm} onChange={handleSearchChange} />
        {currentItems.map((item, index) => (
          <div>
            <div key={index}>{item.CourseDescription}</div>
            <p>-------------------------------------------</p>
          </div>
        ))}
        <p>{`Showing ${startIndex + 1} to ${endIndex} of `}<strong>{`${courses.length}`}</strong> courses</p>
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
}


const Pag = () => {

  const breadCrumb = [
    {
      name: 'Course Finder',
    }
  ]
  const WrappedComponent = AppLayout(Page, { breadCrumb });
  return <WrappedComponent />;
};

export default Pag;


