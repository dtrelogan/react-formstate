# show validation message on blur

your input component looks like:

```jsx
import React, { Component } from 'react';

export default class Input extends Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  render() {
    let fieldState = this.props.fieldState;
    return (
      <div>
        <label>{this.props.label}</label>
        <input
          type={this.props.type || 'text'}
          value={fieldState.getValue()}
          onChange={this.onChange}
          onBlur={this.props.showValidationMessage}
          />
        <span className='help'>
          {fieldState.isMessageVisible() ? fieldState.getMessage() : null}
        </span>
      </div>
    );
  }

  onChange(e) {
    this.props.handleValueChange(e.target.value);
  }
}
```

in your form component, pass 'true' to FormState.isInvalid to factor in "visible" messages only

```jsx
<input type='submit' value='Submit'/>
<span>{this.formState.isInvalid(true) ? 'Please fix validation errors' : null}</span>
```

for asynchronous validation, the message will be marked "visible" as soon as you call setValidating(message). in an asynchronous handler, show the message immediately when validation finishes:

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
