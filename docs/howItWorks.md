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

you can use react-formstate to inject it into your state.

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = this.formState.injectModel(props.model);

  this.onSubmit = this.onSubmit.bind(this);
}
```

react-formstate flattens the data which simplifies immutable state.

```es6
this.state = {
  'formState.name': { value: 'buster brown' },
  'formState.age': { value: 3 }, // <--- can be coerced to '3'
  'formState.contacts.0.email': { value: 'buster@dogs.org' },
  'formState.contacts.0.address.city': { value: 'busytown' },
  'formState.contacts.0.address.line2': { value: null } // <--- can be coerced to ''
};
```

next you describe the model and its inputs with your jsx.

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
</Form>
```
react-formstate will generate an appropriate "fieldState" prop and change handler for each input.

(you can choose whether you want react-formstate to coerce your values to strings upon initial retrieval.)

```es6
import React, { Component } from 'react';

export default class Input extends Component {
  constructor(props) {
    super(props);

    // react-formstate provides a standard change handler but you can override it
    this.onChange = (e) => this.props.handleValueChange(e.target.value);
  }

  render() {
    let value = this.props.fieldState.getValue(); // most of the time you'll use this
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

upon a call to handleValueChange, the change handler prepares the backing fieldState data for a call to this.setState. for instance, if the value of the name field is updated to an empty string, the following state update occurs:

```es6
this.setState({ 'formState.name': { value: '', validity: 2, message: 'Name is required', isCoerced: true } });
```

you can override the change handler using a simple api to manipulate the fieldState data, honoring immutable state.

```es6
handleNameChange(newValue) {
  let context = this.formState.createUnitOfWork(),
    fieldState = context.getFieldState('name');

  fieldState.setCoercedValue(newValue).validate();
  context.updateFormState();
}
```

upon form submission, **based on how the inputs are structured in the jsx,** react-formstate builds a model from your form state. (note that you can change the structure of your inputs dynamically. react-formstate will honor the representation from the most recent render.)

```es6
onSubmit(e) {
  e.preventDefault();
  let model = this.formState.createUnitOfWork().createModel();
  if (model) { // if valid data
    alert(JSON.stringify(model)); // model is unflattened according to your jsx. in this example it will look like the original model.
  }
  // otherwise a call to setState sets all the validation messages (you can control the call to setState if necessary)
}
```

the intConvert and preferNull props save you from having to manually transform your model upon submit:

```es6
onSubmit(e) {
  e.preventDefault();
  let model = this.formState.createUnitOfWork().createModel();
  if (model) {
    model.age = Number(model.age); // undo string coercion
    if (model.contacts[0].address.line2 === '') {
      model.contacts[0].address.line2 = null; // undo string coercion
    }
    // ...
  }
}
```

now that you've got that down, of course you don't have to inject a model...

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = {}; // no initial form state

  this.onSubmit = this.onSubmit.bind(this);
}
```

null and undefined values from your form state are coerced to empty strings when provided to inputs. defaultValue is then a useful feature.

```jsx
<HiddenInput formField='id' defaultValue='0' intConvert/>
```

you can build [nested form components](/docs/nestedFormExample.md) but the entire form state is held in the root form component.

and that's the heart of it, really.

of the things that aren't covered here, [validation](/docs/validationWiring.md) is probably the most important topic.

hope you enjoy react-formstate!
