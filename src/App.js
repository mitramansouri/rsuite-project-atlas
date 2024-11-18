import React, { useRef, useState } from 'react';
import { Form, Button, Input, RadioGroup, Radio, Schema } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import './index.css';
import formFields from './formFields.json';

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
  const [formValues, setFormValues] = useState({});
  const [errors, setErrors] = useState({});
  const [childrenNames, setChildrenNames] = useState(['']); // Initialize with one child's name

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
  
    // Render fields explicitly in the desired order
  
    // 1. Render all fields not related to marital status first
    formFields
      .filter(
        (field) =>
          !['maritalStatus', 'spouseName', 'children', 'firstchildName'].includes(
            field.name
          )
      )
      .forEach((field) => {
        renderedFields.push(
          <Form.Group controlId={field.name} key={field.name}>
            <Form.ControlLabel>{field.label}</Form.ControlLabel>
            {field.type === 'radio' ? (
              <Form.Control
                name={field.name}
                accepter={RadioGroup}
                inline
                value={formValues[field.name]}
                onChange={(value) =>
                  setFormValues((prev) => ({ ...prev, [field.name]: value }))
                }
              >
                {field.values.map((value) => (
                  <Radio value={value} key={value}>
                    {value}
                  </Radio>
                ))}
              </Form.Control>
            ) : (
              <Form.Control
                name={field.name}
                type={field.type === 'password' ? 'password' : 'text'}
                placeholder={field.placeholder}
                accepter={Input}
                value={formValues[field.name]}
                onChange={(value) =>
                  setFormValues((prev) => ({ ...prev, [field.name]: value }))
                }
              />
            )}
          </Form.Group>
        );
      });
  
    // 2. Render "Marital Status" field
    const maritalStatusField = formFields.find(
      (field) => field.name === 'maritalStatus'
    );
    if (maritalStatusField) {
      renderedFields.push(
        <Form.Group controlId={maritalStatusField.name} key={maritalStatusField.name}>
          <Form.ControlLabel>{maritalStatusField.label}</Form.ControlLabel>
          <Form.Control
            name={maritalStatusField.name}
            accepter={RadioGroup}
            value={formValues.maritalStatus}
            onChange={handleMaritalStatusChange}
            inline
          >
            {maritalStatusField.values.map((value) => (
              <Radio value={value} key={value}>
                {value}
              </Radio>
            ))}
          </Form.Control>
        </Form.Group>
      );
    }
  
    // 3. Render "Spouse's Name" immediately after "Marital Status" if married
    if (formValues.maritalStatus === 'Married') {
      const spouseField = formFields.find((field) => field.name === 'spouseName');
      if (spouseField) {
        renderedFields.push(
          <Form.Group controlId={spouseField.name} key={spouseField.name}>
            <Form.ControlLabel>{spouseField.label}</Form.ControlLabel>
            <Form.Control name={spouseField.name} accepter={Input} />
          </Form.Group>
        );
      }
    }
  
    // 4. Render "Do you have children?" if married
    if (formValues.maritalStatus === 'Married') {
      const childrenField = formFields.find((field) => field.name === 'children');
      if (childrenField) {
        renderedFields.push(
          <Form.Group controlId={childrenField.name} key={childrenField.name}>
            <Form.ControlLabel>{childrenField.label}</Form.ControlLabel>
            <Form.Control
              name={childrenField.name}
              accepter={RadioGroup}
              value={formValues.children}
              onChange={(value) => setFormValues({ ...formValues, children: value })}
              inline
            >
              <Radio value="Yes">Yes</Radio>
              <Radio value="No">No</Radio>
            </Form.Control>
          </Form.Group>
        );
      }
    }
  
    // 5. Render dynamic child fields if "Do you have children?" is "Yes"
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
            <Button appearance="link" onClick={() => handleRemoveChild(index)}>
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
};

export default App;
