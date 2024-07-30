import React from "react";
import AppLayout from "../../../layout/index";
import { useNavigate } from "react-router-dom";
import ReactGA from "react-ga4";

export const findCourse = (
  courseArray,
  startDate,
  durationValue,
  locationName,
  courseID
) => {
  return courseArray.find((course) => {
    const normalizedStartDate = startDate === "null" ? null : startDate;
    return (
      course.StartDate === normalizedStartDate &&
      course.DurationValue === durationValue &&
      course.LocationName === locationName &&
      course.CourseID === courseID
    );
  });
};

export const setupAccordionData = (course) => {
  // Use default values for properties if they are undefined
  const {
    EntryRequirements = "",
    LocationName = "",
    LocationAddressOne = "",
    LocationAddressTwo = "",
    LocationCounty = "",
    LocationPostcode = "",
    LocationTelephone = "",
    LocationTown = "",
    LocationWebsite = "",
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
      LocationWebsite,
    },
  };
};

const Page = () => {
  const navigate = useNavigate();

  const providerDetails2 = () => {
    return (
      <div className="wmcads-content-card wmcads-m-b-lg">
        <div className="wmcads-p-sm">
          <h2>Get help and advice</h2>
          <p>
            Not sure which course is right for you? Our partners at National
            Careers Service are on hand to help
          </p>
          <p className="mtb-10">
            <strong>Live chat:</strong>{" "}
            <a
              onClick={() => handleLiveChatNCSClick()}
              className="wmcads-link"
              href="https://nationalcareers.service.gov.uk/webchat/chat"
              target="_blank"
              rel="noopener noreferrer"
            >
              Speak to an adviser on webchat
            </a>
          </p>
          <p className="mtb-10">
            <strong>Phone:</strong>{" "}
            <a
              onClick={() => handlePhoneNCSClick()}
              className="wmcads-link"
              href={`tel:0800100900`}
            >
              0800 100 900
            </a>
          </p>
        </div>
      </div>
    );
  };

  const handleGoBack = (e) => {
    e.preventDefault();
    navigate(-2); // Navigate back one step
    ReactGA.event({
      category: "Course finder Back to course link",
      action: "click",
      label: e,
    });
  };

  const handleLiveChatNCSClick = (liveChatNCS) => {
    ReactGA.event({
      category: "National Careers Service Live Chat",
      action: "click",
      label: liveChatNCS,
    });
  };

  const handlePhoneNCSClick = (phoneNCS) => {
    ReactGA.event({
      category: "National Careers Service Phone",
      action: "click",
      label: phoneNCS,
    });
  };

  return (
    <div className="course-details-page">
        <>
          <div className="main wmcads-col-1 wmcads-col-md-2-3 wmcads-m-b-xl wmcads-p-r-lg wmcads-p-r-sm-none">
            <div className="wmcads-col-1 wmcads-p-lg bg-white">
              {/* {isMobile && providerDetails(courseProvider)} */}
              <h1 className="h4">Eligibility Checker</h1>
              <h2>Sorry, your postcode is not within the eligible area.</h2>
              <p>
                You need to live in Birmingham, Coventry, Dudley, Sandwell, Solihull, Walsall or Wolverhampton to qualify.
              </p>
            </div>
            <a
                  href="/"
                  onClick={handleGoBack}
                  title="Go back to search results"
                  target="_self"
                  className="wmcads-link wmcads-m-t-lg"
                >
                  <span>&lt; Back to course</span>
                </a>
          </div>
          <aside className="wmcads-col-1 wmcads-col-md-1-3 wmcads-m-b-lg">
            {providerDetails2()}
          </aside>
        </>
    </div>
  );
};

const EligibilityOutside = () => {

  const breadCrumb = [
    {
      name: "Course Finder",
      path: "/course-finder",
    },
    {
      name: "Eligibility checker",
    },
  ];

  const WrappedComponent = AppLayout(Page, { breadCrumb });
  return <WrappedComponent />;
};

export default EligibilityOutside;
