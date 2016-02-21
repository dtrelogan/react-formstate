# asynchronous validation

```jsx
import React from 'react';
import { FormState, FormObject } from 'react-formstate';
import Input from './Input.jsx';

export default class UserForm extends React.Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = this.formState.createUnitOfWork().injectModel(props.model);
    this.originalUsername = props.model && props.model.username;
  }

  validateUsername(username) {
    if (username.trim() === '') { return 'Required field'; }
    // uniqueness validated asynchronously in username handler below
  }

  render() {
    let submitMessage = null;

    if (this.formState.isValidating()) {
      submitMessage = 'Waiting for validation to finish...';
    } else if (this.formState.isInvalid()) {
      submitMessage = 'Please fix validation errors';
    }
    
    // notice we are overriding the framework-generated updateFormState prop for username

    return (
      <form>
        <FormObject formState={this.formState}>
          <Input formField='username' label='Username' updateFormState={this.handleUsernameChange.bind(this)} />
        </FormObject>
        <input type='submit' value='Submit' onClick={this.handleSubmit.bind(this)} />
        <span>{submitMessage}</span>
      </form>
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
    let username = e.target.value;

    let context = this.formState.createUnitOfWork();
    let fieldState = context.getFieldState('username').setValue(username);

    if (username === this.originalUsername) {
      fieldState.setValid();
      context.updateFormState();
      return;
    } // else

    let message = this.validateUsername(username);
    if (message) {
      fieldState.setInvalid(message);
      context.updateFormState();
      return;
    } // else

    // user might type additional characters into the username input box
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
        context.updateFormState();
      }
    }.bind(this), 2000);
  }

}
```
