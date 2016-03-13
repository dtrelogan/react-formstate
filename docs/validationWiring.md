# validation

### tl;dr

see [react-formstate-validation](https://github.com/dtrelogan/react-formstate-validation)

### preliminaries

this is *not* a validation library per se, but it *wires up* validation, which in react is just as valuable.

for reusable validation logic, in addition to [react-formstate-validation](https://github.com/dtrelogan/react-formstate-validation), reference [validator](https://www.npmjs.com/package/validator). ([joi](https://www.npmjs.com/package/joi) has an awesome api, but it's not meant for client-side validation and adds about a megabyte to your bundle.)

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

### tailor a message

```jsx
<Input required='Please provide a username' />
```

### suppressing required

obviously you don't have to tag your input with required, but if you are using required to style your inputs, and if the associated validation is causing problems, you can suppress it:

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

default behavior for required:

```jsx
function(value) {
  if (typeof(value) !== 'string' || value.trim() === '') { return 'Required field'; }
}
```

if you want it to work differently you can override it. i might suggest:

```jsx
import { FormState } from 'react-formstate';

FormState.setRequired(function(value, label) {
  if (typeof(value) !== 'string' || value.trim() === '') { return `${label} is required`; }
});
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

see [getFieldState](https://github.com/dtrelogan/react-formstate/blob/master/docs/api.md#UnitOfWork.getFieldState) for more information.

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

see [Field](https://github.com/dtrelogan/react-formstate/blob/master/docs/api.md#Field) for more information

### <a name='register'>registering validation functions</a>

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

### tailoring messages

you can optionally tailor messages in the jsx:

```jsx
<Input
  validate={['noSpaces',['minLength',4]]}
  validationMessages={['No spaces please', 'At least 4 characters please']}
  />
```

'msgs' is an abbreviation for 'validationMessages'. this also works:

```jsx
<Input validate='noSpaces' msgs='no spaces please' />
```

note you can selectively tailor:

```jsx
<Input
  validate={['noSpaces',['minLength',4]]}
  msgs={[null, 'At least 4 characters please']}
  />
```

### fsValidate

a registered validation also receives the following syntax, accessible through 'fsValidate':

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

tailoring messages is optional and 'fsv' is an abbreviation for 'fsValidate':

```jsx
<Input fsv={v => v.min(25).max(1000)} />
```

like functions accessed through 'validate', 'fsValidate' functions can be autowired and are also passed context and field:

```jsx
fsValidatePassword(fsv, context, field) {
  context.getFieldState('passwordConfirmation').setValue('');
  return fsv.minLength(8).msg(`${field.label} must be at least 8 characters`);
}

fsValidatePasswordConfirmation(fsv, context) {
  if (fsv.value !== context.getFieldState('password').getValue()) { return 'Passwords do not match'; }
  // alternatively
  return fsv.equals(context.getFieldState('password').getValue()).msg('Passwords do not match');
}
```

you may have noticed that fsValidate functions can return either an 'fsv' object or a string.

enjoy!

### asynchronous validation

all validation functions documented in this section are intended to be callbacks for the framework generated event handler. they should be *synchronous*. asynchronous validation should instead override the event handler. an example is provided [here](/docs/asyncExample.md)
