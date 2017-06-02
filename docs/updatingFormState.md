# Working with the UnitOfWork and FieldState APIs

## The framework generated change handler

If you provide a 'formField' prop to an element nested within a react-formstate 'Form' element, react-formstate considers it an input meant to capture a value and generates additional props for the element.

The 'handleValueChange' prop is of particular importance.

```es6
const RfsInput = ({fieldState, handleValueChange, ...other}) => {
  return (
    <Input
      value={fieldState.getValue()}
      help={fieldState.getMessage()}
      onChange={e => handleValueChange(e.target.value)}
      {...other}
      />
  );
};
```
```jsx
render() {
  // A framework generated change handler is provided
  // to both the name input and the address.city input.
  // The generated handler prop is named 'handleValueChange'

  return (
    <Form formState={this.formState} onSubmit={this.handleSubmit}>
      <RfsInput formField='name' label='Name' required/>
      <RfsInput formField='address.city' label='Address City' required/>
      <input type='submit' value='Submit'/>
    </Form>
  );
}
```

The 'handleValueChange' prop represents the framework generated change handler. Using the standard handler will normally save you time and effort, but you can always override the standard handler if necessary.

To demonstrate, let's build a custom handler and pass it to the 'name' input.

```jsx

export default class SimpleRfsForm extends Component {

  constructor(props) {
    //...
    this.handleNameChange = this.handleNameChange.bind(this);
  }
  
  render() {
    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <RfsInput formField='name' label='Name' handleValueChange={this.handleNameChange}/>
        <RfsInput formField='address.city' label='Address City'/>
        <input type='submit' value='Submit'/>
      </Form>
    );
  }
  
  // override the standard change handler with essentially the standard change handler
  handleNameChange(newName) {
    const context = this.formState.createUnitOfWork();
    const fieldState = context.getFieldState('name');
    fieldState.setValue(newName).validate();
    context.updateFormState();
  }
  
  // ...
}
```

There are a couple new APIs used in the handler: UnitOfWork and FieldState.

Whereas the FormState API provides a simple wrapper around initializing and reading this.state, the UnitOfWork API is a simple wrapper around calls to this.setState. The main focus of both APIs is essentially to transform data written to, and read from, the component state.

As for the FieldState API, from react-formstate's perspective, the "form state" is essentially a collection of individual "field states." To illustrate, let's look behind the scenes at what the change handler actually does. Suppose name, a required field, is updated to an empty string. The call to context.updateFormState() then makes a call to this.setState like this:

```es6
this.setState(
  {
    'formState.name':
    {
      value: '', // empty string
      validity: 2, // invalid
      message: 'Name is required'
    }
  }
);
```

There is nothing fancy going on here.

## Introduction to the FieldState API

If you retrieve a FieldState instance from the FormState API, the instance is read-only. If you retrieve a FieldState instance from the UnitOfWork API, the instance is read/write.

With a read-only field state, most of the time you are only interested in the field's underlying value. We've already seen shortcuts to retrieve this value:

```es6
this.formState.get('address.city'); // is shorthand for:
this.formState.getFieldState('address.city').getValue();

this.formState.getu('address.city'); // is shorthand for:
this.formState.getFieldState('address.city').getUncoercedValue();
```

There are also shortcuts for setting a value. The custom handler could be rewritten as:

```es6
handleNameChange(newName) {
  const context = this.formState.createUnitOfWork();
  context.set('name', newName).validate();
  context.updateFormState();
}
```

As for the 'validate' method, if, for example, you have an input specified as:

```jsx
<RfsInput formField='name' label='Name' validate={this.validateName}/>
```

the validate method will call the 'validateName' method and apply the results accordingly.

Rather than call a separate validation method, you can always do the validation directly in the change handler using the FieldState API:

```es6
handleNameChange(newName) {
  const context = this.formState.createUnitOfWork();
  const fieldState = context.set('name', newName);
  
  if (!newName) {
    fieldState.setInvalid('Name is required');
  } else if (newName.substring(0,1) === newName.substring(0,1).toLowerCase()) {
    fieldState.setInvalid('Name must be capitalized');
  } else {
    fieldState.setValid();
  }
  
  context.updateFormState();
}
```

It is sometimes useful to store miscellaneous data with a field state. A generic 'set' method provides this ability. For instance:

```es6
handlePasswordChange(newPassword) {
  const context = this.formState.createUnitOfWork();
  const fieldState = context.set('password', newPassword);

  if (newPassword.length < 8) {
    fieldState.setInvalid('Password must contain at least 8 characters');
  } else if (newPassword.length < 12) {
    fieldState.setValid('Passwords ideally contain at least 12 characters');
    fieldState.set('warn', true); // <------ set a nonstandard property
  } else {
    fieldState.setValid();
  }
  
  context.updateFormState();
}
```
