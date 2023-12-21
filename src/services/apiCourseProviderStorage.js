
import { openDB } from 'idb';
import apiCourseProviders from './apiCourseProviders'
import apiCoursesService from './apiCourses'

const apiCourseProviderStorage = async () => {
  try {
    const db1 = await openDB('coursesDB', 1);

    // Assuming apiCoursesService.getData() returns a promise
    const courses = await apiCoursesService.fetchDataFromApi();
    await db1.add('courses', JSON.stringify(courses), 'courses');
    console.log(courses, 'call')

    const providers = await apiCourseProviders();
    await db1.add('providers', JSON.stringify(providers), 'providers');
    console.log(providers, 'call')


    // You can return a value here if needed
    return { courses, providers };
  } catch (error) {
    // You can throw the error or return an error object, depending on your use case
    throw error;
  }
};

export default apiCourseProviderStorage
