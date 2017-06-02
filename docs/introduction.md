# An introduction to react-formstate

Let's contrast a simple form built in raw react:

&nbsp;

```jsx
import React, { Component } from 'react';

const Input = ({label, value, onChange}) => {
  return (
    <div>
      <div>{label}</div>
      <input type='text' value={value} onChange={onChange}/>
    </div>
  );
};

export default class RawReactForm extends Component {
  
  constructor(props) {
    super(props);
    
    // initialize default values for all the fields
    this.state = {
      model: {
        name: '',
        address: {
          city: 'Busytown'
        }
      }
    };
    
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  render() {
    const model = this.state.model;
    
    return (
      <form onSubmit={this.handleSubmit}>
        <Input
          label='Name'
          value={model.name}
          onChange={e => this.setState({model: {...model, name: e.target.value}})}
          />
        <Input
          label='Address City'
          value={model.address.city}
          onChange={e => this.setState({model: {...model, address: {...model.address, city: e.target.value}}})}
          />
        <input type='submit' value='Submit'/>
      </form>
    );
  }
  
  handleSubmit(e) {
    e.preventDefault();
    // persist the model instance here...
    alert(JSON.stringify(this.state.model));
  }
}
```

&nbsp;

&nbsp;

with an equivalent form built using react-formstate:

&nbsp;

```jsx
import React, { Component } from 'react';
import { FormState, Form } from 'react-formstate';

const Input = ({label, value, onChange}) => {
  return (
    <div>
      <div>{label}</div>
      <input type='text' value={value} onChange={onChange}/>
    </div>
  );
};

const RfsInput = ({fieldState, handleValueChange, ...other}) => {
  return (
    <Input
      value={fieldState.getValue()}
      onChange={e => handleValueChange(e.target.value)}
      {...other}
      />
  );
};

export default class SimpleRfsForm extends Component {
  
  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    
    // you only need to initialize values for non-empty fields
    // and you can do it in the jsx
    this.state = {};
    
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  
  render() {
    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <RfsInput formField='name' label='Name'/>
        <RfsInput formField='address.city' label='Address City' defaultValue='Busytown'/>
        <input type='submit' value='Submit'/>
      </Form>
    );
  }
  
  handleSubmit(e) {
    e.preventDefault();
    // persist the model instance here...
    const model = this.formState.createUnitOfWork().createModel();
    alert(JSON.stringify(model));
  }
}
```

&nbsp;

&nbsp;

Comparing the examples, react-formstate saves some effort in terms of initializing an empty form and dealing with updates to immutable state, but at this point the form written with react-formstate isn't necessarily more elegant or more maintainable than the form written in raw react.

Now let's try to add simple validation:

```diff
import React, { Component } from 'react';

+const Input = ({label, value, help, onChange}) => {
  return (
    <div>
      <div>{label}</div>
      <input type='text' value={value} onChange={onChange}/>
+     <div>{help}</div>
    </div>
  );
};

export default class RawReactForm extends Component {

  constructor(props) {
    super(props);

    this.state = {
      model: {
        name: '',
        address: {
          city: 'Busytown'
        }
      }
    };
    
    this.handleSubmit = this.handleSubmit.bind(this);
  }

+ validate() {
+   const errors = {};
+   const model = this.state.model;
+
+   if (!model.name) {
+     errors.name = 'Name is required';
+   } else if (model.name.substring(0,1) === model.name.substring(0,1).toLowerCase()) {
+     errors.name = 'Name must be capitalized';
+   }
+
+   if (!model.address || !model.address.city) {
+     errors['address.city'] = 'City is required';
+   }
+
+   return {
+     errors: errors,
+     isInvalid: Object.keys(errors).length > 0
+   };
+ }
+
  render() {
    const model = this.state.model;
+   const {errors, isInvalid} = this.validate();

    return (
      <form onSubmit={this.handleSubmit}>
        <Input
          label='Name'
          value={model.name}
          onChange={e => this.setState({model: {...model, name: e.target.value}})}
+         help={errors.name}
          />
        <Input
          label='Address City'
          value={model.address.city}
          onChange={e => this.setState({model: {...model, address: {...model.address, city: e.target.value}}})}
+         help={errors['address.city']}
          />
+       <input type='submit' value='Submit' disabled={isInvalid}/>
      </form>
    );
  }

  handleSubmit(e) {
    e.preventDefault();
    // persist the model instance here...
    alert(JSON.stringify(this.state.model));
  }
}
```

&nbsp;

&nbsp;

This is a decent pattern, but there are problems. For starters, ALL the validation messages display before the user has a chance to input anything. To fix this, we *could* try to add an object to state to track which fields have been touched, but the complexity of the code is ratcheting up fast, and this is for an incredibly simple form. Worse, as we solve these problems, the pattern is no longer DRY, which means the approach is tedious and error prone, particularly as you transfer it to other forms. Moreover, without significant alteration, it simply doesn't allow for complex use cases like asynchronous validation.

Let's instead add validation using react-formstate:

```diff
import React, { Component } from 'react';
import { FormState, Form } from 'react-formstate';

+const Input = ({label, value, help, onChange}) => {
  return (
    <div>
      <div>{label}</div>
      <input type='text' value={value} onChange={onChange}/>
+     <div>{help}</div>
    </div>
  );
};

const RfsInput = ({fieldState, handleValueChange, ...other}) => {
  return (
    <Input
      value={fieldState.getValue()}
+     help={fieldState.getMessage()}
      onChange={e => handleValueChange(e.target.value)}
      {...other}
      />
  );
};

export default class SimpleRfsForm extends Component {
  
  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = {};
    
    this.handleSubmit = this.handleSubmit.bind(this);
+   this.validateName = this.validateName.bind(this);
  }
  
  render() {
    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
+       <RfsInput formField='name' label='Name' required validate={this.validateName}/>
+       <RfsInput formField='address.city' label='Address City' required defaultValue='Busytown'/>
+       <input type='submit' value='Submit' disabled={this.formState.isInvalid()}/>
      </Form>
    );
  }

+ validateName(newValue) {
+   if (newValue.substring(0,1) === newValue.substring(0,1).toLowerCase()) {
+     return 'Name should be capitalized';
+   }
+ }
  
  handleSubmit(e) {
    e.preventDefault();
    const model = this.formState.createUnitOfWork().createModel();
+   if (model) { // if model is valid
      alert(JSON.stringify(model)); // persist...
+   }
  }
}
```

&nbsp;

&nbsp;

This is much better, and this is only a simple form. Where react-formstate **really shines** is when you get to more complex use cases. Unlike many other react form packages, react-formstate handles complex forms gracefully, without getting in your way.

Continue the walkthrough [here](workingWithFormState.md) to learn more about react-formstate.
