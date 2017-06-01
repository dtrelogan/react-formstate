To gain an understanding of what react-formstate does, let's first examine a simple react form built without react-formstate:

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
    
    this.state = {model: props.model};
    
    if (!props.model) {
      // set default values
      this.state.model = {
        name: '',
        address: {
          city: ''
        }
      };
    }
  }
  
  render() {
    const model = this.state.model;
    
    return (
      <form onSubmit={e => this.handleSubmit(e)}>
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

Here is the equivalent form built with react-formstate:

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
    this.state = this.formState.injectModel(props.model);
    // note that this.state = {} works just fine too
  }
  
  render() {
    // skipping a default value for address.city,
    // since you don't need to set empty default values...
    return (
      <Form formState={this.formState} onSubmit={e => this.handleSubmit(e)}>
        <RfsInput formField='name' label='Name' defaultValue=''/>
        <RfsInput formField='address.city' label='Address City'/>
        <input type='submit' value='Submit'/>
      </Form>
    );
  }
  
  handleSubmit(e) {
    e.preventDefault();
    // persist the model instance here...
    let model = this.formState.createUnitOfWork().createModel();
    alert(JSON.stringify(model));
  }
}
```

&nbsp;

&nbsp;

Contrasting the forms thus far, react-formstate saves some effort in terms of initializing an empty form and dealing with updates to immutable state, but using advanced javascript features makes it kind of a wash in terms of which approach is better.

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

    this.state = {model: props.model};

    if (!props.model) {
      // set default values
      this.state.model = {
        name: '',
        address: {
          city: ''
        }
      };
    }
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
      <form onSubmit={e => this.handleSubmit(e)}>
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

This is a decent pattern, but there are problems. For starters, ALL the validation messages display before the user has a chance to input anything. To fix this, we *could* try to add a state object to track which fields have been touched, but the complexity of the code is ratcheting up fast, and this is for an incredibly simple form. Worse, as we solve these problems, the pattern is no longer DRY, which means the approach - using raw react for forms - is tedious and error prone.

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
    this.state = this.formState.injectModel(props.model);
+   this.validateName = this.validateName.bind(this);
  }
  
  render() {
    return (
      <Form formState={this.formState} onSubmit={e => this.handleSubmit(e)}>
+       <RfsInput formField='name' label='Name' required validate={this.validateName}/>
+       <RfsInput formField='address.city' label='Address City' required/>
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
    let model = this.formState.createUnitOfWork().createModel();
+   if (model) { // if model is valid
      alert(JSON.stringify(model)); // persist...
+   }
  }
}
```

&nbsp;

&nbsp;

This is much better. Best of all, as your forms grow in complexity, **react-formstate continues to be an asset**. Unlike many other react form packages, react-formstate handles complex forms gracefully, without getting in your way. There are *many* examples here demonstrating advanced use cases and ways to write elegant, maintainable code using react-formstate.
