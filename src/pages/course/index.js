import React, { useState, useEffect} from 'react';
import AppLayout from '../../layout/index';
import moment from 'moment';
import { useNavigate, useLocation } from 'react-router-dom';
import { setCourseName$, courseName$ } from '../../services/rxjsStoreCourseName'
import AccordionComponent from '../../components/accordion'
import { openDB } from 'idb'
import apiCourseProviderStorage from '../../services/apiCourseProviderStorage'

export const findCourse = (courseArray, startDate, durationValue, locationName, courseID) => {
  return courseArray.find(course => {
    const normalizedStartDate = startDate === "null" ? null : startDate;
    return (
      course.StartDate === normalizedStartDate &&
      course.DurationValue === durationValue &&
      course.LocationName === locationName &&
      course.CourseID === courseID
    );
  });
}

export const setupAccordionData = (course) => {
  // Use default values for properties if they are undefined
  const {
    EntryRequirements = '',
    LocationName = '',
    LocationAddressOne = '',
    LocationAddressTwo = '',
    LocationCounty = '',
    LocationPostcode = '',
    LocationTelephone = '',
    LocationTown = '',
    LocationWebsite = ''
  } = course || {};

  // Create a new object with the extracted properties
  return {
    EntryRequirements,
    LocationInfo: {
      LocationName,
      LocationAddressOne,
      LocationAddressTwo,
      LocationCounty,
      LocationPostcode,
      LocationTelephone,
      LocationTown,
      LocationWebsite
    }
  };
};

