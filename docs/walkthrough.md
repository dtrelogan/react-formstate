A really simple form in raw react:

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
    return (
      <form onSubmit={e => this.handleSubmit(e)}>
        <Input
          label='Name'
          value={this.state.model.name}
          onChange={e => this.setState({model: {...this.state.model, name: e.target.value}})}
          />
        <Input
          label='Address City'
          value={this.state.model.address.city}
          onChange={e => this.setState({model: {...this.state.model, address: {...this.state.model.address, city: e.target.value}}})}
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

The equivalent form using react-formstate:

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

We could add validation and other form features in raw react but unless you stay in a very limited box it gets tricky, fast. Worse, as you write new forms, the pattern you come up with won't be very DRY.

So don't bother, use react-formstate instead:

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

export default class RawReactForm extends Component {
  
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
        <RfsInput formField='address.city' label='Address City'/>
+       <input type='submit' value='Submit' disabled={this.formState.isInvalid()}/>
      </Form>
    );
  }

+ validateName(newValue) {
+   if (newValue === newValue.toLowerCase()) {
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

react-formstate will serve you well, **even as your forms grow in complexity**.

See the other examples for other ways you can write simple, elegant forms with react-formstate.
