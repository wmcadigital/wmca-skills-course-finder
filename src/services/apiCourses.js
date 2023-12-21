// ApiService.js
import { BehaviorSubject } from 'rxjs';

let endPoint = "https://prod-31.uksouth.logic.azure.com/workflows/0f5394c3f8844570a94202527b41f1b7/triggers/manual/paths/invoke/courses/all?api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZVkZT_5x_6kpE0Rc4RyfbkYWpO1MnYAJB6KdqoVZzUM";

class ApiCourses {
  // BehaviorSubject to hold the current data
  dataSubject$ = new BehaviorSubject(null);

  // Function to fetch data from the API
  fetchDataFromApi = async () => {
    try {
      const response = await fetch(endPoint, {
        method: 'GET', // or 'POST' or other HTTP methods
      });
      const data = await response.json();
      return data.Table1;
    } catch (error) {
      console.error('Error fetching data:', error);
      throw error;
    }
  };

  // Function to get the data
  getData = async () => {
    // Check if data is already available
    const currentData = this.dataSubject$.getValue();

    if (currentData) {
      // Data exists, return it
      return currentData;
    }

    // Data doesn't exist, fetch from API
    try {
      const newData = await this.fetchDataFromApi();
      // Update BehaviorSubject with new data
      this.dataSubject$.next(newData.Table1);
      return newData.Table1;
    } catch (error) {
      throw error;
    }
  };
}

// Create an instance of the service
const apiCourses = new ApiCourses();
export default apiCourses;