const Page = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const newTab = queryParams.get('newTab');
  const courseId = queryParams.get("courseId");
  const startDate = queryParams.get("startDate");
  const durationValue = queryParams.get("durationValue");
  const locationName = queryParams.get("locationName");


  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const navigate = useNavigate();
  const [getCourse, setGetCourse] = useState(undefined);
  const [courseProvider, setCourseProvider] = useState(undefined);
  const [accordionData, setAccordionData] = useState(undefined);
  const [loading, setLoading] = useState(undefined);
  const [hideBackToResultsBtn, setHideBackToResultsBtn] = useState(false);

  const setPageRequest = (coursesData, providersData) => {
    // Check if the data is an array
    if (Array.isArray(coursesData) && Array.isArray(providersData)) {
      const course = findCourse(coursesData, startDate, durationValue, locationName, courseId)
      const provider = providersData.filter(provider => provider?.UKPRN === course?.UKPRN)

      setCourseName$(course?.CourseName)
      setGetCourse(course)
      setCourseProvider(provider[0])
      const accData = setupAccordionData(course)
      setAccordionData(accData)
      setLoading(false)
    } else {
      console.error('Invalid data format???????????');
      // If the data format is invalid, use an empty array
    }
  }


  useEffect(() => {
    const fetchData = async () => {
      try {
        const db = await openDB('coursesDB', 1);
        // Assuming 'courses' is the name of your object store
        const result = await db.get('courses', 'courses');
        const result2 = await db.get('providers', 'providers');
        db.close();

        const coursesData = JSON.parse(result);
        const providersData = JSON.parse(result2);

        console.log(coursesData)
        console.log(providersData)
        setPageRequest(coursesData, providersData)
      } catch (error) {
        apiCourseProviderStorage()
          .then((result) => {
            setPageRequest(result.courses, result.providers)
          })
          .catch((error) => {
            console.error('Error during data fetch:', error);
          });
        // console.error('Error:', error);
        // If there's an error during the data fetching process, use an empty array
        // setCourses([]);
        // setGetCourses([]);
        // setCoursesCount(0);
      }
    };

    fetchData();
  }, []);

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
    setHideBackToResultsBtn(typeof newTab === 'string')
  }, []); // Empty dependency array ensures the effect runs once after the initial render

  const loader = () => {
    return (
      <div className="wmcads-loader wmcads-loader--large" role="alert" aria-live="assertive">
        <p className="wmcads-loader__content">Content is loading...</p>
      </div>
    )
  }

  const startDateFn = (courseDate) => {
    if (courseDate === undefined) return '';
    const date = moment(courseDate);
    const formattedDate = date.format("MMMM Do YYYY");
    return (courseDate === null ? 'Flexible' : formattedDate)
  }

  const handleGoBack = (e) => {
    e.preventDefault()
    navigate(-1); // Navigate back one step
  };


  const updateContactPhone = (courseProvider) => {
    if (courseProvider?.ContactPhone && !courseProvider.ContactPhone.startsWith('0')) {
      return '0' + courseProvider.ContactPhone
    }
    else {
      return courseProvider.ContactPhone
    }
  }

  const providerDetails = (courseProvider) => {
    return (
      <div className="wmcads-content-card wmcads-m-b-lg">
        <div className="wmcads-p-sm">
          {/* {accordionData} */}
          <h2>Find out more and apply</h2>
          <p><strong>{courseProvider?.CourseProvider}</strong></p>
          <p className="mtb-10"><strong>Website:</strong> <a className="wmcads-link" href={courseProvider?.Website} target="_blank" rel="noopener noreferrer">{courseProvider?.Website}</a></p>
          {courseProvider?.ContactEmail && <p className="mtb-10"><strong>Email:</strong> <a className="wmcads-link" href={`mailto:${courseProvider?.ContactEmail}`}>{courseProvider?.ContactEmail}</a></p>}
          <p className="mtb-10"><strong>Phone:</strong> <a className="wmcads-link" href={`tel:${courseProvider?.ContactPhone && updateContactPhone(courseProvider)}`}>{courseProvider?.ContactPhone && updateContactPhone(courseProvider)}</a></p>
        </div>
      </div>
    )
  }

  return (
    <div className="course-details-page">
      {loading ? (
        <p>{loader()}</p>
      ) : (
          <>
            <div className="main wmcads-col-1 wmcads-col-md-2-3 wmcads-m-b-xl wmcads-p-r-lg wmcads-p-r-sm-none ">
              <h1 id="wmcads-main-content">{getCourse?.CourseName}</h1>
              {isMobile && providerDetails(courseProvider)}
              <h2>Course details</h2>
              <table className="wmcads-table wmcads-m-b-xl wmcads-table--without-header">
                <tbody>
                  <tr>
                    <th scope="row" data-header="Header 1">Qualification name</th>
                    <td data-header="Header 2">{getCourse?.CourseName}</td>
                  </tr>
                  <tr>
                    <th scope="row" data-header="Header 1">Qualification level</th>
                    <td data-header="Header 2">{getCourse?.NotionalNVQLevel}</td>
                  </tr>
                  <tr>
                    <th scope="row" data-header="Header 1">Awarding organisation</th>
                    <td data-header="Header 2">{getCourse?.AwardOrgName}</td>
                  </tr>
                  <tr>
                    <th scope="row" data-header="Header 1">Course type</th>
                    <td data-header="Header 2">{getCourse?.DeliverModeType}</td>
                  </tr>
                  <tr>
                    <th scope="row" data-header="Header 1">Course hours</th>
                    <td data-header="Header 2">{getCourse?.StudyModeType}</td>
                  </tr>
                  <tr>
                    <th scope="row" data-header="Header 1">Course start date</th>
                    <td data-header="Header 2">{startDateFn(getCourse?.StartDate)}</td>
                  </tr>
                  <tr>
                    <th scope="row" data-header="Header 1">Costs</th>
                    <td data-header="Header 2">{getCourse?.CostDescription}</td>
                  </tr>
                </tbody>
              </table>

              {
                getCourse?.CourseDescription && (
                  <>
                    <h2>Course description</h2>
                    <p>
                      <div dangerouslySetInnerHTML={{ __html: getCourse?.CourseDescription }}></div>
                    </p>
                  </>
                )
              }

              <div className="wmcads-accordion-wrapper">
                <AccordionComponent data={{ title: 'Entry requirements', index: 1, isOpen: true }} ChildComponent={
                  <div className="wmcads-accordion__content">
                    <p>
                      {accordionData?.EntryRequirements}
                    </p>
                  </div>
                } />
                <AccordionComponent data={{ title: 'Location address', index: 1, isOpen: true }} ChildComponent={
                  <div className="wmcads-accordion__content">
                    <div className="wmcads-inset-text" >
                      {accordionData?.LocationInfo?.LocationName}
                      <br />
                      {accordionData?.LocationInfo?.LocationAddressOne}
                      <br />
                      {accordionData?.LocationInfo?.LocationAddressTwo}
                      <br />
                      {accordionData?.LocationInfo?.LocationTown}
                      <br />
                      {accordionData?.LocationInfo?.LocationCounty}
                      <br />
                      {accordionData?.LocationInfo?.LocationPostcode}
                    </div>
                  </div>
                } />
              </div>
              {!hideBackToResultsBtn && <a href="#" onClick={handleGoBack} title="link title" target="_self" className="wmcads-link"><span>&lt; Back to results</span></a>}
            </div>
            <aside className="wmcads-col-1 wmcads-col-md-1-3 wmcads-m-b-lg">
              {!isMobile && providerDetails(courseProvider)}
            </aside>
          </>
      )}
    </div>
  );
};


const Course = () => {
  const [courseName, setCourseName] = useState(undefined);

  useEffect(() => {

    courseName$.subscribe(name => {
      setCourseName(name);
    })

  }, []);

  const breadCrumb = [
    {
      name: 'Course Finder',
      path: '/course-finder',
    },
    {
      name: courseName || '',
    },
  ];

  const WrappedComponent = AppLayout(Page, { breadCrumb });
  return <WrappedComponent />;
};

export default Course;
