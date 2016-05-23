# asynchronous validation

```jsx
import React from 'react';
import { FormState, Form } from 'react-formstate';
import Input from './Input.jsx';

export default class UserForm extends React.Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = this.formState.createUnitOfWork().injectModel(props.model);
    this.originalUsername = props.model && props.model.username;

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    let submitMessage = null;

    if (this.formState.isValidating()) {
      submitMessage = 'Waiting for validation to finish...';
    } else if (this.formState.isInvalid()) {
      submitMessage = 'Please fix validation errors';
    }

    // notice we are overriding the framework-generated updateFormState prop for username

    // also notice username is still marked required.
    // this will prevent a valid form submission before the user enters anything.
    // (i.e., no change handler is called in that case)

    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <Input
          formField='username'
          label='Username'
          required
          updateFormState={this.handleUsernameChange.bind(this)}
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


  handleUsernameChange(e) {
    let username = e.target.value,
      context = this.formState.createUnitOfWork(),
      fieldState = context.getFieldState('username');

    fieldState.setValue(username);

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
    window.setTimeout(function() {
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
    }.bind(this), 2000);
  }

}
```
