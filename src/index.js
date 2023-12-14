import React, { StrictMode } from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { RouterProvider, Navigate, createHashRouter} from "react-router-dom";
import Courses from './pages/courses';
import Course from './pages/course';
import Pag from './pages/pag';

const container = document.getElementById("root");
const root = createRoot(container);

const router = createHashRouter([
  {
    path: '/',
    element: <Navigate to = "/course-finder" />,
  },
  {
    path: "/course-finder",
    element: <Courses />,
  },
  {
    path: "/course-finder/details",
    element: <Course />,
  },
  {
    path: "/pag",
    element: <Pag />,
  },
]);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
