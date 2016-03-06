# FormArray
### adding and removing inputs in response to state changes

```jsx
import React from 'react';
import { FormState, FormObject, FormArray } from 'react-formstate';
import Input from './Input.jsx';
import Contact from './Contact.jsx';
import Address from './Address.jsx';

export default class UserForm extends React.Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = this.formState.createUnitOfWork().injectModel(props.model);

    let model = props.model || {};
    this.state.numContacts = model.contacts ? model.contacts.length : 0;
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
      <form>
        <FormObject formState={this.formState}>
          <Input formField='name' label='Name' required />
          <h3>Contacts</h3>
          <a href='#' onClick={this.addContact.bind(this)}>add contact</a><br/>
          <FormArray name='contacts'>
            {contacts}
          </FormArray>
        </FormObject>
        <br/>
        <input type='submit' value='Submit' onClick={this.handleSubmit.bind(this)} />
        <span>{this.formState.isInvalid() ? 'Please fix validation errors' : null}</span>
      </form>
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
    return function(e) {
      e.preventDefault();
      let context = this.formState.createUnitOfWork();
      context.remove(`contacts.${i}`);
      context.updateFormState();
    }.bind(this);
  }
}
```
