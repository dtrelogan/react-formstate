# custom FieldState properties

sometimes things don't fit in the box and a little flexibility is required

### file upload progress example

```es6
onprogress = (percent) => {
  let context = this.props.formState.createUnitOfWork(),
    fi = context.getFieldState(this.props.fieldState.getName());

  fi.set('progress', percent);
  context.updateFormState();
};
```

```es6
render() {
  let percent = this.props.fieldState.get('progress');
  return (
    <ProgressBar percentComplete={percent}/>
  );
}
```

### react bootstrap example

[react bootstrap](https://react-bootstrap.github.io/) has a 'warning' validation state.

from a standpoint of preventing invalid form submission, warning is equivalent to valid.

hence, from react-formstate's perspective, this is best supported through a custom FieldState property.

```es6
import React, { Component } from 'react';
import { FormState, Form } from 'react-formstate';
import Input from './FsBootstrapInput.jsx';

export default class UserForm extends Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = this.formState.injectModel(props.model);

    this.handlePasswordChange = this.handlePasswordChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    let submitMessage = null,
      isInvalid = this.formState.isInvalid();

    if (isInvalid) {
      submitMessage = 'Please fix validation errors';
    }

    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <Input
          formField='password'
          type='password'
          label='Password'
          required
          handleValueChange={this.handlePasswordChange}
        />
        <input type='submit' value='Submit' disabled={isInvalid}/>
        <span>{submitMessage}</span>
      </Form>
    );
  }


  handlePasswordChange(password) {
    let context = this.formState.createUnitOfWork(),
      fi = context.setc('password', password).validate();

    if (fi.isValid() && password.length < 8) {
      fi.setValid('password is valid but weak');

      //
      //
      // set additional property
      //
      //
      fi.set('warn', true);
    }

    context.updateFormState();
  }


  handleSubmit(e) {
    e.preventDefault();
    let model = this.formState.createUnitOfWork().createModel();
    if (model) {
      alert(JSON.stringify(model));
    }
  }
}
```

```es6
import React, { Component } from 'react';
import BootstrapInput from './BootstrapInput.jsx';

export default class FsBootstrapInput extends Component {

  render() {
    let props = this.props, fi = props.fieldState, validationState = null;

    if (fi.isValid()) {
      //
      //
      // get additional property
      //
      //
      validationState = fi.get('warn') ? 'warning' : 'success';
    }
    else if (fi.isValidating()) {validationState = 'warning';}
    else if (fi.isInvalid()) {validationState = 'error';}

    return (
      <BootstrapInput
        controlId={fi.getKey()}
        validationState={validationState}
        value={fi.getValue()}
        help={fi.getMessage()}
        {...props}
        />
    );
  }
}
```
