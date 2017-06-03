# Show validation message on blur

Your input component looks like:

```jsx
import React from 'react';

export default ({label, type, fieldState, handleValueChange, showValidationMessage}) => {
  return (
    <div>
      <label>{label}</label>
      <input
        type={type || 'text'}
        value={fieldState.getValue()}
        onChange={e => handleValueChange(e.target.value)}
        onBlur={showValidationMessage}
        />
      <span className='help'>
        {fieldState.isMessageVisible() ? fieldState.getMessage() : null}
      </span>
    </div>
  );
};
```

In your form component, you can pass 'true' to FormState.isInvalid to factor in "visible" messages only:

```jsx
<input type='submit' value='Submit' disabled={this.formState.isInvalid(true)}/>
```

For asynchronous validation, the message will be marked "visible" as soon as you call setValidating(message). In an asynchronous handler, show the message immediately when validation finishes:

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
