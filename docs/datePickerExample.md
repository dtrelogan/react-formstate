# react-datepicker example

unlike a standard html form input, [react-datepicker](https://github.com/Hacker0x01/react-datepicker) does not work with exclusively with string values and returns a [moment](http://momentjs.com/) rather than an event in its callback.

within react-formstate, the most straightforward way to deal with a nonstandard input is to override the framework generated change handler.

in the case of react-datepicker, since it does not work with string values, the 'noCoercion' feature is also used.

here is an example:

```jsx
import React from 'react';
import DatePicker from 'react-datepicker';

export default class DateInput extends React.Component {
  render() {
    return (
      <div>
        <label>{this.props.label}</label>
        <DatePicker selected={this.props.fieldState.getValue()} onChange={this.props.updateFormState}/>
        <span>{this.props.fieldState.getMessage()}</span>
      </div>
    )
  }
}
```

```jsx
import React from 'react';
import { FormState, Form } from 'react-formstate';
import DateInput from './DateInput.jsx';
import moment from 'moment';

export default class SomeForm extends React.Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = {};
    this.submit = this.submit.bind(this);
    this.handleDateInputChange = this.handleDateInputChange.bind(this);
  }

  render() {
    return (
      <Form formState={this.formState}>
        <DateInput
          formField='when'
          label='When'
          defaultValue={moment()}
          noCoercion
          updateFormState={this.handleDateInputChange}
          />
        <input type='submit' value='Submit' onClick={this.submit}/>
      </Form>
    );
  }
  
  handleDateInputChange(newMoment) {
    let context = this.formState.createUnitOfWork(),
      fieldState = context.getFieldState('when');
    
    fieldState.setValue(newMoment).validate();
    context.updateFormState();
  }

  submit(e) {
    e.preventDefault();
    let model = this.formState.createUnitOfWork().createModel();
    if (model) {
      alert(JSON.stringify(model));
    }
  }
}
```

in this example, the only real purpose of the custom change handler is to spell out how to get the new value out of the callback from react-datepicker.

react-formstate provides the 'handlerBindFunction' prop to streamline this code:

```jsx
import React from 'react';
import { FormState, Form } from 'react-formstate';
import DateInput from './DateInput.jsx';
import moment from 'moment';

export default class SomeForm extends React.Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = {};
    this.submit = this.submit.bind(this);
  }

  render() {
    return (
      <Form formState={this.formState}>
        <DateInput
          formField='when'
          label='When'
          defaultValue={moment()}
          noCoercion
          handlerBindFunction={x=>x}
          />
        <input type='submit' value='Submit' onClick={this.submit}/>
      </Form>
    );
  }
  
  // no longer need to type out the handler

  submit(e) {
    e.preventDefault();
    let model = this.formState.createUnitOfWork().createModel();
    if (model) {
      alert(JSON.stringify(model));
    }
  }
}
```

since this feature will frequently be used in tandem with 'noCoercion', you can alternatively shorten your jsx to:

```jsx
        <DateInput
          formField='when'
          label='When'
          defaultValue={moment()}
          noCoercion={x=>x}
          />
```
