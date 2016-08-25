# FormArray
### adding and removing inputs in response to state changes

```es6
import React, { Component } from 'react';
import { FormState, Form, FormArray } from 'react-formstate';
import Input from './Input.jsx';
import Contact from './Contact.jsx';
import Address from './Address.jsx';

export default class UserForm extends Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = this.formState.injectModel(props.model);

    let model = props.model || {};
    this.state.numContacts = model.contacts ? model.contacts.length : 0;

    this.handleSubmit = this.handleSubmit.bind(this);
    this.addContact = this.addContact.bind(this);
  }


  render() {
    let contacts = [];

    for (let i = 0; i < this.state.numContacts; i++) {
      if (!this.formState.isDeleted(`contacts.${i}`)) {
        contacts.push(
          <div key={i} >
            <h4>{i}</h4>
            <Contact formObject={i} >
              <Address formObject='address' labelPrefix='Address '/>
            </Contact>
            <a href='#' onClick={this.removeContact(i)}>remove</a>
          </div>
        );
      }
    }

    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <Input formField='name' label='Name' required />
        <h3>Contacts</h3>
        <a href='#' onClick={this.addContact}>add contact</a><br/>
        <FormArray name='contacts'>
          {contacts}
        </FormArray>
        <br/>
        <input type='submit' value='Submit'/>
        <span>{this.formState.isInvalid() ? 'Please fix validation errors' : null}</span>
      </Form>
    );
  }


  handleSubmit(e) {
    e.preventDefault();
    let model = this.formState.createUnitOfWork().createModel();
    if (model) {
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
}
```
