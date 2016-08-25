# react-datepicker example

unlike a standard html input, [react-datepicker](https://github.com/Hacker0x01/react-datepicker):

1. does not work exclusively with string values
2. returns a [moment](http://momentjs.com/) rather than an event in its callback.

to solve problem #1, use the 'noCoercion' feature to prevent react-formstate from coercing the value supplied to the react-datepicker input.

for problem #2, the best solution may vary depending on use case. four methods are presented:

## method 1 - override the change handler

the most straightforward way to deal with a nonstandard input is to override the framework generated event handler:

```es6
import React, { Component } from 'react';
import DatePicker from 'react-datepicker';

export default class DateInput extends Component {
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

```es6
import React, { Component } from 'react';
import { FormState, Form } from 'react-formstate';
import DateInput from './DateInput.jsx';
import moment from 'moment';

export default class SomeForm extends Component {

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
    let context = this.formState.createUnitOfWork();
    context.set('when', newMoment).validate();
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

## method 2 - handlerBindFunction

in the above example, the only real purpose of the custom change handler is to spell out how to get the new value from the event handler. in this case the single parameter passed to the callback is the value itself, so the bind function is simply: x=>x

react-formstate provides the 'handlerBindFunction' prop to streamline this code:

```es6
import React, { Component } from 'react';
import { FormState, Form } from 'react-formstate';
import DateInput from './DateInput.jsx';
import moment from 'moment';

export default class SomeForm extends Component {

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

## method 3 - shim the event handler

another approach is to wrap the nonstandard event handler to make it act as if it returns an event like a normal html input.

the framework generated event handler only looks at e.target.type and e.target.value. e.target.type is only important so much as it's not 'checkbox' or 'select-multiple'.

```es6
import React, { Component } from 'react';
import DatePicker from 'react-datepicker';

export default class DateInput extends Component {
  constructor(props) {
    super(props);
    this.handleDateChange = this.handleDateChange.bind(this);
  }
  render() {
    return (
      <div>
        <label>{this.props.label}</label>
        <DatePicker selected={this.props.fieldState.getValue()} onChange={this.handleDateChange}/>
        <span>{this.props.fieldState.getMessage()}</span>
      </div>
    )
  }
  handleDateChange(m) {
    this.props.updateFormState({ target: { type: 'react-datepicker', value: m } });
  }
}
```

```jsx
        <DateInput
          formField='when'
          label='When'
          defaultValue={moment()}
          noCoercion
          />
```

## method 4 - event handler factory

you could also create a factory for your custom event handler:

```es6
import React, { Component } from 'react';
import DatePicker from 'react-datepicker';

export default class DateInput extends Component {

  static buildHandler(formState, fieldName) {
    return function(m) {
      let context = formState.createUnitOfWork();
      context.set(fieldName, m).validate();
      context.updateFormState();
    };
  }

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
        <DateInput
          formField='when'
          label='When'
          defaultValue={moment()}
          noCoercion
          updateFormState={DateInput.buildHandler(this.formState, 'when')}
          />
```
