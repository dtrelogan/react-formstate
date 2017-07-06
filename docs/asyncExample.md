# asynchronous validation

## onChange

```es6
import React, { Component } from 'react';
import { FormState, Form } from 'react-formstate';
import Input from './Input.jsx';

export default class UserForm extends Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = this.formState.injectModel(props.model);
    this.originalUsername = props.model && props.model.username;

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    let submitMessage = null;

    if (this.formState.isValidating()) {
      submitMessage = 'Waiting for validation to finish...';
    } else if (this.formState.isInvalid()) {
      submitMessage = 'Please fix validation errors';
    }

    // notice we are overriding the framework-generated handleValueChange prop for username

    // also notice username is still marked required.
    // this will prevent a valid form submission before the user enters anything.
    // (i.e., no change handler is called in that case)

    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <Input
          formField='username'
          label='Username'
          required
          handleValueChange={this.handleUsernameChange}
        />
        <input type='submit' value='Submit'/>
        <span>{submitMessage}</span>
      </Form>
    );
  }


  handleUsernameChange(username) {
    let context = this.formState.createUnitOfWork(),
      fieldState = context.getFieldState('username');

    fieldState.setCoercedValue(username);

    // alternatively you could use the set or setc function, see the api documentation.
    // let fieldState = context.setc('username', username);

    if (username === this.originalUsername) {
      fieldState.setValid();
      context.updateFormState();
      return;
    } // else

    fieldState.validate();
    if (fieldState.isInvalid()) {
      context.updateFormState();
      return;
    } // else

    // careful: user might type more letters into the username input box
    const asyncToken = fieldState.setValidating('Verifying username...');
    context.updateFormState();

    // simulate calling your api
    window.setTimeout(() => {
      let context = this.formState.createUnitOfWork(),
        fieldState = context.getFieldState('username', asyncToken);

      // if the token still matches, the username we are verifying is still relevant
      if (fieldState) {
        if (username === 'taken') {
          fieldState.setInvalid('Username already exists');
        } else {
          fieldState.setValid('Verified');
        }
        fieldState.showMessage(); // in case you are showing on blur
        context.updateFormState();
      }
    }, 2000);
  }
  
  
  handleSubmit(e) {
    e.preventDefault();
    let model = this.formState.createUnitOfWork().createModel();
    if (model) {
      // Even if you hit submit, you won't enter this block of code
      // if the form is waiting for asynchronous validation to finish.
      alert(JSON.stringify(model));
    }
  }

}
```

## hybrid

If you are normally showing validation messages immediately upon onChange, but you want to wait to call the async validation until onBlur (in order to prevent extraneous calls to your API), it's a little trickier. In the onChange handler, if the fieldState is otherwise valid, you should set the fieldState to "validating" status to prevent successful form submission before the async handler runs.

But you don't want the "validating..." message to show until onBlur. So, in your input component, you'd have to add a little extra logic, something like:

```jsx
export default ({label, type, fieldState, handleValueChange, showValidationMessage}) => {

  let msg = fieldState.getMessage();
  
  if (fieldState.isValidating() && !fieldState.isMessageVisible()) {
    msg = null;
  }

  return (
    <div>
      <label>{label}</label>
      <input
        type={type || 'text'}
        value={fieldState.getValue()}
        onChange={e => handleValueChange(e.target.value)}
        onBlur={showValidationMessage}
        />
      <span className='help'>
        {msg}
      </span>
    </div>
  );
};
```

You of course also have to override the 'showValidationMessage' handler to call your asynchronous validation upon onBlur. It would look something like:

```es6
usernameOnBlur() {
  const context = formState.createUnitOfWork();
  const fieldState = context.getFieldState('username');
  
  fieldState.showMessage(); // mark the message "visible"
  
  if (!fieldState.isValidating()) {
    context.updateFormState();
    return;
  } // else
  
  const asyncToken = fieldState.setValidating('Verifying username...');
  context.updateFormState();
  
  // simulate calling your api
  window.setTimeout(() => {
    const context = this.formState.createUnitOfWork();
    const fieldState = context.getFieldState('username', asyncToken);

    // if the token still matches, the username we are verifying is still relevant
    if (fieldState) {
      if (username === 'taken') {
        fieldState.setInvalid('Username already exists');
      } else {
        fieldState.setValid('Verified');
      }
      fieldState.showMessage();
      context.updateFormState();
    }
  }, 2000);
}
```

```jsx
<Input
  formField='username'
  label='Username'
  required
  handleValueChange={this.handleUsernameChange}
  showValidationMessage={this.usernameOnBlur}
  />
```

## onBlur

Given the above examples and the [onBlur example](/docs/onBlurExample.md), it should be straightforward. You'd have to override the 'showValidationMessage' handler to add a call to your API.
