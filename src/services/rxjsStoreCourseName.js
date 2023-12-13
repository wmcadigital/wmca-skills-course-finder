import { BehaviorSubject } from 'rxjs';

const courseName$ = new BehaviorSubject(null);

const setCourseName$ = (newData) => {
  courseName$.next(newData);
};

export { courseName$, setCourseName$ };