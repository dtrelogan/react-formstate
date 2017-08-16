# validation

### preliminaries

This is *not* a validation library per se, but it *wires up* validation, which in react is just as valuable.

For reusable validation logic, in addition to [react-formstate-validation](https://www.npmjs.com/package/react-formstate-validation), reference [validator](https://www.npmjs.com/package/validator). ([joi](https://www.npmjs.com/package/joi) has an awesome api, but it's not meant for client-side validation and adds about a megabyte to your bundle.)

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

If your formField is named 'field', and if you name your validation function 'validateField', it will be autowired.

Thus, in the example above, we don't need to explicitly configure a 'validate' prop:

```jsx
<Input formField='username' label='Username' />
```

### required

Required field validation is so common it deserves special treatment.

The above can be reduced to the following:

```jsx
validateUsername(username) {
  if (username.includes(' ')) { return 'Spaces are not allowed'; }
  if (username.length < 4) { return 'Must be at least 4 characters'; }
}
```
```jsx
<Input formField='username' label='Username' required />
```

Required validation is called first, and if that passes, the autowired validateUsername function will be called.

### tailor a message

```jsx
<Input required='Please provide a username' />
```

### suppressing required

Obviously you don't have to tag your input with required, but if you are using required to style your inputs, and if the associated validation is causing problems, you can suppress it:

```jsx
<CheckboxGroup
  formField='roleIds'
  label='Roles'
  required='-'
  fsv={v => v.minlen(1).msg('Please select a role')}
  checkboxValues={this.roles}
  defaultValue={[]}
  intConvert
  />
```

### overriding required

Default behavior for required:

```jsx
function(value) {
  if (typeof(value) !== 'string' || value.trim() === '') { return 'Required field'; }
}
```

If you want it to work differently you can override it. I might suggest:

```es6
import { FormState } from 'react-formstate';

FormState.setRequired(function(value, label) {
  if (typeof(value) !== 'string' || value.trim() === '') { return `${label} is required`; }
});
```

### context parameter

Unregistered validation functions are passed three parameters: value, context, field

Context gives you a window on your overall form state and allows you to make changes:

```jsx
validatePassword(password, context) {
  context.getFieldState('passwordConfirmation').setValue('');
  if (password.length < 8) { return 'Must be at least 8 characters'; }
}

validatePasswordConfirmation(confirmation, context) {
  if (confirmation !== context.getFieldState('password').getValue()) { return 'Passwords do not match'; }
}
```

See [getFieldState](https://github.com/dtrelogan/react-formstate/blob/master/docs/api.md#UnitOfWork.getFieldState) for more information.

### field parameter

Unregistered validation functions are passed three parameters: value, context, field

Field will have a property named 'label'. In the examples above, per the jsx, label will be set to 'Username'.

So you can do something like this:

```jsx
validateUsername(username, context, field) {
  if (username.includes(' ')) { return `${field.label} must not contain spaces`; }
  if (username.length < 4) { return `${field.label} must be at least 4 characters`; }
}
```

See [Field](https://github.com/dtrelogan/react-formstate/blob/master/docs/api.md#Field) for more information

### using the FieldState API in a validation block

```es6
validatePassword(newPassword, context) {

  if (newPassword.length < 8) {
    return 'Password must contain at least 8 characters';
  }
  if (newPassword.length < 12) {
    const fieldState = context.getFieldState('password');
    // value has already been set to newPassword here.
    fieldState.setValid('Passwords ideally contain at least 12 characters');
    fieldState.set('warn', true); // <------ set a nonstandard property
    // no need to call updateFormState here.
    return;
  }
}
```

### <a name='register'>registering validation functions</a>

In your application, you can register reusable validation functions with messaging of your choice.

Registered validation functions are minimally passed two parameters: value, label

Additional parameters can be provided as necessary.

If you were to do the following:

```es6
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

Then you could remove the validateUsername function from your form component and do this instead (or you could use the fluent API documented below):

```jsx
<Input formField='username' label='Username' required validate={['noSpaces',['minLength',4]]} />
```

If you only have one registered validation function to call you can use this syntax:

```jsx
<Input formField='username' label='Username' required validate='noSpaces' />
```

### tailoring messages

You can optionally tailor messages in the jsx:

```jsx
<Input
  validate={['noSpaces',['minLength',4]]}
  validationMessages={['No spaces please', 'At least 4 characters please']}
  />
```

'msgs' is an abbreviation for 'validationMessages'. This also works:

```jsx
<Input validate='noSpaces' msgs='no spaces please' />
```

Note you can selectively tailor:

```jsx
<Input
  validate={['noSpaces',['minLength',4]]}
  msgs={[null, 'At least 4 characters please']}
  />
```

### fsValidate

You can also use a registered validation through a fluent API, accessible through 'fsValidate':

```jsx
<Input
  formField='amount'
  label='Amount'
  required='Please provide an amount'
  fsValidate={v =>
    v.min(25)
    .message('Amount must be at least $25')
    .max(1000)
    .msg('Amount cannot be more than $1000')}
  />
```

Tailoring messages is optional and 'fsv' is an abbreviation for 'fsValidate':

```jsx
<Input fsv={v => v.min(25).max(1000)} />
```

### asynchronous validation

All validation functions documented in this section are intended to be callbacks for the standard event handler. They should be *synchronous*. Asynchronous validation should instead override the event handler. An example is provided [here](/docs/asyncExample.md)
