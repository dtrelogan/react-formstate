# onUpdate callback

Working example [here](https://dtrelogan.github.io/react-formstate-demo/?form=login).

(Note that while this is sufficient for most use cases, react-formstate could be improved by adding support for chained 'middleware' functions like you see in expressjs, redux, or java servlets. That would be an elegant solution to composing 'onChange' functionality added for the entire application, or for a particular form, or even for a nested form component. Maybe in a future enhancement.)

```es6
import React, { Component } from 'react';
import { FormState, Form } from 'react-formstate';
import Input from './Input.jsx';

export default class LoginForm extends Component {

  constructor(props) {
    super(props);
    this.formState = FormState.create(this);
    this.state = {};

    // set a callback from the standard onChange handler
    this.formState.onUpdate(this.onUpdate.bind(this));

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  onUpdate(context) {
    // if in the process of logging in, ignore user input
    if (this.state.loggingIn) { return; }

    // after a failed login, once the user enters something,
    // clear 'Invalid username or password' message
    context.updateFormState({failedLogin: false});
  }

  render() {
    let submitMessage;

    if (this.formState.isInvalid()) {
      submitMessage = 'Please fix validation errors';
    }
    if (this.state.loggingIn) {
      submitMessage = 'Logging in...';
    }

    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <div>{this.state.failedLogin ? 'Invalid username or password' : null}</div>
        <Input formField='username' label='Username' required />
        <Input formField='password' label='Password' required type='password' />
        <input type='submit' value='Submit'/>
        <span>{submitMessage}</span>
      </Form>
    );
  }

  handleSubmit(e) {
    e.preventDefault();

    if (this.state.loggingIn) { return; }

    let model = this.formState.createUnitOfWork().createModel();

    if (model) {
      this.setState({loggingIn: true, failedLogin: false});

      // simulate a login attempt
      window.setTimeout(function() {
        if (model.username === 'fail') {
          this.setState({loggingIn: false, failedLogin: true});
        } else {
          alert('successful login'); // update user session...
        }
      }.bind(this), 2000);
    }
  }
}
```
