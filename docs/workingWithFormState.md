# Introduction to the FormState API

## Initializing form state

The introductory walkthrough made a rough equivalence between this code:

```jsx
constructor(props) {
  super(props);
  
  // initialize default values
  this.state = {model: {name: '', country: 'USA'}};
}

render() {
  if (this.state.model.country === 'USA') {
    // this block of code would run upon initial render
  }
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
  if (this.formState.get('country') === 'USA') {
    // this block of code WOULD NOT run upon initial render
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

However, in a more general sense, this is the equivalent code:

```jsx
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = this.formState.injectModel({name: '', country: 'USA'});
}

render() {
  if (this.formState.get('country') === 'USA') {
    // this block of code would run upon initial render
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

### Understanding default values

A react-formstate default value is used to supply a value to an input only if the value for the corresponding field is undefined in your component state. The default value itself is **not** stored in component state.

Default values are syntactic sugar that serve a limited purpose. They are an expressive way to initialize a form input only when you don't have any conditional logic in the render function based on the value of that input. In fairness, this is often the case.

### Model injection

Initializing form data directly within your component state is a more powerful approach, and react-formstate encourages that approach. For instance, if a user is editing or updating a form, it is best to inject the supplied model directly into your state:

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = this.formState.injectModel(props.model);
}
```

The 'add' method can help to initialize form state.

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = this.formState.injectModel(props.model);

  // If we are doing a 'create' CRUD action, and props.model is null or undefined,
  // and if we have to do something dynamic during render based on country,
  // you can add a default value for country to the state here.
  if (!this.formState.get('country')) {
    this.formState.add(this.state, 'country', 'USA');

    // You can provide an object to the add method.
    // The main difference between using add and injectModel
    // is whether you are injecting your root form model,
    // or a specific field within that model.
    this.formState.add(this.state, 'emergencyContact', {name: 'Richard Scarry', age: 34});
  }
}
```

If necessary, you can initialize form state outside of your constructor:

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = {};
}
componentDidMount() {
  getModel().then((model) => {
    // the UnitOfWork API is covered later
    const context = this.formState.createUnitOfWork();
    context.injectModel(model);
    context.add('anAdditionalField', 'someValue');
    context.updateFormState();
  });
}
```

## The underlying representation

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

FormState is a simple wrapper around your component state. You can, of course, use your component's state object directly if you want:

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = {someFlag: true};
  this.formState.add(this.state, 'address', {city: 'Busytown', country: 'USA'});
}

render() {
  this.state.someFlag === true; // true
  this.formState.get('address.country') === 'USA'; // true
}
```

## Retrieving form state

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

Since you can read whatever you want from form state, outside of supplying form state to react-formstate inputs in your JSX (in which case you need to use the FormState API), whether you add data directly to your state object or via the FormState API is more or less arbitrary. It will come down to what is most convenient depending on the scenario.

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
