// let getBlogEndPoint = "https://app-umbraco-multisite.azurewebsites.net/umbraco/delivery/api/v1/content/item/";

const getEndPoint = (id) => {
  return `https://prod-31.uksouth.logic.azure.com/workflows/0f5394c3f8844570a94202527b41f1b7/triggers/manual/paths/invoke/course/course_id?search_text=${id}&api-version=2016-10-01&sp=%2Ftriggers%2Fmanual%2Frun&sv=1.0&sig=ZVkZT_5x_6kpE0Rc4RyfbkYWpO1MnYAJB6KdqoVZzUM`

}

const ApiCourse = async (id) => {

  const response = await fetch(getEndPoint(id), {
    method: 'GET', // or 'POST' or other HTTP methods
  });
  if (!response.ok) {
    console.log(response.status, response.statusText);
  } else {
    const data = await response.json();
    return data.Table1;
  }
};

export default ApiCourse;
