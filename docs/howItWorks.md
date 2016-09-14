# how it works

given a model,

```es6
{
  name: 'buster brown',
  age: 3,
  contacts: [
    {
      email: 'buster@dogs.org',
      address: {
        city: 'busytown'
        line2: null
      }
    }
  ]
}
```

you can inject it into your state.

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = this.formState.injectModel(props.model);

  this.onSubmit = this.onSubmit.bind(this);
}
```

(alternatively, you can inject in componentDidMount.)

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = {};
}
componentDidMount() {
  getModel().then((model) => {
    let context = this.formState.createUnitOfWork();
    context.injectModel(model);
    context.updateFormState();
  });
}
```

react-formstate flattens the data.

```es6
this.state = {
  'formState.name': { value: 'buster brown' },
  'formState.age': { value: 3 }, // <--- can be coerced to '3'
  'formState.contacts.0.email': { value: 'buster@dogs.org' },
  'formState.contacts.0.address.city': { value: 'busytown' },
  'formState.contacts.0.address.line2': { value: null } // <--- can be coerced to ''
};
```

next describe the model in your jsx.

```es6
import { Form, FormState, FormObject, FormArray } from 'react-formstate';
```

```jsx
<Form formState={this.formState} onSubmit={this.onSubmit}>
  <Input formField='name' label='Name' required/>
  <Input formField='age' label='Age' intConvert/>
  <FormArray name='contacts'>
    <FormObject name='0'>
      <Input formField='email' label='Contact Email'/>
      <Input formField='address.city' label='Contact Address City'/>
      <Input formField='address.line2' label='Contact Address Line 2' preferNull/>
    </FormObject>
  </FormArray>
  <input type='submit' value='Submit'/>
</Form>
```

for each input, react-formstate generates an appropriate "fieldState" prop and a change handler.

(typically you'll want to coerce values to strings, but not always.)

```es6
import React, { Component } from 'react';

export default class Input extends Component {
  constructor(props) {
    super(props);

    // react-formstate provides a standard change handler but you can override it
    this.onChange = (e) => this.props.handleValueChange(e.target.value);
  }

  render() {
    // most of the time you'll use this
    let value = this.props.fieldState.getValue();

    // but you have the option of using this
    let uncoercedValue = this.props.fieldState.getUncoercedValue();

    return (
      <div>
        <label>{this.props.label}</label>
        <input
          type={this.props.type || 'text'}
          value={ choose a coerced or an uncoerced value }
          onChange={this.onChange}
          />
        <span>{this.props.fieldState.getMessage()}</span>
      </div>
    );
  }
}
```

the change handler updates form state by making an appropriate call to setState. suppose name is updated to an empty string:

```es6
this.setState(
  {
    'formState.name':
    {
      value: '',
      validity: 2, // invalid
      message: 'Name is required',
      isCoerced: true
    }
  }
);
```

you can override the change handler using a simple api to update immutable form state.

```es6
handleNameChange(newValue) {
  let context = this.formState.createUnitOfWork(),
    fieldState = context.getFieldState('name');

  fieldState.setCoercedValue(newValue).validate();
  context.updateFormState();
}
```

upon form submission, **based on how the inputs are structured in the jsx,** react-formstate builds a model from your form state.

(note that you can change the structure of your inputs dynamically. react-formstate will honor the representation from the most recent render.)

```es6
onSubmit(e) {
  e.preventDefault();
  let model = this.formState.createUnitOfWork().createModel();
  if (model) { // if valid data
    // form state is "unflattened" according to your jsx.
    // in this example the generated model will look like the original model.
    alert(JSON.stringify(model));
  }
  // otherwise a call to setState sets all the validation messages
  // (you can control the call to setState if necessary)
}
```

the intConvert and preferNull props save you some code upon submit:

```es6
onSubmit(e) {
  e.preventDefault();
  let model = this.formState.createUnitOfWork().createModel();
  if (model) {
    // intConvert and preferNull do this for you
    model.age = Number(model.age); // undo string coercion
    if (model.contacts[0].address.line2 === '') {
      model.contacts[0].address.line2 = null; // undo string coercion
    }
    // ...
  }
}
```

of course, you don't have to inject a model. null and undefined values are coerced to empty strings.

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = {}; // no initial form state

  this.onSubmit = this.onSubmit.bind(this);
}
```

defaultValue is then a useful feature.

```jsx
<HiddenInput formField='id' defaultValue='0' intConvert/>
```

you can build [nested form components](/docs/nestedFormExample.md) but the entire form state is held in the root form component.

and that's the heart of it, really.

of the things that aren't covered here, [validation](/docs/validationWiring.md) is probably the most useful topic.

thanks for your interest. i hope you enjoy react-formstate!
