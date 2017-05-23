'use strict';

var assert = require('assert');

var React = require('react');
var ReactDOMServer = require('react-dom/server');

var rf = require('../react-formstate.js');
var Form = rf.Form;
var FormState = rf.FormState;
var FormObject = rf.FormObject;
var FormArray = rf.FormArray;
var FormExtension = rf.FormExtension;

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


function createTestModel() {
  return {
    name: 'Henry',
    contact: {
     email: 'henry@ka.com',
     address: {
       line1: '123 pinecrest rd'
     }
    }
  };
}


var createUserFormFixture = function(inject, doThrow) {
  return React.createClass({
    getInitialState: function() {
      testForm = this;
      this.formState = new FormState(this);

      if (inject) {
        return this.formState.createUnitOfWork().injectModel(createTestModel());
      } else {
        return {};
      }
    },
    render: function() {
      return React.createElement('form', null,
        React.createElement(FormObject, { formState: this.formState, model: this.props.model },
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
    return React.createElement(FormExtension, { nestedForm: this },
      React.createElement(ContactAddressLine1Input, { formField: 'line1', label: 'Line 1' })
    )
  }
});



function createTestContactsModel() {
  return {
    name: 'Henry',
    contacts: [
      {
        email: 'henry@ka.com',
        address: {
          line1: '123 pinecrest rd'
        }
      }
    ]
  };
}



var createUserContactsFormFixture = function(inject, backwards) {
  return React.createClass({
    getInitialState: function() {
      testForm = this;
      this.formState = new FormState(this);
      if (inject) {
        var state = this.formState.createUnitOfWork().injectModel(createTestContactsModel());
        state.numContacts = 1;
        return state;
      } else if (this.props.model) {
        return { numContacts: this.props.model.contacts.length };
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

      return React.createElement(Form, { formState: this.formState, onSubmit: this.handleSubmit, id: 'testingAFormProp', model: this.props.model },
        React.createElement(NameInput, { formField: 'name', label: 'Name' }),
        React.createElement(FormArray, { name: 'contacts' }, contacts),
        React.createElement('input', { type: 'submit', value: 'Submit' }),
        React.createElement('span', null, this.formState.isInvalid() ? 'Please fix validation errors' : null)
      );
    }
  });
};

var UserContactsForm = createUserContactsFormFixture(false);
var UserContactsFormEdit = createUserContactsFormFixture(true);
var UserContactsFormBackwards = createUserContactsFormFixture(true, true);
var UserContactsFormBackwardsModelProp = createUserContactsFormFixture(false, true);


var createMessageOverrideForm = function() {
  return React.createClass({
    getInitialState: function() {
      testForm = this;
      this.formState = new FormState(this);
      return {};
    },
    validateCity: function() {},
    fsValidateZip: function() {},
    fsValidateAutowire: function() {},
    render: function() {
      return React.createElement('form', null,
        React.createElement(FormObject, { formState: this.formState },
          React.createElement(NameInput, { formField: 'name', label: 'Name', required: '-' }),
          React.createElement(NameInput, { formField: 'email', label: 'Email', required: 'Please provide an email', revalidateOnSubmit: true }),
          React.createElement(NameInput, { formField: 'phone', label: 'Phone', required: '' }),
          React.createElement(NameInput, { formField: 'line1', label: 'Line1', required: ['not a string'] }),
          React.createElement(NameInput, { formField: 'line2', label: 'Line2', validationMessages: ['a message'] }),
          React.createElement(NameInput, { formField: 'city', label: 'City', validate: 'noSpaces', msgs: 3 }),
          React.createElement(NameInput, { formField: 'state', label: 'State', validationMessages: ['a message'], msgs: 3 }),
          React.createElement(NameInput, { formField: 'zip', label: 'Zip', fsValidate: 'hello' }),
          React.createElement(NameInput, { formField: 'zip4', label: 'Zip4', fsv: 'world' }),
          React.createElement(NameInput, { formField: 'country', label: 'Country', fsValidate: 'hello', fsv: 'world' }),
          React.createElement(NameInput, { formField: 'autowire', label: 'Autowire' }),
          React.createElement(ContactEmailInput, { formField: 'noLabel' })
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

var MessageOverrideForm = createMessageOverrideForm();




var addressExtensionForm;

var AddressExtension = React.createClass({
  getInitialState: function() {
    addressExtensionForm = this;
    return null;
  },
  validateLine1: function(value) {
    if (value === 'autowired') { return 'it worked!'; }
  },
  render: function() {
    return React.createElement(FormExtension, { nestedForm: this },
      React.createElement(ContactAddressLine1Input, { formField: 'line1', label: 'Line 1' })
    )
  }
});

var ShouldNotManageState = React.createClass({
  getInitialState: function() {
    return {};
  },
  render: function() {
    return React.createElement(FormExtension, { nestedForm: this },
      React.createElement(ContactAddressLine1Input, { formField: 'line1', label: 'Line 1' })
    )
  }
});


var createExtendedUserFormFixture = function(throwFormExtensionError, stateWarning) {
  return React.createClass({
    getInitialState: function() {
      testForm = this;
      this.formState = new FormState(this);
      return {};
    },
    render: function() {
      var children = [
        React.createElement(NameInput, { key: 4, formField: 'name', label: 'Name' }),
        React.createElement(AddressExtension, { key: 5, formExtension: true, labelPrefix: 'Why ' }),
        React.createElement('input', { key: 6, type: 'submit', value: 'Submit' }),
        React.createElement('span', { key: 7 }, this.formState.isInvalid() ? 'Please fix validation errors' : null)
      ];

      if (throwFormExtensionError) {
        children.push(
          React.createElement(FormExtension, { key: 8, name: 'crash' })
        );
      }

      if (stateWarning) {
        children.push(
          React.createElement(ShouldNotManageState, { key: 8, formExtension: true })
        );
      }

      return React.createElement(Form, { formState: this.formState, onSubmit: this.handleSubmit, id: 'testingAFormProp', model: this.props.model },
        children
      );
    }
  });
};

var ExtendedUserForm = createExtendedUserFormFixture();





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
    it('will warn for all non-string values', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var _fieldState = { value: [1,2,3] };
      testForm.state['formState.name'] = _fieldState;
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.required = true;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, model === null);
      assert.equal(2, context.stateUpdates['formState.name'].validity);
      assert.equal('Required field', context.stateUpdates['formState.name'].message);
      assert.equal(true, wasCalled);
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
      contactAddressLine1Input.props.handleValueChange('123 pinecrest rd.');
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
      assert.equal('function', typeof(FormState.createValidator('value', 'label').minLength));
      FormState.unregisterValidation('minLength');
      assert.equal(undefined, FormState.validators['minLength']);
      assert.equal('undefined', typeof(FormState.createValidator('value', 'label').minLength));
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
    it('adds a validation function', function() {
      assert.equal('undefined', typeof(FormState.validators['minLength']));
      var fsvMinLength = FormState.createValidator('value', 'label').constructor.prototype.minLength;
      assert.equal(undefined, fsvMinLength);
      FormState.registerValidation('minLength', minLength);
      assert.equal(minLength, FormState.validators['minLength']);
      fsvMinLength = FormState.createValidator('value', 'label').constructor.prototype.minLength;
      assert.equal('function', typeof(fsvMinLength));
    });
    it('is passed value and label and user-provided parameters', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var wasCalled = false, isFsv = false;
      FormState.registerValidation('minLength', function(value, label, minLength) {
        wasCalled = true;
        if (isFsv) {
          assert.equal('testing fsv', value);
          assert.equal('Work Email', label);
          assert.equal(5, minLength);
        } else {
          assert.equal('123 pinecrest rd.', value);
          assert.equal('Work Address Line 1', label);
          assert.equal(3, minLength);
        }
      });
      testForm.setState = function() {};
      contactAddressLine1Input.props.handleValueChange('123 pinecrest rd.');
      assert.equal(true, wasCalled);
      wasCalled = false;
      isFsv = true;
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      assert.equal(undefined, field.validate);
      assert.equal(undefined, field.fsValidate);
      field.fsValidate = (fsv) => fsv.minLength(5);
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      fieldState.setValue('testing fsv').validate();
      assert.equal(true, wasCalled);
    });
    it('upserts an existing validation function', function() {
      assert.equal('function', typeof(FormState.validators['minLength']));
      assert.notEqual(minLength, FormState.validators['minLength']);
      var fsvMinLength = FormState.createValidator('value', 'label').constructor.prototype.minLength;
      assert.equal('function', typeof(fsvMinLength));
      FormState.registerValidation('minLength', minLength);
      assert.equal(minLength, FormState.validators['minLength']);
      assert.notEqual(fsvMinLength, FormState.createValidator('value', 'label').constructor.prototype.minLength);
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
        'formState.phone': { validity: 2 },
        'formState.document': { validity: 4 }
      };
      var fs = new FormState({ state: state });
      assert.equal(false, fs.isValidating());
      state['formState.address.line1'] = { validity: 3 };
      assert.equal(true, fs.isValidating());
    });
  });
  describe('#isUploading', function() {
    it('returns false unless an uploading field state exists', function() {
      var state = {
        'formState.name': {},
        'formState.email': { validity: 1 },
        'formState.phone': { validity: 2 },
        'formState.username': { validity: 3 }
      };
      var fs = new FormState({ state: state });
      assert.equal(false, fs.isUploading());
      state['formState.address.document'] = { validity: 4 };
      assert.equal(true, fs.isUploading());
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
  describe('#injectModelProp', function() {
    it('does not crash on a null model prop', function() {
      var fs = new FormState({ state: {} });
      fs.injectModelProp(null);
      var fieldState = fs.getFieldState('name');
      assert.equal('', fieldState.getValue());
    });
    it('does not crash on an undefined model prop', function() {
      var fs = new FormState({ state: {} });
      fs.injectModelProp(undefined);
      var fieldState = fs.getFieldState('name');
      assert.equal('', fieldState.getValue());
    });
    it('does not crash on a non-object type model prop', function() {
      var fs = new FormState({ state: {} });
      fs.injectModelProp(1);
      var fieldState = fs.getFieldState('name');
      assert.equal('', fieldState.getValue());
    });
  });
  describe('#get', function() {
    it('coerces', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state });
      assert.equal(true, fs.get('name') === '3');
    });
    it('does not coerce touched values', function() {
      var state = { 'formState.name': { value: 3, isCoerced: true } },
        fs = new FormState({ state: state });
      assert.equal(true, fs.get('name') === 3);
    });
    it('returns empty string if no match', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state });
      assert.equal(true, fs.get('noMatch') === '');
    });
  });
  describe('#getu', function() {
    it('does not coerce', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state });
      assert.equal(true, fs.getu('name') === 3);
    });
    it('returns null if no match', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state });
      assert.equal(true, fs.getu('noMatch') === null);
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
    it('looks up a model prop field by name', function() {
      var fs = new FormState({ state: {} });
      fs.injectModelProp(createTestModel());
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
    it('returns a field state with value set to null if none exists', function() {
      var fs = new FormState({ state: {} });
      var fieldState = fs.getFieldState('name');
      assert.equal(true, fieldState.fieldState.value === null);
    });
    it('returns a field state with value set to null if model prop field does not exist', function() {
      var fs = new FormState({ state: {} });
      fs.injectModelProp({});
      var fieldState = fs.getFieldState('name');
      assert.equal(true, fieldState.fieldState.value === null);
    });
    it('returns a field state with value set to null if deleted', function() {
      var state = {
        'formState.name': { value: 'Henry', isDeleted: true }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('name');
      assert.equal(true, fieldState.fieldState.value === null);
    });
    it('returns a field state with value set to null if deleted, ignoring model prop', function() {
      var state = {
        'formState.name': { value: 'Henry', isDeleted: true }
      };
      var fs = new FormState({ state: state });
      fs.injectModelProp(createTestModel());
      var fieldState = fs.getFieldState('name');
      assert.equal(true, fieldState.fieldState.value === null);
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
    it('uses a name relative to form state path for model prop', function() {
      var fs = new FormState({ state: {} });
      fs.injectModelProp(createTestModel());
      var nfs = fs.createFormState('contact');
      nfs = nfs.createFormState('address');
      var fieldState = nfs.getFieldState('line1');
      assert.equal('123 pinecrest rd', fieldState.getValue());
    });
    it('uses a subkey relative to form state path for model prop', function() {
      var fs = new FormState({ state: {} });
      fs.injectModelProp(createTestModel());
      var nfs = fs.createFormState('contact.address');
      var fieldState = nfs.getFieldState('line1');
      assert.equal('123 pinecrest rd', fieldState.getValue());
    });
    it('can find a nested field state by key', function() {
      var state = {
        'formState.contact.address.line1': { value: '123 elm st' }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('contact.address.line1');
      assert.equal('123 elm st', fieldState.getValue());
    });
    it('can find injected field state by field', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'address');
      field = field.fields.find(x => x.name === 'line1');
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal('123 pinecrest rd', fieldState.getValue());
      assert.equal(field, fieldState.getField());
    });
    it('can find model prop field by field', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm, { model: createTestModel() }));
      var field = testForm.formState.fields.find(x => x.name === 'name');
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal('Henry', fieldState.getValue());
      assert.equal(field, fieldState.getField());
    });
    it('can find nested model prop field by field', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm, { model: createTestModel() }));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'address');
      field = field.fields.find(x => x.name === 'line1');
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal('123 pinecrest rd', fieldState.getValue());
      assert.equal(field, fieldState.getField());
    });
    it('sets to default value if nothing injected', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.defaultValue = 'default';
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal('default', fieldState.getValue());
    });
    it('sets to default value if no model prop field', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm, { model: {} }));
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.defaultValue = 'default';
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal('default', fieldState.getValue());
    });
    it('model prop field takes precedence over default value', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm, { model: {name: 'precedence'} }));
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.defaultValue = 'default';
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal('precedence', fieldState.getValue());
    });
    it('empty model prop field takes precedence over default value', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm, { model: {name: undefined} }));
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.defaultValue = 'default';
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal('', fieldState.getValue());
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
    it('could return undefined value if no coercion', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.noCoercion = true;
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, null === fieldState.getValue());
      testForm.state = { 'formState.contact.email': { value: undefined } };
      fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, undefined === fieldState.getValue());
      testForm.state = {};
      field.defaultValue = undefined;
      fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, null === fieldState.getValue());
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
    it('does not mark fieldState coerced', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      var fieldState = testForm.formState.getFieldState(field, null, testForm.formState.createUnitOfWork());
      assert.equal(false, Boolean(fieldState.fieldState.isCoerced));
      assert.equal(true, fieldState.getValue() === '');
      assert.equal(false, Boolean(fieldState.fieldState.isCoerced));
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
    it('is called during a render', function(){
      // this appromixates testing dynamic regeneration of fields during a render
      // without a browser...
      var clearFields = FormState.prototype.clearFields;
      assert.equal('function', typeof(clearFields));
      var wasCalled = false;
      FormState.prototype.clearFields = function() {
        wasCalled = true;
        if (this === this.rootFormState) {
          this.fields.length = 0;
        }
      };
      ReactDOMServer.renderToString(React.createElement(UserForm));
      FormState.prototype.clearFields = clearFields;
      assert.equal(true, wasCalled);
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
      nameInput.props.handleValueChange('Henry!');
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
      contactAddressLine1Input.props.handleValueChange('123 pinecrest rd.');
      assert.equal(true, wasCalled);
    });
  });
  describe('#injectModel', function() {
    it('returns injected state', function() {
      var state = new FormState({}).injectModel({ x: 3 });
      assert.equal(state['formState.x'].value, 3);
    });
  });
  describe('#inject', function() {
    it('injects into provided state', function() {
      var state = { a: 1 };
      new FormState({}).inject(state, { x: 3 });
      assert.equal(state.a, 1);
      assert.equal(state['formState.x'].value, 3);
    });
  });
  describe('#add', function() {
    it('adds a formState value to provided state', function() {
      var fs = new FormState({});
      var state = fs.injectModel({ x: 3 });
      fs.add(state, 'y', 4);
      assert.equal(state['formState.x'].value, 3);
      assert.equal(state['formState.y'].value, 4);
    });
  });
  describe('#remove', function() {
    it('tags a formState value as deleted within provided state', function() {
      var form = {};
      var fs = new FormState(form);
      form.state = fs.injectModel({ x: 3 });
      assert.equal(form.state['formState.x'].value, 3);
      fs.remove(form.state, 'x');
      assert.equal(form.state['formState.x'].isDeleted, true);
    });
  });
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
  describe('#set', function() {
    it('sets a value', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork();
      context.set('name', '4');
      assert.equal(true, context.stateUpdates['formState.name'].value === '4');
    });
    it('does not set isCoerced to true', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork();
      context.set('name', 4);
      assert.equal(true, context.stateUpdates['formState.name'].value === 4);
      assert.equal(true, context.stateUpdates['formState.name'].isCoerced === false);
    });
    it('returns a fieldstate', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork(),
        result = context.set('name', 4);
      assert.equal(true, result.validate !== undefined);
    });
    it('creates a fieldstate', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork(),
        result = context.set('newField', '4');
      assert.equal(true, context.stateUpdates['formState.newField'].value === '4');
    });
  });
  describe('#setc', function() {
    it('sets a value', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork();
      context.setc('name', '4');
      assert.equal(true, context.stateUpdates['formState.name'].value === '4');
    });
    it('sets isCoerced to true', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork();
      context.setc('name', 4);
      assert.equal(true, context.stateUpdates['formState.name'].value === 4);
      assert.equal(true, context.stateUpdates['formState.name'].isCoerced === true);
    });
    it('returns a fieldstate', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork(),
        result = context.setc('name', 4);
      assert.equal(true, result.validate !== undefined);
    });
    it('creates a fieldstate', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork(),
        result = context.setc('newField', 4);
      assert.equal(true, context.stateUpdates['formState.newField'].value === 4);
    });
  });
  describe('#get', function() {
    it('coerces', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork();
      assert.equal(true, context.get('name') === '3');
    });
    it('pulls from context', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork();
      context.stateUpdates['formState.name'] = { value: '4', isCoerced: true };
      assert.equal(true, context.get('name') === '4');
    });
    it('does not coerce touched values', function() {
      var state = { 'formState.name': { value: 3, isCoerced: true } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork();
      assert.equal(true, context.get('name') === 3);
    });
    it('returns empty string if no match', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork();
      assert.equal(true, context.get('noMatch') === '');
    });
  });
  describe('#getu', function() {
    it('does not coerce', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork();
      assert.equal(true, context.getu('name') === 3);
    });
    it('pulls from context', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork();
      context.stateUpdates['formState.name'] = { value: 4, isCoerced: true };
      assert.equal(true, context.getu('name') === 4);
    });
    it('returns null if no match', function() {
      var state = { 'formState.name': { value: 3 } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork();
      assert.equal(true, context.getu('noMatch') === null);
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
      assert.equal(true, context.getFieldState('x').getValue() === '1');
      assert.equal(true, context.getFieldState('x').getUncoercedValue() === 1);
      assert.equal(true, context.stateUpdates['formState.y'].value === 2);
      assert.equal(true, context.getFieldState('y').getValue() === '2');
      assert.equal(true, context.getFieldState('y').getUncoercedValue() === 2);
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
      assert.equal(true, context.stateUpdates['formState.x'].isCoerced === undefined);
      assert.equal(true, context.getFieldState('x').getValue() === '1');
      assert.equal(true, context.getFieldState('x').getUncoercedValue() === 1);
      form.setState = function(x) {
        this.state = x;
      };
      context.updateFormState();
      assert.equal(true, '1' === fs.getFieldState('x').getValue());
      assert.equal(true, 1 === fs.getFieldState('x').getUncoercedValue());
    });
    it('adds a nested value relative to form state path', function() {
      var state = {}, form = { state: state }, fs = new FormState(form),
        nfs = fs.createFormState('nested'), context = nfs.createUnitOfWork();
      context.add('x', 1);
      assert.equal(true, context.getFieldState('x').getValue() === '1');
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
      assert.equal(true, context.getFieldState('nested.x').getValue() === '1');
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
      assert.equal('', context.getFieldState('name').getValue());
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
      assert.equal('', context.getFieldState('email').getValue());
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
      assert.equal('', context.getFieldState('contact.email').getValue());
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
    it('works with a valid model prop', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm, { model: createTestModel() }));
      var model = testForm.formState.createUnitOfWork().createModel();
      assert.equal('object', typeof(model));
      assert.equal('Henry', model.name);
      assert.equal('henry@ka.com', model.contact.email);
      assert.equal('123 pinecrest rd', model.contact.address.line1);
    });
    it('works with a valid model prop with FormArray', function() {
      ReactDOMServer.renderToString(React.createElement(UserContactsForm, { model: createTestContactsModel() }));
      var model = testForm.formState.createUnitOfWork().createModel();
      assert.equal('object', typeof(model));
      assert.equal('Henry', model.name);
      assert.equal('henry@ka.com', model.contacts[0].email);
      assert.equal('123 pinecrest rd', model.contacts[0].address.line1);
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
    it('works with an invalid model prop', function() {
      var model = createTestModel();
      model.name = '';
      ReactDOMServer.renderToString(React.createElement(UserForm, { model: model }));
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.required = true;
      field.defaultValue = undefined;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, model === null);
      var update = context.stateUpdates['formState.name'];
      assert.equal(false, update.isCoerced);
      assert.equal(2, update.validity);
      assert.equal('Name is required', update.message);
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
    it('doesnt revalidate validated fields by default', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var _fieldState = { isCoerced: true, value: '', validity: 1 }; // invalid value flagged as valid
      testForm.state['formState.contact.address.line1'] = _fieldState;
      var context = testForm.formState.createUnitOfWork();
      var wasCalled = false;
      context.updateFormState = function() {
        wasCalled = true;
      };
      var model = context.createModel();
      assert.equal(true, model !== null);
      assert.equal(false, wasCalled);
    });
    it('optionally revalidates validated fields upon submit', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'address');
      field = field.fields.find(x => x.name === 'line1');
      field.revalidateOnSubmit = true;
      var _fieldState = { isCoerced: true, value: '', validity: 1 }; // invalid value flagged as valid
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
  });
});
describe('FieldState', function() {
  describe('#getName', function() {
    it('returns the field name', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var fieldState = testForm.formState.getFieldState('contact.email');
      assert.equal('contact.email', fieldState.getKey());
      assert.equal('email', fieldState.getName());
    });
    it('does not crash if no field', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var fieldState = testForm.formState.getFieldState('contact.email');
      fieldState.field = null;
      assert.equal('contact.email', fieldState.getKey());
      assert.equal(true, fieldState.getName() === null);
    });
  });
  describe('#getValue', function() {
    it('returns the value', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal('henry@ka.com', fieldState.getValue());
    });
    it('does not coerce a value tagged as coerced', function() {
      var state = {
        'formState.name': { value: 3, isCoerced: true }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('name');
      assert.equal(true, fieldState.getValue() === 3);
    });
    it('coerces injected form state unless noCoercion is set', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal(false, Boolean(fieldState.fieldState.isCoerced));
      testForm.state = { 'formState.contact.email': { value: 1 } };
      fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, '1' === fieldState.getValue());
      field.noCoercion = true;
      fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, 1 === fieldState.getValue());
    });
    it('noCoercion applies to model prop field', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm, { model: {name: 1} }));
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.noCoercion = true;
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, 1 === fieldState.getValue());
    });
    it('sets value to empty array if array default value and null or undefined injected value', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.defaultValue = [1,2,3];
      testForm.state = { 'formState.contact.email': { value: null } };
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, Array.isArray(fieldState.getValue()) && fieldState.getValue().length === 0);
      testForm.state = { 'formState.contact.email': { value: undefined } };
      fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, Array.isArray(fieldState.getValue()) && fieldState.getValue().length === 0);
    });
    it('sets value to empty array if array default value and null or undefined injected value unless noCoercion is set', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.defaultValue = [1,2,3];
      field.noCoercion = true;
      testForm.state = { 'formState.contact.email': { value: null } };
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, fieldState.getValue() === null);
      testForm.state = { 'formState.contact.email': { value: undefined } };
      fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, fieldState.getValue() === undefined);
    });
    it('sets value to empty array if array default value and null model prop value', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm, { model: { name: null }}));
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.defaultValue = [1,2,3];
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, Array.isArray(fieldState.getValue()) && fieldState.getValue().length === 0);
    });
    it('sets value to empty array if array default value and null model prop value unless noCoercion is set', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm, { model: { name: null }}));
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.defaultValue = [1,2,3];
      field.noCoercion = true;
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, fieldState.getValue() === null);
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
    it('coerces an array of objects to an array of objects', function() {
      var state = {
        'formState.name': { value: [ {x: 3} ] }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('name');
      assert.equal(true, Array.isArray(fieldState.getValue()));
      assert.equal(1, fieldState.getValue().length);
      assert.equal(true, typeof(fieldState.getValue()[0]) === 'object');
      assert.equal(true, fieldState.getValue()[0].x === 3);
    });
    it('coerces a model prop value', function() {
      var fs = new FormState({ state: {} });
      fs.injectModelProp({name: 3});
      var fieldState = fs.getFieldState('name');
      assert.equal(true, fieldState.getValue() === '3');
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
  });
  describe('#getUncoercedValue', function() {
    it('does not coerce', function() {
      var state = {
        'formState.name': { value: 3 }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('name');
      assert.equal(true, fieldState.getUncoercedValue() === 3);
    });
    it('does not coerce a field state with value of undefined', function() {
      var state = {
        'formState.name': { value: undefined }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('name');
      assert.equal(true, fieldState.getUncoercedValue() === undefined);
    });
    it('does not coerce a field state with value of null', function() {
      var state = {
        'formState.name': { value: null }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('name');
      assert.equal(true, fieldState.getUncoercedValue() === null);
    });
    it('does not coerce an array value', function() {
      var state = {
        'formState.name': { value: [1] }
      };
      var fs = new FormState({ state: state });
      var fieldState = fs.getFieldState('name');
      assert.equal(true, fieldState.getUncoercedValue().length === 1);
      assert.equal(true, fieldState.getUncoercedValue()[0] === 1);
    });
    it('does not set value to empty array if array default value and null or undefined injected value', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var field = testForm.formState.fields.find(x => x.name === 'contact');
      field = field.fields.find(x => x.name === 'email');
      field.defaultValue = [1,2,3];
      testForm.state = { 'formState.contact.email': { value: null } };
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, fieldState.getUncoercedValue() === null);
      testForm.state = { 'formState.contact.email': { value: undefined } };
      fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, fieldState.getUncoercedValue() === undefined);
    });
    it('does not set value to empty array if array default value and null model prop value', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm, { model: { name: null }}));
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.defaultValue = [1,2,3];
      var fieldState = testForm.formState.getFieldState(field);
      assert.equal(true, fieldState.getUncoercedValue() === null);
    });
  });
  describe('#setValue', function() {
    it('does not tag as coerced', function() {
      var state = { 'formState.name': { value: 'Henry' } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork(),
        fieldState = context.getFieldState('name');
      fieldState.setValue('test');
      assert.equal(false, fieldState.fieldState.isCoerced);
      fieldState.setValid();
      assert.equal(false, fieldState.fieldState.isCoerced);
      fieldState.setInvalid();
      assert.equal(false, fieldState.fieldState.isCoerced);
      fieldState.setValidating();
      assert.equal(false, fieldState.fieldState.isCoerced);
      fieldState.setUploading();
      assert.equal(false, fieldState.fieldState.isCoerced);
      fieldState.showMessage();
      assert.equal(false, fieldState.fieldState.isCoerced);
      assert.equal(false, fieldState.isCoerced());
    });
  });
  describe('#setCoercedValue', function() {
    it('tags as coerced', function() {
      var state = { 'formState.name': { value: 'Henry' } },
        fs = new FormState({ state: state }),
        context = fs.createUnitOfWork(),
        fieldState = context.getFieldState('name');
      fieldState.setCoercedValue('test');
      assert.equal(true, fieldState.fieldState.isCoerced);
      fieldState.setValid();
      assert.equal(true, fieldState.fieldState.isCoerced);
      fieldState.setInvalid();
      assert.equal(true, fieldState.fieldState.isCoerced);
      fieldState.setValidating();
      assert.equal(true, fieldState.fieldState.isCoerced);
      fieldState.setUploading();
      assert.equal(true, fieldState.fieldState.isCoerced);
      fieldState.showMessage();
      assert.equal(true, fieldState.fieldState.isCoerced);
      assert.equal(true, fieldState.isCoerced());
    });
  });
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
      f = function() { fieldState.setUploading(); };
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
      assert.equal(fieldState.fieldState, _modified);
      assert.equal(false, _fieldState === _modified);
      fieldState.setValid();
      assert.equal(true, fieldState.isModified);
      assert.equal(fieldState.fieldState, _modified);
      assert.equal(false, _fieldState === _modified);
      // and so on...
    });
    it('does not update isCoerced', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal(false, Boolean(fieldState.fieldState.isCoerced));
      fieldState.setValue('');
      assert.equal(false, fieldState.fieldState.isCoerced);
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
      assert.equal(false, fs1 === fs2);
      assert.equal(true, fs1.fieldState === fs2.fieldState);
      assert.equal(true, fs1.equals(fs2));
      fs1.setValid('undefined');
      fs2.setValid('a message');
      assert.equal(false, fs1.fieldState === fs2.fieldState);
      assert.equal(false, fs1.equals(fs2));
    });
    it('returns false if message visibility is different', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fs1 = context.getFieldState('contact.email');
      var fs2 = context.getFieldState('contact.email');
      assert.equal(false, fs1 === fs2);
      assert.equal(true, fs1.fieldState === fs2.fieldState);
      assert.equal(true, fs1.equals(fs2));
      fs1.setValid('a message');
      fs2.setValid('a message');
      assert.equal(false, fs1.fieldState === fs2.fieldState);
      assert.equal(true, fs1.equals(fs2));
      fs2.showMessage();
      assert.equal(false, fs1.fieldState === fs2.fieldState);
      assert.equal(false, fs1.equals(fs2));
    });
    it('returns false if non-array value is different', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fs1 = context.getFieldState('contact.email');
      var fs2 = context.getFieldState('contact.email');
      assert.equal(false, fs1 === fs2);
      assert.equal(true, fs1.fieldState === fs2.fieldState);
      assert.equal(true, fs1.equals(fs2));
      fs1.setValue('1');
      fs2.setValue('2');
      assert.equal(false, fs1.fieldState === fs2.fieldState);
      assert.equal(false, fs1.equals(fs2));
    });
    it('returns true if array value is same', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fs1 = context.getFieldState('contact.email');
      var fs2 = context.getFieldState('contact.email');
      assert.equal(false, fs1 === fs2);
      assert.equal(true, fs1.fieldState === fs2.fieldState);
      assert.equal(true, fs1.equals(fs2));
      fs1.setCoercedValue(['1',1,null,'']);
      fs2.setCoercedValue(['1',1,null,'']);
      assert.equal(false, fs1.fieldState === fs2.fieldState);
      assert.equal(true, fs1.equals(fs2));
    });
    it('returns false if array value has different values', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fs1 = context.getFieldState('contact.email');
      var fs2 = context.getFieldState('contact.email');
      assert.equal(false, fs1 === fs2);
      assert.equal(true, fs1.fieldState === fs2.fieldState);
      assert.equal(true, fs1.equals(fs2));
      fs1.setCoercedValue(['1',1,'',null]);
      fs2.setCoercedValue(['1',1,null,'']);
      assert.equal(false, fs1.fieldState === fs2.fieldState);
      assert.equal(false, fs1.equals(fs2));
    });
    it('returns false if array value has different length', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fs1 = context.getFieldState('contact.email');
      var fs2 = context.getFieldState('contact.email');
      assert.equal(false, fs1 === fs2);
      assert.equal(true, fs1.fieldState === fs2.fieldState);
      assert.equal(true, fs1.equals(fs2));
      fs1.setValue(['1',1,null]);
      fs2.setValue(['1',1,null,'']);
      assert.equal(false, fs1.fieldState === fs2.fieldState);
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
    it('returns true if valid', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal(false, fieldState.isValidated());
      fieldState.setValid();
      assert.equal(true, fieldState.isValidated());
    });
    it('returns true if invalid', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal(false, fieldState.isValidated());
      fieldState.setInvalid();
      assert.equal(true, fieldState.isValidated());
    });
    it('returns true if validating', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal(false, fieldState.isValidated());
      fieldState.setValidating();
      assert.equal(true, fieldState.isValidated());
    });
    it('returns true if uploading', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal(false, fieldState.isValidated());
      fieldState.setUploading();
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
  describe('#isUploading', function() {
    it('returns whether field state is uploading', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.email');
      assert.equal(false, fieldState.isUploading());
      fieldState.fieldState.validity = 4;
      assert.equal(true, fieldState.isUploading());
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
      fieldState.fieldState.formerProp = 'willBeRemoved';
      fieldState.setValue('');
      assert.equal('', fieldState.fieldState.value);
      assert.equal(undefined, fieldState.fieldState.validity);
      assert.equal(undefined, fieldState.fieldState.message);
      assert.equal(undefined, fieldState.fieldState.asyncToken);
      assert.equal(undefined, fieldState.fieldState.isMessageVisible);
      assert.equal(undefined, fieldState.fieldState.formerProp);
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
    it('honors a message override for required', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('email');
      fieldState.setValue('').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('Please provide an email', fieldState.getMessage());
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
    it('honors message override', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('city');
      var field = fieldState.getField();
      field.required = false;
      field.validate = ['noSpaces',['lengthBetween',4,6]];
      field.validationMessages = ['message for noSpaces','message for between'];
      fieldState.setValue('123 4567').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('message for noSpaces', fieldState.getMessage());
    });
    it('honors message override for proper validation', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('city');
      var field = fieldState.getField();
      field.required = false;
      field.validate = ['noSpaces',['lengthBetween',4,6]];
      field.validationMessages = ['message for noSpaces','message for between'];
      fieldState.setValue('1234567').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('message for between', fieldState.getMessage());
    });
    it('does not break on non-array and non-single-string message overrides', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('city');
      var field = fieldState.getField();
      field.required = false;
      field.validate = ['noSpaces',['lengthBetween',4,6]];
      field.validationMessages = 3;
      fieldState.setValue('1234567').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('City must be at most 6 characters', fieldState.getMessage());
    });
    it('can work with a single string message override', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('city');
      var field = fieldState.getField();
      field.required = false;
      field.validate = 'noSpaces';
      field.validationMessages = 'message override';
      fieldState.setValue('123 4567').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('message override', fieldState.getMessage());
    });
    it('does not break on non-string message overrides', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('city');
      var field = fieldState.getField();
      field.required = false;
      field.validate = ['noSpaces',['lengthBetween',4,6]];
      field.validationMessages = ['message for no spaces', null];
      fieldState.setValue('1234567').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('City must be at most 6 characters', fieldState.getMessage());
    });
    it('does not break on non-string message overrides 2', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('city');
      var field = fieldState.getField();
      field.required = false;
      field.validate = ['noSpaces',['lengthBetween',4,6]];
      field.validationMessages = ['message for no spaces', 3];
      fieldState.setValue('1234567').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('City must be at most 6 characters', fieldState.getMessage());
    });
    it('does not break on non-string message overrides 3', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('city');
      var field = fieldState.getField();
      field.required = false;
      field.validate = ['noSpaces',['lengthBetween',4,6]];
      field.validationMessages = ['message for no spaces'];
      fieldState.setValue('1234567').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('City must be at most 6 characters', fieldState.getMessage());
    });
    it('does not break on non-string message overrides 4', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('city');
      var field = fieldState.getField();
      field.required = false;
      field.validate = ['noSpaces',['lengthBetween',4,6]];
      field.validationMessages = ['message for no spaces', null];
      fieldState.setValue('123 4567').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('message for no spaces', fieldState.getMessage());
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
    it('passes value, context, and field to a called function', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.required = false;
      field.validate = function(value, context, field) {
        assert.equal('  ', value);
        assert.equal('UnitOfWork', context.constructor.name);
        assert.equal('name', field.name);
        assert.equal('Name', field.label);
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
    it('uses fsValidate if both fsValidate and validate are specified', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = fieldState.getField();
      field.validate = [['lengthBetween',4,6]];
      fieldState.setValue('willwarn').validate();
      assert.equal(true, fieldState.isInvalid());
      field.fsValidate = (fsv) => fsv.noSpaces();
      fieldState.validate();
      assert.equal(true, fieldState.isValid());
    });
    it('passes fsv, context, and field to a called fsValidate function', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.required = false;
      field.fsValidate = function(fsv, context, field) {
        assert.equal('FormStateValidation', fsv.constructor.name);
        assert.equal('  ', fsv.value);
        assert.equal('Name', fsv.label);
        assert.equal('UnitOfWork', context.constructor.name);
        assert.equal('name', field.name);
        assert.equal('Name', field.label);
        if (fsv.value.trim() === '') { return { _message: 'this was called' }; }
      };
      fieldState.setValue('  ').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('this was called', fieldState.getMessage());
    });
    it('can work with a string returned from fsValidate', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.required = false;
      field.fsValidate = function(fsv, context, field) {
        if (fsv.value.trim() === '') { return 'this was called'; }
      };
      fieldState.setValue('  ').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('this was called', fieldState.getMessage());
    });
    it('can work with a nonexistent value returned from fsValidate', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.required = false;
      var wasCalled = false;
      field.fsValidate = function(fsv, context, field) {
        wasCalled = true;
        if (fsv.value.trim() === '') { return 'this was called'; }
      };
      fieldState.setValue(' a ').validate();
      assert.equal(true, wasCalled);
      assert.equal(true, fieldState.isValid());
      assert.equal(undefined, fieldState.getMessage());
    });
    it('can work with an fsv object returned from fsValidate', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = testForm.formState.fields.find(x => x.name === 'name');
      field.required = false;
      var wasCalled = false;
      field.fsValidate = function(fsv, context, field) {
        wasCalled = true;
        return fsv.noSpaces();
      };
      fieldState.setValue(' a ').validate();
      assert.equal(true, wasCalled);
      assert.equal(true, fieldState.isInvalid());
      assert.equal('no spaces', fieldState.getMessage());
    });
    it('throws an error if fsValidate is not a function', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = fieldState.getField();
      field.fsValidate = 'not a function';
      var f = function() {
        fieldState.setValue('will throw').validate();
      }
      assert.throws(f, /not a function/);
    });
    it('can return valid from fsValidate', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = fieldState.getField();
      field.fsValidate = (fsv) => fsv.noSpaces().minLength(4);
      fieldState.setValue('thisisvalid').validate();
      assert.equal(true, fieldState.isValid());
    });
    it('can return valid from fsValidate and not override message', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = fieldState.getField();
      field.fsValidate = (fsv) => fsv.noSpaces().msg('1').minLength(4).msg('2');
      fieldState.setValue('thisisvalid').validate();
      assert.equal(true, fieldState.isValid());
      assert.equal(undefined, fieldState.getMessage());
    });
    it('breaks chain if fsValidate returns a message early', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = fieldState.getField();
      field.fsValidate = (fsv) => fsv.noSpaces().minLength(4);
      fieldState.setValue('will fail early').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('no spaces', fieldState.getMessage());
    });
    it('breaks chain if fsValidate returns a message early and overrides message', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = fieldState.getField();
      field.fsValidate = (fsv) => fsv.noSpaces().msg('noSpaces override').minLength(4).msg('minLength override');
      fieldState.setValue('will fail early').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('noSpaces override', fieldState.getMessage());
    });
    it('can go through a chain of fsValidate functions', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = fieldState.getField();
      field.fsValidate = (fsv) => fsv.noSpaces().minLength(20);
      fieldState.setValue('notlongenough').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('Name must be at least 20 characters', fieldState.getMessage());
    });
    it('can go through a chain of fsValidate functions and overrides message', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = fieldState.getField();
      field.fsValidate = (fsv) => fsv.noSpaces().msg('noSpaces override').minLength(20).msg('minLength override');
      fieldState.setValue('notlongenough').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('minLength override', fieldState.getMessage());
    });
    it('can use message instead of msg for fsValidate', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = fieldState.getField();
      field.fsValidate = (fsv) => fsv.noSpaces().msg('noSpaces override').minLength(20).message('minLength override');
      fieldState.setValue('notlongenough').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('minLength override', fieldState.getMessage());
    });
    it('can have an fsValidate span multiple lines', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = fieldState.getField();
      field.fsValidate = (fsv) => fsv.noSpaces().
        msg('noSpaces override').
        minLength(20).
        msg('minLength override');
      fieldState.setValue('notlongenough').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('minLength override', fieldState.getMessage());
    });
    it('can have an fsValidate span multiple lines 2', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = fieldState.getField();
      field.fsValidate = (fsv) => fsv.noSpaces()
        .msg('noSpaces override')
        .minLength(20)
        .msg('minLength override');
      fieldState.setValue('notlongenough').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('minLength override', fieldState.getMessage());
    });
    it('passes multiple params to fsValidate properly', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = fieldState.getField();
      field.fsValidate = (fsv) => fsv.noSpaces().minLength(3).lengthBetween(7,13);
      fieldState.setValue('thisiswaytoolong!!!').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('Name must be at most 13 characters', fieldState.getMessage());
    });
    it('ignores empty message overrides', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = fieldState.getField();
      field.fsValidate = (fsv) => fsv.noSpaces().minLength(20).msg();
      fieldState.setValue('notlongenough').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('Name must be at least 20 characters', fieldState.getMessage());
    });
    it('ignores whitespace message overrides', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = fieldState.getField();
      field.fsValidate = (fsv) => fsv.noSpaces().minLength(20).msg('   ');
      fieldState.setValue('notlongenough').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('Name must be at least 20 characters', fieldState.getMessage());
    });
    it('ignores non-string message overrides', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = fieldState.getField();
      field.fsValidate = (fsv) => fsv.noSpaces().minLength(20).msg(3);
      fieldState.setValue('notlongenough').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('Name must be at least 20 characters', fieldState.getMessage());
    });
    it('ignores redundant message overrides', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('name');
      var field = fieldState.getField();
      field.fsValidate = (fsv) => fsv.noSpaces().msg().msg().msg().minLength(20).msg('override').msg('different');
      fieldState.setValue('notlongenough').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('override', fieldState.getMessage());
    });
    it('returns a field state if no field', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('someInputThatDoesNotExist');
      var newFieldState = fieldState.setValue('someValueIWantToStore').validate();
      assert.equal(false, fieldState.isValid());
      assert.equal('FieldState', newFieldState.constructor.name);
      assert.equal(fieldState, newFieldState);
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
      fieldState.fieldState.formerProp = 'willBeRemoved';
      fieldState.setValid('new');
      assert.equal('old', fieldState.fieldState.value);
      assert.equal(1, fieldState.fieldState.validity);
      assert.equal('new', fieldState.fieldState.message);
      assert.equal(undefined, fieldState.fieldState.asyncToken);
      assert.equal(undefined, fieldState.fieldState.isMessageVisible);
      assert.equal(undefined, fieldState.fieldState.formerProp);
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
      fieldState.fieldState.formerProp = 'willBeRemoved';
      fieldState.setInvalid('new');
      assert.equal('old', fieldState.fieldState.value);
      assert.equal(2, fieldState.fieldState.validity);
      assert.equal('new', fieldState.fieldState.message);
      assert.equal(undefined, fieldState.fieldState.asyncToken);
      assert.equal(undefined, fieldState.fieldState.isMessageVisible);
      assert.equal(undefined, fieldState.fieldState.formerProp);
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
    it('sets all the core props except value and returns an asyncToken', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      fieldState.fieldState.value = 'old';
      fieldState.fieldState.validity = 2;
      fieldState.fieldState.message = 'old';
      fieldState.fieldState.asyncToken = 'old';
      fieldState.fieldState.isMessageVisible = false;
      fieldState.fieldState.formerProp = 'willBeRemoved';
      var asyncToken = fieldState.setValidating('new');
      assert.equal('string', typeof(asyncToken));
      assert.equal('old', fieldState.fieldState.value);
      assert.equal(3, fieldState.fieldState.validity);
      assert.equal('new', fieldState.fieldState.message);
      assert.notEqual('old, asyncToken');
      assert.equal(asyncToken, fieldState.fieldState.asyncToken);
      assert.equal(true, fieldState.fieldState.isMessageVisible);
      assert.equal(undefined, fieldState.fieldState.formerProp);
    });
  });
  describe('#setUploading', function() {
    it('sets all the core props except value and asyncToken', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      fieldState.fieldState.value = 'old';
      fieldState.fieldState.validity = 2;
      fieldState.fieldState.message = 'old';
      fieldState.fieldState.asyncToken = 'old';
      fieldState.fieldState.isMessageVisible = false;
      fieldState.fieldState.formerProp = 'willBeRemoved';
      fieldState.setUploading('new');
      assert.equal('old', fieldState.fieldState.value);
      assert.equal(4, fieldState.fieldState.validity);
      assert.equal('new', fieldState.fieldState.message);
      assert.equal(true, fieldState.fieldState.asyncToken === null);
      assert.equal(true, fieldState.fieldState.isMessageVisible);
      assert.equal(undefined, fieldState.fieldState.formerProp);
    });
    it('returns a field state', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      var newFieldState = fieldState.setUploading('new');
      assert.equal('FieldState',  newFieldState.constructor.name);
      assert.equal('123 pinecrest rd', newFieldState.getValue());
      assert.equal(4, newFieldState.getValidity());
      assert.equal('new', newFieldState.getMessage());
      assert.equal(true, newFieldState.getAsyncToken() === null);
      assert.equal(true, newFieldState.isMessageVisible());
    });
  });
  describe('#showMessage', function() {
    it('shows the message and copies all the other core props', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      fieldState.fieldState.value = 'old';
      fieldState.fieldState.validity = 2;
      fieldState.fieldState.message = 'old';
      fieldState.fieldState.asyncToken = 'old';
      fieldState.fieldState.isMessageVisible = false;
      fieldState.fieldState.formerProp = 'willBeRemoved';
      var _fieldState = fieldState.fieldState;
      fieldState.showMessage();
      assert.notEqual(_fieldState, fieldState.fieldState);
      assert.equal(true, fieldState.isModified);
      assert.equal('old', fieldState.fieldState.value);
      assert.equal(2, fieldState.fieldState.validity);
      assert.equal('old', fieldState.fieldState.message);
      assert.equal('old', fieldState.fieldState.asyncToken);
      assert.equal(true, fieldState.fieldState.isMessageVisible);
      assert.equal(undefined, fieldState.fieldState.formerProp);
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
  describe('#set', function() {
    it('adds the prop and only copies the other core props', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      fieldState.fieldState.value = 'old';
      fieldState.fieldState.validity = 2;
      fieldState.fieldState.message = 'old';
      fieldState.fieldState.asyncToken = 'old';
      fieldState.fieldState.isMessageVisible = true;
      var _fieldState = fieldState.fieldState;
      var fi = fieldState.set('test', 3);
      assert.notEqual(_fieldState, fieldState.fieldState);
      assert.equal(true, fieldState.isModified);
      assert.equal('old', fieldState.fieldState.value);
      assert.equal(2, fieldState.fieldState.validity);
      assert.equal('old', fieldState.fieldState.message);
      assert.equal('old', fieldState.fieldState.asyncToken);
      assert.equal(true, fieldState.fieldState.isMessageVisible);
      assert.equal(true, 3 === fieldState.fieldState.test);
    });
    it('clears other props upon initial modification and returns the FieldState object', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      fieldState.fieldState.value = 'old';
      fieldState.fieldState.formerProp = 'willBeRemoved';
      var _fieldState = fieldState.fieldState;
      var fi = fieldState.set('test', 3);
      assert.notEqual(_fieldState, fieldState.fieldState);
      assert.equal(true, fieldState.isModified);
      assert.equal('old', fieldState.fieldState.value);
      assert.equal(true, undefined === fieldState.fieldState.formerProp);
      assert.equal(true, 3 === fieldState.fieldState.test);
      fi.set('anotherProp', 4);
      assert.equal('old', fieldState.fieldState.value);
      assert.equal(true, undefined === fieldState.fieldState.formerProp);
      assert.equal(true, 3 === fieldState.fieldState.test);
      assert.equal(true, 4 === fieldState.fieldState.anotherProp);
    });
    it('additional props not wiped by other set functions after modification', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      fieldState.fieldState.value = 'old';
      fieldState.fieldState.formerProp = 'willBeRemoved';
      var _fieldState = fieldState.fieldState;
      var fi = fieldState.set('test', 3);
      assert.notEqual(_fieldState, fieldState.fieldState);
      assert.equal(true, fieldState.isModified);
      assert.equal('old', fieldState.fieldState.value);
      assert.equal(true, undefined === fieldState.fieldState.formerProp);
      assert.equal(true, 3 === fieldState.fieldState.test);
      fi.setValid();
      fi.setInvalid();
      fi.setValidating();
      fi.setUploading();
      fi.showMessage();
      assert.equal(true, 3 === fieldState.fieldState.test);
      assert.equal(true, 3 === fi.get('test'));
    });
  });
  describe('#get', function() {
    it('gets a prop value by name', function() {
      ReactDOMServer.renderToString(React.createElement(UserFormEdit));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('contact.address.line1');
      fieldState.fieldState.test = 3;
      assert.equal(true, 3 === fieldState.get('test'));
      assert.equal(true, undefined === fieldState.get('noMatch'));
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
  describe('#required', function() {
    it('can be suppressed', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var fieldState = testForm.formState.getFieldState('name');
      assert.equal(false, fieldState.getField().required);
    });
    it('is suppressed for empty string (documenting this behavior)', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var fieldState = testForm.formState.getFieldState('phone');
      assert.equal(false, fieldState.getField().required);
    });
  });
  describe('#requiredMessage', function() {
    it('is undefined by default', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var fieldState = testForm.formState.getFieldState('name');
      assert.equal(undefined, fieldState.getField().requiredMessage);
    });
    it('can be supplied', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var fieldState = testForm.formState.getFieldState('email');
      assert.equal('Please provide an email', fieldState.getField().requiredMessage);
    });
    it('ignores empty string', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var fieldState = testForm.formState.getFieldState('phone');
      assert.equal(undefined, fieldState.getField().requiredMessage);
    });
    it('ignores non-string values', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var fieldState = testForm.formState.getFieldState('line1');
      assert.equal(undefined, fieldState.getField().requiredMessage);
    });
  });
  describe('#validationMessages', function() {
    it('is undefined by default', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var fieldState = testForm.formState.getFieldState('name');
      assert.equal(undefined, fieldState.getField().validationMessages);
    });
    it('can be supplied', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var fieldState = testForm.formState.getFieldState('line2');
      var msgs = fieldState.getField().validationMessages;
      assert.equal(true, Array.isArray(msgs));
    });
    it('can be set via msgs', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var fieldState = testForm.formState.getFieldState('city');
      var msgs = fieldState.getField().validationMessages;
      assert.equal(3, msgs);
    });
    it('prefers validationMessages over msgs', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var fieldState = testForm.formState.getFieldState('state');
      var msgs = fieldState.getField().validationMessages;
      assert.equal(true, Array.isArray(msgs));
    });
  });
  describe('#fsValidate', function() {
    it('is undefined by default', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var fieldState = testForm.formState.getFieldState('name');
      assert.equal(undefined, fieldState.getField().fsValidate);
    });
    it('can be supplied', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var fieldState = testForm.formState.getFieldState('zip');
      var fsValidate = fieldState.getField().fsValidate;
      assert.equal('hello', fsValidate);
    });
    it('can be set via fsv', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var fieldState = testForm.formState.getFieldState('zip4');
      var fsValidate = fieldState.getField().fsValidate;
      assert.equal('world', fsValidate);
    });
    it('prefers fsValidate over fsv', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var fieldState = testForm.formState.getFieldState('country');
      var fsValidate = fieldState.getField().fsValidate;
      assert.equal('hello', fsValidate);
    });
    it('can be autowired', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var fieldState = testForm.formState.getFieldState('autowire');
      var fsValidate = fieldState.getField().fsValidate;
      assert.equal(true, typeof(fsValidate) === 'function');
    });
    it('prefers fsValidate over autowiring', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var fieldState = testForm.formState.getFieldState('zip');
      var fsValidate = fieldState.getField().fsValidate;
      assert.equal('hello', fsValidate);
    });
  });
  describe('#validate', function() {
    // a whole lot tested elsewhere...
    it('prefers validate over autowiring', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var fieldState = testForm.formState.getFieldState('city');
      var validate = fieldState.getField().validate;
      assert.equal('noSpaces', validate);
    });
  });
  describe('#revalidateOnSubmit', function() {
    it('picks up a revalidateOnSubmit configuration', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      var field = testForm.formState.fields.find(x => x.name === 'name');
      assert.equal(false, field.revalidateOnSubmit);
      field = testForm.formState.fields.find(x => x.name === 'email');
      assert.equal(true, field.revalidateOnSubmit);
    });
  });
});
describe('FormObject', function() {
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
    it('can handle contacts.0.address before contacts.0 with a model prop', function() {
      ReactDOMServer.renderToString(React.createElement(UserContactsFormBackwardsModelProp, { model: createTestContactsModel() }));
      var model = testForm.formState.createUnitOfWork().createModel();
      assert.equal('123 pinecrest rd', model.contacts[0].address.line1);
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
describe('Form', function() {
  describe('#render', function() {
    it('forwards form props to form element', function() {
      let markup = ReactDOMServer.renderToString(React.createElement(UserContactsFormEdit));
      assert.equal(true, markup.startsWith('<form id="testingAFormProp" '));
    });
  });
});
describe('FormExtension', function() {
  describe('#createExtensionProps', function() {
    it('does not prefix path and does not clear root fields', function() {
      ReactDOMServer.renderToString(React.createElement(ExtendedUserForm));
      var model = testForm.formState.createUnitOfWork().createModel();
      assert.equal(2, Object.keys(model).length);
      assert.equal(true, model.name !== undefined);
      assert.equal(true, model.line1 !== undefined);
    });
    it('calls an autowired function', function() {
      ReactDOMServer.renderToString(React.createElement(ExtendedUserForm));
      var context = testForm.formState.createUnitOfWork();
      var fieldState = context.getFieldState('line1');
      fieldState.setValue('autowired').validate();
      assert.equal(true, fieldState.isInvalid());
      assert.equal('it worked!', fieldState.getMessage());
    });
    it('passes label prefix', function() {
      ReactDOMServer.renderToString(React.createElement(ExtendedUserForm));
      assert.equal('Why Line 1', contactAddressLine1Input.props.label);
    });
    it('throws error if used improperly', function() {
      var f = function() {
        ReactDOMServer.renderToString(React.createElement(createExtendedUserFormFixture(true)));
      };
      assert.throws(f, /a FormExtension element should not be nested/);
    });
    it('warns about nested components managing their own state', function() {
      ReactDOMServer.renderToString(React.createElement(createExtendedUserFormFixture(false, true)));
    });
  });
});
describe('formField', function() {
  describe('#addProps', function() {
    it('adds a fieldState prop', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      assert.equal(true, contactEmailInput.props.fieldState !== null);
      assert.equal(true, typeof(contactEmailInput.props.fieldState) === 'object');
    });
    it('adds an updateFormState prop', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      assert.equal(true, typeof(contactEmailInput.props.updateFormState) === 'function');
    });
    it('adds a handleValueChange prop', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      assert.equal(true, typeof(contactEmailInput.props.handleValueChange) === 'function');
    });
    it('adds a showValidationMessage prop', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      assert.equal(true, typeof(contactEmailInput.props.showValidationMessage) === 'function');
    });
    it('adds a formState prop', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      assert.equal(true, contactEmailInput.props.formState !== null);
      assert.equal(true, typeof(contactEmailInput.props.formState) === 'object');
    });
    it('adds a label prop', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      assert.equal(true, typeof(contactEmailInput.props.label) === 'string');
      assert.equal(true, contactEmailInput.props.label === 'Work Email');
    });
    it('adds a label prop even if you do not provide one', function() {
      ReactDOMServer.renderToString(React.createElement(MessageOverrideForm));
      assert.equal(true, typeof(contactEmailInput.props.label) === 'string');
      assert.equal(true, contactEmailInput.props.label === '');
    });
  });
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
  describe('#simpleChangeHandler', function() {
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
      contactEmailInput.props.handleValueChange('a');
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
      contactEmailInput.props.handleValueChange('a');
      assert.equal(false, wasCalled);
      assert.equal(true, onUpdateWasCalled);
    });
    // onUpdate callback already tested...
    it('calls setCoercedValue', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var state;
      testForm.setState = function(x) { state = x };
      contactAddressLine1Input.props.handleValueChange('123 pinecrest rd.');
      assert.equal(true, state['formState.contact.address.line1'].isCoerced);
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
      contactEmailInput.props.updateFormState({ target: { value: 'a', type: 'testing' }});
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
      contactEmailInput.props.updateFormState({ target: { value: 'a', type: 'testing' }});
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
        contactEmailInput.props.updateFormState({ target: { value: '?', type: 'testing' }});
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
    it('throws an error if handlerBindFunction is not a function', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      testForm.setState = function(updates) {};
      var fieldState = testForm.formState.getFieldState('contact.email');
      fieldState.getField().handlerBindFunction = {};
      assert.throws(contactEmailInput.props.updateFormState, /you specified a handlerBindFunction/);
    });
    it('uses handlerBindFunction if specified', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      var wasCalled = false;
      testForm.setState = function(updates) {
        wasCalled = true;
        Object.assign(this.state, updates);
      };
      var fieldState = testForm.formState.getFieldState('contact.email');
      fieldState.getField().handlerBindFunction = (x) => x;
      assert.equal('', fieldState.getValue());
      assert.equal(false, fieldState.isValidated());
      contactEmailInput.props.updateFormState('hello');
      assert.equal(true, wasCalled);
      fieldState = testForm.formState.getFieldState('contact.email');
      assert.equal('hello', fieldState.getValue());
      assert.equal(true, fieldState.isValidated());
    });
    it('throws an error if handlerBindFunction not specified and e.target.type undefined', function() {
      ReactDOMServer.renderToString(React.createElement(UserForm));
      testForm.setState = function(updates) {};
      assert.throws(contactEmailInput.props.updateFormState, /you are using a non-standard html input/);
      var f = () => contactEmailInput.props.updateFormState({});
      assert.throws(contactEmailInput.props.updateFormState, /you are using a non-standard html input/);
      f = () => contactEmailInput.props.updateFormState({ target: {} });
      assert.throws(contactEmailInput.props.updateFormState, /you are using a non-standard html input/);
    });
  });
});
