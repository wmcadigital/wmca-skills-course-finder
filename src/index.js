import React, { StrictMode } from 'react';
import {createRoot} from 'react-dom/client';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { RouterProvider, createBrowserRouter, Route, createRoutesFromElements } from "react-router-dom";
// import App from './App.js'
import Courses from './pages/courses';
import Course from './pages/course';
import Pag from './pages/pag';
import AppLayout from './layout'

const container = document.getElementById("root");
const root = createRoot(container);

const pathname = window.location.pathname;

console.log(pathname, 'path name')
// const router = createBrowserRouter(
//   createRoutesFromElements(
//     <Route path="/" element={AppLayout}>
//       <Route index element={<Courses />} />
//       <Route path="Course" element={<Course />} />
//     </Route>
//   )
// );

const router = createBrowserRouter([
  {
    path: "/",
    element: <Courses />,
  },
  {
    path: "/course",
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
