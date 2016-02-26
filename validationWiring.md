# validation

### preliminaries

this is *not* a validation library per se, but it *wires up* validation, which in react is arguably just as valuable.

you can do whatever you'd like in your validation functions but i'd suggest using [validator](https://www.npmjs.com/package/validator).

sadly, despite the fact that many react packages steer you toward [joi](https://www.npmjs.com/package/joi), _i would NOT recommend using it_. while it has an awesome api, it's not meant for client-side validation and adds about a megabyte to your bundle.

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

FormState.setRequired(function(value, label) {
  if (value.trim() === '') { return `${label} is required`; }
});
```

### field parameter

unregistered validation functions are passed three parameters: value, context, field

field will have a property named 'label'. in the examples above, per the jsx, label will be set to 'Username'.

so you can do something like this:

```jsx
validateUsername(username, context, field) {
  if (username.includes(' ')) { return `${field.label} must not contain spaces`; }
  if (username.length < 4) { return `${field.label} must be at least 4 characters`; }
}
```

### context parameter

unregistered validation functions are passed three parameters: value, context, field

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

registered validation functions are minimally passed two parameters: value, label

additional parameters can be provided as necessary.

if you were to do the following:

```jsx
import { FormState } from 'react-formstate';

FormState.registerValidation('noSpaces', function(value, label) {
  if (value.includes(' ')) { return `${label} must not contain spaces`; }
});

FormState.registerValidation('minLength', function(value, label, minLength) {
  if (value.length < minLength) {
    return `${label} must be at least ${minLength} characters`;
  }
});
```

then you could remove the validateUsername function from your form component and do this instead:

```jsx
<Input formField='username' label='Username' required validate={['noSpaces',['minLength',4]]} />
```

if you only have one registered validation function to call you can use this syntax:

```jsx
<Input formField='username' label='Username' required validate='noSpaces' />
```

### asynchronous validation

all validation functions documented in this section are intended to be callbacks for the framework generated event handler. they should be *synchronous*. asynchronous validation should instead override the event handler. an example is provided [here](/asyncExample.md)

### <a name='future'>should this become a validation library?</a>

considering the existence of [validator](https://www.npmjs.com/package/validator), with respect to the framework api, providing hooks for validation *messaging* is trickier than providing canned validation logic. i'm unsure of the appropriate hooks for internationalization.

i think the api is strong as it is. i'd prefer not to put anything extra into the framework until it's done well.

in the meantime you could argue the framework isn't optimal for fast prototyping. maybe someone could share some code for registering a bunch of default validation functions? then you'd have the *option* of quickly throwing those into your application.
