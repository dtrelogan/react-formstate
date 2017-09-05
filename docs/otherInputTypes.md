# Checkbox, CheckboxGroup, RadioGroup, and Select

Working example [here](https://dtrelogan.github.io/react-formstate-demo/?form=otherinputs) using [React-Bootstrap](https://react-bootstrap.github.io/) components.

Note that react-formstate is NOT intended to be an input component library. That's what something like [React-Bootstrap](https://react-bootstrap.github.io/) is for.

```es6
import React, { Component } from 'react';
import { FormState, Form, FormArray } from 'react-formstate';
import Input from './Input.jsx';
import Checkbox from './Checkbox.jsx';
import CheckboxGroup from './CheckboxGroup.jsx';
import RadioGroup from './RadioGroup.jsx';
import Select from './Select.jsx';

import { validationAdapter } from 'react-formstate-validation';
validationAdapter.plugInto(FormState);

export default class UserForm extends Component {

  constructor(props) {
    super(props);

    this.formState = FormState.create(this);

    let model = {}; // create
    // or edit:
    // model = {
    //   name: 'buster brown',
    //   contactPreferenceId: 2,
    //   roleIds: [2,3],
    //   siteIds: [4],
    //   defaultSiteId: 4,
    //   disabled: true
    // };

    this.state = this.formState.injectModel(model);

    // transform model state for the UI
    this.formState.injectField(this.state, 'active', !model.disabled);

    this.contactChoices = [
      { id: 1, name: 'Contact Me' },
      { id: 2, name: 'Do Not Contact Me' }
    ];

    this.roles = [
      { id: 1, name: 'Master Admin' },
      { id: 2, name: 'Customer Service' },
      { id: 3, name: 'Data Admin' }
    ];

    this.sites = [
      { id: 1, name: 'Site 1' },
      { id: 2, name: 'Site 2' },
      { id: 3, name: 'Site 3' },
      { id: 4, name: 'Site 4' }
    ];

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    let submitMessage = null;

    if (this.formState.isInvalid()) {
      submitMessage = 'Please fix validation errors';
    }

    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <Input formField='name' label='Name' required />
        <br/>
        <RadioGroup
          buttonValues={this.contactChoices}
          formField='contactPreferenceId'
          label='Contact Preference'
          defaultValue={1}
          intConvert
          />
        <h3>Account Settings</h3>
        <CheckboxGroup
          formField='roleIds'
          checkboxValues={this.roles}
          label='Roles'
          defaultValue={[]}
          intConvert
          required='-'
          fsv={v => v.minLength(1).msg('Please select at least one role')}
          />
        <Select
          formField='siteIds'
          multiple={true}
          optionValues={this.sites}
          label='Site Access'
          defaultValue={[1]}
          intConvert
          />
        <br/>
        <Select
          formField='defaultSiteId'
          optionValues={this.sites}
          label='Default Site'
          defaultValue={1}
          intConvert
          />
        <br/>
        <Checkbox
          formField='active'
          label='Active'
          defaultValue={true}
          />
        <br/>
        <br/>
        <input type='submit' value='Submit'/>
        <span>{submitMessage}</span>
      </Form>
    );
  }


  handleSubmit(e) {
    e.preventDefault();
    let model = this.formState.createUnitOfWork().createModel();
    if (model) {
      // transform model for the api
      model.disabled = !model.active;
      delete model.active;
      alert(JSON.stringify(model));
    }
  }

}
```

&nbsp;

You will probably want to convert these to stateless functional components and separate the components into a react-formstate layer and a layer independent of react-formstate layer. That exercise is beyond the scope of this document but you can refer to the [demo source code](https://github.com/dtrelogan/react-formstate-demo/tree/master/components/inputs) for ideas.

### Checkbox

```es6
import React, { Component } from 'react';

export default class Checkbox extends Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  render() {
    return (
      <div>
        <input
          type='checkbox'
          checked={this.props.fieldState.getValue()}
          onChange={this.onChange}
          />
        <label>{this.props.label}</label>
        <span className='help'>{this.props.fieldState.getMessage()}</span>
      </div>
    );
  }

  onChange(e) {
    this.props.handleValueChange(e.target.checked); // NOT e.target.value!
  }
}
```

### CheckboxGroup

```es6
import React, { Component } from 'react';

export default class CheckboxGroup extends Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  render() {
    let arrayValue = this.props.fieldState.getValue() || [];

    // note that in getValue react-formstate will coerce [1,2,3] to ['1','2','3']

    let checkboxes = this.props.checkboxValues.map((v) => {
      let checked = arrayValue.some(x => x === v.id.toString());
      return (
        <span key={v.id}>
          <input
            type='checkbox'
            value={v.id}
            checked={checked}
            onChange={this.onChange}
            />
          <label>{v.name}</label><br/>
        </span>
      );
    });

    return (
      <div>
        <label>{this.props.label}</label><br/>
        {checkboxes}
        <br/>
        <div className='help'>{this.props.fieldState.getMessage()}</div>
        <br/>
      </div>
    );
  }

  onChange(e) {
    let value = this.props.fieldState.getValue() || []; // previous value

    if (e.target.checked) {
      value = value.slice(0); // copy the existing array
      if (!value.some(x => x === e.target.value)) {
        value.push(e.target.value)
        value.sort();
      }
    } else {
      value = value.filter(x => x !== e.target.value);
    }

    this.props.handleValueChange(value);
  }
}
```

### RadioGroup

```es6
import React, { Component } from 'react';

export default class RadioGroup extends Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  render() {
    let buttons = this.props.buttonValues.map((v) => {
      return (
        <span key={v.id}>
          <input
            type='radio'
            value={v.id}
            checked={this.props.fieldState.getValue() === v.id.toString()}
            onChange={this.onChange}
            />
          <label>{v.name}</label><br/>
        </span>
      );
    });

    return (
      <div>
        <label>{this.props.label}</label><br/>
        {buttons}
        <br/>
        <div className='help'>{this.props.fieldState.getMessage()}</div>
      </div>
    );
  }

  onChange(e) {
    this.props.handleValueChange(e.target.value);
  }
}
```

### Select (and multi-select)

```es6
import React, { Component } from 'react';

export default class Select extends Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  render() {
    let options = this.props.optionValues.map((v) => {
      return (
        <option key={v.id} value={v.id.toString()}>
          {v.name}
        </option>
      );
    });

    let value = this.props.fieldState.getValue();

    // note that in getValue react-formstate will coerce [1,2,3] to ['1','2','3']

    if (this.props.multiple) {
      value = value || []; // null is coerced to '' not []
    }

    return (
      <div>
        <div><label>{this.props.label}</label></div>
        <select
          multiple={Boolean(this.props.multiple)}
          value={value}
          onChange={this.onChange}
          >
          {options}
        </select>
        <span className='help'>{this.props.fieldState.getMessage()}</span>
      </div>
    );
  }

  onChange(e) {
    let value;

    if (this.props.multiple) {
      value = [];
      let options = e.target.options;
      for (let i = 0, len = options.length; i < len; i++) {
        if (options[i].selected) {
          value.push(options[i].value);
        }
      }
    } else {
      value = e.target.value;
    }

    this.props.handleValueChange(value);
  }
}
```

### Text Area

```es6
import React, { Component } from 'react';

export default class TextArea extends Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  render() {
    return (
      <div>
        <label>{this.props.label}</label>
        <textarea
          value={this.props.fieldState.getValue()}
          onChange={this.onChange}
          />
        <span className='help'>{this.props.fieldState.getMessage()}</span>
      </div>
    );
  }

  onChange(e) {
    this.props.handleValueChange(e.target.value);
  }
}
```
