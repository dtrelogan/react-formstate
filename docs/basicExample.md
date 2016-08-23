# Basic Example

```es6
import React, { Component } from 'react';
import { FormState, Form } from 'react-formstate';
import Input from './Input.jsx';

// using the optional validation library to demonstrate fluent api
import { validationAdapter } from 'react-formstate-validation';
validationAdapter.plugInto(FormState);

export default class ChangePasswordForm extends Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = {};

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // you can write plain old validation code
  validateConfirmNewPassword(confirmation, context) {
    if (confirmation !== context.getFieldState('newPassword').getValue()) {
      return 'Password confirmation does not match';
    }
  }

  // or you can use a fluent validation api as appropriate
  render() {
    let submitMessage = null,
      isInvalid = this.formState.isInvalid();

    if (isInvalid) {
      submitMessage = 'Please fix validation errors';
    }

    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <Input
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
        <Input
          formField='confirmNewPassword'
          type='password'
          label='Confirm New Password'
          required
          revalidateOnSubmit
          />
        <input type='submit' value='Submit' disabled={isInvalid}/>
        <span>{submitMessage}</span>
      </Form>
    );
  }

  handleSubmit(e) {
    e.preventDefault();
    let model = this.formState.createUnitOfWork().createModel();
    if (model) {
      alert(JSON.stringify(model)); // proceed with valid data
    }
    // else: createModel called setState to set the appropriate validation messages
  }
}
```

an associated input component manages no state and is essentially a layout of your choosing. it might look like:

```es6
import React, { Component } from 'react';

export default class Input extends Component {

  render() {
    return (
      <div>
        <label>{this.props.label}</label>
        <input
          type={this.props.type || 'text'}
          value={this.props.fieldState.getValue()}
          onChange={this.props.updateFormState}
          />
        <span>{this.props.fieldState.getMessage()}</span>
      </div>
    );
  }
}
```
