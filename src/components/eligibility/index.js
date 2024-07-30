import React, { useState } from 'react';
import useFetch from '../../services/useFetch';

const EligibilityComponent = () => {
  const [inputValue, setInputValue] = useState('');
  const { data, loading, error } = useFetch(`https://api.example.com/data?query=${inputValue}`);

  const handleChange = (e) => {
    setInputValue(e.target.value);
  };

  return (
    <div>
      <input type="text" value={inputValue} onChange={handleChange} placeholder="Type to search..." />
      {loading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <div>{JSON.stringify(data)}</div>}
    </div>
  );
};

export default EligibilityComponent;