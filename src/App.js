import React, { useRef, useState } from 'react';
import { Form, Button, Input, RadioGroup, Radio, SelectPicker, Schema } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import './index.css';
import formFields from './formFields.json';

const { StringType } = Schema.Types;

// Create a dynamic schema based on your `formFields`
const generateSchema = (fields) => {
  const schemaObject = fields.reduce((acc, field) => {
    let type = StringType();

    // Handle validation rules from JSON
    const validation = field.validation || {};

    if (validation.required) {
      type = type.isRequired(validation.errorMessage || `${field.label} is required`);
    }
    if (validation.minLength) {
      type = type.minLength(validation.minLength, validation.errorMessage);
    }
    if (validation.isEmail) {
      type = type.isEmail(validation.errorMessage || 'Please enter a valid email address');
    }
    if (validation.pattern) {
      const regex = new RegExp(validation.pattern);
      type = type.pattern(regex, validation.errorMessage);
    }

    acc[field.name] = type;
    return acc;
  }, {});

  return Schema.Model(schemaObject);
};


const App = () => {
  const formRef = useRef(null);
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const schema = generateSchema(formFields);

  const handleMaritalStatusChange = (value) => {
    if (value === 'Single') {
      // Clear dependent fields when "Single" is selected
      setFormValues((prevValues) => ({
        ...prevValues,
        maritalStatus: value,
        spouseName: undefined,
        children: undefined,
        firstchildName: undefined,
      }));
    } else {
      setFormValues((prevValues) => ({
        ...prevValues,
        maritalStatus: value,
      }));
    }
  };

  const handleSubmit = () => {
    if (formRef.current.check()) {
      console.log('Form Values:', formValues);
    } else {
      console.log('Validation failed');
    }
  };

  const renderFields = () => {
    const renderedFields = [];

    // Render all fields above "Marital Status"
    const fieldsAboveMaritalStatus = formFields.filter(
      (field) =>
        !['maritalStatus', 'spouseName', 'children', 'firstchildName'].includes(field.name)
    );

    fieldsAboveMaritalStatus.forEach((field) => {
      renderedFields.push(
        <Form.Group controlId={field.name} key={field.name}>
          <Form.ControlLabel className="block font-semibold text-gray-700">
            {field.label}
          </Form.ControlLabel>
          {field.type === 'radio' ? (
            <Form.Control
              name={field.name}
              accepter={RadioGroup}
              inline
            >
              {field.values.map((value) => (
                <Radio value={value} key={value} className="mr-4">
                  {value}
                </Radio>
              ))}
            </Form.Control>
          ) : (
            <Form.Control
              name={field.name}
              type={field.type === 'password' ? 'password' : 'text'}
              placeholder={field.placeholder}
              accepter={
                field.type === 'select' ? SelectPicker : Input
              }
              data={
                field.type === 'select'
                  ? field.values.map((value) => ({ label: value, value }))
                  : undefined
              }
            />
          )}
        </Form.Group>
      );
    });

    // Render "Marital Status" section below "Country"
    const maritalStatusField = formFields.find((field) => field.name === 'maritalStatus');
    if (maritalStatusField) {
      renderedFields.push(
        <Form.Group controlId={maritalStatusField.name} key={maritalStatusField.name}>
          <Form.ControlLabel className="block font-semibold text-gray-700">
            {maritalStatusField.label}
          </Form.ControlLabel>
          <Form.Control
            name={maritalStatusField.name}
            accepter={RadioGroup}
            inline
            value={formValues.maritalStatus}
            onChange={handleMaritalStatusChange}
          >
            {maritalStatusField.values.map((value) => (
              <Radio value={value} key={value} className="mr-4">
                {value}
              </Radio>
            ))}
          </Form.Control>
        </Form.Group>
      );
    }

    // Render "Spouse's Name" if marital status is "Married"
    if (formValues.maritalStatus === 'Married') {
      const spouseField = formFields.find((field) => field.name === 'spouseName');
      if (spouseField) {
        renderedFields.push(
          <Form.Group controlId={spouseField.name} key={spouseField.name}>
            <Form.ControlLabel className="block font-semibold text-gray-700">
              {spouseField.label}
            </Form.ControlLabel>
            <Form.Control
              name={spouseField.name}
              type="text"
              placeholder={spouseField.placeholder}
              accepter={Input}
            />
          </Form.Group>
        );
      }
    }

    // Render "Do you have children?" if marital status is "Married"
    if (formValues.maritalStatus === 'Married') {
      const childrenField = formFields.find((field) => field.name === 'children');
      if (childrenField) {
        renderedFields.push(
          <Form.Group controlId={childrenField.name} key={childrenField.name}>
            <Form.ControlLabel className="block font-semibold text-gray-700">
              {childrenField.label}
            </Form.ControlLabel>
            <Form.Control
              name={childrenField.name}
              accepter={RadioGroup}
              inline
            >
              {childrenField.values.map((value) => (
                <Radio value={value} key={value} className="mr-4">
                  {value}
                </Radio>
              ))}
            </Form.Control>
          </Form.Group>
        );
      }
    }

    // Render "First Child's Name" if "Do you have children?" is "Yes"
    if (formValues.children === 'Yes') {
      const firstChildField = formFields.find((field) => field.name === 'firstchildName');
      if (firstChildField) {
        renderedFields.push(
          <Form.Group controlId={firstChildField.name} key={firstChildField.name}>
            <Form.ControlLabel className="block font-semibold text-gray-700">
              {firstChildField.label}
            </Form.ControlLabel>
            <Form.Control
              name={firstChildField.name}
              type="text"
              placeholder={firstChildField.placeholder}
              accepter={Input}
            />
          </Form.Group>
        );
      }
    }

    return renderedFields;
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Form
        ref={formRef}
        model={schema}
        formValue={formValues}
        onChange={setFormValues}
        onCheck={setErrors}
        className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-4"
      >
        {renderFields()}
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
