# [react bootstrap](https://react-bootstrap.github.io/) example

in my project i found it was useful to split the input components into two layers.

the vanilla bootstrap input:

```es6
import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';

export default class BootstrapInput extends Component {

  render() {
    return (
      <FormGroup
        className={`${this.props.className || ''} ${this.props.hidden ? 'hidden' : ''}`}
        controlId={this.props.controlId}
        validationState={this.props.validationState}
        >
        <ControlLabel>{this.props.label}</ControlLabel>
        <FormControl
          type={this.props.type || 'text'}
          value={this.props.value}
          placeholder={this.props.placeholder}
          onChange={this.props.onChange}
          disabled={this.props.disabled}
          autoFocus={this.props.autoFocus}
          />
        <FormControl.Feedback />
        <HelpBlock>{this.props.help}</HelpBlock>
      </FormGroup>
    );
  }
}
```

and the react-formstate wrapper:

```es6
import React, { Component } from 'react';
import BootstrapInput from './BootstrapInput.jsx';

export default class FsBootstrapInput extends Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  render() {
    let {
      className,
      formField, required, validate, fsValidate, fsv, noTrim, preferNull, intConvert, defaultValue, noCoercion, revalidateOnSubmit, handlerBindFunction,
      fieldState, updateFormState, handleValueChange, showValidationMessage,
      ...other
    } = this.props;

    className = `${className || ''} ${required ? 'required' : ''}`;

    let validationState = null;
    if (this.props.fieldState.isValid()) {validationState = 'success';}
    else if (this.props.fieldState.isValidating()) {validationState = 'warning';}
    else if (this.props.fieldState.isInvalid()) {validationState = 'error';}

    return (
      <BootstrapInput
        className={className}
        controlId={fieldState.getKey()}
        validationState={validationState}
        value={fieldState.getValue()}
        onChange={this.onChange}
        help={fieldState.getMessage()}
        {...other}
        />
    );
  }

  onChange(e) {
    this.props.handleValueChange(e.target.value);
  }
}
```

note: to use destructuring assignment i had to do

    $ npm install babel-plugin-transform-object-rest-spread --save

and my .babelrc looks like

```es6
{
  "presets": ["es2015"],
  "plugins": ["transform-object-rest-spread"]
}
```
