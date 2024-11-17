import React, { useRef, useState } from 'react';
import { Form, Button, Input, RadioGroup, Radio, SelectPicker, Schema } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import './index.css';
import formFields from './formFields.json';

const { StringType } = Schema.Types;

// Create a dynamic schema based on your `formFields`
const generateSchema = (fields) => {
  const schemaObject = fields.reduce((acc, field) => {
    let type = StringType().isRequired(`${field.label} is required`);
    if (field.type === 'email') {
      type = type.isEmail('Please enter a valid email address');
    }
    if (field.type === 'password') {
      type = type.minLength(6, 'Password must be at least 6 characters long');
    }
    if (field.type === 'phone') {
      type = type
        .pattern(/^\d+$/, 'Phone number must contain only numeric values')
        .minLength(10, 'Phone number must be at least 10 digits long');
    }
    acc[field.name] = type;
    return acc;
  }, {});

  return Schema.Model(schemaObject);
};

const App = () => {
  const formRef = useRef(null); // Use useRef to avoid re-renders
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const schema = generateSchema(formFields);

  const handleSubmit = () => {
    if (formRef.current.check()) {
      console.log('Form Values:', formValues);
    } else {
      console.log('Validation failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Form
        ref={formRef} // Assign the form reference here
        model={schema}
        formValue={formValues}
        onChange={setFormValues}
        onCheck={setErrors}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        {formFields.map((field, index) => (
          <Form.Group controlId={field.name} key={index}>
            <Form.ControlLabel className="block font-semibold text-gray-700">
              {field.label}
            </Form.ControlLabel>

            {field.type === 'textfield' || field.type === 'email' || field.type === 'password' || field.type === 'phone' ? (
              <Form.Control
                name={field.name}
                type={field.inputType || 'text'}
                placeholder={field.placeholder}
                accepter={Input}
              />
            ) : field.type === 'radio' ? (
              <Form.Control
                name={field.name}
                accepter={RadioGroup}
                inline
              >
                {field.values.map((option, i) => (
                  <Radio key={i} value={option} className="mr-4">
                    {option}
                  </Radio>
                ))}
              </Form.Control>
            ) : field.type === 'select' ? (
              <Form.Control
                name={field.name}
                accepter={SelectPicker}
                data={field.values.map((option) => ({ label: option, value: option }))}
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
          onClick={handleSubmit}
          className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
        >
          Submit
        </Button>
      </Form>
    </div>
  );
};

export default App;
