# onChange, onBlur, or onSubmit

You can choose when you'd like to show validation messages. To get a feel for the differences, you can play with the [demo](https://dtrelogan.github.io/react-formstate-demo/).

Start with an underlying stateless input component:

```jsx
export default ({type, label, value, help, onChange, onBlur}) => {
  return (
    <div>
      <div>{label}</div>
      <input type={type || 'text'} value={value} onChange={onChange} onBlur={onBlur}/>
      <div>{help}</div>
    </div>
  );
};
```

## onChange

```jsx
export default ({fieldState, handleValueChange, showValidationMessage, ...other}) => {
  return (
    <Input
      value={fieldState.getValue()}
      help={fieldState.getMessage()}
      onChange={e => handleValueChange(e.target.value)}
      onBlur={showValidationMessage}
      {...other}
      />
  );
};
```

## onBlur

```diff
export default ({fieldState, handleValueChange, showValidationMessage, ...other}) => {
  return (
    <Input
      value={fieldState.getValue()}
+     help={fieldState.isMessageVisible() ? fieldState.getMessage() : null}
      onChange={e => handleValueChange(e.target.value)}
      onBlur={showValidationMessage}
      {...other}
      />
  );
};
```

## onSubmit

```diff
export default ({fieldState, handleValueChange, showValidationMessage, ...other}) => {
  return (
    <Input
      value={fieldState.getValue()}
+     help={fieldState.isMessageVisible() ? fieldState.getMessage() : null}
      onChange={e => handleValueChange(e.target.value)}
+     onBlur={() => {}}
      {...other}
      />
  );
};
```

## Changing the behavior of FormState.isInvalid

For onBlur and onSubmit, in your form component, you can pass 'true' to FormState.isInvalid to factor in "visible" messages only:

```jsx
<input type='submit' value='Submit' disabled={this.formState.isInvalid(true)}/>
```

## Dynamic configuration

```jsx
export default ({formState, fieldState, handleValueChange, showValidationMessage, ...other}) => {

  let validationState = null, help = null;

  if (fieldState.isMessageVisible() || !(formState.showMessageOnBlur() || formState.showMessageOnSubmit())) {

    // for demonstration, showing how you could manipulate styling based on validation status
    // this is based on react-bootstrap inputs
    if (fieldState.isValid()) {
      validationState = fieldState.get('warn') ? 'warning' : 'success';
    }
    if (fieldState.isValidating()) {validationState = 'warning';}
    if (fieldState.isInvalid()) {validationState = 'error';}

    help = fieldState.getMessage();
  }

  return (
    <Input
      validationState={validationState}
      value={fieldState.getValue()}
      help={help}
      onChange={e => handleValueChange(e.target.value)}
      onBlur={formState.showMessageOnSubmit() ? () => {} : showValidationMessage}
      {...other}
      />
  );
};
```

Globally:

```es6
import { FormState } from 'react-formstate';

// defaults to show onChange behavior

FormState.setShowMessageOnBlur(true);
FormState.setShowMessageOnSubmit(true); // supercedes onBlur

// behavior of FormState.isInvalid automatically adjusts accordingly

FormState.setEnsureValidationOnBlur(true); // explained below

```

Locally:

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);

  // override global settings on FormState

  this.formState.setShowMessageOnBlur(true);
  this.formState.setShowMessageOnSubmit(true);
  this.formState.setEnsureValidationOnBlur(true);
}
```

You could also override on a per-input basis in a variety of ways.

## ensureValidationOnBlur

The best way to understand what this does is to play with the [demo](https://dtrelogan.github.io/react-formstate-demo/). Toggle the ensure validation onBlur setting and blur through some inputs without changing them.

## Overriding showValidationMessage

Like 'handleValueChange', 'showValidationMessage' is another framework generated handler prop. You can always override it if necessary:

```jsx
<Input formField='name' showValidationMessage={this.customBlurHandler}/>
```

```es6
// this is what the standard framework generated blur handler does
customBlurHandler() {
  const context = this.formState.createUnitOfWork();
  const fieldState = context.getFieldState('someField');

  if (this.formState.ensureValidationOnBlur() && !fieldState.isValidated()) {
    fieldState.validate();
  }

  fieldState.showMessage(); // mark the message "visible"
  context.updateFormState();
}
```

## Showing messages when asynchronous validation finishes

In an asynchronous handler, it's simplest to show the message immediately when validation finishes:

```jsx
// simulate calling your api
window.setTimeout(function() {
  let context = this.formState.createUnitOfWork(),
    fieldState = context.getFieldState('username', asyncToken);

  // if the token still matches, the username we are verifying is still relevant
  if (fieldState) {
    if (username === 'taken') {
      fieldState.setInvalid('Username already exists');
    } else {
      fieldState.setValid('Verified');
    }
    fieldState.showMessage(); // in case you are showing on blur
    context.updateFormState();
  }
}.bind(this), 2000);
```

Alternatively you can check to see if the message was already visible at the beginning of your async callback and only showMessage at the end if so.
