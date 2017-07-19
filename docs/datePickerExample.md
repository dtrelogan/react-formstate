# react-datepicker example

Working example [here](https://dtrelogan.github.io/react-formstate-demo/?form=event).

Unlike a **standard HTML** input, [react-datepicker](https://github.com/Hacker0x01/react-datepicker):

1. does not work exclusively with string values
2. returns a [moment](http://momentjs.com/) rather than an event in its callback.

To work around this, it's best to set an 'rfsNoCoercion' property on your input component:

```jsx
import React, { Component } from 'react';
import DatePicker from 'react-datepicker';

const DateInput = ({label, fieldState, handleValueChange}) => {
  return (
    <div>
      <label>{label}</label>
      <DatePicker
        selected={fieldState.getValue()}
        onChange={handleValueChange}
        />
      <span>{fieldState.getMessage()}</span>
    </div>
  );
};

DateInput.rfsNoCoercion = true; // <---- set it ONCE

export default DateInput;
```

&nbsp;

During initial model injection, react-formstate assumes values are NOT coerced and must be coerced to string values to work with HTML inputs (it leaves booleans alone for checkboxes). This is why you have to be explicit and set a noCoercion property. Otherwise react-formstate would try to coerce the DateInput's default value to a string before providing it to react-datepicker, which would be bad.

```jsx
import React, { Component } from 'react';
import { FormState, Form } from 'react-formstate';
import DateInput from './DateInput.jsx';
import moment from 'moment';

export default class FormComponent extends Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = this.formState.injectModel(props.model);

    // Might need to "reverse coerce" a string to a moment here
    // i.e., moment('2017-07-12T18:32:24.402Z');
    //
    const when = (props.model && props.model.when) ? moment(props.model.when) : null;

    // Pass true to skip flattening the moment object into form state.
    //
    this.formState.injectField(this.state, 'when', when, true);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  validateWhen(value) {
    if (!value) {
      return 'When is required';
    }
  }

  render() {

    if (this.formState.getu('when') < moment()) {

      console.log('Works even though fields are not rendered yet...');

      //
      // use 'getu' or getFieldState('when').getUncoercedValue() here.
      //
      // react-formstate cannot deduce noCoercion from the JSX here because the
      // JSX hasn't been processed yet.
      //
    }

    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <DateInput
          formField='when'
          label='When'
          required='-'
          noCoercion='you can skip this with rfsNoCoercion defined on the DateInput class'
        />
        <input type='submit' value='Submit'/>
        <span>{submitMessage}</span>
      </Form>
    );
  }

  this.handleSubmit(e) {
    e.preventDefault();
    const model = this.formState.createUnitOfWork().createModel();
    if (model) {
      alert(JSON.stringify(model));
    }
  }
};
```

Note that in the DateInput component, doing this

```jsx
selected={fieldState.getUncoercedValue()}
```

would cover you 99% of the time. But if you have validation on the field, and if the change handler never fires before a submit... the noCoercion setting covers that case.
