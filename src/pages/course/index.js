import React, { useState, useEffect} from 'react';
import AppLayout from '../../layout/index';
import ApiCourse from '../../services/apiCourse'
import ApiCourseProviders from '../../services/apiCourseProviders'
import moment from 'moment';
import { useNavigate, useLocation, useLoaderData } from 'react-router-dom';
import { setCourseName$, courseName$ } from '../../services/rxjsStoreCourseName'
import AccordionComponent from '../../components/accordion'

export async function ApiFetchCourseDetails({ request }) {
  
  const searchParams = new URLSearchParams(new URL(request.url).search);
  // Get the value of the 'courseId' parameter
  const courseId = searchParams.get("courseId");
  const startDate = searchParams.get("startDate");
  const durationValue = searchParams.get("durationValue");
  const locationName = searchParams.get("locationName");

  try {
    const course = await ApiCourse(courseId);
    const courseFound = findCourse(course, startDate, durationValue, locationName)
    setCourseName$(courseFound.CourseName)
    const getCourseProvider = await ApiCourseProviders(courseFound.UKPRN);

    return { courseFound, getCourseProvider };

  } catch (error) {
    console.error('Error fetching data:', error);
    return { courseFound: [], getCourseProvider: [] };
  }

}

export const findCourse = (courseArray, startDate, durationValue, locationName) => {
  return courseArray.find(course => {
    return (
      course.StartDate === startDate &&
      course.DurationValue === durationValue &&
      course.LocationName === locationName
    );
  });
}

export const setupAccordionData = (course) => {
  // Destructure the object to extract the desired properties
  const { EntryRequirements, LocationName, LocationAddressOne, LocationAddressTwo, LocationCounty, LocationPostcode, LocationTelephone, LocationTown, LocationWebsite } = course;

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
}

const Page = () => {
  const courseInfo = useLoaderData();
  const provider = courseInfo.getCourseProvider
  const course = courseInfo.courseFound
  const accData = setupAccordionData(course)

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const navigate = useNavigate();
  const [getCourse] = useState(course || undefined);
  const [courseProvider] = useState(provider || undefined);
  const [accordionData] = useState(accData || undefined);
  const [loading] = useState(undefined);
  const [hideBackToResultsBtn, setHideBackToResultsBtn] = useState(false);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const newTab = queryParams.get('newTab');

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

  const providerDetails = (courseProvider) => {
    return (
      <div className="wmcads-content-card wmcads-m-b-lg">
        <div className="wmcads-p-sm">
          {/* {accordionData} */}
          <h2>Course provider</h2>
          <p><strong>{courseProvider.CourseProvider}</strong></p>
          <p className="mtb-10"><strong>Website:</strong> <a className="wmcads-link" href={courseProvider.Website} target="_blank" rel="noopener noreferrer">{courseProvider.Website}</a></p>
          {courseProvider.ContactEmail && <p className="mtb-10"><strong>Email:</strong> <a className="wmcads-link" href={`mailto:${courseProvider.ContactEmail}`}>{courseProvider.ContactEmail}</a></p>}
          <p className="mtb-10"><strong>Phone:</strong> <a className="wmcads-link" href={`tel:${courseProvider.ContactPhone}`}>{courseProvider.ContactPhone}</a></p>
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
              <h1 id="wmcads-main-content">{getCourse.CourseName}</h1>
              {isMobile && providerDetails(courseProvider)}
              <h2>Course details</h2>
              <table className="wmcads-table wmcads-m-b-xl wmcads-table--without-header">
                <tbody>
                  <tr>
                    <th scope="row" data-header="Header 1">Qualification name</th>
                    <td data-header="Header 2">{getCourse.CourseName}</td>
                  </tr>
                  <tr>
                    <th scope="row" data-header="Header 1">Qualification level</th>
                    <td data-header="Header 2">{getCourse.NotionalNVQLevel}</td>
                  </tr>
                  <tr>
                    <th scope="row" data-header="Header 1">Awarding organisation</th>
                    <td data-header="Header 2">{getCourse.AwardOrgName}</td>
                  </tr>
                  <tr>
                    <th scope="row" data-header="Header 1">Course type</th>
                    <td data-header="Header 2">{getCourse.DeliverModeType}</td>
                  </tr>
                  <tr>
                    <th scope="row" data-header="Header 1">Course hours</th>
                    <td data-header="Header 2">{getCourse.StudyModeType}</td>
                  </tr>
                  <tr>
                    <th scope="row" data-header="Header 1">Course start date</th>
                    <td data-header="Header 2">{startDateFn(getCourse.StartDate)}</td>
                  </tr>
                  <tr>
                    <th scope="row" data-header="Header 1">Costs</th>
                    <td data-header="Header 2">{getCourse.CostDescription}</td>
                  </tr>
                </tbody>
              </table>

              {
                getCourse.CourseDescription && (
                  <>
                    <h2>Course description</h2>
                    <p>
                      <div dangerouslySetInnerHTML={{ __html: getCourse.CourseDescription }}></div>
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
      name:  courseName || '',
    },
  ];

  const WrappedComponent = AppLayout(Page, { breadCrumb });
  return <WrappedComponent />;
};

export default Course;
