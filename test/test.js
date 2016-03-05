'use strict';

var assert = require('assert');

var React = require('react');
var ReactDOMServer = require('react-dom/server');

var rf = require('../react-formstate.js');
var FormState = rf.FormState;
var FormObject = rf.FormObject;
var FormArray = rf.FormArray;

var required = function(value, label) {
  if (value.trim() === '') {
    return label + ' is required';
  }
};

var minLength = function(value, label, minLength) {
  if (value.length < minLength) {
    return label + ' must be at least ' + minLength + ' characters';
  }
};

var noSpaces = function(value, label) {
  if (value.includes(' ')) { return 'no spaces'; }
}

var lengthBetween = function(value, label, minLength, maxLength) {
  if (value.length < minLength) {
    return label + ' must be at least ' + minLength + ' characters';
  }
  if (value.length > maxLength) {
    return label + ' must be at most ' + maxLength + ' characters';
  }
};

FormState.registerValidation('minLength', minLength);
FormState.registerValidation('noSpaces', noSpaces);
FormState.registerValidation('lengthBetween', lengthBetween);

var testForm,
  NameInput, nameInput,
  ContactEmailInput, contactEmailInput,
  ContactAddressLine1Input, contactAddressLine1Input;

var createInput = function(saveRef) {
  return React.createClass({
    render: function() {
      saveRef(this);
      return React.createElement('div', null,
        React.createElement('label', null, this.props.label),
        React.createElement('input', { type: 'text', value: this.props.fieldState.getValue(), onChange: this.props.updateFormState }),
        React.createElement('span', null, this.props.fieldState.getMessage())
      );
    }
  });
};

NameInput = createInput(function(input) { nameInput = input; });
ContactEmailInput = createInput(function(input) { contactEmailInput = input; });
ContactAddressLine1Input = createInput(function(input) { contactAddressLine1Input = input; });


var createUserFormFixture = function(inject, doThrow) {
  return React.createClass({
    getInitialState: function() {
      testForm = this;
      this.formState = new FormState(this);
      if (inject) {
        return this.formState.createUnitOfWork().injectModel({
           name: 'Henry',
           contact: {
             email: 'henry@ka.com',
             address: {
               line1: '123 pinecrest rd'
             }
           }
         });
       } else {
         return {};
       }
    },
    render: function() {
      return React.createElement('form', null,
        React.createElement(FormObject, { formState: this.formState },
          React.createElement(NameInput, { formField: 'name', label: 'Name', defaultValue: 'hpt' }),
          React.createElement(FormObject, { name: 'contact', labelPrefix: 'Work ' },
            React.createElement(ContactEmailInput, { formField: 'email', label: 'Email' }),
            React.createElement(FormObject, { name: 'address', labelPrefix: 'Address ' },
              React.createElement(ContactAddressLine1Input, { formField: 'line1', label: 'Line 1', required: true, validate: [['minLength', 3]] })
            )
          ),
          'test no child',
          null,
          doThrow ? React.createElement(FormObject) : null
        ),
        React.createElement('input', { type: 'submit', value: 'Submit', onClick: this.handleSubmit }),
        React.createElement('span', null, this.formState.isInvalid() ? 'Please fix validation errors' : null)
      );
    },
    handleSubmit: function(e) {
      e.preventDefault();
      var model = this.formState.createUnitOfWork().createModel();
      if (model) {
        alert(JSON.stringify(model));
      }
    }
  });
};

var UserForm = createUserFormFixture(false);
var UserFormEdit = createUserFormFixture(true);
var UserFormThrow = createUserFormFixture(false, true);


var contactForm;

var Contact = React.createClass({
  getInitialState: function() {
    contactForm = this;
    return null;
  },
  render: function() {
    return React.createElement(FormObject, { nestedForm: this },
      React.createElement(ContactEmailInput, { formField: 'email', label: 'Email' }),
      this.props.children
    )
  }
});

var addressForm;

var Address = React.createClass({
  getInitialState: function() {
    addressForm = this;
    return null;
  },
  validateLine1: function(value) {
    if (value === 'autowired') { return 'it worked!'; }
  },
  render: function() {
    return React.createElement(FormObject, { nestedForm: this },
      React.createElement(ContactAddressLine1Input, { formField: 'line1', label: 'Line 1' })
    )
  }
});

var createUserContactsFormFixture = function(inject, backwards) {
  return React.createClass({
    getInitialState: function() {
      testForm = this;
      this.formState = new FormState(this);
      if (inject) {
        var state = this.formState.createUnitOfWork().injectModel({
           name: 'Henry',
           contacts: [
             {
               email: 'henry@ka.com',
               address: {
                 line1: '123 pinecrest rd'
               }
             }
           ]
         });
         state.numContacts = 1;
         return state;
       } else {
         return { numContacts: 0 };
       }
    },
    render: function() {
      var contacts = [];

      for (var i = 0; i < this.state.numContacts; i++) {
        if (!this.formState.isDeleted(`contacts.${i}`)) {
          if (backwards) {
            contacts.push(React.createElement('div', { key: i },
              React.createElement('h4', null, i),
              React.createElement(Address, { formObject: i.toString() + '.address' }),
              React.createElement(Contact, { formObject: i })
            ));
          } else {
            contacts.push(React.createElement('div', { key: i },
              React.createElement('h4', null, i),
              React.createElement(Contact, { formObject: i, labelPrefix: 'Work ' },
                React.createElement(Address, { formObject: 'address', labelPrefix: 'Address ' })
              )
            ));
          }
        }
      }

      return React.createElement('form', null,
        React.createElement(FormObject, { formState: this.formState },
          React.createElement(NameInput, { formField: 'name', label: 'Name' }),
          React.createElement(FormArray, { name: 'contacts' }, contacts)
        ),
        React.createElement('input', { type: 'submit', value: 'Submit', onClick: this.handleSubmit }),
        React.createElement('span', null, this.formState.isInvalid() ? 'Please fix validation errors' : null)
      );
    }
  });
};

var UserContactsForm = createUserContactsFormFixture(false);
var UserContactsFormEdit = createUserContactsFormFixture(true);
var UserContactsFormBackwards = createUserContactsFormFixture(true, true);




