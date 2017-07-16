# Asynchronous validation

Working example [here](https://dtrelogan.github.io/react-formstate-demo/).

```es6
import React, { Component } from 'react';
import { FormState, Form } from 'react-formstate';
import Input from './Input.jsx';

export default class UserForm extends Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = this.formState.injectModel(props.model);

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  originalUsername() {
    return this.props.model && this.props.model.username;
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
          fsv={v => v.regex(/^\S+$/).msg('Username must not contain spaces')}
          handleValueChange={this.handleUsernameChange}
        />
        <input type='submit' value='Submit'/>
        <span>{submitMessage}</span>
      </Form>
    );
  }


  handleUsernameChange(username) {
    const context = this.formState.createUnitOfWork(),
      fieldState = context.set('username', username);

    fieldState.validate();
    if (fieldState.isInvalid()) {
      context.updateFormState();
      return;
    } // else

    if (username === this.originalUsername()) {
      fieldState.setValid('Verified');
      fieldState.showMessage(); // if normally waiting until onBlur
      context.updateFormState();
      return;
    } // else

    // careful: user might type more letters into the username input box
    const asyncToken = fieldState.setValidating('Verifying username...');
    context.updateFormState();

    // simulate calling your api
    window.setTimeout(() => {
      const context = this.formState.createUnitOfWork(),
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
    const model = this.formState.createUnitOfWork().createModel();
    if (model) {
      // Even if you hit submit, you won't enter this block of code
      // if the form is waiting for asynchronous validation to finish.
      alert(JSON.stringify(model));
    }
  }

}
```


## Alternative approaches

The onChange approach above is simple and arguably provides the best user experience. It is completely compatible with showing the validation message on blur if that is your preference.

If you are nevertheless compelled to perform asynchronous validation during your onSubmit handler, or during your onBlur handler, you can, but react-formstate intentionally does not streamline support for it. Some cursory examples are provided [here](/docs/asyncAlternatives.md).
