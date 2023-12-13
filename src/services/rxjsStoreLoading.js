import { BehaviorSubject } from 'rxjs';

const loading$ = new BehaviorSubject(null);

const setLoading$ = (newData) => {
  loading$.next(newData);
};

export { loading$, setLoading$ };