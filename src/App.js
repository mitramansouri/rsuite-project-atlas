import React, { useRef, useState } from 'react';
import { Form, Button, Input, RadioGroup, Radio, Schema } from 'rsuite';
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
  const [formValues, setFormValues] = useState({
    gender: '',
    maritalStatus: '',
    children: '',
    childrenNames: [],
  });
  // eslint-disable-next-line no-unused-vars
  const [errors, setErrors] = useState({});
  const [childrenNames, setChildrenNames] = useState(['']);

  const schema = generateSchema(formFields);

  const handleMaritalStatusChange = (value) => {
    if (value === 'Single') {
      setFormValues((prevValues) => ({
        ...prevValues,
        maritalStatus: value,
        spouseName: undefined,
        children: undefined,
        childrenNames: [],
      }));
      setChildrenNames(['']);
    } else {
      setFormValues((prevValues) => ({
        ...prevValues,
        maritalStatus: value,
      }));
    }
  };

  const handleAddChild = () => {
    setChildrenNames([...childrenNames, '']);
  };

  const handleRemoveChild = (index) => {
    const updatedChildren = childrenNames.filter((_, i) => i !== index);
    setChildrenNames(updatedChildren);
    setFormValues((prevValues) => ({
      ...prevValues,
      childrenNames: updatedChildren,
    }));
  };

  const handleChildNameChange = (value, index) => {
    const updatedChildren = [...childrenNames];
    updatedChildren[index] = value;
    setChildrenNames(updatedChildren);
    setFormValues((prevValues) => ({
      ...prevValues,
      childrenNames: updatedChildren,
    }));
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
    // Dynamically render all fields except Gender
    formFields
      .filter(
        (field) =>
          !['gender', 'maritalStatus', 'spouseName', 'children', 'firstchildName'].includes(
            field.name
          )
      )
      .forEach((field) => {
        renderedFields.push(
          <Form.Group controlId={field.name} key={field.name}>
            <Form.ControlLabel>{field.label}</Form.ControlLabel>
            <Form.Control
              name={field.name}
              type={field.type === 'password' ? 'password' : undefined}
              placeholder={field.placeholder}
              accepter={
                field.type === 'select'
                  ? SelectPicker
                  : field.type === 'radio'
                  ? RadioGroup
                  : Input
              }
              data={
                field.type === 'select'
                  ? field.values.map((value) => ({ label: value, value }))
                  : undefined
              }
              inline={field.type === 'radio' ? true : undefined}
              value={formValues[field.name]}
              onChange={(value) =>
                setFormValues((prev) => ({ ...prev, [field.name]: value }))
              }
            />
          </Form.Group>
        );
        // Insert the Gender field after "Phone Number"
        if (field.name === 'phoneNumber') {
          renderedFields.push(
            <Form.Group controlId="gender" key="gender">
              <Form.ControlLabel>Gender</Form.ControlLabel>
              <RadioGroup
                name="gender"
                value={formValues.gender}
                onChange={(value) =>
                  setFormValues((prevValues) => ({ ...prevValues, gender: value }))
                }
                inline
              >
                <Radio value="Male">Male</Radio>
                <Radio value="Female">Female</Radio>
                <Radio value="Other">Other</Radio>
              </RadioGroup>
            </Form.Group>
          );
        }
      });
    // Render "Marital Status" and related fields dynamically
    const maritalStatusField = formFields.find(
      (field) => field.name === 'maritalStatus'
    );
    if (maritalStatusField) {
      renderedFields.push(
        <Form.Group controlId={maritalStatusField.name} key={maritalStatusField.name}>
          <Form.ControlLabel>{maritalStatusField.label}</Form.ControlLabel>
          <RadioGroup
            name={maritalStatusField.name}
            value={formValues.maritalStatus}
            onChange={handleMaritalStatusChange}
            inline
          >
            {maritalStatusField.values.map((value) => (
              <Radio value={value} key={value}>
                {value}
              </Radio>
            ))}
          </RadioGroup>
        </Form.Group>
      );
    }
    // Add logic for spouse name and children fields
    if (formValues.maritalStatus === 'Married') {
      const spouseField = formFields.find((field) => field.name === 'spouseName');
      if (spouseField) {
        renderedFields.push(
          <Form.Group controlId={spouseField.name} key={spouseField.name}>
            <Form.ControlLabel>{spouseField.label}</Form.ControlLabel>
            <Form.Control
              name={spouseField.name}
              value={formValues.spouseName || ''}
              onChange={(value) =>
                setFormValues((prev) => ({ ...prev, spouseName: value }))
              }
              accepter={Input}
            />
          </Form.Group>
        );
      }
  
      const childrenField = formFields.find((field) => field.name === 'children');
      if (childrenField) {
        renderedFields.push(
          <Form.Group controlId={childrenField.name} key={childrenField.name}>
            <Form.ControlLabel>{childrenField.label}</Form.ControlLabel>
            <RadioGroup
              name={childrenField.name}
              value={formValues.children}
              onChange={(value) =>
                setFormValues((prev) => ({ ...prev, children: value }))
              }
              inline
            >
              <Radio value="Yes">Yes</Radio>
              <Radio value="No">No</Radio>
            </RadioGroup>
          </Form.Group>
        );
      }
    }
  
    if (formValues.children === 'Yes') {
      childrenNames.forEach((name, index) => {
        renderedFields.push(
          <Form.Group controlId={`child-${index}`} key={`child-${index}`}>
            <Form.ControlLabel>Child {index + 1} Name</Form.ControlLabel>
            <Input
              value={name}
              onChange={(value) => handleChildNameChange(value, index)}
              placeholder={`Enter name of child ${index + 1}`}
            />
            <Button
              type="submit"
              appearance="link"
              onClick={() => handleRemoveChild(index)}
            >
              Remove
            </Button>
          </Form.Group>
        );
      });
      renderedFields.push(
        <Button
          appearance="primary"
          onClick={handleAddChild}
          className="my-2"
          key="add-child-button"
        >
          Add Another Child
        </Button>
      );
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
}
export default App;
