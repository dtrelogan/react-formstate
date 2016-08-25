# asynchronous validation

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


  handleSubmit(e) {
    e.preventDefault();
    let model = this.formState.createUnitOfWork().createModel();
    if (model) {
      alert(JSON.stringify(model));
    }
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
    let asyncToken = fieldState.setValidating('Verifying username...');
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

}
```
