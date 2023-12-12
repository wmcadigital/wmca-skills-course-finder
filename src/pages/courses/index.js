import React, { useEffect, useState } from 'react';
import AppLayout from '../../layout/index';
import apiCoursesService from '../../services/apiCourses'
import moment from 'moment';
import AccordionComponent from '../../components/accordion'
import CheckboxComponent from '../../components/checkbox'
import { useLocation, useNavigate } from 'react-router-dom';
import { setCourse$ } from '../../services/rxjsStoreCourse'
import { setCourseProviders$ } from '../../services/rxjsStoreCourseProviders'
import ApiCourseProviders from '../../services/apiCourseProviders'

const itemsPerPage = 10;
const maxIndexButtons = 5;

const searchCourses = (courses, searchTerm) => {
  const searchTermRegex = new RegExp(`\\b${searchTerm}`, "i");
  return courses.filter((course) =>
    searchTermRegex.test(course.CourseName)
  );
};

const filterCourses = (courses, studyModes, filterType) => {

  const searchValue = 'Day or block release';
  const replacementValue = 'Day/Block Release';

  // Using map to create a new array with replaced values
  const updatedStudyModes = studyModes.map(option =>
    option.includes(searchValue) ? replacementValue : option
  );

  return courses.filter(course => updatedStudyModes.includes(course[filterType]));
};

const sortCourses = (courses) => {

  const sortCourses = [...courses].sort((a, b) => {
    const dateA = a.StartDate ? new Date(a.StartDate) : null;
    const dateB = b.StartDate ? new Date(b.StartDate) : null;

    // Handle null dates by placing them at the end
    if (dateA === null && dateB === null) {
      return 0;
    } else if (dateA === null) {
      return 1;
    } else if (dateB === null) {
      return -1;
    } else {
      return dateA - dateB;
    }
  });

  return sortCourses
}


const filterCoursesByStartDate = (courses, startBy) => {
  return courses.filter(course => {
    const targetDate = moment(course.StartDate);
    const currentDate = moment();
    const monthDifference = targetDate.diff(currentDate, 'months');

    switch (startBy) {
      case 'New 3 months':
        return (monthDifference === 3) && courses
        case 'In 3 to 6 months':
        return (monthDifference > 3 && monthDifference <= 6) && courses
        case 'More than 6 months':
        return (monthDifference > 6) && courses
      default:
      // Handle other cases or set a default value
    }
  })
}

