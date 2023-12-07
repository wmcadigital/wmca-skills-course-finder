import React, { useEffect, useState } from 'react';
import AppLayout from '../../layout/index';
import apiCoursesService from '../../services/apiCoursesService'
import moment from 'moment';
import AccordionComponent from '../../components/accordion'
import CheckboxComponent from '../../components/checkbox'
import { useLocation, Link } from 'react-router-dom';

const itemsPerPage = 10;
const maxIndexButtons = 5;

const searchCourses = (courses, searchTerm) => {
  const searchTermRegex = new RegExp(`\\b${searchTerm}`, "i");
  return courses.filter((course) =>
    searchTermRegex.test(course.CourseName)
  );
};

const filterCourses = (courses, studyModes, filterType) => {
  return courses.filter(course => studyModes.includes(course[filterType]));
};

const Page = () => {
  const [courses, setCourses] = useState([]);
  const [getCourses, setGetCourses] = useState([]);
  const [coursesCount, setCoursesCount] = useState(0);
  const [accordionData, setAccordionData] = useState([
    {
      title: 'Course type', type: 'courseType', checkbox: [
        { name: 'Online', checked: false },
        { name: 'Classroom based', checked: false },
        { name: 'Work based', checked: false }
      ],
    },
    {
      title: 'Course hours', type: 'courseHours', checkbox: [
        { name: 'Full-Time', checked: false },
        { name: 'Part-Time', checked: false },
        { name: 'Flexible', checked: false }
      ],
    },
    {
      title: 'Course study time', type: 'courseStudyTime', checkbox: [
        { name: 'Daytime', checked: false },
        { name: 'Evening', checked: false },
        { name: 'Weekend', checked: false },
        { name: 'Day or block release', checked: false }
      ],
    },
  ]);
  
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialPage = parseInt(searchParams.get('page'), 10) || 1;
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [loading, setLoading] = useState(false);
  
  const [filter, setFilter] = useState({
    sort: "",
    courseType: [],
    courseHours: [],
    courseStudyTime: [],
    searchTerm: ''
  });




  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await apiCoursesService.getData();
        setLoading(false);
        setGetCourses(data); 
        setCourses(data); 
        setCoursesCount(data.length); 
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    
    fetchData();
  }, []); // The empty dependency array means this effect runs once after the initial render

  useEffect(() => {
    // Update the URL when the page or search term changes
    const newSearchParams = new URLSearchParams();
    newSearchParams.set('page', currentPage);
    newSearchParams.set('search', filter.searchTerm);
    newSearchParams.set('courseType', filter.courseType);
    newSearchParams.set('courseHours', filter.courseHours);
    newSearchParams.set('courseStudyTime', filter.courseStudyTime);

    // Use replaceState to prevent adding a new entry to the history stack
    window.history.replaceState({}, '', `?${newSearchParams.toString()}`);
  }, [currentPage, filter]);

  useEffect(() => {

    let coursesFiltered = getCourses;
    
    if (filter.searchTerm) {
      setCurrentPage(1);
      coursesFiltered = searchCourses(coursesFiltered, filter.searchTerm)
    }
    
    if (filter.courseType.length) {
      setCurrentPage(1);
      coursesFiltered = filterCourses(coursesFiltered, filter.courseType, 'DeliverModeType' )
    }

    if (filter.courseHours.length) {
      setCurrentPage(1);
      coursesFiltered = filterCourses(coursesFiltered, filter.courseHours, 'StudyModeType')
    }

    if (filter.courseStudyTime.length) {
      setCurrentPage(1);
      coursesFiltered = filterCourses(coursesFiltered, filter.courseStudyTime, 'AttendancePatternType')
    }

    setCourses(coursesFiltered)
    setCoursesCount(coursesFiltered.length);

  }, [filter, getCourses]);




  const handleCheckboxChange = (accordionIndex, checkboxIndex) => {
    const updatedAccordionData = [...accordionData];
    updatedAccordionData[accordionIndex].checkbox[checkboxIndex].checked = !updatedAccordionData[accordionIndex].checkbox[checkboxIndex].checked;

    // The array you want to push into courseType
    const newArray = updatedAccordionData[accordionIndex].checkbox[checkboxIndex]
    const type = updatedAccordionData[accordionIndex].type

    // // Check if newArray is checked, then add or remove from courseType
    const updatedCourseType = newArray.checked
      ? [...filter[type], newArray.name]
      : filter[type].filter((type) => type !== newArray.name);

    // // Create a new state object with the updated courseType array
    // const updatedFilter = { ...filter, courseType: updatedCourseType };

    setFilter((prevFilter) => ({
      ...prevFilter,
      [type]: updatedCourseType,
    })); 
    setAccordionData(updatedAccordionData);
  };
  

  const coursesCountAmount = () => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = Math.min(startIndex + itemsPerPage, courses.length);
    const currentCourseItems = courses.slice(startIndex, endIndex);

    if (coursesCount > 1) {
      return (<p class="course-count">Showing 1 to {currentCourseItems.length} of <strong>{coursesCount}</strong> courses</p>)
    // return (<p class="load-block"></p>)
    } else if (coursesCount === 1) {
    } else {
      return (<p class="load-block pulse"></p>)
    }

  }

  const corsesDuration = (course) => {
    return (`${course.DurationValue} ${course.DurationUnitType}, ${course.StudyModeType} (${course.AttendancePatternType})`)
  }

  const isFlexible = (course) => {
    const date = moment(course.StartDate);
    const formattedDate = date.format("MMMM Do YYYY");
    return (course.StartDate === null ? 'Flexible' : formattedDate)
  }

  const createExcerpt = (text, maxLength) => {
    if (text === null) return;
    if (text.length <= maxLength) {
      return text;
    } else {
      const lastSpaceIndex = text.lastIndexOf(' ', maxLength - 4);
      // Trim the text to the last space and add "..."
      return text.substring(0, lastSpaceIndex) + '...';
    }
  }
  const handleNextPage = (e) => {
    e.preventDefault();
    setCurrentPage((prevPage) => Math.min(prevPage + 1, totalPages));
  };

  const handlePrevPage = (e) => {
    e.preventDefault();
    setCurrentPage((prevPage) => Math.max(prevPage - 1, 1));
  };

  const handleJumpToPage = (e, page) => {
    e.preventDefault();
    setCurrentPage(page);
  };

  const generatePageIndexPagination = () => {
    const Li = [];
    const totalPagesForcourses = Math.ceil(courses.length / itemsPerPage);
    const halfMaxButtons = Math.floor(maxIndexButtons / 2);

    let startPage = Math.max(currentPage - halfMaxButtons, 1);
    let endPage = Math.min(startPage + maxIndexButtons - 1, totalPagesForcourses);

    if (endPage - startPage < maxIndexButtons - 1) {
      startPage = Math.max(endPage - maxIndexButtons + 1, 1);
    }

    if (startPage > 1) {
      Li.push(
        <li key="prevDots" className="wmcads-pagination__item">
          ...
        </li>
      );
    }

    for (let i = startPage; i <= endPage; i++) {
      Li.push(
        <li key={i} className={i === currentPage ? "wmcads-pagination__item" : "wmcads-pagination__item"}>
          {i === currentPage ? (
            i
          ) : (
            <a onClick={(e) => handleJumpToPage(e, i)} className="wmcads-link" href="#">
              {i}
            </a>
          )}
        </li>
      );
    }

    if (endPage < totalPagesForcourses) {
      Li.push(
        <li key="nextDots" className="wmcads-pagination__item">
          ...
        </li>
      );
    }
    return Li;
  };

  const clearFilters = () => {
    setFilter({
      sort: "",
      courseType: [],
      courseHours: [],
      courseStudyTime: [],
      searchTerm: ''
    });

    let accordionDataCleared = []

    accordionData.map(type => { 
      type.checkbox.map(checkbox => {
        checkbox.checked = false
        return checkbox
      })
      accordionDataCleared.push(type)
    })

    setAccordionData(accordionDataCleared)
  
  }


  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = Math.min(startIndex + itemsPerPage, courses.length);
  const currentCourseItems = courses.slice(startIndex, endIndex);
  const totalPages = Math.ceil(courses.length / itemsPerPage);

  const CoursesFound = (currentCourseItems) => {
    const contentLoad = Array.from({ length: 5 }, (_, index) => (
      <div className="load-wrapper" key={index}>
        <div class="loader-title pulse"></div>
        <div class="loader-content pulse"></div>
      </div>
    ));
    return (
      <div>
        {
          loading ? (
            <div className="load-wrapper-main">
              {contentLoad}
            </div>
          ) : (
            currentCourseItems.map((course, index) => (
              <div key={index} className="wmcads-search-result">
                <h2 className="wmcads-m-b-none">
                  
                  <Link to={`/course-finder/details?courseId=${course.CourseID}&locationName=${course.LocationName}&startDate=${course.StartDate}&durationValue=${course.DurationValue}`} className="h2 wmcads-search-result__title">
                    {course.CourseName}
                  </Link>
                </h2>
                <p className="mtb-10">
                  <strong>
                    {course.LocationName}
                  </strong>
                </p>
                <p className="wmcads-search-result__excerpt">
                  {createExcerpt(course.CourseDescription, 200)}
                </p>
                <table class="courses wmcads-table wmcads-m-b-xl wmcads-table--without-header">
                  <tbody>
                    <tr>
                      <td class="" data-header="Header 2"><strong>Start date: </strong>{isFlexible(course)}</td>
                      <td class="" data-header="Header 2"><strong>Course type: </strong>{course.DeliverModeType}</td>
                    </tr>
                    <tr>
                      <td class="" data-header="Header 2"><strong>Cost: </strong>{course.Cost === null ? 'N/A' : course.Cost }</td>
                      <td class="" data-header="Header 2"><strong>Duration: </strong>{corsesDuration(course)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))
          )
        }
      </div>
    );
  };

  return (
    <div class="template-search">
      <div class="wmcads-m-b-lg">
        <h1 id="wmcads-main-content" class="wmcads-hide-mobile">Find courses for jobs</h1>
        <div class="wmcads-col-1 wmcads-col-md-2-3 wmcads-p-r-xl">
          <form id="searchBar_form" class="wmcads-search-bar">
            <input id="searchBar_input" aria-label="Search" type="text" value={filter.searchTerm} class="wmcads-search-bar__input wmcads-fe-input" placeholder="Search course title or subject..." onChange={(e) => setFilter((prevFilter) => ({
              ...prevFilter,
              searchTerm: e.target.value,
            }))} />
              <button class="wmcads-search-bar__btn" type="submit">
                <svg>
                  <title>Search</title>
                  <use xlinkHref="#wmcads-general-search" href="#wmcads-general-search"></use>
                </svg>
              </button>
          </form>
        </div>
      </div>
      <div>
        <div class="wmcads-grid">
          <div class="main wmcads-col-1 wmcads-col-md-2-3 wmcads-m-b-xl wmcads-p-r-lg">
            <div className="course-count-sort-by-wrapper">
              {coursesCountAmount()}
              {/* <div class="wmcads-search-sort wmcads-fe-group"> */}
                <label class="wmcads-fe-label" for="dropdown">
                  <h4>Sort by</h4>
                </label>
                <div class="wmcads-fe-dropdown">
                  <select class="wmcads-fe-dropdown__select" id="dropdown" name="dropdown">
                    <option value="" selected="selected">Choose from list</option>
                    <option value="1">Relevance</option>
                    <option value="2">Most recent</option>
                    <option value="3">Oldest</option>
                  </select>
                </div>
              {/* </div> */}
            </div>
            {CoursesFound(currentCourseItems)}
            <div className="wmcads-pagination wmcads-m-t-xl">


              {currentPage > 1 && (
                <a
                  href="#"
                  onClick={handlePrevPage} disabled={currentPage === 1}
                  className="wmcads-pagination__prev wmcads-link wmcads-link--with-chevron"
                >
                  <svg className="wmcads-link__chevron wmcads-link__chevron--left">
                    <use
                      xlinkHref="#wmcads-general-chevron-right"
                      href="#wmcads-general-chevron-right"
                    ></use>
                  </svg>{" "}
                  Previous page
                </a>
              )}
              
              
              {/* <button onClick={handlePrevPage} disabled={currentPage === 1}>
                Previous
              </button> */}
              <ol className="wmcads-pagination__nav">
                {generatePageIndexPagination()}
              </ol>
              <a onClick={handleNextPage} href="#" target="_self" class="wmcads-pagination__next wmcads-link wmcads-link--with-chevron">
                Next page
                <svg class="wmcads-link__chevron wmcads-link__chevron--right">
                  <use href="#wmcads-general-chevron-right" href="#wmcads-general-chevron-right"></use>
                </svg>
              </a>
            </div>
          </div>
          <aside class="wmcads-col-1 wmcads-col-md-1-3 wmcads-m-b-lg">
            <hr class="wmcads-hide-desktop"/>
              <div class="wmcads-search-sort wmcads-fe-group">
                <label class="wmcads-fe-label" for="dropdown">
                <h3>Start date</h3>
                </label>
                <div class="wmcads-fe-dropdown">
                  <select class="wmcads-fe-dropdown__select" id="dropdown" name="dropdown">
                    <option value="" selected="selected">Choose from list</option>
                    <option value="1">Relevance</option>
                    <option value="2">Most recent</option>
                    <option value="3">Oldest</option>
                  </select>
                </div>
              </div>
              <div class="wmcads-hide-desktop"><button class="wmcads-btn wmcads-btn--primary wmcads-btn--block" id="show_filter_btn" aria-controls="search_filter" aria-expanded="false">Filter your results</button></div>
              <div id="search_filter" class="wmcads-search-filter">
                <div class="wmcads-search-filter__header">
                  <h3 class="wmcads-search-filter__header-title">Filter</h3>
                  <a href="#" class="wmcads-search-filter__clear-all wmcads-hide-desktop">Clear all</a>
                  <a href="#" id="hide_filter_btn" class="wmcads-search-filter__close">
                    <svg>
                      <title>Close</title>
                      <use href="#wmcads-general-cross" href="#wmcads-general-cross"></use>
                    </svg>
                  </a>
                </div>
                {accordionData.map((accordion, index) => (
                  <AccordionComponent key={index} data={accordion} index={index} ChildComponent={<CheckboxComponent options={accordion.checkbox} accordionIndex={index} onCheckboxChange={handleCheckboxChange} />} />
                ))}
                <a href="#"
                  className="wmcads-search-filter__clear-all wmcads-hide-mobile"
                  onClick={clearFilters}
                >
                  <svg
                    style={{
                      display: "inline-block",
                      fill: "#c05701",
                      stroke: "#c05701",
                      strokeWidth: "25px",
                    }}
                  >
                    <title>Close</title>
                    <use
                      xlinkHref="#wmcads-general-cross"
                      href="#wmcads-general-cross"
                    ></use>
                  </svg>
                  Clear all filters
                </a>
              </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

const Courses = () => {

  const breadCrumb = [
    {
      name: 'Course Finder',
    }
  ]

  const WrappedComponent = AppLayout(Page, { breadCrumb });
  return <WrappedComponent />;
};

export default Courses;
