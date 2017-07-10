# Updating form state

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

The 'handleValueChange' prop represents the framework generated change handler. Using the standard handler will normally save you time and effort, but you can always override it if necessary.

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

The UnitOfWork API is a simple wrapper around calls to this.setState. It is complementary to the FormState API, which is a simple wrapper around initializing and reading this.state. The main focus of both APIs is essentially to transform data written to, and read from, component state.

As for the FieldState API, from react-formstate's perspective, the "form state" is essentially a collection of individual "field states."

To illustrate, let's look behind the scenes at what the change handler actually does (there is nothing magical happening). Suppose name, a required field, is updated to an empty string. The call to context.updateFormState() then makes a call to this.setState like this:

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

and that's the crux of react-formstate. It's simple, really.

### Standard change handler callback

Sophisticated user experiences sometimes require updating form state whenever *any* input is updated.

It might be handy, then, to be aware of the existence of the 'onUpdate' callback from the framework generated change handler. (The custom handler above is more or less the implementation of the standard handler, but not entirely.)

An advanced example of using the 'onUpdate' callback is provided [here](onUpdateExample.md).

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

  // DO NOT code required field validation solely in a change handler,
  // as the handler might not run before a form submission.
  // That is, if your input element is tagged with 'required', for example
  // <Input formField='name' required/>, then required
  // field validation can run during a call to createModel upon submit,
  // which calls validation blocks associated with inputs, but which DOES NOT
  // call your change handler. Required field validation is the only
  // type of validation that might be missed in this way if you code it into
  // your change handler rather than into your input element.
  fieldState.validate(); // call required field validation
  if (fieldState.isInvalid()) {
    context.updateFormState();
    return;
  } // else

  if (newName.substring(0,1) === newName.substring(0,1).toLowerCase()) {
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

  fieldState.validate(); // call required field validation
  if (fieldState.isInvalid()) {
    context.updateFormState();
    return;
  } // else

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

```es6
if (fieldState.get('warn')) {
  // ...
}
```

## Introduction to the UnitOfWork API

We've already seen examples for using the following methods from the UnitOfWork API: 'getFieldState', 'get', 'getu', 'set', 'injectModel', 'add', 'updateFormState', and 'createModel'.

It is worth mentioning that the 'add' method can also update data. The main difference between 'add' and 'set' is that 'add' can accept both objects and primitive types. This makes 'add' more powerful, but the 'set' method is used the vast majority of the time.

Also important to note is that the 'updateFormState' method can receive additional updates to provide to the call to setState:

```es6
context.updateFormState({someFlag: true, someOtherStateValue: 1});
// ...
if (this.state.someFlag)
// ...
```

The 'createModel' method is worthy of its own section.

## UnitOfWork.createModel

### Controlling the call to setState

We've seen 'createModel' used like this:

```es6
handleSubmit(e) {
  e.preventDefault();
  const model = this.formState.createUnitOfWork().createModel();
  if (model) {
    alert(JSON.stringify(model)); // submit to your api or store or whatever
  }
}
```

but you can control the call to setState by passing true to 'createModel':

```es6
handleSubmit(e) {
  e.preventDefault();
  const context = this.formState.createUnitOfWork();
  const model = context.createModel(true); // <--- pass true

  if (model) {
    alert(JSON.stringify(model)); // submit to your api or store or whatever
  } else {
    // do additional work...
    context.updateFormState(withAdditionalUpdates); // <--- need to call this yourself now
  }
}
```

### Transforms

To save you effort, the 'createModel' method can perform a few common transforms for you:

```jsx
<RfsInput formField='age' intConvert/>
<RfsInput formField='address.line2' preferNull/>
<RfsInput formField='specialText' noTrim/>
```

```es6
handleSubmit(e) {
  e.preventDefault();
  const model = this.formState.createUnitOfWork().createModel();
  if (model) {
    model.age === 8; // rather than '8' due to intConvert prop
    model.address.line2 === null; // rather than '' due to preferNull prop
    model.specialText === ' not trimmed '; // rather than 'not trimmed' due to noTrim prop
  }
}
```

Of course, you can do your own transforms too:

```es6
handleSubmit(e) {
  e.preventDefault();
  const model = this.formState.createUnitOfWork().createModel();
  if (model) {
    model.active = !model.disabled;
    model.someFlag = model.someRadioButtonValue === '1';
    // ...
  }
}
```

### Model output depends on rendered inputs

This was already covered [here](workingWithFormState.md#model-output-depends-on-rendered-inputs)

### revalidateOnSubmit

If validation is specified for a form field, and the validation hasn't run, createModel performs the validation before generating the model. However, if the field has already been validated, createModel **does not** bother to revalidate.

This might be different from what you are used to, but it is entirely consistent with react-formstate's approach, and it should be able to gracefully handle most anything you throw at it, including [asynchronous validation](asyncExample.md).

If you find a need for react-formstate to revalidate a particular field during createModel you *could* use the 'revalidateOnSubmit' property:

```jsx
<RfsInput
  formField='confirmNewPassword'
  type='password'
  label='Confirm New Password'
  required
  validate={this.validateConfirmNewPassword}
  revalidateOnSubmit
  />
```

but consider that between a custom change handler, or the [onUpdate callback](onUpdateExample.md) from the framework generated handler, there is likely a better solution.

For instance, in the case of a password confirmation:

```es6
handlePasswordChange(newPassword) {
  const context = this.formState.createUnitOfWork();
  context.set('newPassword', newPassword).validate();
  context.set('confirmNewPassword', ''); // <--- clear the confirmation field
  context.updateFormState();
}
```

If you find yourself wanting to use revalidateOnSubmit, or wanting to perform additional model-wide validation directly in the onSubmit handler, think hard on whether react-formstate doesn't already provide a better way to solve your problem.

## End of walkthrough

There is a lot more to react-formstate, but this concludes the walkthrough. If it was successful, you should now have a basic understanding of how to make react-formstate work for your purposes. Remaining features are covered through specific examples and documentation.

- Put it all together with a [basic example](/docs/basicExample.md)
- Review the [advantages](/docs/advantages.md) of react-formstate.
- Return to the [front page](https://www.npmjs.com/package/react-formstate)
