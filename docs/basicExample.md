# Basic Example

```jsx
import React, { Component } from 'react';
import { FormState, Form } from 'react-formstate';


// Using the optional validation library to demonstrate fluent api
import { validationAdapter } from 'react-formstate-validation';
validationAdapter.plugInto(FormState);


// An associated input component manages no state
// and is essentially a layout of your choosing
//
const Input = ({label, type, value, help, onChange}) => {
  return (
    <div>
      <div>{label}</div>
      <input type={type || 'text'} value={value} onChange={onChange}/>
      <div>{help}</div>
    </div>
  );
};


// A component shim to transform props provided by react-formstate
// to simple props for the vanilla Input component
//
const RfsInput = ({fieldState, handleValueChange, ...other}) => {
  return (
    <Input
      value={fieldState.getValue()}
      help={fieldState.getMessage()}
      onChange={e => handleValueChange(e.target.value)}
      {...other}
      />
  );
};


export default class ChangePasswordForm extends Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = {};

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // you can write plain old validation code
  validateConfirmNewPassword(confirmationValue, context) {
    if (confirmationValue !== context.get('newPassword')) {
      return 'Password confirmation does not match';
    }
  }

  // or you can use a fluent validation api as appropriate
  render() {
    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <RfsInput
          formField='newPassword'
          type='password'
          label='New Password'
          required
          fsv={v => v.regex(/^\S+$/)
            .msg('Password must not contain whitespace')
            .minLength(8)
            .msg('Password must be at least 8 characters')
          }
          />
        <RfsInput
          formField='confirmNewPassword'
          type='password'
          label='Confirm New Password'
          required
          revalidateOnSubmit
          />
        <input type='submit' value='Submit' disabled={this.formState.isInvalid()}/>
      </Form>
    );
  }


  handleSubmit(e) {
    e.preventDefault();
    const model = this.formState.createUnitOfWork().createModel();
    if (model) {
      alert(JSON.stringify(model)); // proceed with valid data
    }
    // else: createModel called setState to set the appropriate validation messages
  }
}
```
