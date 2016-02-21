# validation

### preliminaries

this is *not* a validation library per se, but it *wires up* validation, which in react is just as valuable.

you can do whatever you'd like in your validation functions but i'd suggest using validator https://www.npmjs.com/package/validator

sadly, despite the fact that many react packages steer you toward joi https://www.npmjs.com/package/joi _i would NOT recommend using it_. while it has an awesome api, it's not meant for client-side validation and adds about a megabyte to your bundle.

### basic usage

```jsx
validateUsername(username) {
  // return a message or don't
  if (username.trim() === '') { return 'Required field'; }
  if (username.includes(' ')) { return 'Spaces are not allowed'; }
  if (username.length < 4) { return 'Must be at least 4 characters'; }
}
```
```jsx
<Input formField='username' label='Username' validate={this.validateUsername} />
```

### autowiring

if your formField is named 'field', and if you name your validation function 'validateField', it will be autowired.

thus, in the example above, we don't need to explicitly configure a 'validate' prop:

```jsx
<Input formField='username' label='Username' />
```

### required

required field validation is so common it deserves special treatment.

the above can be reduced to the following:

```jsx
validateUsername(username) {
  if (username.includes(' ')) { return 'Spaces are not allowed'; }
  if (username.length < 4) { return 'Must be at least 4 characters'; }
}
```
```jsx
<Input formField='username' label='Username' required />
```

required validation is called first, and if that passes, the autowired validateUsername function will be called.

### labels

validation functions are passed three parameters: value, context, field

field will have a property named 'label'. in the examples above, per the jsx, label will be set to 'Username'.

so you can do something like this:

```jsx
validateUsername(username, context, field) {
  if (username.includes(' ')) { return `${field.label} must not contain spaces`; }
  if (username.length < 4) { return `${field.label} must be at least 4 characters`; }
}
```

### overriding required

default behavior for required:

```jsx
function(value) {
  if (value.trim() === '') { return 'Required field'; }
}
```

if you want it to work differently you can override it. i might suggest:

```jsx
import { FormState } from 'react-formstate';

FormState.setRequired(function(value, context, field) {
  if (value.trim() === '') { return `${field.label} is required`; }
});
```

### context

validation functions are passed three parameters: value, context, field

context gives you a window on your overall form state and allows you to make changes:

```jsx
validatePassword(password, context) {
  context.getFieldState('passwordConfirmation').setValue('');
  if (password.length < 8) { return 'Must be at least 8 characters'; }
}

validatePasswordConfirmation(confirmation, context) {
  if (confirmation !== context.getFieldState('password').getValue()) { return 'Passwords do not match'; }
}
```

### registering validation functions

in your application, you can register reusable validation functions with messaging of your choice.

if you were to do the following:

```jsx
import { FormState } from 'react-formstate';

FormState.registerValidation('noSpaces', function(value) {
  if (value.includes(' ')) { return 'Must not contain spaces'; }
});

FormState.registerValidation('minLength', function(value, context, field, minLength) {
  if (value.length < minLength) {
    return `Must be at least ${minLength} characters`;
  }
});
```

you could remove the validateUsername function from your form component and do this instead:

```jsx
<Input formField='username' label='Username' required validate={['noSpaces',['minLength',4]]} />
```

### asynchronous validation

the context api allows for asynchronous validation. an example is provided [here] (/asyncExample.md)

### disclaimer

surprisingly, rather than the syntactic sugar

```jsx
<Input formField='username' label='Username' required validate={['noSpaces',['minLength',4]]} />
```

i'm partial to basic usage with autowiring. you will see that in other examples in this repository.
