# Working with the UnitOfWork and FieldState APIs

## The framework generated change handler

If you provide a 'formField' prop to an element nested within a react-formstate 'Form' element, react-formstate generates additional props for the element.

Let's start with a closer look at the 'handleValueChange' prop, which represents the framework generated change handler.

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

You can always override the standard handler if necessary using a simple react-formstate API.

To demonstrate, let's write essentially the standard handler and pass it to the 'name' input.

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
    fieldState.setCoercedValue(newName).validate();
    context.updateFormState();
  }
  
  // ...
}
```

Whereas the FormState API provides a simple wrapper around initializing and reading this.state, the UnitOfWork API is a simple wrapper around calls to this.setState. The main focus of both APIs is essentially to transform data as it writes to, and reads from, the component state.

From react-formstate's perspective, the "form state" is essentially a collection of individual "field states." To illustrate, let's look behind the scenes at what the change handler actually does. Suppose name, a required field, is updated to an empty string. The call to context.updateFormState() then makes a call to this.setState that essentially looks like this:

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

Simple, right?

## The FieldState API

If you retrieve a FieldState instance from the FormState API, the instance is read-only. In this case, most of the time you are only interested in the field's underlying value. We've already seen shortcuts to retrieve this:

```es6
this.formState.get('address.city');
// is shorthand for
this.formState.getFieldState('address.city').getValue();

this.formState.getu('address.city');
// is shorthand for
this.formState.getFieldState('address.city').getUncoercedValue();
```

