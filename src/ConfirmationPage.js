import React, { useEffect, useState } from 'react';

const ConfirmationPage = () => {
  const [confirmationData, setConfirmationData] = useState({});
  const [fieldNames, setFieldNames] = useState({});

  useEffect(() => {
    // Retrieve data from local storage
    const storedData = JSON.parse(localStorage.getItem('confirmationData')) || {};
    setConfirmationData(storedData);

    // Load field names from nameFields.json
    fetch('/nameFields.json')
      .then((response) => response.json())
      .then((data) => setFieldNames(data))
      .catch((error) => console.error('Error loading field names:', error));
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-4">
        <h2 className="text-xl font-bold">Confirmation Page</h2>
        <ul className="space-y-2">
          {Object.entries(confirmationData).map(([key, value]) => {
            const fieldName = fieldNames[key] || key; // Use nameFields.json or fallback to key
            return (
              <li key={key} className="flex justify-between">
                <span className="font-medium">{fieldName}:</span>
                <span>{typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}</span>
              </li>
            );
          })}
        </ul>
        <button
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
          onClick={() => alert('Confirmed!')}
        >
          Confirm
        </button>
      </div>
    </div>
  );
};

export default ConfirmationPage;
