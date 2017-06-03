# [React-Bootstrap](https://react-bootstrap.github.io/) example

The vanilla [React-Bootstrap](https://react-bootstrap.github.io/) input:

```jsx
import React from 'react';
import { FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';

export default (props) => {
  return (
    <FormGroup
      className={props.className}
      controlId={props.controlId}
      validationState={props.validationState}
      >
      <ControlLabel>{props.label}</ControlLabel>
      <FormControl
        type={props.type || 'text'}
        value={props.value}
        placeholder={props.placeholder}
        onChange={e => props.handleValueChange(e.target.value)}
        disabled={props.disabled}
        autoFocus={props.autoFocus}
        />
      <FormControl.Feedback />
      <HelpBlock>{props.help}</HelpBlock>
    </FormGroup>
  );
};
```

The react-formstate component shim:

```jsx
import React from 'react';
import BootstrapInput from './BootstrapInput.jsx';

export default ({className, required, fieldState, handleValueChange, ...other}) => {

  let validationState = null;

  if (fieldState.isValid()) {
    validationState = fieldState.get('warn') ? 'warning' : 'success';
  }
  else if (fieldState.isValidating()) {validationState = 'warning';}
  else if (fieldState.isInvalid()) {validationState = 'error';}

  return (
    <BootstrapInput
      className={`${className || ''} ${required ? 'required' : ''}`}
      controlId={fieldState.getKey()}
      validationState={validationState}
      value={fieldState.getValue()}
      handleValueChange={handleValueChange}
      help={fieldState.getMessage()}
      {...other}
      />
  );
};
```
