# react-datepicker example

Unlike a standard html input, [react-datepicker](https://github.com/Hacker0x01/react-datepicker):

1. does not work exclusively with string values
2. returns a [moment](http://momentjs.com/) rather than an event in its callback.

To work around this, use 'getUncoercedValue' in your input component:

```es6
import React, { Component } from 'react';
import DatePicker from 'react-datepicker';

export default class DateInput extends Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  render() {
    return (
      <div>
        <label>{this.props.label}</label>
        <DatePicker
          selected={this.props.fieldState.getUncoercedValue()}
          onChange={this.onChange}
          />
        <span>{this.props.fieldState.getMessage()}</span>
      </div>
    )
  }

  onChange(v) {
    this.props.handleValueChange(v);
  }
}
```

During initial model injection, react-formstate assumes value are NOT coerced. This is why you have to be explicit and use getUncoercedValue in the input component. Otherwise react-formstate would coerce the moment to a string before providing it to react-datepicker.

```es6
import React, { Component } from 'react';
import { FormState, Form } from 'react-formstate';
import DateInput from './DateInput.jsx';
import moment from 'moment';

export default class FormComponent extends Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = this.formState.injectModel(props.model);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <DateInput
          formField='when'
          label='When'
          required
          defaultValue={moment()}
        />
        <input type='submit' value='Submit'/>
        <span>{submitMessage}</span>
      </Form>
    );
  }

  this.handleSubmit(e) {
    // ...
  }
}
```
