# Basic Example

```jsx
import React from 'react';
import { FormState, Form } from 'react-formstate';
import Input from './Input.jsx';

// using the optional validation library to demonstrate fluent api
import { validationAdapter } from 'react-formstate-validation';
validationAdapter.plugInto(FormState);

export default class ChangePasswordForm extends React.Component {

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
    let submitMessage = null;
    if (this.formState.isInvalid()) {
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
        <input type='submit' value='Submit'/>
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

```jsx
import React from 'react';

export default class Input extends React.Component {

  shouldComponentUpdate(nextProps, nextState) {
    return !nextProps.fieldState.equals(this.props.fieldState);
  }

  render() {
    console.log('render ' + this.props.label); // for demonstration only
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
