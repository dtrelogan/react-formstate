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

Rather than call a separate validation method, you *can* perform the validation directly in the change handler using the FieldState API:

```es6
//
// demonstrate the FieldState API
//

handleNameChange(newName) {
  const context = this.formState.createUnitOfWork(),
    fieldState = context.set('name', newName);

  // DO NOT put required field validation in a change handler.
  // The createModel method that runs on submit will not call a change handler...

  fieldState.validate(); // call required field validation
  if (fieldState.isInvalid()) {
    context.updateFormState();
    return;
  } // else

  // perform other validation

  if (newName.substring(0,1) === newName.substring(0,1).toLowerCase()) {
    fieldState.setInvalid('Name must be capitalized');
  } else {
    fieldState.setValid();
  }

  context.updateFormState();
}
```

&nbsp;

You can argue it's best practice, however, to always put synchronous validation logic into a code block referenced from your input elements (or using the fluent validation API). That way you can make sure *all* your validation runs at least once, regardless of whether or not an input is ever changed prior to hitting submit. That protects you against the nasty edge case of injecting an invalid model into your form state.

```jsx
<Input
  formField='username'
  label='Username'
  required
  fsv={v => v.regex(/^\S+$/).msg('Username must not contain spaces')}
  handleValueChange={this.handleUsernameChange}
  />
```
```es6
handleUsernameChange(newUsername) {
  const context = this.formState.createUnitOfWork(),
    fieldState = context.set('username', newUsername);

  // run the synchronous validation specified on the input element
  fieldState.validate();
  if (fieldState.isInvalid()) {
    context.updateFormState();
    return;
  }
  // else

  // run asynchronous validation...
}
```

It is sometimes useful to store miscellaneous data with a field state. A generic 'set' method provides this ability. For instance:

```es6
validatePassword(newPassword, context) {

  if (newPassword.length < 8) {
    return 'Password must contain at least 8 characters';
  }
  if (newPassword.length < 12) {
    //
    // Notice that we have the option of using the FieldState API directly in the validation block.
    //
    const fieldState = context.getFieldState('password');
    // value has already been set to newPassword here.
    fieldState.setValid('Passwords ideally contain at least 12 characters');
    fieldState.set('warn', true); // <------ set a nonstandard property
    // no need to call updateFormState here.
    return;
  }
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
