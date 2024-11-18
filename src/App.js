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

  // return (
  //   <div className="flex items-center justify-center min-h-screen bg-gray-100">
  //     <Form
  //       ref={formRef} // Assign the form reference here
  //       model={schema}
  //       formValue={formValues}
  //       onChange={setFormValues}
  //       onCheck={setErrors}
  //       className="bg-white p-8 rounded-lg shadow-md w-full max-w-md space-y-4"
  //     >
  //       {formFields.map((field, index) => {
  //         // Conditional rendering for "First Child's Name" field
  //         if (field.name === 'firstchildName' && formValues.children !== 'Yes') {
  //           return null;
  //         }

  //         // Conditional rendering for "Spouse's Name" field
  //         if (field.name === 'spouseName' && formValues.maritalStatus !== 'Married') {
  //           return null;
  //         }

  //         return (
  //           <Form.Group controlId={field.name} key={index}>
  //             <Form.ControlLabel className="block font-semibold text-gray-700">
  //               {field.label}
  //             </Form.ControlLabel>

  //             {field.type === 'textfield' || field.type === 'email' || field.type === 'password' || field.type === 'phone' ? (
  //               <Form.Control
  //                 name={field.name}
  //                 type={field.inputType || 'text'}
  //                 placeholder={field.placeholder}
  //                 accepter={Input}
  //               />
  //             ) : field.type === 'radio' ? (
  //               <Form.Control
  //                 name={field.name}
  //                 accepter={RadioGroup}
  //                 inline
  //               >
  //                 {field.values.map((option, i) => (
  //                   <Radio key={i} value={option} className="mr-4">
  //                     {option}
  //                   </Radio>
  //                 ))}
  //               </Form.Control>
  //             ) : field.type === 'select' ? (
  //               <Form.Control
  //                 name={field.name}
  //                 accepter={SelectPicker}
  //                 data={field.values.map((option) => ({ label: option, value: option }))}
  //                 placeholder={field.placeholder}
  //                 block
  //               />
  //             ) : null}
  //           </Form.Group>
  //         );
  //       })}

  //       <Button
  //         appearance="primary"
  //         onClick={handleSubmit}
  //         className="w-full bg-blue-500 text-white font-bold py-2 px-4 rounded hover:bg-blue-600"
  //       >
  //         Submit
  //       </Button>
  //     </Form>
  //   </div>
  // );
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
        {formFields.map((field, index) => {
          if (field.name === 'spouseName' || field.name === 'maritalStatus') {
            // Skip rendering the fields here to handle them together below
            return null;
          }
  
          // Conditional rendering for "First Child's Name" field
          if (field.name === 'firstchildName' && formValues.children !== 'Yes') {
            return null;
          }
  
          return (
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
            </Form.Group>
          );
        })}
  
        {/* Handle Marital Status and Spouse's Name together */}
        <Form.Group controlId="maritalStatus">
          <Form.ControlLabel className="block font-semibold text-gray-700">
            Marital Status
          </Form.ControlLabel>
          <Form.Control
            name="maritalStatus"
            accepter={RadioGroup}
            inline
          >
            <Radio value="Single" className="mr-4">Single</Radio>
            <Radio value="Married" className="mr-4">Married</Radio>
          </Form.Control>
        </Form.Group>
        {formValues.maritalStatus === 'Married' && (
          <Form.Group controlId="spouseName">
            <Form.ControlLabel className="block font-semibold text-gray-700">
              Spouse's Name
            </Form.ControlLabel>
            <Form.Control
              name="spouseName"
              type="text"
              placeholder="Enter your spouse's name"
              accepter={Input}
            />
          </Form.Group>
        )}
  
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
