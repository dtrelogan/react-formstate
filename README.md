# react-formstate
a clean, simple form framework for react

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
  }

  render() {
    return (
      <form>
        <FormObject formState={this.formState}>
          <Input formField='username' label='Username' required />
          <Input formField='password' label='Password' required type='password' />
        </FormObject>
        <input type='submit' value='Submit' onClick={this.handleSubmit.bind(this)} />
        <span>{this.formState.isInvalid() ? 'Please fix validation errors' : null}</span>
      </form>
    );
  }

  handleSubmit(e) {
    e.preventDefault();
    let model = this.formState.createUnitOfWork().createModel();
    if (model) {
      alert(JSON.stringify(model)); // submit to your api or store or whatever
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

### remarks

- no mixin or decoration, just an api
- form state lives with your form component until the form is submitted with valid data
- designed to work with react [controlled components](https://facebook.github.io/react/docs/forms.html#controlled-components)
- framework simply provides props, you lay out your inputs

### features and examples

- [validation](/validationWiring.md)
- [nested form components](/nestedFormExample.md)
- [asynchronous validation](/asyncExample.md)
- [arrays, adding and removing inputs in response to state changes](/arrayExample.md)
- [other input types: checkbox, checkbox group, radio group, select, and multi-select](/otherInputTypes.md)
- [show validation message on blur](/onBlurExample.md)

### documentation

[api](/api.md)

### peer dependencies

- react (duh)
- es6 polyfills. if you are working in es6 (or above) with babel you shouldn't need to do anything extra to use this library.
