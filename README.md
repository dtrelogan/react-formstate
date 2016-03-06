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
        <span>submitMessage</span>
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

### remarks

- no mixin or decoration, just an api
- form state lives with your form component until the form is submitted with valid data
- designed to work with react [controlled components](https://facebook.github.io/react/docs/forms.html#controlled-components)
- framework simply provides props, you lay out your inputs

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