const Page = () => {
  const navigate = useNavigate();
  const [isOpenMobileFilters, setIsOpenMobileFilters] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
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
  const [filterIsModified, setFilterIsModified] = useState(false);

  const paramNames = ['startDate', 'sort', 'courseType', 'courseHours', 'courseStudyTime', 'searchTerm'];

  const [filter, setFilter] = useState(() => {
    const initialState = {};
    paramNames.forEach(param => {
      if (param === 'courseType' || param === 'courseHours' || param === 'courseStudyTime') {
        const paramValue = searchParams.get(param);
        initialState[param] = paramValue ? paramValue.split(',') : [];
      } else {
        initialState[param] = searchParams.get(param) || '';
      }
    });
    return initialState;
  });

  const initialFilter = {
    startDate: "",
    sort: "",
    courseType: [],
    courseHours: [],
    courseStudyTime: [],
    searchTerm: ''
  };

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 767);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []); // Empty dependency array ensures that this effect runs once

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

    const paramsToSet = ['searchTerm', 'courseType', 'courseHours', 'courseStudyTime', 'startDate', 'sort'];
    paramsToSet.forEach(param => {
      newSearchParams.set(param, filter[param]);
    });

    // Use replaceState to prevent adding a new entry to the history stack
    window.history.replaceState({}, '', `#/course-finder?${newSearchParams.toString()}`);
  }, [currentPage, filter]);

  useEffect(() => {

    const hasFilterSetted = JSON.stringify(filter) !== JSON.stringify(initialFilter)
    setFilterIsModified(hasFilterSetted)

    const loadedAccordionData = []

    const updateCheckedProperty = (checkbox, value) => {
      checkbox.checked = value;
    };

    accordionData.map(category => {
      const arrayToCheck = category.type === 'courseHours' ? filter.courseHours :
        category.type === 'courseType' ? filter.courseType :
          category.type === 'courseStudyTime' ? filter.courseStudyTime :
            [];
        category.checkbox.forEach(checkbox => {
          updateCheckedProperty(checkbox, arrayToCheck.includes(checkbox.name));
        });
      
      loadedAccordionData.push(category);
    });

    setAccordionData(loadedAccordionData)

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

    if (filter.startDate) {
      setCurrentPage(1);
      coursesFiltered = filterCoursesByStartDate(coursesFiltered, filter.startDate)
    }

    if (filter.sort) {
      setCurrentPage(1);
      coursesFiltered = sortCourses(coursesFiltered, filter.sort)
    }

      setCourses(coursesFiltered)
      setCoursesCount(coursesFiltered.length);

  }, [filter, getCourses]);

  const selectionHandle = (event, selection) => {
    const value = event.target.value;
    setFilter((prevFilter) => ({
      ...prevFilter,
      [selection]: value,
    }));
  };

  const toggleMobileFilters = (e) => {
    e.preventDefault()
    setIsOpenMobileFilters(!isOpenMobileFilters)
  }

  const courseDetailsLink = (e, course) => {
    e.preventDefault()
    setCourse$(course)
    
    const fetchProviders = async () => {
      try {
        const courseProvider = await ApiCourseProviders(course.UKPRN);
        setCourseProviders$(courseProvider)
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchProviders();
    
    // Redirect to the details page
    navigate(`/course-finder/details?courseId=${course.CourseID}&locationName=${course.LocationName}&startDate=${course.StartDate}&durationValue=${course.DurationValue}`);
  };

  const handleCheckboxChange = (accordionIndex, checkboxIndex) => {
    const updatedAccordionData = [...accordionData];
    updatedAccordionData[accordionIndex].checkbox[checkboxIndex].checked = !updatedAccordionData[accordionIndex].checkbox[checkboxIndex].checked;

    // The array you want to push into courseType
    const newArray = updatedAccordionData[accordionIndex].checkbox[checkboxIndex]
    const type = updatedAccordionData[accordionIndex].type

    // // Check if newArray is checked, then add or remove from courseType
    const updatedCourseType = newArray.checked
      ? [...(Array.isArray(filter[type]) ? filter[type] : []), newArray.name]
      : Array.isArray(filter[type])
        ? filter[type].filter((type) => type !== newArray.name)
        : [];

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
    } else if (loading) {
      return (<p class="load-block pulse"></p>)
    } else if (coursesCount === 0) {
      return (<p class="course-count"><strong>{coursesCount}</strong> results found</p>)
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
      return text.substring(0, lastSpaceIndex) + '...';
    }
  }

  const countSortBy = () => {
    return (
      <div className="course-count-sort-by-wrapper">
        {coursesCountAmount()}
        <label class="wmcads-fe-label" for="dropdown">
          <h4>Sort by</h4>
        </label>
        <div class="wmcads-fe-dropdown">
          <select
            class="wmcads-fe-dropdown__select"
            id="sort"
            name="sort"
            value={filter.sort} // Set the value of the dropdown to the state variable
            onChange={e => selectionHandle(e, 'sort')} // Set the event handler for dropdown changes
            >
            <option value="" selected="selected">Relevance</option>
            <option value="Start date">Start date</option>
          </select>
        </div>
      </div>
    )
  }

  const searchByStartDate = () => {
    return (
      <div class="wmcads-search-sort wmcads-fe-group">
        <label class="wmcads-fe-label" for="dropdown">
          <h3>Start date</h3>
        </label>
        <div class="wmcads-fe-dropdown">
          <select
            className="wmcads-fe-dropdown__select"
            id="startDate"
            name="startDate"
            value={filter.startDate} // Set the value of the dropdown to the state variable
            onChange={e => selectionHandle(e, 'startDate')} // Set the event handler for dropdown changes
          >
            <option value="">Anytime</option>
            <option value="New 3 months">New 3 months</option>
            <option value="In 3 to 6 months">In 3 to 6 months</option>
            <option value="More than 6 months">More than 6 months</option>
          </select>
        </div>
      </div>
    )
  }

  const countSortByMobile = () => {
    return (
      <div class="wmcads-search-sort wmcads-fe-group">
        <label class="wmcads-fe-label" for="dropdown">
          <h3>Sort by</h3>
        </label>
        <div class="wmcads-fe-dropdown">
          <div class="wmcads-fe-dropdown">
            <select
              class="wmcads-fe-dropdown__select"
              id="sort"
              name="sort"
              value={filter.sort} // Set the value of the dropdown to the state variable
              onChange={e => selectionHandle(e, 'sort')} // Set the event handler for dropdown changes
            >
              <option value="" selected="selected">Relevance</option>
              <option value="Start date">Start date</option>
            </select>
          </div>
        </div>
      </div>
    )
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
        <li key={1} className="wmcads-pagination__item">
          {1 === currentPage ? (
            1
          ) : (
            <a onClick={(e) => handleJumpToPage(e, 1)} className="wmcads-link" href="#">
              1
            </a>
          )}
        </li>
      );

      if (startPage > 2) {
        Li.push(
          <li key="prevDots" className="wmcads-pagination__item">
            ...
          </li>
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      Li.push(
        <li key={i} className={"wmcads-pagination__item"}>
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
      if (endPage < totalPagesForcourses - 1) {
        Li.push(
          <li key="nextDots" className="wmcads-pagination__item">
            ...
          </li>
        );
      }

      Li.push(
        <li key={totalPagesForcourses} className={totalPagesForcourses === currentPage ? "wmcads-pagination__item" : "wmcads-pagination__item"}>
          {totalPagesForcourses === currentPage ? (
            totalPagesForcourses
          ) : (
              <a onClick={(e) => handleJumpToPage(e, totalPagesForcourses)} className="wmcads-link" href="#">
                {totalPagesForcourses}
            </a>
          )}
        </li>
      );
    }
    return Li;
  };

  const clearFilters = () => {
    setFilter(initialFilter);
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
          ) : currentCourseItems.length > 0 ? (
            currentCourseItems.map((course, index) => (
              <div key={index} className="wmcads-search-result">
                <h2 className="wmcads-m-b-none">
                  <a href="#" onClick={(e) => courseDetailsLink(e, course)} className="h2 wmcads-search-result__title">
                    {course.CourseName}
                  </a>
                </h2>
                <p className="mtb-10">
                  <strong>
                    {course.LocationName}
                  </strong>
                </p>
                <p className="wmcads-search-result__excerpt">
                  {createExcerpt(course.CourseDescription, 200)}
                </p>
                <table className="courses wmcads-table wmcads-m-b-xl wmcads-table--without-header">
                  <tbody>
                    <tr>
                      <td className="" data-header="Header 2"><strong>Start date: </strong>{isFlexible(course)}</td>
                      <td className="" data-header="Header 2"><strong>Course type: </strong>{course.DeliverModeType}</td>
                    </tr>
                    <tr>
                      <td className="" data-header="Header 2"><strong>Cost: </strong>{course.Cost === null ? 'N/A' : course.Cost}</td>
                      <td className="" data-header="Header 2"><strong>Duration: </strong>{corsesDuration(course)}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ))
          ) : ( 
            <div className="wmcads-msg-summary wmcads-msg-summary--warning" style={{marginTop: '40px'}}>
              <div className="wmcads-msg-summary__header">
                <svg className="wmcads-msg-summary__icon">
                  <use
                    xlinkHref="#wmcads-general-warning-circle"
                    href="#wmcads-general-warning-circle"
                  ></use>
                </svg>
                <h3 className="wmcads-msg-summary__title">
                  There are no matching results
                </h3>
              </div>
              <div className="wmcads-msg-summary__info">
                <p>Improve your search results by:</p>
                <ul className="wmcads-unordered-list">
                  <li>Removing filters</li>
                  <li>Double-checking your spelling</li>
                  <li>Using fewer keywords</li>
                  <li>Searching for something less specific</li>
                </ul>
              </div>
            </div>
          )
        }
      </div>
    );
  };

  return (
    <div class="template-search">
      <div class="wmcads-m-b-lg">
        <h1 id="wmcads-main-content">Find courses for jobs</h1>
        <div class="wmcads-col-1 wmcads-col-md-2-3 wmcads-p-r-xl wmcads-p-r-sm-none">
          <form id="searchBar_form" class="wmcads-search-bar">
            <input id="searchBar_input" aria-label="Search" type="text" value={filter.searchTerm} class="wmcads-search-bar__input wmcads-fe-input" placeholder="Search course title or subject..." onChange={(e) => setFilter((prevFilter) => ({
              ...prevFilter,
              searchTerm: e.target.value,
            }))} />
              <button class="wmcads-search-bar__btn" type="submit" onClick={(e) => e.preventDefault()}>
                <svg>
                  <title>Search</title>
                  <use xlinkHref="#wmcads-general-search" href="#wmcads-general-search"></use>
                </svg>
              </button>
          </form>
        </div>
      </div>
      <div class="wmcads-grid">
        <div class="main wmcads-col-1 wmcads-col-md-2-3 wmcads-m-b-xl wmcads-p-r-lg wmcads-p-r-sm-none">
            {!isMobile && countSortBy()}
          <div style={{paddingBottom: '20px'}}>
            {isMobile &&  coursesCountAmount() }
          </div>
          {isMobile && countSortByMobile()}
          {isMobile && searchByStartDate()}
          <div class="wmcads-hide-desktop" onClick={toggleMobileFilters}><button class="wmcads-btn wmcads-btn--primary wmcads-btn--block" id="show_filter_btn" aria-controls="search_filter" aria-expanded="false">Filter your results</button></div>
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
            <ol className="wmcads-pagination__nav">
              {generatePageIndexPagination()}
            </ol>
            {currentCourseItems.length === 10 && !loading &&
              <a onClick={handleNextPage} href="#" target="_self" class="wmcads-pagination__next wmcads-link wmcads-link--with-chevron">
                Next page
                <svg class="wmcads-link__chevron wmcads-link__chevron--right">
                  <use href="#wmcads-general-chevron-right" href="#wmcads-general-chevron-right"></use>
                </svg>
              </a>
            }
          </div>
        </div>
        <aside class="wmcads-col-1 wmcads-col-md-1-3 wmcads-m-b-lg">
          <hr class="wmcads-hide-desktop"/>
          {!isMobile && searchByStartDate() }
          <div id="search_filter" class={`wmcads-search-filter ${isOpenMobileFilters ? 'open' : ''}`}>
              <div class="wmcads-search-filter__header">
                <h3 class="wmcads-search-filter__header-title">Filter</h3>
                {filterIsModified && <a href="#" class="wmcads-hide-desktop wmcads-link wmcads-hide-desktop hide-desktop" onClick={clearFilters}>Clear all</a>}
                <a href="#" id="hide_filter_btn" class="wmcads-search-filter__close" onClick={toggleMobileFilters}>
                  <svg>
                    <title>Close</title>
                    <use href="#wmcads-general-cross" href="#wmcads-general-cross"></use>
                  </svg>
                </a>
              </div>
              {accordionData.map((accordion, index) => (
                <AccordionComponent key={index} data={accordion} index={index} ChildComponent={<CheckboxComponent options={accordion.checkbox} accordionIndex={index} onCheckboxChange={handleCheckboxChange} />} />
              ))}
            {filterIsModified && <div class="wmcads-container wmcads-hide-desktop" onClick={toggleMobileFilters}><button class="wmcads-btn wmcads-btn--primary wmcads-btn--block" id="show_filter_btn" aria-controls="search_filter" aria-expanded="false">Apply fliters</button></div>}
              {filterIsModified &&
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
              }
            </div>
        </aside>
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
