import React, { useState } from 'react';
import { Form, Button, Input, RadioGroup, Radio, SelectPicker } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import './index.css';
import formFields from './formFields.json';

const App = () => {
  const initialFormValues = formFields.reduce((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {});

  const initialErrors = formFields.reduce((acc, field) => {
    acc[field.name] = '';
    return acc;
  }, {});

  const [formValues, setFormValues] = useState(initialFormValues);
  const [errors, setErrors] = useState(initialErrors);

  const handleChange = (value, name) => {
    setFormValues((prevValues) => ({ ...prevValues, [name]: value }));
    setErrors((prevErrors) => ({ ...prevErrors, [name]: '' }));
  };

  const validate = () => {
    const newErrors = {};
    formFields.forEach((field) => {
      if (!formValues[field.name]) {
        newErrors[field.name] = `${field.label} is required`;
      } else if (field.type === 'email') {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formValues[field.name])) {
          newErrors[field.name] = 'Please enter a valid email';
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      console.log(formValues);
    } else {
      console.log("Validation failed");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Form 
        onSubmit={handleSubmit} 
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        {formFields.map((field, index) => (
          <Form.Group controlId={field.name} key={index}>
            <Form.ControlLabel className="block font-semibold text-gray-700">
              {field.label}
            </Form.ControlLabel>

            {field.type === 'textfield' || field.type === 'email' || field.type === 'password' || field.type === 'phone' ? (
              <Input
                name={field.name}
                type={field.inputType || 'text'}
                placeholder={field.placeholder}
                value={formValues[field.name]}
                onChange={(value) => handleChange(value, field.name)}
                className={`border ${errors[field.name] ? 'border-red-500' : 'border-gray-300'} rounded-lg p-2 w-full`}
              />
            ) : field.type === 'radio' ? (
              <RadioGroup
                name={field.name}
                inline
                value={formValues[field.name]}
                onChange={(value) => handleChange(value, field.name)}
              >
                {field.values.map((option, i) => (
                  <Radio key={i} value={option} className="mr-4">
                    {option}
                  </Radio>
                ))}
              </RadioGroup>
            ) : field.type === 'select' ? (
              <SelectPicker
                data={field.values.map((option) => ({ label: option, value: option }))}
                value={formValues[field.name]}
                onChange={(value) => handleChange(value, field.name)}
                placeholder={field.placeholder}
                block
              />
            ) : null}

            {errors[field.name] && (
              <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
            )}
          </Form.Group>
        ))}

        <Button 
          appearance="primary" 
          type="submit" 
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
        >
          Submit
        </Button>
      </Form>
    </div>
  );
};

export default App;
