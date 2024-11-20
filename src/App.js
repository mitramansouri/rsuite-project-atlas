import React, { useRef, useState } from 'react';
import { Form, Button, RadioGroup, Radio, Schema, Input } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import './index.css';
import formFields from './formFields.json';
import { SelectPicker } from 'rsuite';

const { StringType } = Schema.Types;

const generateSchema = (fields) => {
  const schemaObject = fields.reduce((acc, field) => {
    let type = StringType();
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

  const [formValues, setFormValues] = useState(() => {
    const initialValues = formFields.reduce((acc, field) => {
      if (field.type === 'checkbox') {
        acc[field.name] = field.defaultChecked || false;
      } else if (field.type === 'radio') {
        acc[field.name] =
          field.defaultChecked !== undefined
            ? field.defaultChecked
            : typeof field.values[0] === 'object'
              ? field.values[0].value
              : field.values[0];
      } else {
        acc[field.name] = '';
      }
      return acc;
    }, {});
    return initialValues;
  });
  console.log('Initial Form Values:', formValues);
  // eslint-disable-next-line no-unused-vars
  const [errors, setErrors] = useState({});
  const schema = generateSchema(formFields);
  console.log('Generated Schema:', schema);

  const handleCheckboxChange = (name, checked) => {
    setFormValues((prevValues) => ({
      ...prevValues,
      [name]: checked,
    }));
  };

  const renderFields = () => {
    return formFields.map((field) => {
      if (field.hideWhen) {
        const shouldHide = field.hideWhen.some((condition) => {
          const { relation, conditions } = condition;
          const checkConditions = conditions.map((cond) => {
            const fieldValue = formValues[cond.name];
            switch (relation) {
              case 'equal':
                return fieldValue === cond.value;
              case 'notEqual':
                return fieldValue !== cond.value;
              default:
                return false;
            }
          });
          return checkConditions.some(Boolean);
        });

        if (shouldHide) return null;
      }

      if (field.type === 'checkbox') {
        return (
          <Form.Group controlId={field.name} key={field.name}>
            <Form.ControlLabel>{field.label}</Form.ControlLabel>
            <input
              type="checkbox"
              name={field.name}
              checked={formValues[field.name]}
              onChange={(event) => handleCheckboxChange(field.name, event.target.checked)}
            />
          </Form.Group>
        );
      }

      if (field.type === 'radio') {
        return (
          <Form.Group controlId={field.name} key={field.name}>
            <Form.ControlLabel>{field.label}</Form.ControlLabel>
            <RadioGroup
              name={field.name}
              value={formValues[field.name]}
              onChange={(value) =>
                setFormValues((prevValues) => ({
                  ...prevValues,
                  [field.name]: value,
                }))
              }
              inline
            >
              {field.values.map((value) =>
                typeof value === 'object' ? (
                  <Radio key={value.value} value={value.value}>
                    {value.label}
                  </Radio>
                ) : (
                  <Radio key={value} value={value}>
                    {value}
                  </Radio>
                )
              )}
            </RadioGroup>
          </Form.Group>
        );
      }
      if (field.type === 'radio' && !formValues[field.name]) {
        console.warn(`Radio button "${field.name}" does not have a default value.`);
      }
      
      return (
        <Form.Group controlId={field.name} key={field.name}>
          <Form.ControlLabel>{field.label}</Form.ControlLabel>
          <Form.Control
            name={field.name}
            type={field.type === 'password' ? 'password' : undefined}
            placeholder={field.placeholder}
            accepter={field.type === 'select' ? SelectPicker : Input}
            data={
              field.type === 'select'
                ? field.values.map((value) => ({ label: value, value: value }))
                : undefined
            }
            value={formValues[field.name]}
            onChange={(value) =>
              setFormValues((prevValues) => ({
                ...prevValues,
                [field.name]: value,
              }))
            }
          />
        </Form.Group>
      );
    });
  };
  const handleSubmit = () => {
    const isValid = formRef.current.check();
    console.log('Form Values:', formValues);
    if (isValid) {
      console.log('Form Submitted Successfully:', formValues);
    } else {
      console.error('Validation failed. Errors:', errors);
      Object.keys(errors).forEach((field) => {
        console.error(`Validation error in "${field}":`, errors[field]);
      });
    }
  };
  

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Form
        ref={formRef}
        model={schema}
        formValue={formValues}
        onChange={setFormValues}
        onCheck={(newErrors) => {
          setErrors(newErrors);
          console.log('Validation Errors:', newErrors);
        }}
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
