import React, { useState } from "react";
import AppLayout from "../../layout/index";
import { useNavigate, useLocation } from "react-router-dom";
import ReactGA from "react-ga4";

const Page = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { state } = location;
  const courseUrl = state?.courseUrl || '';

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
    navigate(-1); // Navigate back one step
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

  const [postcode, setPostcode] = useState("");
  const [message, setMessage] = useState("");
  const [load, setLoad] = useState(false);
  const [isValid, setIsValid] = useState(true);
  const [isDisabled, setIsDisabled] = useState(true);
  const postcodeRegex = /^([A-Z]{1,2}[0-9]{1,2}[A-Z]?) ?[0-9][A-Z]{2}$/i;


  const handleChange = (e) => {
    const value = e.target.value;
    setPostcode(value);
    setIsValid(postcodeRegex.test(value));
    if (isValid) {
      setIsDisabled(false);
    }
  };

  // add a space in the postcode for api requirements
  const formatPostcode = (postcode) => {
    const postcodeRegexQ = /^([A-Z]{1,2}\d{1,2}[A-Z]?)\s*(\d[A-Z]{2})$/i;
    return postcode.replace(postcodeRegexQ, '$1 $2');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formattedPostcode = formatPostcode(postcode);
    if (isValid) {
    setIsDisabled(false);
    setLoad(true);
    try {
      let res = await fetch(
        `https://prod-31.uksouth.logic.azure.com/workflows/0f5394c3f8844570a94202527b41f1b7/triggers/manual/paths/invoke/postcode/is_eligible?search_text=${formattedPostcode}&api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZVkZT_5x_6kpE0Rc4RyfbkYWpO1MnYAJB6KdqoVZzUM`,
        {
          method: "GET",
        }
      );
      const resJson = await res.json();
      if (res.status === 200) {
        if (resJson.Table1[0]?.Column1 === "TRUE") {
          setMessage("Yes - Eligible");
          navigate('/course-finder/eligibility/inside', { state: { courseUrl: courseUrl} });
        } else {
          setMessage("No - Not Eligible");
          navigate('/course-finder/eligibility/outside');
        }
      } else {
        setMessage("Issue checking. Please try again later.");
      }
    } catch (err) {
      console.log(err);
    } finally {
      setLoad(false);
    }

  } else {
    console.log('Invalid postcode', postcode);
  }


  };

  const postcodeClass = 'wmcads-fe-group ' + (!isValid ? 'wmcads-fe-group--error' : '');
  const buttonClass = 'wmcads-btn wmcads-btn--cta ' + (isDisabled ? 'wmcads-btn--disabled' : '');

  return (
    <div className="course-details-page">
        <>
          <div className="main wmcads-col-1 wmcads-col-md-2-3 wmcads-m-b-xl wmcads-p-r-lg wmcads-p-r-sm-none">
            <div className="wmcads-col-1 wmcads-p-lg bg-white">
              {/* {isMobile && providerDetails(courseProvider)} */}
              <h1 className="h4">Eligibility Checker</h1>
              <h2>Are you eligible?</h2>
              <p>
              Enter your postcode below to find out if you are eligible for funding for this course. You need to live in Birmingham, Coventry, Dudley, Sandwell, Solihull, Walsall or Wolverhampton to qualify.
              </p>
              <form onSubmit={handleSubmit}>
                <div className={postcodeClass}>
                  <label className="wmcads-fe-label" for="input">
                    Postcode
                  </label>
                  {!isValid && (<span className="wmcads-fe-error-message">Please enter a valid postcode</span>)}
                  <input
                    className="wmcads-fe-input"
                    id="input"
                    name="input"
                    type="text"
                    value={postcode}
                    onChange={handleChange}
                  />
                </div>

                <button className={buttonClass} type="submit" disabled={isDisabled} >
                  Check eligibility
                  {load && (
                    <div
                      className="wmcads-loader wmcads-loader--btn wmcads-btn__icon wmcads-btn__icon--right"
                      role="alert"
                      aria-live="assertive"
                    >
                      <p className="wmcads-loader__content">
                        Content is loading...
                      </p>
                    </div>
                  )}
                </button>

                <div className="message">
                  {message ? <p>{message}</p> : null}
                </div>
              </form>
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

const Eligibility = () => {

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

export default Eligibility;
