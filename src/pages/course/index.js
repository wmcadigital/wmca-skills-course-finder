import React, { useState, useEffect} from 'react';
import AppLayout from '../../layout/index';
import ApiCourse from '../../services/apiCourse'
import ApiCourseProviders from '../../services/apiCourseProviders'
import moment from 'moment';
import { useNavigate, useLocation } from 'react-router-dom';
import { Subject } from 'rxjs';
import { combineLatest } from 'rxjs';
import { course$ } from '../../services/rxjsStoreCourse'
import { courseProviders$ } from '../../services/rxjsStoreCourseProviders'
import { setLoading$ } from '../../services/rxjsStoreLoading'
import AccordionComponent from '../../components/accordion'

const courseName$ = new Subject();

const Page = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 767);
  const navigate = useNavigate();
  const [getCourse, setGetCourse] = useState([]);
  const [courseProvider, setCourseProvider] = useState([]);
  const [accordionData, setAccordionData] = useState(undefined);
  const [loading, setLoading] = useState(undefined);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const courseId = queryParams.get('courseId');
  const startDate = queryParams.get('startDate');
  const locationName = queryParams.get('locationName');
  const durationValue = queryParams.get('durationValue');

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
    const subscription = combineLatest([course$, courseProviders$]).subscribe(async ([course, courseProviders]) => {
      try {
        // Check if dataValue is null and make an API call if needed
        if (course === null) {
          setLoading(true)
          // setLoading$(true)
          const course = await ApiCourse(courseId);

          const courseFound = findCourse(course, startDate, durationValue, locationName)
          setGetCourse(courseFound)
          courseName$.next(courseFound.CourseName)

          const accData = setupAccordionData(courseFound)
          setAccordionData(accData)

          const getCourseProvider = await ApiCourseProviders(courseFound.UKPRN);
          setCourseProvider(getCourseProvider)
          setLoading(false)
          // setLoading$(false)
        } else {

          if (courseProviders !== null) {
            setCourseProvider(courseProviders)
          }

          const accData = setupAccordionData(course)
          setAccordionData(accData)
          setGetCourse(course);
          courseName$.next(course.CourseName)

        }

      } catch (error) {
        console.error('Error fetching data from API:', error);
      }
    });

    // Clean up the subscription on component unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []); // Empty dependency array ensures the effect runs once after the initial render

  const loader = () => {
    return (
      <div class="wmcads-loader wmcads-loader--large" role="alert" aria-live="assertive">
        <p class="wmcads-loader__content">Content is loading...</p>
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

  const findCourse = (courseArray, startDate, durationValue, locationName) => {
    return courseArray.find(course => {
      return (
        course.StartDate === startDate &&
        course.DurationValue === durationValue &&
        course.LocationName === locationName
      );
    });
  }

  const setupAccordionData = (course) => {
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

  const providerDetails = (courseProvider) => {
    return (
      <div class="wmcads-content-card wmcads-m-b-lg">
        <div class="wmcads-p-sm">
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
              <table class="wmcads-table wmcads-m-b-xl wmcads-table--without-header">
                <tbody>
                  <tr>
                    <th scope="row" class="" data-header="Header 1">Qualification name</th>
                    <td class="" data-header="Header 2">{getCourse.CourseName}</td>
                  </tr>
                  <tr>
                    <th scope="row" class="" data-header="Header 1">Qualification level</th>
                    <td class="" data-header="Header 2">{getCourse.NotionalNVQLevel}</td>
                  </tr>
                  <tr>
                    <th scope="row" class="" data-header="Header 1">Awarding organisation</th>
                    <td class="" data-header="Header 2">{getCourse.AwardOrgName}</td>
                  </tr>
                  <tr>
                    <th scope="row" class="" data-header="Header 1">Course type</th>
                    <td class="" data-header="Header 2">{getCourse.DeliverModeType}</td>
                  </tr>
                  <tr>
                    <th scope="row" class="" data-header="Header 1">Course hours</th>
                    <td class="" data-header="Header 2">{getCourse.StudyModeType}</td>
                  </tr>
                  <tr>
                    <th scope="row" class="" data-header="Header 1">Course start date</th>
                    <td class="" data-header="Header 2">{startDateFn(getCourse.StartDate)}</td>
                  </tr>
                  <tr>
                    <th scope="row" class="" data-header="Header 1">Costs</th>
                    <td class="" data-header="Header 2">{getCourse.CostDescription}</td>
                  </tr>
                </tbody>
              </table>
              <div class="wmcads-accordion-wrapper">
                <AccordionComponent data={{ title: 'Entry requirements', index: 1, isOpen: true }} ChildComponent={
                  <div className="wmcads-accordion__content">
                    <p>
                      {accordionData?.EntryRequirements}
                    </p>
                  </div>
                } />
                <AccordionComponent data={{ title: 'Location address', index: 1, isOpen: true }} ChildComponent={
                  <div className="wmcads-accordion__content">
                    <div class="wmcads-inset-text" >
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
              <a href="#" onClick={handleGoBack} title="link title" target="_self" className="wmcads-link"><span>&lt; Back to results</span></a>
            </div>
            <aside class="wmcads-col-1 wmcads-col-md-1-3 wmcads-m-b-lg">
              {!isMobile && providerDetails(courseProvider)}
            </aside>
          </>
      )}
    </div>
  );
};

const Course = (props) => {
  const [courseName, setCourseName] = useState(undefined);

  useEffect(() => {

    courseName$.subscribe(name => {
      setCourseName(name);
    })

    console.log(courseName, 'courseName$')

  }, [courseName]); 

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
