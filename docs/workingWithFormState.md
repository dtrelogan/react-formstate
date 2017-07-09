# Introduction to the FormState API

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

In react-formstate, a default value is used to supply a value to an input only if the value for the corresponding field is undefined in your component state. The default value itself is **not** stored in component state. It is a static property provided to the input element.

Default values are syntactic sugar that serve a limited purpose. They are an expressive way to initialize a form input only when you don't have any conditional logic in the render function based on the value of that input. In fairness, this is often the case.

## Initializing form state

It is generally more flexible and powerful to inject the initial form model directly into your state. If a user is editing or updating a form, this is surely the case:

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  // the model to edit is supplied in props.model
  this.state = this.formState.injectModel(props.model);
}
```

The 'add' method can help with initialization. (Although since it both inserts and updates data, a more appropriate name might be 'upsert'.)

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = this.formState.injectModel(props.model);

  // If we are using the same form for CRUD 'creates' and 'updates',
  // and if in 'create' mode, props.model is null or undefined,
  // and if we have to do something dynamic during render based on country,
  // we can initialize a default value for country using the 'add' method.
  if (!this.formState.get('country')) {
    this.formState.add(this.state, 'country', 'USA');

    // The 'add' method can inject both primitive types and objects.
    // The main difference between using add and injectModel
    // is whether you are injecting your root form model,
    // or a specific field within that model.
    this.formState.add(this.state, 'favoriteFormPackage', {name: 'react-formstate', foundedIn: 2016});
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
    // this is a sneak peek at the UnitOfWork API
    // it is properly introduced later
    const context = this.formState.createUnitOfWork();
    context.injectModel(model);
    context.add('isInitialized1', true);
    // alternatively you can set this flag directly in your state object
    context.updateFormState({isInitialized2: true);
  });
}
```

FormState is a simple wrapper around initializing and reading this.state. It transforms the data into, and out of, a format useful to react-formstate. You can, of course, still use your component's state object directly if you want:

```es6
render() {
  // Continuing the example above, whether these are true depends
  // on whether the promise in ComponentDidMount is fulfilled.
  if (this.state.isInitialized2 || this.formState.get('isInitialized1')) {
    // ...
  }
}
```

## Model output depends on rendered inputs

The above example shows that it is arbitrary whether you want to manipulate certain aspects of form state directly in component state, or whether you want to work through the FormState API. Which is easiest may depend on the particular situation.

The reason why this is arbitrary is important to understand. If you supply this model:

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

This is because the schema of the model produced by the submit handler depends on the inputs actually rendered in the JSX, **not** on the collection of values stored in your form state.

(This means you should be familiar with HTML hidden inputs)

```jsx
const HiddenInput = ({fieldState}) => {
  return (
    <input type='hidden' value={fieldState.getValue()}/>
  );
}
```

```jsx
<HiddenInput formField='id' defaultValue='0' intConvert/>
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
        city: 'Busytown',
        line2: null
      }
    }
  ],
  roleIds: [1,2,3]
}
```

flattens the data and returns this state object:

```es6
this.state = {
  'formState.name': { value: 'Huckle' },
  'formState.age': { value: 8 }, // <--- can be coerced to '8'
  'formState.contacts.0.email': { value: 'huckle@busy.town' },
  'formState.contacts.0.address.city': { value: 'Busytown' },
  'formState.contacts.0.address.line2': { value: null }, // <--- can be coerced to ''
  'formState.roleIds': { value: [1,2,3] } // for providing to a multi-select
};
```

Note that, since react-formstate cannot know how your model will be used, it may inject extra fields:

```es6
  // These fields, for example, will go unused.
  // Remember, model output depends on the inputs actually rendered.
  'formState.roleIds.0': { value: 1 },
  'formState.roleIds.1': { value: 2 },
  'formState.roleIds.2': { value: 3 }
```

## Querying form state

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
  this.formState.get('formState.roleIds'); // returns ['1','2','3']
  this.formState.getu('formState.roleIds'); // returns [1,2,3]
}
```

There are several other helper methods to read from form state that will be covered later. We have already seen at least one in the course of the examples:

```jsx
<input type='submit' value='Submit' disabled={this.formState.isInvalid()}/>
```

We have discussed initializing and accessing form state with the FormState API. The [next step](updatingFormState.md) in the walkthrough is to learn how to *update* form state.
