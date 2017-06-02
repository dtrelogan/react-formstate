# Working with the UnitOfWork and FieldState APIs

## The standard change handler

A fieldState prop and a framework generated change handler prop are supplied to each input marked with a formField attribute. Let's start with an examination of the change handler.

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
  // a framework generated change handler is provided
  // to both the name input and the address.city input
  // the generated handler prop is named 'handleValueChange'

  return (
    <Form formState={this.formState} onSubmit={this.handleSubmit}>
      <RfsInput formField='name' label='Name' required/>
      <RfsInput formField='address.city' label='Address City' required/>
      <input type='submit' value='Submit'/>
    </Form>
  );
}
```

You can override the change handler using a simple API. To demonstrate, let's write essentially the standard framework-generated change handler and explicitly pass it to the 'name' input.

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

    fieldState.setCoercedValue(newValue).validate();
    context.updateFormState();
  }
  
  // ...
}
```

Let's examine each line of code from the change handler.

### Line1

```es6
const context = this.formState.createUnitOfWork();
```

This creates an instance of the UnitOfWork class. The UnitOfWork API is a way to build an appropriate call to this.setState to update form state.

You can think of it this way: FormState is a simple wrapper around initializing and reading this.state, while UnitOfWork is a simple wrapper around preparing a call to this.setState.

### Line2

```es6
const fieldState = context.getFieldState('name');
```

The FieldState class provides methods for reading and manipulating the state of a particular field within your form.

### Line3

```es6
fieldState.setCoercedValue(newValue).validate();
```

This is where we prepare an update to the state of the field based on the new value supplied through user input.

### Line4

```es6
context.updateFormState();
```

This makes a call to this.setState. Suppose name, a required field, is updated to an empty string. Behind the scenes, the call to setState will essentially look like this:

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

## FieldState

"Form state" is really a collection of field states:

```es6
// this
this.formState.get('address.city');
// is shorthand for
this.formState.getFieldState('address.city').getValue();

// and this
this.formState.getu('address.city');
// is shorthand for
this.formState.getFieldState('address.city').getUncoercedValue();
```

