# react-formstate

[![Coverage Status](https://coveralls.io/repos/github/dtrelogan/react-formstate/badge.svg?branch=master)](https://coveralls.io/github/dtrelogan/react-formstate?branch=master)
[![Build Status](https://travis-ci.org/dtrelogan/react-formstate.svg?branch=master)](https://travis-ci.org/dtrelogan/react-formstate)

a clean, simple form framework for [react](https://facebook.github.io/react)

### design remarks

- no mixin or decoration, just an api
- form state lives with your form component until the form is submitted with valid data
- framework simply provides props, you lay out your inputs
- works with react [controlled components](https://facebook.github.io/react/docs/forms.html#controlled-components)

### setup

    $ npm install react-formstate --save

### example

```jsx
import React from 'react';
import { FormState, FormObject } from 'react-formstate';
import Input from './Input.jsx';

export default class LoginForm extends React.Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);

    // if you were editing a model, you could "inject" props.model
    this.state = this.formState.createUnitOfWork().injectModel();

    // since we're not injecting a model, the above is equivalent to
    this.state = {};

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    let submitMessage = '';
    if (this.formState.isInvalid()) {
      submitMessage = 'Please fix validation errors';
    }
    return (
      <form>
        <FormObject formState={this.formState}>
          <Input formField='username' label='Username' required />
          <Input formField='password' label='Password' required type='password' />
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


your input component might look like

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

### concise validation syntax

credit to [joi](https://www.npmjs.com/package/joi) for the inspiration

```jsx
<Input
  formField='amount'
  label='Amount'
  required='Please provide an amount'
  fsValidate={v =>
    v.min(25)
    .message('Amount must be at least $25')
    .max(1000)
    .msg('Amount cannot be more than $1000')}
  />
```
```jsx
<CheckboxGroup
  formField='roleIds'
  label='Roles'
  required='-'
  fsv={v => v.minLength(1).msg('Please select a role')}
  checkboxValues={this.roles}
  defaultValue={[]}
  intConvert
  />
```

### features and examples

- [validation](/docs/validationWiring.md)
- [nested form components](/docs/nestedFormExample.md)
- [asynchronous validation](/docs/asyncExample.md)
- [arrays, adding and removing inputs in response to state changes](/docs/arrayExample.md)
- [other input types: checkbox, checkbox group, radio group, select, and multi-select](/docs/otherInputTypes.md)
- [show validation message on blur](/docs/onBlurExample.md)
- [onUpdate callback](/docs/onUpdateExample.md)

### documentation

- [api](/docs/api.md)

### peer dependencies

- react (!)
- assumes es5 (for example: Object.keys and Array.isArray)
