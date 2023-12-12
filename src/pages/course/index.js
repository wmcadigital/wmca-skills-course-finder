import React, { useState, useEffect } from 'react';
import AppLayout from '../../layout/index';
import ApiCourse from '../../services/apiCourse'
import ApiCourseProviders from '../../services/apiCourseProviders'
import moment from 'moment';
import { useNavigate, useLocation } from 'react-router-dom';
import { Subject } from 'rxjs';
import { firstValueFrom, combineLatest } from 'rxjs';
import { course$ } from '../../services/rxjsStoreCourse'
import { courseProviders$ } from '../../services/rxjsStoreCourseProviders'

const courseName$ = new Subject();


const Page = () => {
  // const course = []
  const navigate = useNavigate();
  const [getCourse, setGetCourse] = useState([]);
  const [courseProvider, setCourseProvider] = useState([]);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const courseId = queryParams.get('courseId');
  const startDate = queryParams.get('startDate');
  const locationName = queryParams.get('locationName');
  const durationValue = queryParams.get('durationValue');

  useEffect(() => {
    const subscription = combineLatest([course$, courseProviders$]).subscribe(async ([course, courseProviders]) => {
      try {
        // Check if dataValue is null and make an API call if needed
        if (course === null) {
          const course = await ApiCourse(courseId);

          const courseFound = findCourse(course, startDate, durationValue, locationName)
          setGetCourse(courseFound)
          courseName$.next(courseFound.CourseName)

          const getCourseProvider = await ApiCourseProviders(courseFound.UKPRN);
          setCourseProvider(getCourseProvider)
        } else {

          if (courseProviders !== null) {
            setCourseProvider(courseProviders)
          }

          setGetCourse(course);
          courseName$.next(course.CourseName)

          console.log(course, 'here')
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

  const startDateFn = (courseDate) => {
    console.log(courseDate, 'data')
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

  return (
    <div className="course-details-page">
      <div className="main wmcads-col-1 wmcads-col-md-2-3 wmcads-m-b-xl wmcads-p-r-lg wmcads-p-r-sm-none ">
        <h1 id="wmcads-main-content">{getCourse.CourseName}</h1>
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
        <a href="#" onClick={handleGoBack} title="link title" target="_self" className="wmcads-link"><span>&lt; Back to results</span></a>
      </div>
      <aside class="wmcads-col-1 wmcads-col-md-1-3 wmcads-m-b-lg">
        <div class="wmcads-content-card wmcads-m-b-lg">
          <div class="wmcads-p-sm">
            <h2>Course provider</h2>
            <p><strong>{courseProvider.CourseProvider}</strong></p>
            <p className="mtb-10"><strong>Website:</strong> <a className="wmcads-link" href={courseProvider.Website} target="_blank" rel="noopener noreferrer">{courseProvider.Website}</a></p>            
            {courseProvider.ContactEmail && <p className="mtb-10"><strong>Email:</strong> <a className="wmcads-link" href={`mailto:${courseProvider.ContactEmail}`}>{courseProvider.ContactEmail}</a></p>}
            <p className="mtb-10"><strong>Phone:</strong> <a className="wmcads-link" href={`tel:${courseProvider.ContactPhone}`}>{courseProvider.ContactPhone}</a></p>            
          </div>
        </div>
      </aside>
    </div>
  );
};

const Course = () => {
  const [courseName, setCourseName] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      const name = await firstValueFrom(courseName$);
      setCourseName(name);
    };

    fetchData();
  }, []); 

  const breadCrumb = [
    {
      name: 'Course Finder',
      path: '/course-finder',
    },
    {
      name: courseName,
    },
  ];

  const WrappedComponent = AppLayout(Page, { breadCrumb });
  return <WrappedComponent />;
};

export default Course;