describe('FormState', function() {
  describe('#setRequired', function() {
    it('is set to something by default', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, model === null);
      assert.equal(2, context.stateUpdates['formState.contact.address.line1'].validity);
      assert.equal('Required field', context.stateUpdates['formState.contact.address.line1'].message);
      assert.equal(true, wasCalled);
    });
    it('does not support arrays by default', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var _fieldState = { value: [] };
      testForm.state['formState.name'] = _fieldState;
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.required = true;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, Array.isArray(model.name));
    });
    it('throws an error if passed something other than a function', function() {
      var f = function() { FormState.setRequired('s'); };
      assert.throws(f, /not a function/);
    });
    it('is passed value and label', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var wasCalled = false;
      FormState.setRequired(function(value, label) {
        wasCalled = true;
        assert.equal('123 pinecrest rd.', value);
        assert.equal('Work Address Line 1', label);
      });
      testForm.setState = function() {};
      contactAddressLine1Input.props.updateFormState({ target: { value: '123 pinecrest rd.' }});
      assert.equal(true, wasCalled);
    });
    it('sets the required validation function', function() {
      FormState.setRequired(required);
      assert.equal(required, FormState.required);
    });
  });
  describe('#unregisterValidation', function() {
    it('removes a registered function', function() {
      assert.equal(minLength, FormState.validators['minLength']);
      FormState.unregisterValidation('minLength');
      assert.equal(undefined, FormState.validators['minLength']);
    });
    it('does not crash if no registered function', function() {
      FormState.unregisterValidation('minLength');
      assert.equal(undefined, FormState.validators['minLength']);
    });
  });
  describe('#registerValidation', function() {
    it('throws an error if passed something other than a function', function() {
      var f = function() { FormState.registerValidation('s'); };
      assert.throws(f, /not a function/);
    });
    it('is passed value and label and user-provided parameters', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var wasCalled = false;
      FormState.registerValidation('minLength', function(value, label, minLength) {
        wasCalled = true;
        assert.equal('123 pinecrest rd.', value);
        assert.equal('Work Address Line 1', label);
        assert.equal(3, minLength);
      });
      testForm.setState = function() {};
      contactAddressLine1Input.props.updateFormState({ target: { value: '123 pinecrest rd.' }});
      assert.equal(true, wasCalled);
    });
    it('upserts an existing validation function', function() {
      assert.equal('function', typeof(FormState.validators['minLength']));
      assert.notEqual(minLength, FormState.validators['minLength']);
      FormState.registerValidation('minLength', minLength);
      assert.equal(minLength, FormState.validators['minLength']);
    });
  });
  describe('#lookupValidation', function() {
    it('returns a registered validation function', function() {
      assert.equal(minLength, FormState.lookupValidation('minLength'));
    });
    it('returns undefined if no registered function', function() {
      assert.equal(undefined, FormState.lookupValidation('noneByThatName'));
    });
  });
  describe('#constructor', function() {
    it('sets a form property', function() {
      var fs = new FormState(this);
      assert.equal(this, fs.form);
    });
    it('sets a path property', function() {
      var fs = new FormState(this);
      assert.equal(null, fs.path);
    });
    it('sets a root form state property', function() {
      var fs = new FormState(this);
      assert.equal(fs, fs.rootFormState);
    });
    it('sets a fields property', function() {
      var fs = new FormState(this);
      assert.equal(true, Array.isArray(fs.fields));
      assert.equal(0, fs.fields.length);
    });
  });
  describe('#createFormState', function() {
    it('sets a path property', function() {
      var fs = new FormState(this);
      var nfs = fs.createFormState('1');
      assert.equal('1', nfs.path);
      var nnfs = nfs.createFormState('2');
      assert.equal('1.2', nnfs.path);
    });
    it('sets a root form state property', function() {
      var fs = new FormState(this);
      var nfs = fs.createFormState('1');
      assert.equal(fs, nfs.rootFormState);
      var nnfs = nfs.createFormState('2');
      assert.equal(fs, nnfs.rootFormState);
    });
    it('clears the fields property', function() {
      var fs = new FormState(this);
      var nfs = fs.createFormState('nested');
      assert.equal(undefined, nfs.fields);
    });
  });
  describe('#isInvalid', function() {
    it('returns false unless an invalid field state exists', function() {
      var state = {
        'formState.name': {},
        'formState.email': { validity: 1 },
        'formState.phone': { validity: 3 }
      };
      var fs = new FormState({ state: state });
      assert.equal(false, fs.isInvalid());
      state['formState.address.line1'] = { validity: 2 };
      assert.equal(true, fs.isInvalid());
    });
    it('optionally ignores invalid messages', function() {
      var state = {
        'formState.email': { validity: 2 }
      };
      var fs = new FormState({ state: state });
      assert.equal(true, fs.isInvalid());
      assert.equal(false, fs.isInvalid(true));
      state['formState.address.line1'] = { validity: 2, isMessageVisible: true };
      assert.equal(true, fs.isInvalid());
      assert.equal(true, fs.isInvalid(true));
    });
  });
  describe('#isValidating', function() {
    it('returns false unless a validating field state exists', function() {
      var state = {
        'formState.name': {},
        'formState.email': { validity: 1 },
        'formState.phone': { validity: 2 }
      };
      var fs = new FormState({ state: state });
      assert.equal(false, fs.isValidating());
      state['formState.address.line1'] = { validity: 3 };
      assert.equal(true, fs.isValidating());
    });
  });
  describe('#buildKey', function() {
    it('builds a dot separated key', function() {
      var fs = new FormState();
      assert.equal(null, fs.path);
      assert.equal('name', fs.buildKey('name'));
      var nfs = fs.createFormState('contact');
      assert.equal('contact', nfs.path);
      assert.equal('contact.email', nfs.buildKey('email'));
      var nnfs = nfs.createFormState('address');
      assert.equal('contact.address', nnfs.path);
      assert.equal('contact.address.line1', nnfs.buildKey('line1'));
    });
  });
  describe('#getRootFields', function() {
    it('returns fields from root form state', function() {
      var fs = new FormState();
      assert.equal(fs.fields, fs.getRootFields());
      var nfs = fs.createFormState('contact');
      assert.equal(fs.fields, nfs.getRootFields());
      var nnfs = nfs.createFormState('address');
      assert.equal(fs.fields, nnfs.getRootFields());
    });
  });
  describe('#getFieldState', function() {
    it('looks up a field state by name', function() {
      var state = {
        'formState.name': { value: 'Henry' }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('name');
      assert.equal('Henry', fieldState.getValue());
    });
    it('returns a read-only FieldState', function() {
      var state = {
        'formState.name': { value: 'Henry' }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('name');
      assert.equal('Henry', fieldState.getValue());
      assert.equal('FieldState', fieldState.constructor.name);
      assert.equal('name', fieldState.getKey());
      assert.equal(null, fieldState.getField());
      assert.equal(false, fieldState.isModified);
      assert.throws(function() { fieldState.assertCanUpdate(); }, /read-only/);
    });
    it('returns null if async token does not match', function() {
      var state = {
        'formState.name': { value: 'Henry', isCoerced: true }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('name', 1);
      assert.equal(true, fieldState === null);
    });
    it('returns field state if async token matches', function() {
      var state = {
        'formState.name': { value: 'Henry', isCoerced: true, asyncToken: 1 }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('name', 1);
      assert.equal('Henry', fieldState.getValue());
    });
    it('returns a field state with value set to empty string if none exists', function() {
      var fs = new FormState({ state: {} });
      var fieldState = fs.getFieldState('name');
      assert.equal(true, fieldState.getValue() === '');
    });
    it('returns a field state with value set to empty string if deleted', function() {
      var state = {
        'formState.name': { value: 'Henry', isDeleted: true }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('name');
      assert.equal(true, fieldState.getValue() === '');
    });
    it('coerces a field state value of undefined to empty string', function() {
      var state = {
        'formState.name': { value: undefined }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('name');
      assert.equal(true, fieldState.getValue() === '');
    });
    it('coerces a field state value of null to empty string', function() {
      var state = {
        'formState.name': { value: null }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('name');
      assert.equal(true, fieldState.getValue() === '');
    });
    it('does not coerce a boolean false field state value', function() {
      var state = {
        'formState.name': { value: false }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('name');
      assert.equal(true, fieldState.getValue() === false);
    });
    it('does not coerce a boolean true field state value', function() {
      var state = {
        'formState.name': { value: true }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('name');
      assert.equal(true, fieldState.getValue() === true);
    });
    it('coerces an array of ints to an array of strings', function() {
      var state = {
        'formState.name': { value: [1, null, 3, true] }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('name');
      assert.equal(true, Array.isArray(fieldState.getValue()));
      assert.equal(4, fieldState.getValue().length);
      assert.equal(true, fieldState.getValue()[0] === '1');
      assert.equal(true, fieldState.getValue()[1] === null);
      assert.equal(true, fieldState.getValue()[2] === '3');
      assert.equal(true, fieldState.getValue()[3] === 'true');
    });
    it('coerces an empty array to an empty array', function() {
      var state = {
        'formState.name': { value: [] }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('name');
      assert.equal(true, Array.isArray(fieldState.getValue()) && fieldState.getValue().length === 0);
    });
    it('uses a name relative to form state path', function() {
      var state = {
        'formState.contact.address.line1': { value: '123 elm st' }
      };
      var fs = new FormState({ state: state });
      var nfs = fs.createFormState('contact.address');
      var fieldState = nfs.getFieldState('line1');
      assert.equal('123 elm st', fieldState.getValue());
    });
    it('can find a nested field state by key', function() {
      var state = {
        'formState.contact.address.line1': { value: '123 elm st' }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('contact.address.line1');
      assert.equal('123 elm st', fieldState.getValue());
    });
    it('can find a field state by field', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'address');
      field = field.fields.find(x => x.name === 'line1');
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal('123 pinecrest rd', fieldState.getValue());
      assert.equal(field, fieldState.getField());
    });
    it('coerces injected form state unless noCoercion is set', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal(false, Boolean(fieldState.isCoerced));
      testForm.state = { 'formState.contact.email': { value: 1 } };
      fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, '1' === fieldState.getValue());
      field.noCoercion = true;
      fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, 1 === fieldState.getValue());
    });
    it('sets value to empty array if array default value and null or undefined injected value', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.defaultValue = [1,2,3];
      field.noCoercion = true; // this doesn't apply
      testForm.state = { 'formState.contact.email': { value: null } };
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, Array.isArray(fieldState.getValue()) && fieldState.getValue().length === 0);
      testForm.state = { 'formState.contact.email': { value: undefined } };
      fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, Array.isArray(fieldState.getValue()) && fieldState.getValue().length === 0);
    });
    it('sets to default value if nothing injected', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.defaultValue = 'default';
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal('default', fieldState.getValue());
    });
    it('sets to default value if deleted', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.defaultValue = 'default';
      testForm.state = { 'formState.contact.email': { value: 'deleted', isDeleted: true } };
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal('default', fieldState.getValue());
    });
    it('coerces default value unless noCoercion is set', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.defaultValue = 3;
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, '3' === fieldState.getValue());
      testForm.state = { 'formState.contact.email': { value: 'deleted', isDeleted: true } };
      field.noCoercion = true;
      fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, 3 === fieldState.getValue());
    });
    it('can return undefined value if no coercion', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.noCoercion = true;
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, undefined === fieldState.getValue());
      testForm.state = { 'formState.contact.email': { value: undefined } };
      fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, undefined === fieldState.getValue());
    });
    it('can return null value if no coercion', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.noCoercion = true;
      field.defaultValue = null;
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, null === fieldState.getValue());
      testForm.state = { 'formState.contact.email': { value: null } };
      fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, null === fieldState.getValue());
    });
    it('does not mark fieldState coerced until you call set...', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      var fieldState = testForm.formState.getFieldState(field, null, testForm.formState.createUnitOfWork());
      fieldState.getKey();
      fieldState.getValue();
      fieldState.getMessage();
      fieldState.isValidated();
      fieldState.isValid();
      fieldState.isInvalid();
      fieldState.isValidating();
      fieldState.isDeleted();
      fieldState.isMessageVisible();
      fieldState.getField();
      assert.equal(false, Boolean(fieldState.fieldState.isCoerced));
      fieldState.setValue('update');
      assert.equal(true, Boolean(fieldState.fieldState.isCoerced));
      fieldState = testForm.formState.getFieldState(field, null, testForm.formState.createUnitOfWork());
      fieldState.validate();
      assert.equal(true, Boolean(fieldState.fieldState.isCoerced));
      fieldState = testForm.formState.getFieldState(field, null, testForm.formState.createUnitOfWork());
      fieldState.setValid();
      assert.equal(true, Boolean(fieldState.fieldState.isCoerced));
      fieldState = testForm.formState.getFieldState(field, null, testForm.formState.createUnitOfWork());
      fieldState.setInvalid();
      assert.equal(true, Boolean(fieldState.fieldState.isCoerced));
      fieldState = testForm.formState.getFieldState(field, null, testForm.formState.createUnitOfWork());
      fieldState.setValidating();
      assert.equal(true, Boolean(fieldState.fieldState.isCoerced));
      fieldState = testForm.formState.getFieldState(field, null, testForm.formState.createUnitOfWork());
      fieldState.fieldState.message = 'a message';
      fieldState.showMessage();
      assert.equal(true, Boolean(fieldState.fieldState.isCoerced));
    });
  });
  describe('#isDeleted', function() {
    it('returns false if field state does not exist', function() {
      var state = {};
      var fs = new FormState({ state: state });
      assert.equal(false, fs.isDeleted('noMatch'));
    });
    it('returns false unless field state is deleted', function() {
      var state = {
        'formState.name': {}
      };
      var fs = new FormState({ state: state });
      assert.equal(false, fs.isDeleted('name'));
      state['formState.name'] = { isDeleted: true };
      assert.equal(true, fs.isDeleted('name'));
    });
    it('uses a name relative to the form state path', function() {
      var state = {
        'formState.contact.address.line1': { isDeleted: true }
      };
      var fs = new FormState({ state: state });
      assert.equal(false, fs.isDeleted('line1'));
      fs.path = 'contact.address';
      assert.equal(true, fs.isDeleted('line1'));
    });
  });
  describe('#createUnitOfWork', function() {
    it('returns a new unit of work tied to calling form state', function() {
      var fs = new FormState();
      var context = fs.createUnitOfWork();
      assert.equal('UnitOfWork', context.constructor.name);
      assert.equal(fs, context.formState);
    });
  });
  describe('#clearFields', function() {
    it('sets length to 0 on root form state fields', function() {
      var fs = new FormState();
      var fields = [1,2,3];
      fs.fields = fields;
      assert.equal(3, fs.fields.length);
      fs.clearFields();
      assert.equal(fields, fs.fields);
      assert.equal(0, fs.fields.length);
    });
    it('does nothing unless called on root form state', function() {
      var fs = new FormState();
      var fields = [1,2,3];
      fs.fields = fields;
      var nfs = fs.createFormState('1');
      assert.equal(3, fs.fields.length);
      nfs.clearFields();
      assert.equal(3, fs.fields.length);
    });
  });
  describe('#onUpdate', function() {
    it('sets a callback function', function() {
      var f = function(){};
      var fs = new FormState();
      fs.onUpdate(f);
      assert.equal(f, fs.updateCallback);
    });
    it('throws an error if passed something other than a function', function() {
      var fs = new FormState();
      assert.throws(function() { fs.onUpdate({}); }, /not a function/);
    });
    it('throws an error if not called against root form state', function() {
      var f = function(){};
      var fs = new FormState();
      var nfs = fs.createFormState('1');
      assert.throws(function() { nfs.onUpdate(f); }, /nested form state/);
    });
    it('is passed a unit of work with updates and a key', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var wasCalled = false;
      testForm.formState.onUpdate(function(context, key) {
        wasCalled = true;
        assert.equal('UnitOfWork', context.constructor.name);
        assert.equal('Henry!', context.stateUpdates['formState.name'].value);
        assert.equal('name', key);
      });
      nameInput.props.updateFormState({ target: { value: 'Henry!' }});
      assert.equal(true, wasCalled);
    });
    it('is passed a key that may name a nested field', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var wasCalled = false;
      testForm.formState.onUpdate(function(context, key) {
        wasCalled = true;
        assert.equal('UnitOfWork', context.constructor.name);
        assert.equal('123 pinecrest rd.', context.stateUpdates['formState.contact.address.line1'].value);
        assert.equal('contact.address.line1', key);
        assert.equal(context.formState, context.formState.rootFormState);
      });
      contactAddressLine1Input.props.updateFormState({ target: { value: '123 pinecrest rd.' }});
      assert.equal(true, wasCalled);
    });
  })
});
describe('UnitOfWork', function() {
  describe('#constructor', function() {
    it('sets a formState and stateUpdates', function() {
      var fs = new FormState(), context = fs.createUnitOfWork();
      assert.equal(fs, context.formState);
      assert.equal('object', typeof(context.stateUpdates));
      assert.equal(0, Object.keys(context.stateUpdates).length);
    });
  });
  describe('#getFieldState', function() {
    it('looks up a possibly updated field state by name', function() {
      var state = { 'formState.name': { value: 'Henry' } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      assert.equal('Henry', fieldState.getValue());
      context.stateUpdates['formState.name'] = { value: 'Henry!' };
      fieldState = context.getFieldState('name');
      assert.equal('Henry!', fieldState.getValue());
      assert.equal('name', fieldState.getKey());
      assert.equal(null, fieldState.getField());
      assert.equal(true, fieldState.isModified);
      assert.equal(context, fieldState.stateContext);
    });
    it('returns a writeable field state', function() {
      var state = { 'formState.name': { value: 'Henry' } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      assert.equal('Henry', fieldState.getValue());
      assert.equal(context, fieldState.stateContext);
      context.stateUpdates['formState.name'] = { value: 'Henry!' };
      fieldState = context.getFieldState('name');
      assert.equal('Henry!', fieldState.getValue());
      assert.equal(context, fieldState.stateContext);
    });
    it('ignores async token if found in state updates', function() {
      var state = { 'formState.name': { value: 'Henry' } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork();
      context.stateUpdates['formState.name'] = { value: 'Henry!' };
      var fieldState = context.getFieldState('name', 1);
      assert.equal('Henry!', fieldState.getValue());
    });
    it('passes async token to FormState.getFieldState', function() {
      var state = { 'formState.name': { value: 'Henry', isCoerced: true } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork();
      var fieldState = context.getFieldState('name', 1);
      assert.equal(null, fieldState);
      state['formState.name'].asyncToken = 1;
      fieldState = context.getFieldState('name', 1);
      assert.equal('Henry', fieldState.getValue());
    });
    it('uses a name relative to form state path', function() {
      var state = {
        'formState.contact.address.line1': { value: '123 elm st' }
      };
      var fs = new FormState({ state: state });
      var nfs = fs.createFormState('contact.address');
      var context = nfs.createUnitOfWork();
      var fieldState = context.getFieldState('line1');
      assert.equal('123 elm st', fieldState.getValue());
      context.stateUpdates['formState.contact.address.line1'] = { value: 'u' };
      fieldState = context.getFieldState('line1');
      assert.equal('u', fieldState.getValue());
    });
    it('can find a nested field state by key', function() {
      var state = {
        'formState.contact.address.line1': { value: '123 elm st' }
      };
      var fs = new FormState({ state: state });
      var context = fs.createUnitOfWork();
      var fieldState = fs.getFieldState('contact.address.line1');
      assert.equal('123 elm st', fieldState.getValue());
      context.stateUpdates['formState.contact.address.line1'] = { value: 'u' };
      fieldState = context.getFieldState('contact.address.line1');
      assert.equal('u', fieldState.getValue());
    });
    it('can find a field state by field', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'address');
      field = field.fields.find(x => x.name === 'line1');
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState(field);
      assert.equal('123 pinecrest rd', fieldState.getValue());
      assert.equal(field, fieldState.getField());
      context.stateUpdates['formState.contact.address.line1'] = { value: 'u' };
      fieldState = context.getFieldState(field);
      assert.equal('u', fieldState.getValue());
      assert.equal(field, fieldState.getField());
    });
    it('does not coerce updated field state', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      assert.equal(true, '3' === fieldState.getValue());
      context.stateUpdates['formState.name'] = { value: 4 };
      var fieldState = context.getFieldState('name');
      assert.equal(true, 4 === fieldState.getValue());
    });
  });
  describe('#updateFormState', function() {
    it('calls set state on the root form', function() {
      var form = {
        state: {
          'formState.contact.address.line1': { value: '123 elm st' }
        }
      };
      var fs = new FormState(form);
      var nfs = fs.createFormState('contact.address');
      var context = nfs.createUnitOfWork();
      context.stateUpdates = {
        'formState.contact.address.line1': { value: 'u' }
      };
      var wasCalled = false;
      form.setState = function(x) {
        wasCalled = true;
        assert.equal(x, context.stateUpdates);
      }
      context.updateFormState();
      assert.equal(true, wasCalled);
    });
    it('does not call set state if no updates', function() {
      var form = {
        state: {
          'formState.contact.address.line1': { value: '123 elm st' }
        }
      };
      var fs = new FormState(form);
      var nfs = fs.createFormState('contact.address');
      var context = nfs.createUnitOfWork();
      var wasCalled = false;
      form.setState = function(x) {
        wasCalled = true;
        assert.equal(x, context.stateUpdates);
      }
      context.updateFormState();
      assert.equal(false, wasCalled);
    });
    it('merges additional updates', function() {
      var form = {
        state: {
          'formState.contact.address.line1': { value: '123 elm st' }
        }
      };
      var fs = new FormState(form);
      var nfs = fs.createFormState('contact.address');
      var context = nfs.createUnitOfWork();
      context.stateUpdates = {
        'formState.contact.address.line1': { value: 'u' }
      };
      var wasCalled = false;
      form.setState = function(x) {
        wasCalled = true;
        assert.equal(x, context.stateUpdates);
        assert.equal('hello', x.another);
        assert.equal('world', x.ya);
      }
      context.updateFormState({ another: 'hello', ya: 'world' });
      assert.equal(true, wasCalled);
    });
  });
  describe('#add', function() {
    it('adds a value to the unit of work state updates', function() {
      var fs = new FormState(), context = fs.createUnitOfWork();
      context.add('x', 1);
      context.add('y', 2);
      assert.equal(true, context.stateUpdates['formState.x'].value === 1);
      assert.equal(true, context.getFieldState('x').getValue() === 1);
      assert.equal(true, context.stateUpdates['formState.y'].value === 2);
      assert.equal(true, context.getFieldState('y').getValue() === 2);
    });
    it('returns the unit of work state updates', function() {
      var fs = new FormState(), context = fs.createUnitOfWork();
      var result = context.add('x', 1);
      assert.equal(true, context.stateUpdates === result);
    });
    it('adds a value that will be coerced', function() {
      var state = {}, form = { state: state }, fs = new FormState(form),
        context = fs.createUnitOfWork();
      context.add('x', 1);
      assert.equal(true, context.stateUpdates['formState.x'].value === 1);
      assert.equal(true, context.getFieldState('x').getValue() === 1);
      form.setState = function(x) {
        this.state = x;
      };
      context.updateFormState();
      assert.equal(true, '1' === fs.getFieldState('x').getValue());
    });
    it('adds a nested value relative to form state path', function() {
      var state = {}, form = { state: state }, fs = new FormState(form),
        nfs = fs.createFormState('nested'), context = nfs.createUnitOfWork();
      context.add('x', 1);
      assert.equal(true, context.getFieldState('x').getValue() === 1);
      form.setState = function(x) {
        this.state = x;
      };
      context.updateFormState();
      assert.equal(true, '1' === fs.getFieldState('nested.x').getValue());
      assert.equal(true, '1' === nfs.getFieldState('x').getValue());
    });
    it('can work with a key rather than a relative name', function() {
      var state = {}, form = { state: state }, fs = new FormState(form),
        nfs = fs.createFormState('nested'), context = fs.createUnitOfWork();
      context.add('nested.x', 1);
      assert.equal(true, context.getFieldState('nested.x').getValue() === 1);
      form.setState = function(x) {
        this.state = x;
      };
      context.updateFormState();
      assert.equal(true, '1' === fs.getFieldState('nested.x').getValue());
      assert.equal(true, '1' === nfs.getFieldState('x').getValue());
    });
    it('calls inject model if value is an object and does NOT add a field state', function() {
      var state = {}, form = { state: state }, fs = new FormState(form),
        context = fs.createUnitOfWork();
      var wasCalled = false;
      context.injectModel = function(value) {
        wasCalled = true;
        assert.notEqual(fs, context.formState);
        assert.equal(fs, context.formState.rootFormState);
        assert.equal('contact', context.formState.path);
      };
      context.add('contact', { email: 'henry@ka.edu' });
      assert.equal(true, wasCalled);
      assert.equal(fs, context.formState);
      assert.equal(true, undefined === context.stateUpdates['formState.contact']);
      assert.equal(true, '' === context.getFieldState('contact').getValue());
    });
    it('calls inject model if value is an array and DOES add a field state', function() {
      var state = {}, form = { state: state }, fs = new FormState(form),
        context = fs.createUnitOfWork();
      var wasCalled = false;
      context.injectModel = function(value) {
        wasCalled = true;
        assert.notEqual(fs, context.formState);
        assert.equal(fs, context.formState.rootFormState);
        assert.equal('contacts', context.formState.path);
      };
      context.add('contacts', [ { email: 'henry@ka.edu' } ]);
      assert.equal(true, wasCalled);
      assert.equal(fs, context.formState);
      assert.equal('henry@ka.edu', context.stateUpdates['formState.contacts'].value[0].email);
      assert.equal('henry@ka.edu', context.getFieldState('contacts').getValue()[0].email);
    });
  });
  describe('#remove', function () {
    it('sets field state as deleted', function() {
      var state = { 'formState.name' : { value: 'Henry' } }, form = { state: state },
        fs = new FormState(form), context = fs.createUnitOfWork();

      form.setState = function(x) {
        this.state = x;
      };

      context.remove('name');
      assert.equal(true, context.getFieldState('name').isDeleted());
      assert.equal(undefined, context.getFieldState('name').getValue());
      assert.equal('Henry', fs.getFieldState('name').getValue());
      context.updateFormState();
      assert.equal('', fs.getFieldState('name').getValue());
    });
    it('uses a name relative to form state path', function() {
      var state = { 'formState.contact.email' : { value: 'x' } }, form = { state: state },
        fs = new FormState(form), nfs = fs.createFormState('contact'),
        context = nfs.createUnitOfWork();

      form.setState = function(x) {
        this.state = x;
      };

      context.remove('email');
      assert.equal(true, context.getFieldState('email').isDeleted());
      assert.equal(undefined, context.getFieldState('email').getValue());
      assert.equal('x', fs.getFieldState('contact.email').getValue());
      assert.equal('x', nfs.getFieldState('email').getValue());
      context.updateFormState();
      assert.equal('', fs.getFieldState('contact.email').getValue());
      assert.equal('', nfs.getFieldState('name').getValue());
    });
    it('can use a key to name nested values', function() {
      var state = { 'formState.contact.email' : { value: 'x' } }, form = { state: state },
        fs = new FormState(form), nfs = fs.createFormState('contact'),
        context = fs.createUnitOfWork();

      form.setState = function(x) {
        this.state = x;
      };

      context.remove('contact.email');
      assert.equal(true, context.getFieldState('contact.email').isDeleted());
      assert.equal(undefined, context.getFieldState('contact.email').getValue());
      assert.equal('x', fs.getFieldState('contact.email').getValue());
      assert.equal('x', nfs.getFieldState('email').getValue());
      context.updateFormState();
      assert.equal('', fs.getFieldState('contact.email').getValue());
      assert.equal('', nfs.getFieldState('name').getValue());
    });
    it('removes the entire form state branch', function() {
      var state = {
        'formState.name' : { value: 'Henry' },
        'formState.contacts' : { value: [] },
        'formState.contacts.0.email' : { value: 'email' },
        'formState.contacts.0.address.line1' : { value: 'line1' }
      };
      var form = { state: state },
        fs = new FormState(form), context = fs.createUnitOfWork();

      form.setState = function(x) {
        this.state = Object.assign(this.state, x);
      };

      context.remove('contacts');
      assert.equal(false, context.getFieldState('name').isDeleted());
      assert.equal(true, context.getFieldState('contacts').isDeleted());
      assert.equal(true, context.getFieldState('contacts.0.email').isDeleted());
      assert.equal(true, context.getFieldState('contacts.0.address.line1').isDeleted());
      assert.equal('Henry', fs.getFieldState('name').getValue());
      assert.equal(true, Array.isArray(fs.getFieldState('contacts').getValue()));
      assert.equal('email', fs.getFieldState('contacts.0.email').getValue());
      assert.equal('line1', fs.getFieldState('contacts.0.address.line1').getValue());
      context.updateFormState();
      assert.equal('Henry', fs.getFieldState('name').getValue());
      assert.equal('', fs.getFieldState('contacts').getValue());
      assert.equal('', fs.getFieldState('contacts.0.email').getValue());
      assert.equal('', fs.getFieldState('contacts.0.address.line1').getValue());
    });
  });
  describe('#injectModel', function() {
    it('throws an error if not an object/array', function() {
      var fs = new FormState(), context = fs.createUnitOfWork();

      var f = function() { context.injectModel('s'); };
      assert.throws(f, /object type/);
    });
    it('calls add for each key in the injected object', function() {
      var fs = new FormState(), context = fs.createUnitOfWork();

      var names = [];
      context.add = function(name, value) {
        names.push({ name: name, value: value });
      };
      context.injectModel({ a: 1, b: 2 });
      assert.equal('a', names[0].name);
      assert.equal(1, names[0].value);
      assert.equal('b', names[1].name);
      assert.equal(2, names[1].value);
    });
    it('calls add for each key in the injected array', function() {
      var fs = new FormState(), context = fs.createUnitOfWork();

      var names = [];
      context.add = function(name, value) {
        names.push({ name: name, value: value });
      };
      context.injectModel([1,2]);
      assert.equal('0', names[0].name);
      assert.equal(1, names[0].value);
      assert.equal('1', names[1].name);
      assert.equal(2, names[1].value);
    });
    it('creates a placeholder field state', function() {
      var fs = new FormState(), context = fs.createUnitOfWork();

      var names = [];
      context.add = function(name, value) {
        names.push({ name: name, value: value });
      };
      context.injectModel({ a: 1, b: 2 });
      var fieldState = context.stateUpdates['formState.'];
      assert.equal('object', typeof(fieldState));
      assert.equal(0, Object.keys(fieldState).length);
      context = fs.createFormState('contacts').createUnitOfWork();
      context.injectModel([1,2]);
      fieldState = context.stateUpdates['formState.contacts'];
      assert.equal('object', typeof(fieldState));
      assert.equal(0, Object.keys(fieldState).length);
    });
    it('returns state updates', function() {
      var fs = new FormState(), context = fs.createUnitOfWork();

      var names = [];
      context.add = function(name, value) {
        names.push({ name: name, value: value });
      };
      var result = context.injectModel({ a: 1, b: 2 });
      assert.equal(result, context.stateUpdates);
    });
    it('does not crash if passed nothing', function() {
      var fs = new FormState(), context = fs.createUnitOfWork();

      var names = [];
      context.add = function(name, value) {
        names.push({ name: name, value: value });
      };
      var result = context.injectModel();
      assert.equal(1, Object.keys(context.stateUpdates).length);
      assert.equal(0, Object.keys(context.stateUpdates['formState.']).length);
    });
    it('does not crash if passed null', function() {
      var fs = new FormState(), context = fs.createUnitOfWork();

      var names = [];
      context.add = function(name, value) {
        names.push({ name: name, value: value });
      };
      var result = context.injectModel(null);
      assert.equal(1, Object.keys(context.stateUpdates).length);
      assert.equal(0, Object.keys(context.stateUpdates['formState.']).length);
    });
  });
  describe('#createModel', function() {
    it('throws an error unless called on root form state', function () {
      var fs = new FormState(), nfs = fs.createFormState('contact'),
        context = nfs.createUnitOfWork();
      var f = function() { context.createModel(); }
      assert.throws(f, /root form state/);
    });
    it('returns an empty object if no fields', function() {
      var state = {}, form = { state: state },
        fs = new FormState(form), nfs = fs.createFormState('contact'),
        context = fs.createUnitOfWork();
      var model = context.createModel();
      assert.equal('object', typeof(model));
      assert.equal(0, Object.keys(model).length);
    });
    it('returns a model if form state is valid', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var model = testForm.formState.createUnitOfWork().createModel();
      assert.equal('object', typeof(model));
      assert.equal('Henry', model.name);
      assert.equal('henry@ka.com', model.contact.email);
      assert.equal('123 pinecrest rd', model.contact.address.line1);
    });
    it('returns null and calls updateFormState if form state is invalid', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var _fieldState = { value: '', isCoerced: true, validity: 2, message: 'required', isMessageVisible: true };
      testForm.state['formState.contact.email'] = _fieldState;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, model === null);
      assert.equal(undefined, context.stateUpdates['formState.contact.email']);
      assert.equal(true, wasCalled);
    });
    it('does not call updateFormState if passed true', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var _fieldState = { value: '', isCoerced: true, validity: 2, message: 'required', isMessageVisible: true };
      testForm.state['formState.contact.email'] = _fieldState;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel(true);
      assert.equal(true, model === null);
      assert.equal(undefined, context.stateUpdates['formState.contact.email']);
      assert.equal(false, wasCalled);
    });
    it('validates unvalidated fields', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var _fieldState = { value: '' };
      testForm.state['formState.contact.address.line1'] = _fieldState;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, model === null);
      assert.equal(2, context.stateUpdates['formState.contact.address.line1'].validity);
      assert.equal(true, wasCalled);
    });
    it('shows hidden validation messages', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var _fieldState = { value: '', isCoerced: true, validity: 2, message: 'required', isMessageVisible: false };
      testForm.state['formState.contact.address.line1'] = _fieldState;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, model === null);
      assert.equal(true, context.stateUpdates['formState.contact.address.line1'].isMessageVisible);
      assert.equal(true, wasCalled);
    });
    it('can convert output from string to int', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var _fieldState = { value: '1', isCoerced: true, validity: 1 };
      testForm.state['formState.contact.email'] = _fieldState;
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.intConvert = true;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, 1 === model.contact.email);
      assert.equal(false, wasCalled);
    });
    it('can convert output from array of string to array of int', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var _fieldState = { value: ['1','2'], isCoerced: true, validity: 1 };
      testForm.state['formState.contact.email'] = _fieldState;
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.intConvert = true;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, Array.isArray(model.contact.email));
      assert.equal(2, model.contact.email.length);
      assert.equal(true, 1 === model.contact.email[0]);
      assert.equal(true, 2 === model.contact.email[1]);
      assert.equal(false, wasCalled);
    });
    it('trims strings by default', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var _fieldState = { value: '  1   ', isCoerced: true, validity: 1 };
      testForm.state['formState.contact.email'] = _fieldState;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, '1' === model.contact.email);
      assert.equal(false, wasCalled);
    });
    it('does not trim if noTrim is set', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var _fieldState = { value: '  1   ', isCoerced: true, validity: 1 };
      testForm.state['formState.contact.email'] = _fieldState;
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.noTrim = true;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, '  1   ' === model.contact.email);
      assert.equal(false, wasCalled);
    });
    it('normally prefers empty string', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var _fieldState = { value: '     ', isCoerced: true, validity: 1 };
      testForm.state['formState.contact.email'] = _fieldState;
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.noTrim = false;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, '' === model.contact.email);
      assert.equal(false, wasCalled);
    });
    it('can prefer null', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var _fieldState = { value: '     ', isCoerced: true, validity: 1 };
      testForm.state['formState.contact.email'] = _fieldState;
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.noTrim = false;
      field.preferNull = true;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, null === model.contact.email);
      assert.equal(false, wasCalled);
    });
    it('can output whitespace if null preferred', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var _fieldState = { value: '     ', isCoerced: true, validity: 1 };
      testForm.state['formState.contact.email'] = _fieldState;
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.noTrim = true;
      field.preferNull = true;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, '     ' === model.contact.email);
      assert.equal(false, wasCalled);
    });
    it('can still prefer null if no trim', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var _fieldState = { value: '', isCoerced: true, validity: 1 };
      testForm.state['formState.contact.email'] = _fieldState;
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.noTrim = true;
      field.preferNull = true;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, null === model.contact.email);
      assert.equal(false, wasCalled);
    });
    it('normally outputs an empty array', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var _fieldState = { value: [], isCoerced: true, validity: 1 };
      testForm.state['formState.contact.email'] = _fieldState;
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.preferNull = false;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, Array.isArray(model.contact.email));
      assert.equal(0, model.contact.email.length);
      assert.equal(false, wasCalled);
    });
    it('can prefer null to an empty array', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var _fieldState = { value: [], isCoerced: true, validity: 1 };
      testForm.state['formState.contact.email'] = _fieldState;
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.preferNull = true;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, null === model.contact.email);
      assert.equal(false, wasCalled);
    });
    it('normally outputs an empty object', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'address');
      field.fields = [];
      field.preferNull = false;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal('object', typeof(model.contact.address));
      assert.equal(0, Object.keys(model.contact.address).length);
      assert.equal(false, wasCalled);
    });
    it('can prefer null to an empty object', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'address');
      field.fields = [];
      field.preferNull = true;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, null === model.contact.address);
      assert.equal(false, wasCalled);
    });
    it('can work with FormArrays', function() {
      ReactDOMServer.renderToString(React.createElement(UserContactsFormEdit));
      var model = testForm.formState.createUnitOfWork().createModel();
      assert.equal('object', typeof(model));
      assert.equal('Henry', model.name);
      assert.equal('henry@ka.com', model.contacts[0].email);
      assert.equal('123 pinecrest rd', model.contacts[0].address.line1);
    });
    it('normally produces empty FormArray values', function() {
      ReactDOMServer.renderToString(React.createElement(UserContactsFormEdit));
      var field = testForm.formState.fields.find(x => x.name === 'contacts');
      field.array = [];
      var model = testForm.formState.createUnitOfWork().createModel();
      assert.equal(true, Array.isArray(model.contacts));
      assert.equal(0, model.contacts.length);
    });
    it('can produce null FormArray values', function() {
      ReactDOMServer.renderToString(React.createElement(UserContactsFormEdit));
      var field = testForm.formState.fields.find(x => x.name === 'contacts');
      field.array = [];
      field.preferNull = true;
      var model = testForm.formState.createUnitOfWork().createModel();
      assert.equal(true, null === model.contacts);
    });
    it('doesnt output gaps in arrays if deleted formstate', function() {
      ReactDOMServer.renderToString(React.createElement(UserContactsFormEdit));
      var context = testForm.formState.createUnitOfWork();
      context.add('contacts.1', {email:'email1',address:{line1:'line1'}});
      context.remove('contacts.1');
      context.add('contacts.2', {email:'email2',address:{line1:'line2'}});
      testForm.setState = function(x) {
        Object.assign(this.state, x);
      };
      context.updateFormState();
      var field = testForm.formState.fields.find(x => x.name === 'contacts');
      field.array.push({name:'2',key:'contacts.2',fields:[{name:'email',key:'contacts.2.email'},{name:'address',key:'contacts.2.address',fields:[{name:'line1',key:'contacts.2.address.line1'}]}]});
      var model = testForm.formState.createUnitOfWork().createModel();
      assert.equal(true, Array.isArray(model.contacts));
      assert.equal(2, model.contacts.length);
      assert.equal('Henry', model.name);
      assert.equal('henry@ka.com', model.contacts[0].email);
      assert.equal('123 pinecrest rd', model.contacts[0].address.line1);
      assert.equal('email2', model.contacts[1].email);
      assert.equal('line2', model.contacts[1].address.line1);
    });
    it('a subsequent render with dynamic field removal - need a browser?');
  });
});
describe('FieldState', function() {
  describe('#constructor', function() {
    it('sets props appropriately', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal('henry@ka.com', fieldState.fieldState.value);
      assert.equal('contact.email', fieldState.key);
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      assert.equal(field, fieldState.field);
      assert.equal(false, fieldState.isModified);
      assert.equal(context, fieldState.stateContext);
    });
  });
  describe('#assertCanUpdate', function() {
    it('throws error if read-only', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var fieldState = testForm.formState.getFieldState('contact.email');
      var f = function() { fieldState.setValue(''); };
      assert.throws(f, /read-only/);
    });
    it('throws error if deleted', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      fieldState.fieldState.isDeleted = true;
      var f = function() { fieldState.setValue(''); };
      assert.throws(f, /deleted/);
    });
    it('is called by all the setter methods', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var fieldState = testForm.formState.getFieldState('contact.email');
      var f = function() { fieldState.setValue(''); };
      assert.throws(f, /read-only/);
      f = function() { fieldState.validate(); };
      assert.throws(f, /read-only/);
      f = function() { fieldState.setValid(); };
      assert.throws(f, /read-only/);
      f = function() { fieldState.setInvalid(); };
      assert.throws(f, /read-only/);
      f = function() { fieldState.setValidating(); };
      assert.throws(f, /read-only/);
      fieldState.fieldState.message = 'a message';
      f = function() { fieldState.showMessage(); };
      assert.throws(f, /read-only/);
    });
  });
  describe('#setProps', function() {
    it('updates isModified', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      var _fieldState = fieldState.fieldState;
      assert.equal(false, fieldState.isModified);
      fieldState.setValue('');
      assert.equal(true, fieldState.isModified);
      var _modified = fieldState.fieldState;
      assert.notEqual(_fieldState, _modified);
      fieldState.setValid();
      assert.equal(true, fieldState.isModified);
      assert.equal(fieldState.fieldState, _modified);
      // and so on...
    });
    it('updates isCoerced', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal(false, Boolean(fieldState.fieldState.isCoerced));
      fieldState.setValue('');
      assert.equal(true, fieldState.fieldState.isCoerced);
    });
    it('adds to state updates', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal(0, Object.keys(context.stateUpdates).length);
      fieldState.setValue('');
      assert.equal(1, Object.keys(context.stateUpdates).length);
      assert.equal(fieldState.fieldState, context.stateUpdates['formState.contact.email']);
    });
  });
  describe('#callValidationFunction', function() {
    it('throws an error if not a function', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      fieldState.field.validate = 1;
      var f = function() { fieldState.validate(); };
      assert.throws(f, /not a function/);
    });
  });
  describe('#equals', function() {
    it('returns false if messages are different', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fs1 = context.getFieldState('contact.email');
      var fs2 = context.getFieldState('contact.email');
      assert.notEqual(fs1, fs2);
      assert.equal(true, fs1.equals(fs2));
      fs1.fieldState.message = undefined;
      fs2.fieldState.message = 'a message';
      assert.equal(false, fs1.equals(fs2));
    });
    it('returns false if message visibility is different', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fs1 = context.getFieldState('contact.email');
      var fs2 = context.getFieldState('contact.email');
      assert.notEqual(fs1, fs2);
      assert.equal(true, fs1.equals(fs2));
      fs1.fieldState.message = 'a message';
      fs2.fieldState.message = 'a message';
      assert.equal(true, fs1.equals(fs2));
      fs1.fieldState.isMessageVisible = undefined;
      fs2.fieldState.isMessageVisible = true;
      assert.equal(false, fs1.equals(fs2));
    });
    it('returns false if non-array value is different', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fs1 = context.getFieldState('contact.email');
      var fs2 = context.getFieldState('contact.email');
      assert.notEqual(fs1, fs2);
      assert.equal(true, fs1.equals(fs2));
      fs1.fieldState.value = '1';
      fs2.fieldState.value = '2';
      assert.equal(false, fs1.equals(fs2));
    });
    it('returns true if array value is same', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fs1 = context.getFieldState('contact.email');
      var fs2 = context.getFieldState('contact.email');
      assert.notEqual(fs1, fs2);
      assert.equal(true, fs1.equals(fs2));
      fs1.fieldState.value = ['1',1,null,''];
      fs2.fieldState.value = ['1',1,null,''];
      assert.equal(true, fs1.equals(fs2));
    });
    it('returns false if array value has different values', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fs1 = context.getFieldState('contact.email');
      var fs2 = context.getFieldState('contact.email');
      assert.notEqual(fs1, fs2);
      assert.equal(true, fs1.equals(fs2));
      fs1.fieldState.value = ['1',1,'',null];
      fs2.fieldState.value = ['1',1,null,''];
      assert.equal(false, fs1.equals(fs2));
    });
    it('returns false if array value has different length', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fs1 = context.getFieldState('contact.email');
      var fs2 = context.getFieldState('contact.email');
      assert.notEqual(fs1, fs2);
      assert.equal(true, fs1.equals(fs2));
      fs1.fieldState.value = ['1',1,null];
      fs2.fieldState.value = ['1',1,null,''];
      assert.equal(false, fs1.equals(fs2));
    });
  });
  describe('#getKey', function() {
    it('returns the key', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal('contact.email', fieldState.getKey());
    });
  });
  describe('#getValue', function() {
    it('returns the value', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal('henry@ka.com', fieldState.getValue());
    });
  });
  describe('#getMessage', function() {
    it('returns the message', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal(undefined, fieldState.getMessage());
      fieldState.fieldState.message = 'a message';
      assert.equal('a message', fieldState.getMessage());
    });
  });
  describe('#isValidated', function() {
    it('returns whether field state is validated', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal(false, fieldState.isValidated());
      fieldState.fieldState.validity = 1;
      assert.equal(true, fieldState.isValidated());
    });
  });
  describe('#isValid', function() {
    it('returns whether field state is valid', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal(false, fieldState.isValid());
      fieldState.fieldState.validity = 1;
      assert.equal(true, fieldState.isValid());
    });
  });
  describe('#isInvalid', function() {
    it('returns whether field state is invalid', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal(false, fieldState.isInvalid());
      fieldState.fieldState.validity = 2;
      assert.equal(true, fieldState.isInvalid());
    });
  });
  describe('#isValidating', function() {
    it('returns whether field state is validating', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal(false, fieldState.isValidating());
      fieldState.fieldState.validity = 3;
      assert.equal(true, fieldState.isValidating());
    });
  });
  describe('#isDeleted', function() {
    it('returns whether field state is deleted', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal(false, fieldState.isDeleted());
      fieldState.fieldState.isDeleted = true;
      assert.equal(true, fieldState.isDeleted());
    });
  });
  describe('#isMessageVisible', function() {
    it('returns whether field state is showing a message', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal(false, fieldState.isMessageVisible());
      fieldState.fieldState.isMessageVisible = true;
      assert.equal(true, fieldState.isMessageVisible());
    });
  });
  describe('#getField', function() {
    it('gets the associated field', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      assert.equal('line1', fieldState.getField().name);
      assert.equal('contact.address.line1', fieldState.getField().key);
      assert.equal(true, fieldState.getField().required);
      assert.equal('minLength', fieldState.getField().validate[0][0]);
    });
  });
  describe('#setValue', function() {
    it('throws an error if field state is modified', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      fieldState.isModified = true;
      var f = function() { fieldState.setValue(''); };
      assert.throws(f, /modified/);
    });
    it('sets a value and clears the other props', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      fieldState.fieldState.value = 'old';
      fieldState.fieldState.validity = 2;
      fieldState.fieldState.message = 'old';
      fieldState.fieldState.asyncToken = 'old';
      fieldState.fieldState.isMessageVisible = true;
      fieldState.setValue('');
      assert.equal('', fieldState.fieldState.value);
      assert.equal(undefined, fieldState.fieldState.validity);
      assert.equal(undefined, fieldState.fieldState.message);
      assert.equal(undefined, fieldState.fieldState.asyncToken);
      assert.equal(undefined, fieldState.fieldState.isMessageVisible);
    });
    it('returns a field state', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      var newFieldState = fieldState.setValue('new');
      assert.equal('FieldState',  newFieldState.constructor.name);
      assert.equal('new', newFieldState.getValue());
      assert.equal(undefined, newFieldState.getValidity());
      assert.equal(undefined, newFieldState.getMessage());
      assert.equal(false, newFieldState.isMessageVisible());
    });
  });
  describe('#validate', function() {
    it('sets to valid if no validation specified', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      fieldState.setValue('').validate();
      assert.equal(true, fieldState.isValid());
      assert.equal(undefined, fieldState.getMessage());
    });
    it('returns a field state if set to valid', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var newFieldState = fieldState.setValue('').validate();
      assert.equal(true, fieldState.isValid());
      assert.equal('FieldState', newFieldState.constructor.name);
      assert.equal(fieldState, newFieldState);
    });
    it('calls required validation if specified', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.required = true;
      fieldState.setValue('').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('Name is required', fieldState.getMessage());
    });
    it('returns a field state if set to invalid', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.required = true;
      var newFieldState = fieldState.setValue('').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('FieldState', newFieldState.constructor.name);
      assert.equal(fieldState, newFieldState);
    });
    it('calls registered validation if validate is a string', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.validate = 'noSpaces';
      fieldState.setValue('a space').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('no spaces', fieldState.getMessage());
    });
    it('throws an error if validate is a string and no registered validation', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.validate = 'notRegistered';
      var f = function() { fieldState.setValue('a space').validate(); };
      assert.throws(f, /no validation/);
    });
    it('throws an error if validate is an array and no registered validation', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.validate = [['notRegistered']];
      var f = function() { fieldState.setValue('a space').validate(); };
      assert.throws(f, /no validation/);
    });
    it('does not validate further if required fails and validate is a string', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.required = true;
      field.validate = 'noSpaces';
      fieldState.setValue('  ').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('Name is required', fieldState.getMessage());
    });
    it('does not validate further if required fails and validate is an array', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.required = true;
      field.validate = ['noSpaces'];
      fieldState.setValue('  ').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('Name is required', fieldState.getMessage());
    });
    it('calls multiple registered validations', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.required = false;
      field.validate = ['noSpaces',['minLength',4]];
      fieldState.setValue('123').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('Name must be at least 4 characters', fieldState.getMessage());
    });
    it('does not validate further if first validation fails', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.required = false;
      field.validate = ['noSpaces',['minLength',4]];
      fieldState.setValue('  ').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('no spaces', fieldState.getMessage());
    });
    it('can pass multiple params', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.required = false;
      field.validate = ['noSpaces',['lengthBetween',4,6]];
      fieldState.setValue('1234567').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('Name must be at most 6 characters', fieldState.getMessage());
    });
    it('calls a function', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.required = false;
      field.validate = function(value) {
        if (value.trim() === '') { return 'this was called'; }
      };
      fieldState.setValue('  ').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('this was called', fieldState.getMessage());
    });
    it('calls an autowired function', function() {
      ReactDOMServer.renderToString(React.createElement(UserContactsFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contacts.0.address.line1');
      fieldState.setValue('autowired').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('it worked!', fieldState.getMessage());
    });
  });
  describe('#setValid', function() {
    it('sets message and validity, keeps value, and clears the other props', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      fieldState.fieldState.value = 'old';
      fieldState.fieldState.validity = 2;
      fieldState.fieldState.message = 'old';
      fieldState.fieldState.asyncToken = 'old';
      fieldState.fieldState.isMessageVisible = true;
      fieldState.setValid('new');
      assert.equal('old', fieldState.fieldState.value);
      assert.equal(1, fieldState.fieldState.validity);
      assert.equal('new', fieldState.fieldState.message);
      assert.equal(undefined, fieldState.fieldState.asyncToken);
      assert.equal(undefined, fieldState.fieldState.isMessageVisible);
    });
    it('returns a field state', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      var newFieldState = fieldState.setValid('new');
      assert.equal('FieldState',  newFieldState.constructor.name);
      assert.equal('123 pinecrest rd', newFieldState.getValue());
      assert.equal(1, newFieldState.getValidity());
      assert.equal('new', newFieldState.getMessage());
      assert.equal(false, newFieldState.isMessageVisible());
    });
  });
  describe('#setInvalid', function() {
    it('sets message and validity, keeps value, and clears the other props', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      fieldState.fieldState.value = 'old';
      fieldState.fieldState.validity = 3;
      fieldState.fieldState.message = 'old';
      fieldState.fieldState.asyncToken = 'old';
      fieldState.fieldState.isMessageVisible = true;
      fieldState.setInvalid('new');
      assert.equal('old', fieldState.fieldState.value);
      assert.equal(2, fieldState.fieldState.validity);
      assert.equal('new', fieldState.fieldState.message);
      assert.equal(undefined, fieldState.fieldState.asyncToken);
      assert.equal(undefined, fieldState.fieldState.isMessageVisible);
    });
    it('returns a field state', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      var newFieldState = fieldState.setInvalid('new');
      assert.equal('FieldState',  newFieldState.constructor.name);
      assert.equal('123 pinecrest rd', newFieldState.getValue());
      assert.equal(2, newFieldState.getValidity());
      assert.equal('new', newFieldState.getMessage());
      assert.equal(false, newFieldState.isMessageVisible());
    });
  });
  describe('#setValidating', function() {
    it('sets all the props except value and returns an asyncToken', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      fieldState.fieldState.value = 'old';
      fieldState.fieldState.validity = 2;
      fieldState.fieldState.message = 'old';
      fieldState.fieldState.asyncToken = 'old';
      fieldState.fieldState.isMessageVisible = false;
      var asyncToken = fieldState.setValidating('new');
      assert.equal('string', typeof(asyncToken));
      assert.equal('old', fieldState.fieldState.value);
      assert.equal(3, fieldState.fieldState.validity);
      assert.equal('new', fieldState.fieldState.message);
      assert.notEqual('old, asyncToken');
      assert.equal(asyncToken, fieldState.fieldState.asyncToken);
      assert.equal(true, fieldState.fieldState.isMessageVisible);
    });
  });
  describe('#showMessage', function() {
    it('shows the message and copies all the other props', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      fieldState.fieldState.value = 'old';
      fieldState.fieldState.validity = 2;
      fieldState.fieldState.message = 'old';
      fieldState.fieldState.asyncToken = 'old';
      fieldState.fieldState.isMessageVisible = false;
      var _fieldState = fieldState.fieldState;
      fieldState.showMessage();
      assert.notEqual(_fieldState, fieldState.fieldState);
      assert.equal(true, fieldState.isModified);
      assert.equal('old', fieldState.fieldState.value);
      assert.equal(2, fieldState.fieldState.validity);
      assert.equal('old', fieldState.fieldState.message);
      assert.equal('old', fieldState.fieldState.asyncToken);
      assert.equal(true, fieldState.fieldState.isMessageVisible);
    });
    it('returns nothing', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      assert.equal(undefined, fieldState.showMessage());
    });
    it('does nothing if no message to show', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      fieldState.fieldState.value = 'old';
      fieldState.fieldState.validity = 1;
      fieldState.fieldState.message = undefined;
      var _fieldState = fieldState.fieldState;
      fieldState.showMessage();
      assert.equal(_fieldState, fieldState.fieldState);
      assert.equal(false, fieldState.isModified);
      assert.equal(false, fieldState.isMessageVisible());
      fieldState.fieldState.message = null;
      _fieldState = fieldState.fieldState;
      fieldState.showMessage();
      assert.equal(_fieldState, fieldState.fieldState);
      assert.equal(false, fieldState.isModified);
      assert.equal(false, fieldState.isMessageVisible());
    });
    it('does nothing if message already visible', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      fieldState.fieldState.value = 'old';
      fieldState.fieldState.validity = 2;
      fieldState.fieldState.message = 'old';
      fieldState.fieldState.isMessageVisible = true;
      var _fieldState = fieldState.fieldState;
      fieldState.showMessage();
      assert.equal(_fieldState, fieldState.fieldState);
      assert.equal(false, fieldState.isModified);
      assert.equal('old', fieldState.getMessage());
      assert.equal(true, fieldState.isMessageVisible());
    });
  });
});
describe('Field', function() {
  describe('#defaultValue', function() {
    it('picks up a defaultValue configuration', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var fieldState = testForm.formState.getFieldState('name');
      assert.equal('hpt', fieldState.getValue());
    });
  });
});
describe('FormObject', function() {
  describe('#blurHandler', function() {
    it('shows message and updates form state', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var _fieldState = testForm.state['formState.name'];
      _fieldState.value = 'a value';
      _fieldState.message = 'a message';
      _fieldState.validity = 2;
      _fieldState.isMessageVisible = false;
      _fieldState.isCoerced = true;
      var wasCalled = false;
      testForm.setState = function(x) {
        wasCalled = true;
        Object.assign(this.state, x);
      };
      nameInput.props.showValidationMessage();
      var fieldState = testForm.formState.getFieldState('name');
      assert.equal('a value', fieldState.getValue());
      assert.equal('a message', fieldState.getMessage());
      assert.equal(true, fieldState.isInvalid());
      assert.equal(true, fieldState.isMessageVisible());
      assert.equal(true, wasCalled);
    });
  });
  describe('#changeHandler', function() {
    it('sets value, validates, and calls updateFormState', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var wasCalled = false;
      testForm.setState = function(updates) {
        wasCalled = true;
        Object.assign(this.state, updates);
      };
      var fieldState = testForm.formState.getFieldState('contact.email');
      assert.equal('', fieldState.getValue());
      assert.equal(false, fieldState.isValidated());
      contactEmailInput.props.updateFormState({ target: { value: 'a' }});
      assert.equal(true, wasCalled);
      fieldState = testForm.formState.getFieldState('contact.email');
      assert.equal('a', fieldState.getValue());
      assert.equal(true, fieldState.isValidated());
    });
    it('does not call updateFormState if update callback defined', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var wasCalled = false;
      testForm.setState = function(updates) {
        wasCalled = true;
        Object.assign(this.state, updates);
      };
      var onUpdateWasCalled = false;
      testForm.formState.onUpdate(function() {
        onUpdateWasCalled = true;
      });
      contactEmailInput.props.updateFormState({ target: { value: 'a' }});
      assert.equal(false, wasCalled);
      assert.equal(true, onUpdateWasCalled);
    });
    // onUpdate callback already tested...
    it('throws an error for a select-multiple without an array defaultValue', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      testForm.setState = function(updates) {
        Object.assign(this.state, updates);
      };
      var f = function() {
        contactEmailInput.props.updateFormState({ target: { value: 'a', type: 'select-multiple' }});
      };
      assert.throws(f, /defaultValue/);
    });
    it('supports checkbox inputs', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      testForm.setState = function(updates) {
        Object.assign(this.state, updates);
      };
      var fieldState = testForm.formState.getFieldState('contact.email');
      assert.equal('', fieldState.getValue());
      contactEmailInput.props.updateFormState({ target: { checked: true, type: 'checkbox' }});
      fieldState = testForm.formState.getFieldState('contact.email');
      assert.equal(true, fieldState.getValue());
    });
    it('throws an error for array values with type not equal to checkbox or select-multiple', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      testForm.setState = function(updates) {
        Object.assign(this.state, updates);
      };
      testForm.state['formState.contact.email'] = { value: [], isCoerced: true };
      var f = function() {
        contactEmailInput.props.updateFormState({ target: { value: '?' }});
      }
      assert.throws(f, /only select-multiple and checkbox group/);
    });
    it('supports select-multiple inputs', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      testForm.setState = function(updates) {
        Object.assign(this.state, updates);
      };
      testForm.state['formState.contact.email'] = { value: [], isCoerced: true };
      var e = {
        target: {
          type: 'select-multiple',
          options: [
            { value: '1', selected: true },
            { value: '2', selected: false },
            { value: '3', selected: true },
            { value: '4', selected: false }
          ]
        }
      };
      contactEmailInput.props.updateFormState(e);
      var v = testForm.formState.getFieldState('contact.email').getValue();
      assert.equal(true, Array.isArray(v));
      assert.equal(2, v.length);
      assert.equal('1', v[0]);
      assert.equal('3', v[1]);
    });
    it('supports checkbox group inputs', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      testForm.setState = function(updates) {
        Object.assign(this.state, updates);
      };
      testForm.state['formState.contact.email'] = { value: [], isCoerced: true };
      // removing something not in the array
      var e = { target: { type: 'checkbox', value: '3', checked: false } };
      contactEmailInput.props.updateFormState(e);
      var v = testForm.formState.getFieldState('contact.email').getValue();
      assert.equal(true, Array.isArray(v));
      assert.equal(0, v.length);
      // adding something to the array
      e = { target: { type: 'checkbox', value: '3', checked: true } };
      contactEmailInput.props.updateFormState(e);
      v = testForm.formState.getFieldState('contact.email').getValue();
      assert.equal(true, Array.isArray(v));
      assert.equal(1, v.length);
      assert.equal('3', v[0]);
      // adding something to the array and sorting
      e = { target: { type: 'checkbox', value: '1', checked: true } };
      contactEmailInput.props.updateFormState(e);
      v = testForm.formState.getFieldState('contact.email').getValue();
      assert.equal(true, Array.isArray(v));
      assert.equal(2, v.length);
      assert.equal('1', v[0]);
      assert.equal('3', v[1]);
      // removing something from the array
      e = { target: { type: 'checkbox', value: '1', checked: false } };
      contactEmailInput.props.updateFormState(e);
      v = testForm.formState.getFieldState('contact.email').getValue();
      assert.equal(true, Array.isArray(v));
      assert.equal(1, v.length);
      assert.equal('3', v[0]);
    });
  });
  describe('#addProps', function() {
    it('throws assertion for nested FormObject unless name specified', function() {
      var f = function() {
        ReactDOMServer.renderToString(React.createElement(UserFormThrow));
      };
      assert.throws(f, /should have a/)
    });
    it('can handle contacts.0.address before contacts.0', function() {
      ReactDOMServer.renderToString(React.createElement(UserContactsFormBackwards));
      var fields = testForm.formState.fields;
      assert.equal('name', fields[0].name);
      assert.equal('name', fields[0].key);
      assert.equal('contacts', fields[1].name);
      assert.equal('contacts', fields[1].key);
      fields = fields[1].array;
      assert.equal('0', fields[0].name);
      assert.equal('contacts.0', fields[0].key);
      fields = fields[0].fields;
      assert.equal('address', fields[0].name);
      assert.equal('contacts.0.address', fields[0].key);
      assert.equal('email', fields[1].name);
      assert.equal('contacts.0.email', fields[1].key);
      fields = fields[0].fields;
      assert.equal('line1', fields[0].name);
      assert.equal('contacts.0.address.line1', fields[0].key);
    });
    it('optionally prefixes labels', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      assert.equal('Name', nameInput.props.label);
      assert.equal('Work Email', contactEmailInput.props.label);
      assert.equal('Work Address Line 1', contactAddressLine1Input.props.label);
    });
    it('optionally prefixes labels across a formObject attribute', function() {
      ReactDOMServer.renderToString(React.createElement(UserContactsFormEdit));
      assert.equal('Name', nameInput.props.label);
      assert.equal('Work Email', contactEmailInput.props.label);
      assert.equal('Work Address Line 1', contactAddressLine1Input.props.label);
    });
    it('paths nested form states', function() {
      ReactDOMServer.renderToString(React.createElement(UserContactsFormEdit));
      assert.equal('contacts.0', contactForm.props.formState.path);
      assert.equal('contacts.0.address', addressForm.props.formState.path);
    })
    it('provides the right field state props', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      assert.equal('name', nameInput.props.fieldState.getKey());
      assert.equal('contact.email', contactEmailInput.props.fieldState.getKey());
      assert.equal('contact.address.line1', contactAddressLine1Input.props.fieldState.getKey());
    });
    it('provides the right field state props across a formObject attribute', function() {
      ReactDOMServer.renderToString(React.createElement(UserContactsFormEdit));
      assert.equal('name', nameInput.props.fieldState.getKey());
      assert.equal('contacts.0.email', contactEmailInput.props.fieldState.getKey());
      assert.equal('contacts.0.address.line1', contactAddressLine1Input.props.fieldState.getKey());
    });
  });
});
