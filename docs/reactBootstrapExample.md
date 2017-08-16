# [React-Bootstrap](https://react-bootstrap.github.io/) example

(Note that the [demo](https://dtrelogan.github.io/react-formstate-demo/) uses [React-Bootstrap](https://react-bootstrap.github.io/) components.)

The vanilla [React-Bootstrap](https://react-bootstrap.github.io/) input:

```jsx
import React from 'react';
import { FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';

export default (props) => {

  const {
    className,
    controlId,
    validationState,
    type,
    label,
    value,
    help,
    onChange,
    onBlur,
    placeholder,
    disabled,
    autoFocus,
    autoComplete,
    showFeedback
  } = props;

  return (
    <FormGroup
      className={className}
      controlId={controlId}
      validationState={validationState}
      >
      <ControlLabel>{label}</ControlLabel>
      <FormControl
        type={type || 'text'}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onBlur={onBlur}
        disabled={disabled}
        autoFocus={autoFocus}
        autoComplete={autoComplete}
        />
      {showFeedback === false ? null : <FormControl.Feedback />}
      <HelpBlock>{help}</HelpBlock>
    </FormGroup>
  );
};
```

The react-formstate layer:

```jsx
import React from 'react';
import BootstrapInput from './BootstrapInput.jsx';

export default (props) => {

  const {
    className,
    required,
    fieldState,
    handleValueChange,
    handleBlur,
    showMessage,
    formState,
    ...other
  } = props;

  let validationState = null, help = null;

  if (showMessage) {
    if (fieldState.isValid()) {
      validationState = fieldState.get('warn') ? 'warning' : 'success';
    }
    else if (fieldState.isValidating()) {validationState = 'warning';}
    else if (fieldState.isInvalid()) {validationState = 'error';}

    help = fieldState.getMessage();
  }

  return (
    <BootstrapInput
      className={`${className || ''} ${required ? 'required' : ''}`}
      controlId={fieldState.getKey()}
      validationState={validationState}
      value={fieldState.getValue()}
      help={help}
      onChange={e => handleValueChange(e.target.value)}
      onBlur={handleBlur}
      {...other}
      />
  );
};
```
