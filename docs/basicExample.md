# Basic Example

```jsx
import React from 'react';
import { FormState, FormObject } from 'react-formstate';
import Input from './Input.jsx';

// using the optional validation library to demonstrate fluent api
import { validationAdapter } from 'react-formstate-validation';
validationAdapter.plugInto(FormState);

export default class ChangePasswordForm extends React.Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);

    // if you were editing a model, you could "inject" props.model
    this.state = this.formState.createUnitOfWork().injectModel();

    // since we're not injecting a model, the above is equivalent to
    this.state = {};

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  // you can write plain old validation code
  validateConfirmNewPassword(confirmation, context) {
    if (confirmation !== context.getFieldState('newPassword').getValue()) {
      return 'Password confirmation does not match';
    }
  }

  render() {
    let submitMessage = '';
    if (this.formState.isInvalid()) {
      submitMessage = 'Please fix validation errors';
    }
    // or you can use a fluent validation api as appropriate
    return (
      <form>
        <FormObject formState={this.formState}>
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
            />
        </FormObject>
        <input type='submit' value='Submit' onClick={this.handleSubmit} />
        <span>{submitMessage}</span>
      </form>
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

### remarks

- business logic is encapsulated in your form component, not your reusable input components.
- invalid data does not leave your form component, insulating your application, allowing it to focus on more important things.
- saves a lot of time and effort for common tasks while also providing the proper extension points for whatever you need to accomplish.
  - in other words it helps you get work done but doesn't get in your way.
