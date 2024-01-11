
import { openDB } from 'idb';
import apiCourseProviders from './apiCourseProviders'
import apiCoursesService from './apiCourses'

const apiCourseProviderStorage = async () => {
  try {
    const db1 = await openDB('coursesDB', 1);

    // Assuming apiCoursesService.getData() returns a promise
    const courses = await apiCoursesService.fetchDataFromApi();
    await db1.put('courses', JSON.stringify(courses), 'courses');

    const providers = await apiCourseProviders();
    await db1.put('providers', JSON.stringify(providers), 'providers');

    // You can return a value here if needed
    return { courses, providers };
  } catch (error) {
    console.log(error, 'error')
    // You can throw the error or return an error object, depending on your use case
    throw error;
  }
};

export default apiCourseProviderStorage
