# Introduction to the FormState API

## Default values

The introductory walkthrough made a rough equivalence between this code:

```jsx
constructor(props) {
  super(props);
  
  // initialize default values
  this.state = {model: {name: '', country: 'USA'}};
}

render() {
  return (
    <form ...>
      <input value={this.state.model.name} .../>
      <input value={this.state.model.country} .../>
      <input type='submit' value='Submit'/>
    </form>
  );
}
```

and this code:

```jsx
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = {};
}

render() {
  return (
    <Form formState={this.formState} ...>
      <RfsInput formField='name'/>
      <RfsInput formField='country' defaultValue='USA'/>
      <input type='submit' value='Submit'/>
    </Form>
  );
}
```

This is true in the sense that you may need to set appropriate default values in order to initialize an empty form. (Particularly, in the raw react code, in the initial render you need to provide initial string values to all the text inputs in order to keep the HTML inputs happy.)

However, in a more general sense, this is actually the equivalent code:

```jsx
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = {};
  this.formState.add(this.state, 'country', 'USA');
}

render() {
  return (
    <Form formState={this.formState} ...>
      <RfsInput formField='name'/>
      <RfsInput formField='country'/>
      <input type='submit' value='Submit'/>
    </Form>
  );
}
```

Working with data loaded into your state is generally more powerful. For instance:

```jsx
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = {};
}

render() {
  if (this.formState.get('country') === 'USA') {
    // this block of code would not run upon initial render
  }
  return (
    <Form formState={this.formState} ...>
      <RfsInput formField='name'/>
      <RfsInput formField='country' defaultValue='USA'/>
      <input type='submit' value='Submit'/>
    </Form>
  );
}
```

whereas:

```jsx
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = {};
  this.formState.add(this.state, 'country', 'USA');
}

render() {
  if (this.formState.get('country') === 'USA') {
    // upon initial render this could populate a dropdown for state/province appropriately
  }
  return (
    <Form formState={this.formState} ...>
      <RfsInput formField='name'/>
      <RfsInput formField='country'/>
      <input type='submit' value='Submit'/>
    </Form>
  );
}
```

In react-formstate default values expressed as properties of the react elements in the JSX are stored as part of react-formstate's representation of those elements, **not** as part of your form's state. The default value is used to supply a value to the input only if the value for the corresponding field is undefined in your state.

Default values are a convenient way within react-formstate to initialize an empty form for a user who is filling out the form for the first time. It's syntactic sugar for that limited purpose.

## Model injection

If a user is editing or updating a form, it is best to inject the supplied model into your state:

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = this.formState.injectModel(props.model);
}
```

Injecting this model:

```es6
{
  name: 'Huckle',
  age: 3,
  contacts: [
    {
      email: 'huckle@busy.town',
      address: {
        city: 'Busytown'
        line2: null
      }
    }
  ]
}
```

flattens the data and returns this state object:

```es6
this.state = {
  'formState.name': { value: 'Huckle' },
  'formState.age': { value: 8 }, // <--- can be coerced to '8'
  'formState.contacts.0.email': { value: 'huckle@busy.town' },
  'formState.contacts.0.address.city': { value: 'Busytown' },
  'formState.contacts.0.address.line2': { value: null } // <--- can be coerced to ''
};
```

The 'add' method can also be used to initialize form state:

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = this.formState.injectModel(props.model);
  
  // if we are doing a 'create' CRUD action, and props.model is null or undefined,
  // and if we have to do something dynamic during render based on country,
  // you can add what you need to the state here
  if (!this.formState.get('country')) {
    this.formState.add(this.state, 'country', 'USA');
  }
}
```

You can use accessor methods to read whatever you want from your "form state".

To keep HTML inputs happy, values are typically coerced to strings upon retrieval, but you have a choice in the matter:

```es6
render() {
  this.formState.get('age') === '8'; // true
  this.formState.getu('age') === 8;  // true
  this.formState.get('contacts.0.address.line2') === '';    // true
  this.formState.getu('contacts.0.address.line2') === null; // true
  this.formState.get('notInState') === '';         // true
  this.formState.getu('notInState') === undefined; // true
}
```

FormState is a simple wrapper around your component state. You can, of course, use your component's state object directly if you want:

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = {someFlag: true};
  
  // add flattens objects just like injectModel
  // the main difference between using add and injectModel
  // is whether you are injecting your root form model
  // or a specific field within your model
  this.formState.add(this.state, 'address', {city: 'Busytown', country: 'USA'});
}

render() {
  this.state.someFlag === true; // true
  this.formState.get('address.country') === 'USA'; // true
}
```

Outside of supplying form state to react-formstate inputs in your JSX (in which case you need to use the FormState API), whether you add data directly to your state object or via the FormState API is more or less arbitrary. It will come down to what is most convenient depending on the scenario.

The reason you can do this is important to understand.

## Model output depends on rendered inputs

If you supply this model:

```es6
{
  name: 'Huckle',
  city: 'Busytown'
}
```

to this form:

```jsx
import React, { Component } from 'react';
import { FormState, Form } from 'react-formstate';

export default class SimpleRfsForm extends Component {
  
  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = this.formState.injectModel(props.model);
  }
  
  render() {
    return (
      <Form formState={this.formState} onSubmit={e => this.handleSubmit(e)}>
        <RfsInput formField='name' label='Name' required/>
        <input type='submit' value='Submit'/>
      </Form>
    );
  }
  
  handleSubmit(e) {
    e.preventDefault();
    const model = this.formState.createUnitOfWork().createModel();
    if (model) {
      alert(JSON.stringify(model));
    }
  }
}
```

and if you immediately submit the form, the output in the alert window will be:

```es6
{name: 'Huckle'}
```

The 'city' field is not included in the resulting model.

This is because the nature of the model produced by the submit handler depends on the inputs actually rendered in the JSX.

This means that you can add and remove inputs dynamically to change the structure of your model (which is useful for arrays of objects).

It also means you can put peripheral data into your "form state" without necessarily impacting the model that will be produced.

The [next step](updatingFormState.md) in the walkthrough is to learn how to make updates to form state.
