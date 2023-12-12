import { BehaviorSubject } from 'rxjs';

const course$ = new BehaviorSubject(null);

const setCourse$ = (newData) => {
  course$.next(newData);
};

export { course$, setCourse$ };