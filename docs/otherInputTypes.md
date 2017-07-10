# templates for other input types

```es6
import React, { Component } from 'react';
import { FormState, Form, FormArray } from 'react-formstate';
import Input from './Input.jsx';
import Contact from './Contact.jsx';
import Address from './Address.jsx';
import Checkbox from './Checkbox.jsx';
import CheckboxGroup from './CheckboxGroup.jsx';
import RadioGroup from './RadioGroup.jsx';
import Select from './Select.jsx';

export default class UserForm extends Component {

  constructor(props) {
    super(props);

    this.formState = new FormState(this);

    let model = {}; // create
    // or edit:
    // model = {
    //   name: 'buster brown',
    //   username: 'buster',
    //   contactPreferenceId: 2,
    //   contacts: [
    //     {
    //       email: 'buster@dogmail.com',
    //       phone: '999-999-9999',
    //       address: { line1: '123 home st' }
    //     },
    //     {
    //       email: 'buster@dogs.org',
    //       phone: '888-888-8888',
    //       address: { line1: '456 work st' }
    //     }
    //   ],
    //   roleIds: [2,3],
    //   siteIds: [4],
    //   defaultSiteId: 4,
    //   disabled: true
    // };

    this.state = this.formState.injectModel(model);

    this.state.originalUsername = model.username;

    // transform model state for the UI
    this.formState.add(this.state, 'active', !model.disabled);

    this.state.numContacts = model.contacts ? model.contacts.length : 0;

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

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addContact = this.addContact.bind(this);
  }


  validatePassword(password, context) {
    context.setc('passwordConfirmation', '');
    if (password.length < 8) { return 'Must be at least 8 characters'; }
  }

  validatePasswordConfirmation(confirmation, context) {
    if (confirmation !== context.get('password')) {
      return 'Passwords do not match';
    }
  }

  validateRoleIds(roleIds) {
    if (!roleIds.length) { return 'Please select at least one role'; }
  }


  render() {
    let submitMessage = null;

    if (this.formState.isValidating()) {
      submitMessage = 'Waiting for validation to finish...';
    } else if (this.formState.isInvalid()) {
      submitMessage = 'Please fix validation errors';
    }

    let contacts = [];

    for (let i = 0; i < this.state.numContacts; i++) {
      if (!this.formState.isDeleted(`contacts.${i}`)) {
        contacts.push(
          <div key={i} >
            <h4>{i}</h4>
            <Contact formObject={i} >
              <Address formObject={'address'} labelPrefix='Address '/>
            </Contact>
            <a href='#' onClick={this.removeContact(i)}>remove</a>
          </div>
        );
      }
    }

    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <Input formField='name' label='Name' required />
        <Input
          formField='username'
          label='Username'
          required
          fsv={v => v.regex(/^\S+$/).msg('Username must not contain spaces')}
          handleValueChange={this.handleUsernameChange}
          />
        <Input formField='password' type='password' label='Password' required />
        <Input formField='passwordConfirmation' type='password' label='Confirm Password'/>
        <br/>
        <RadioGroup
          buttonValues={this.contactChoices}
          formField='contactPreferenceId'
          label='Contact Preference'
          defaultValue={1}
          intConvert
          />
        <h3>Contacts</h3>
        <a href='#' onClick={this.addContact}>add contact</a><br/>
        <FormArray name='contacts'>
          {contacts}
        </FormArray>
        <h3>Account Settings</h3>
        <CheckboxGroup
          formField='roleIds'
          checkboxValues={this.roles}
          label='Roles'
          defaultValue={[]}
          intConvert
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


  addContact(e) {
    e.preventDefault();
    this.setState({ numContacts: this.state.numContacts + 1 });
  }


  removeContact(i) {
    return (e) => {
      e.preventDefault();
      let context = this.formState.createUnitOfWork();
      context.remove(`contacts.${i}`);
      context.updateFormState();
    };
  }


  handleUsernameChange(username) {
    let context = this.formState.createUnitOfWork(),
      fieldState = context.set('username', username);

    fieldState.validate();
    if (fieldState.isInvalid()) {
      context.updateFormState();
      return;
    } // else

    if (username === this.state.originalUsername) {
      fieldState.setValid('Verified');
      context.updateFormState();
      return;
    } // else

    let field = fieldState.getField(),
      asyncToken = fieldState.setValidating(`Verifying ${field.label.toLowerCase()}...`);

    context.updateFormState();

    window.setTimeout(() => {
      let context = this.formState.createUnitOfWork();
      let fieldState = context.getFieldState(field.name, asyncToken);
      if (fieldState) { // if it hasn't changed in the meantime
        if (username === 'taken') {
          fieldState.setInvalid(`${field.label} already exists`);
        } else {
          fieldState.setValid('Verified');
        }
        fieldState.showMessage(); // in case you are showing on blur
        context.updateFormState();
      }
    }, 2000);
  }

}
```

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
