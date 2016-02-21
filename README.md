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

  validateUsername(username) {
    if (username.trim() === '') { return 'Username is required'; }
  }

  validatePassword(password) {
    if (password.trim() === '') { return 'Password is required'; }
  }

  render() {
    return (
      <form>
        <FormObject formState={this.formState}>
          <Input formField='username' label='Username' />
          <Input formField='password' label='Password' />
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
        <input type='text' value={this.props.fieldState.getValue()} onChange={this.props.updateFormState} />
        <span>{this.props.fieldState.getMessage()}</span>
      </div>
    );
  }
}
```

### required fields

i might suggest the following

```jsx
  <Input formField='username' label='Username' validate={APP.required} />
  <Input formField='password' label='Password' validate={APP.required} />
```

```jsx
  required(value) {
    if (value.trim() === '') { return 'Required field'; }
  }
```

or

```jsx
  required(value, context, field) {
    if (value.trim() === '') { return `${field.label} is required`; }
  }
```

### comments

- no mixin or decoration, just an api
- form state lives with your form component until the form is submitted with valid data
- designed to work with controlled components https://facebook.github.io/react/docs/forms.html
- framework simply provides props, you lay out your inputs
- and...

### NOT a validation library per se

but it does *wire up* validation, which in react is arguably more valuable.

you can do whatever you'd like in your validation callbacks but i'd suggest using validator https://www.npmjs.com/package/validator

sadly, despite the fact that many react packages steer you toward joi https://www.npmjs.com/package/joi _i would NOT recommend using it_. while it has an awesome api, it's not meant for client-side validation and will add about a megabyte to your bundle.

i would love it if there were a clean client-side validation api that gave you the proper hooks for messaging and internationalization, but as far as i'm aware there isn't. i'm totally open to adding something to this api to minimize busy work but it has to be done well. (and for now i need to move on to other things)

regardless i very much believe what you see above enables real work to get done, efficiently and effectively.

### features and examples (the good stuff)

- [nested form components](/nestedFormExample.md)
- [asynchronous validation](/asyncExample.md)
- [arrays, adding and removing inputs in response to state changes](/arrayExample.md)
- [other input types: checkbox, checkbox group, radio group, select, and multi-select](/otherInputTypes.md)

### peer dependencies

- react (duh)
- es6 polyfills. if you are working in es6 (or above) with babel you shouldn't need to do anything extra to use this library.
