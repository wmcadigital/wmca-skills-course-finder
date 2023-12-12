import { BehaviorSubject } from 'rxjs';

const courseProviders$ = new BehaviorSubject(null);

const setCourseProviders$ = (newData) => {
  courseProviders$.next(newData);
};

export { courseProviders$, setCourseProviders$ };