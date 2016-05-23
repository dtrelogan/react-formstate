import React from 'react';

//
// private functions, local to module
//

const FORM_STATE_PREFIX = 'formState.';

function prefix(path, name) {
  if (name === undefined) {
    return FORM_STATE_PREFIX + path;
  } else {
    return path ? path + '.' + name : name;
  }
}

function _getFieldState(state, key) {
  return state[prefix(key)];
}

function _setFieldState(state, key, _fieldState) {
  state[prefix(key)] = _fieldState;
}

function exists(v) {
  return v !== undefined && v !== null;
}

function findField(rootFields, key, readOnly) {
  let fields = rootFields,
    fieldnames = key.split('.'),
    len = fieldnames.length;

  for(let i = 0; i < len - 1; i++) {
    let objectField = fields.find(x => x.name === fieldnames[i]);
    if (!objectField) {
      if (readOnly) { return null; }
      objectField = { key: fieldnames.slice(0,i+1).join('.'), name: fieldnames[i], fields: [], initialized: false };
      fields.push(objectField);
    }
    fields = objectField.fields || objectField.array;
  }

  let field = fields.find(x => x.name === fieldnames[len - 1]);
  if (!field) {
    if (readOnly) { return null; }
    field = { key: key, name: fieldnames[len - 1], initialized: false };
    fields.push(field);
  }
  return field;
}

function findFieldByFieldOrName(formState, fieldOrName) {
  if (exists(fieldOrName.name)) {
    return fieldOrName;
  } else {
    return findField(formState.getRootFields(), formState.buildKey(fieldOrName), true);
  }
}

function capitalize(name) {
  return name.charAt(0).toUpperCase() + name.slice(1);
}

function generateQuickGuid() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function iterateKeys(state, f) {
  let keys = Object.keys(state);
  for (let i = 0, len = keys.length; i < len; i++) {
    let key = keys[i];
    if (key.startsWith(FORM_STATE_PREFIX)) {
      if (f(key.replace(FORM_STATE_PREFIX, ''))) { break; }
    }
  }
}

function iterateFieldStates(state, f) {
  iterateKeys(state, function(key) {
    let fieldState = new FieldState(_getFieldState(state, key), key);
    if (!fieldState.isDeleted()) {
      return f(fieldState);
    }
  });
}

function anyFieldState(state, f) {
  let result = false;
  iterateFieldStates(state, function(fieldState) {
    if (f(fieldState)) {
      result = true;
      return true; // stop iterating
    }
  });
  return result;
}

function isObject(v) {
  return v !== null && typeof(v) === 'object';
}

function coerceToString(v) {
  if (!exists(v)) { return ''; } // else
  if (v === true || v === false) { return v; } // else
  if (Array.isArray(v)) { return v.map(x => exists(x) ? x.toString() : x); } // else
  return v.toString();
}

function changeHandler(formState, field, e) {
  let context = formState.createUnitOfWork(),
    fieldState = context.getFieldState(field),
    value = fieldState.getValue(); // temporarily set to previous value

  if (Array.isArray(value)) {
    if (e.target.type === 'checkbox') { // checkbox group
      if (e.target.checked) {
        value = value.slice(0); // copy the existing array
        if (!value.some(x => x === e.target.value)) {
          value.push(e.target.value)
          value.sort();
        }
      } else {
        value = value.filter(x => x !== e.target.value);
      }
    } else { // select-multiple
      if (e.target.type !== 'select-multiple') { throw new Error('only select-multiple and checkbox group supported for array value types. you will need to override the framework event handler or request an enhancement'); }
      value = [];
      let options = e.target.options;
      for (let i = 0, len = options.length; i < len; i++) {
        if (options[i].selected) {
          value.push(options[i].value);
        }
      }
    }
  } else {
    if (e.target.type === 'checkbox') {
      value = e.target.checked;
    } else { // note that select-one and radio group work like every other input in this regard
      if (e.target.type === 'select-multiple') { throw new Error('a select-multiple input must have defaultValue={[]} specified'); }
      value = e.target.value;
    }
  }

  fieldState.setValue(value).validate();

  if (formState.rootFormState.updateCallback) {
    // accessing internals... clean this up?
    context.formState = formState.rootFormState;
    formState.rootFormState.updateCallback(context, field.key);
  } else {
    context.updateFormState();
  }
}

function blurHandler(formState, field) {
  let context = formState.createUnitOfWork(),
    fieldState = context.getFieldState(field);

  fieldState.showMessage();
  context.updateFormState();
}


//
// Form
//

export class Form extends React.Component {
  render() {
    let { formState, ...otherProps } = this.props;

    return React.createElement(
      'form',
      otherProps,
      React.createElement(FormObject, {formState: formState}, this.props.children)
    );
  }
}


//
// FormObject
//

export class FormObject extends React.Component {

  constructor(props) {
    super(props);

    if (this.props.nestedForm) {
      let nestedProps = this.props.nestedForm.props;
      this.formState = nestedProps.formState;
      this.validationComponent = this.props.nestedForm;
      this.labelPrefix = nestedProps.labelPrefix;
    } else {
      this.formState = this.props.formState;
      this.validationComponent = this.props.validationComponent || this.formState.form;
      this.labelPrefix = this.props.labelPrefix;
    }

    this.addProps = this.addProps.bind(this);
  }


  render() {
    // to support dynamic removal, upon render, rebuild the field definitions
    this.formState.clearFields();

    return React.createElement(
      'div',
      null,
      React.Children.map(this.props.children, this.addProps)
    );
  }


  addProps(child) {
    if (!child || !child.props) { return child; } // else

    let props = null, formState = this.formState;

    if (exists(child.props.formField)) {
      props = this.createFieldProps(child.props);
    }
    else if (exists(child.props.formObject) || exists(child.props.formArray)) {
      props = this.createObjectProps(
        exists(child.props.formObject) ? child.props.formObject : child.props.formArray,
        child.props,
        exists(child.props.formArray)
      );
      this.formState = props.formState;
    }
    else if (child.type === FormObject || child.type === FormArray) {
      if (!exists(child.props.name)) { throw new Error('a FormObject or FormArray element nested within the same render function should have a "name" property'); }
      props = this.createObjectProps(child.props.name, child.props, child.type === FormArray);
      // let the child FormObject/FormArray create the appropriate props for its children
      return React.cloneElement(child, props, child.props.children);
    }

    let result = React.cloneElement(
      child,
      props,
      child.props.children && React.Children.map(child.props.children, this.addProps)
    );

    this.formState = formState;

    return result;
  }


  createObjectProps(name, props, isArray) {
    name = name.toString();

    let formState = this.formState,
      key = formState.buildKey(name),
      field = findField(formState.getRootFields(), key);

    if (!field.initialized) {
      field.initialized = true;

      if (isArray) {
        field.array = [];
      } else {
        if (!field.fields) { field.fields = []; }
      }

      field.preferNull = Boolean(props.preferNull);
    }

    return {
      formState: formState.createFormState(name),
      validationComponent: this.validationComponent, // ignored by a nested COMPONENT
      labelPrefix: (this.labelPrefix || '') + (props.labelPrefix || '')
    };
  }


  createFieldProps(props) {
    let name = props.formField.toString();

    let formState = this.formState,
      key = formState.buildKey(name),
      field = findField(formState.getRootFields(), key);

    if (!field.initialized) {
      field.initialized = true;
      field.label = (this.labelPrefix || '') + props.label;
      if (props.required === '-') {
        field.required = false;
      } else {
        field.required = Boolean(props.required);
      }
      if (field.required && typeof(props.required) === 'string' && props.required.length > 0) {
        field.requiredMessage = props.required;
      }
      if (props.validate) {
        field.validate = props.validate;
      } else {
        let f = this.validationComponent['validate' + capitalize(field.name)];
        if (f) { field.validate = f; }
      }
      field.noTrim = Boolean(props.noTrim);
      field.preferNull = Boolean(props.preferNull);
      field.intConvert = Boolean(props.intConvert);
      if (exists(props.defaultValue)) { field.defaultValue = props.defaultValue; }
      field.noCoercion = Boolean(props.noCoercion);
      field.fsValidate = props.fsValidate || props.fsv;
      if (!field.fsValidate) {
        let f = this.validationComponent['fsValidate' + capitalize(field.name)];
        if (f) { field.fsValidate = f; }
      }
      field.validationMessages = props.validationMessages || props.msgs;
      field.revalidateOnSubmit = Boolean(props.revalidateOnSubmit);
    }

    return {
      label: field.label,
      fieldState: formState.getFieldState(field), // read-only
      updateFormState: props.updateFormState || changeHandler.bind(null, formState, field),
      showValidationMessage: blurHandler.bind(null, formState, field)
    };
  }

}

//
// FormArray
//

export class FormArray extends FormObject {}

//
// FieldState
//

class FieldState {

  //
  // "private"
  //

  constructor(_fieldState, key, field, isModified, stateContext) {
    this.fieldState = _fieldState;
    this.key = key;
    this.field = field;
    this.isModified = isModified;
    this.stateContext = stateContext;
  }

  assertCanUpdate() {
    if (!this.stateContext) { throw new Error('Cannot update a read-only field state'); }
    if (this.isDeleted()) { throw new Error('Cannot update a deleted field state.'); }
  }

  getValidity() {
    return this.fieldState.validity;
  }

  getAsyncToken() {
    return this.fieldState.asyncToken;
  }

  setProps(value, validity, message, asyncToken, isMessageVisible) {
    this.assertCanUpdate();

    if (!this.isModified) {
      this.isModified = true;
      this.fieldState = { isCoerced: true }; // to get here, would have already gone through getFieldState
      _setFieldState(this.stateContext.stateUpdates, this.key, this.fieldState);
    }

    this.fieldState.value = value;
    this.fieldState.validity = validity;
    this.fieldState.message = message;
    this.fieldState.asyncToken = asyncToken;
    this.fieldState.isMessageVisible = isMessageVisible;

    return this;
  }

  callValidationFunction(f) {
    if (typeof(f) === 'function') {
      return f(this.getValue(), this.stateContext, this.field);
    } // else
    throw new Error(`validation provided for ${this.getKey()} is not a function?`);
  }

  callRegisteredValidationFunction(f, params) {
    return f(this.getValue(), this.field.label, ...params);
  }

  //
  // public
  //

  equals(fieldState) {
    if (fieldState.getMessage() !== this.getMessage()) { return false; } // else
    if (fieldState.isMessageVisible() !== this.isMessageVisible()) { return false; } // else
    let a = fieldState.getValue(), b = this.getValue();
    if (!Array.isArray(a)) { return a === b; } // else
    return a.length === b.length && a.every((v,i) => v === b[i]);
  }

  getKey() { return this.key; }
  getValue() { return this.fieldState.value; }
  getMessage() { return this.fieldState.message; }

  isValidated() { return exists(this.fieldState.validity); }
  isValid() { return this.fieldState.validity === 1 }
  isInvalid() { return this.fieldState.validity === 2; }
  isValidating() { return this.fieldState.validity === 3; }
  isDeleted() { return Boolean(this.fieldState.isDeleted); }
  isMessageVisible() { return Boolean(this.fieldState.isMessageVisible); }

  getField() { return this.field; }

  setValue(value) {
    if (this.isModified) { throw new Error('setting value on a modified field state? if you are changing the value do that first'); }
    return this.setProps(value);
  }

  validate() {
    this.assertCanUpdate();

    if (this.field.validate && this.field.fsValidate) {
      console.log(`warning: both validate and fsValidate defined on ${this.field.key}. fsValidate will be used.`)
    }

    let message;
    if (this.field.required) {
      message = this.callRegisteredValidationFunction(FormState.required, []);
      if (message && this.field.requiredMessage) {
        message = this.field.requiredMessage;
      }
    }

    if (!message && this.field.fsValidate) {
      if (typeof(this.field.fsValidate) !== 'function') {
        throw new Error(`fsValidate defined on ${this.field.key} is not a function?`);
      }
      let result = this.field.fsValidate(new FormStateValidation(this.getValue(), this.field.label), this.stateContext, this.field);
      if (typeof(result) === 'string') {
        message = result;
      } else {
        message = result && result._message;
      }
    }
    else if (!message && this.field.validate) {
      let f = this.field.validate, msgs = this.field.validationMessages;
      if (typeof(f) === 'string') { f = [f]; }
      if (typeof(msgs) === 'string') { msgs = [msgs]; }
      if (Array.isArray(f)) {
        for(let i = 0, len = f.length; i < len; i++) {
          let validationName = f[i],
            params = [];

          if (Array.isArray(validationName)) {
            params = validationName.slice(1);
            validationName = validationName[0];
          }

          let g = FormState.lookupValidation(validationName);
          if (g) {
            message = this.callRegisteredValidationFunction(g, params);
          } else {
            throw new Error('no validation function registered as ' + validationName);
          }
          if (message) {
            if (Array.isArray(msgs)) {
              if (typeof(msgs[i]) === 'string') {
                message = msgs[i];
              }
            }
            break;
          }
        }
      } else {
        message = this.callValidationFunction(f);
      }
    }

    if (message) { return this.setInvalid(message); } // else
    return this.setValid();
  }

  setValid(message) { return this.setProps(this.getValue(), 1, message); }
  setInvalid(message) { return this.setProps(this.getValue(), 2, message); }
  setValidating(message) {
    let asyncToken = generateQuickGuid();
    this.setProps(this.getValue(), 3, message, asyncToken, true);
    return asyncToken; // thinking this is more valuable than chaining
  }
  showMessage() {
    // i don't think chaining adds any value to this method. can always change it later.
    if (exists(this.getMessage()) && !this.isMessageVisible()) { // prevents unnecessary rendering
      this.setProps(this.getValue(), this.getValidity(), this.getMessage(), this.getAsyncToken(), true);
    }
  }

}

//
// FormState
//

export class FormState {

  static setRequired(f) {
    if (typeof(f) !== 'function') { throw new Error('registering a required function that is not a function?'); }
    this.required = f;
  }

  static registerValidation(name, f) {
    if (typeof(f) !== 'function') { throw new Error('registering a validation function that is not a function?'); }
    this.validators[name] = f;
    FormStateValidation.prototype[name] = function() {
      if (!this._message) {
        this._message = f(this.value, this.label, ...arguments);
        if (this._message) {
          this.canOverrideMessage = true;
        }
      } else {
        this.canOverrideMessage = false;
      }
      return this;
    }
  }

  static unregisterValidation(name) {
    delete this.validators[name];
    delete FormStateValidation.prototype[name];
  }

  static lookupValidation(name) {
    return this.validators[name];
  }

  static createValidator(value, label) {
    return new FormStateValidation(value, label);
  }

  constructor(form) {
    this.form = form;
    this.path = null;
    this.rootFormState = this;
    this.fields = [];
  }


  createFormState(name) {
    let formState = new FormState(this.form);
    formState.path = this.buildKey(name);
    formState.rootFormState = this.rootFormState;
    formState.fields = undefined;
    return formState;
  }


  isInvalid(visibleMessagesOnly) {
    return anyFieldState(this.form.state, x => x.isInvalid() && (!visibleMessagesOnly || x.isMessageVisible()));
  }


  isValidating() {
    return anyFieldState(this.form.state, fieldState => fieldState.isValidating());
  }


  buildKey(name) {
    return prefix(this.path, name);
  }


  getRootFields() {
    return this.rootFormState.fields;
  }


  getFieldState(fieldOrName, asyncToken, stateContext) {
    let field = findFieldByFieldOrName(this, fieldOrName),
      key = field ? field.key : this.buildKey(fieldOrName),
      _fieldState = _getFieldState(this.form.state, key),
      noCoercion = field && field.noCoercion;

    // todo: how to get modelProp?
    // if (!_fieldState || _fieldState.isDeleted && modelProp) {
    //   _fieldState = { value: modelProp[field ? field.name : fieldOrName] };
    // }

    // if you inject a model and this is the first time we are using an injected value
    if (_fieldState && !_fieldState.isDeleted && !_fieldState.isCoerced) {
      if (!exists(_fieldState.value) && field && Array.isArray(field.defaultValue)) {
        // if injected model.value is null and you are providing the value to, say, a select-multiple
        // note that you can use 'preferNull' to reverse this upon model generation
        _fieldState = { value: [] };
      } else {
        _fieldState = { value: noCoercion ? _fieldState.value : coerceToString(_fieldState.value) };
      }
    }

    // if no model injected and this is the first time pulling a value
    if (!_fieldState || _fieldState.isDeleted) {
      let defaultValue = field && field.defaultValue;
      _fieldState = { value: noCoercion ? defaultValue : coerceToString(defaultValue) };
    }

    if (asyncToken && _fieldState.asyncToken !== asyncToken) {
      return null;
    } else {
      return new FieldState(_fieldState, key, field, false, stateContext);
    }
  }


  isDeleted(name) {
    let _fieldState = _getFieldState(this.form.state, this.buildKey(name));
    return Boolean(_fieldState && _fieldState.isDeleted);
  }


  createUnitOfWork() {
    return new UnitOfWork(this);
  }


  clearFields() {
    if (this === this.rootFormState) {
      this.fields.length = 0;
    }
  }


  onUpdate(f) {
    if (typeof(f) !== 'function') { throw new Error('adding an update callback that is not a function?'); }
    if (this !== this.rootFormState) { throw new Error('cannot add an update callback to nested form state'); }
    this.updateCallback = f;
  }

}

FormState.required = function(value) {
  if (typeof(value) !== 'string' || value.trim() === '') { return 'Required field'; }
}

FormState.validators = {};


//
// UnitOfWork
//

class UnitOfWork {

  //
  // "private"
  //

  constructor(formState) {
    this.formState = formState;
    this.stateUpdates = {};
  }


  recursiveCreateModel(fields, model) {
    let isModelValid = true;

    for (let i = 0, len = fields.length; i < len; i++) {
      let value, field = fields[i];

      if (field.fields || field.array) { // nested object
        if (field.fields) {
          value = {};
        } else {
          value = [];
        }

        let formState = this.formState;
        this.formState = formState.createFormState(field.name);
        if (!this.recursiveCreateModel(field.fields || field.array, value)) {
          isModelValid = false;
        }
        this.formState = formState;
      }
      else {
        let fieldState = this.getFieldState(field);

        if (!fieldState.isValidated() || field.revalidateOnSubmit) { fieldState.validate(); }
        fieldState.showMessage();
        if (!fieldState.isValid()) { isModelValid = false; }
        if (!isModelValid) { continue; } // else

        value = fieldState.getValue();

        if (field.intConvert) {
          value = Array.isArray(value) ? value.map(x => parseInt(x)) : parseInt(value);
        }

        if (typeof(value) === 'string') {
          if (!field.noTrim) {
            value = value.trim();
          }
          if (field.preferNull && value === '') {
            value = null;
          }
        }
      }

      if (field.preferNull) {
        if (Array.isArray(value)) {
          if (value.length === 0) { value = null; }
        } else if (isObject(value)) {
          if (Object.keys(value).length === 0) { value = null; }
        }
      }

      if (Array.isArray(model)) {
        model.push(value);
      } else {
        model[field.name] = value;
      }
    }

    return isModelValid;
  }

  //
  // public
  //

  getFieldState(fieldOrName, asyncToken) {
    let field = findFieldByFieldOrName(this.formState, fieldOrName),
      key = field ? field.key : this.formState.buildKey(fieldOrName),
      _fieldState = _getFieldState(this.stateUpdates, key);

    if (_fieldState) {
      return new FieldState(_fieldState, key, field, true, this);
    } else {
      return this.formState.getFieldState(field ? field : fieldOrName, asyncToken, this);
    }
  }


  updateFormState(additionalUpdates) {
    if (additionalUpdates) {
      this.formState.form.setState(Object.assign(this.stateUpdates, additionalUpdates));
    } else if (Object.keys(this.stateUpdates).length > 0) {
      this.formState.form.setState(this.stateUpdates);
    }
  }


  add(name, value) {
    if (isObject(value)) {
      let formState = this.formState;
      this.formState = formState.createFormState(name);
      this.injectModel(value);
      this.formState = formState;
    }

    // at this point there is no way to know how an array value will be used by the jsx.
    // will it be for a FormArray or for a select-multiple or checkbox group?
    // to cover either case, add an additional fieldState record for array values below.
    // understand that the jsx will define the model that gets generated,
    // so the extraneous fieldState entries should be harmless since they won't be referenced.
    // that is, assuming isInvalid() is sufficient wrt the api...
    // if formState.isValid() becomes necessary this could be problematic.

    if (!isObject(value) || Array.isArray(value)) {
      let _fieldState = { value: value };
      _setFieldState(this.stateUpdates, this.formState.buildKey(name), _fieldState);
    }

    return this.stateUpdates; // for transforming form state in form component constructor
  }


  remove(name) {
    let key = this.formState.buildKey(name);

    _setFieldState(this.stateUpdates, key, { isDeleted: true });

    // remove the whole branch

    let keyDot = key + '.';

    iterateKeys(this.formState.form.state, key => {
      if (key.startsWith(keyDot)) {
        _setFieldState(this.stateUpdates, key, { isDeleted: true });
      }
    });
  }


  injectModel(model) {
    model = model || {};

    if (typeof(model) !== 'object') {
      throw new Error('injectModel only accepts object types (including arrays)');
    }

    // a place to hold deleted status and validation messages
    _setFieldState(this.stateUpdates, this.formState.path || '', {});

    if (Array.isArray(model)) {
      for (let i = 0, len = model.length; i < len; i++) {
        this.add(i.toString(), model[i]);
      }
    }
    else {
      let names = Object.keys(model);

      for (let i = 0, len = names.length; i < len; i++) {
        let name = names[i];
        this.add(name, model[name]);
      }
    }

    return this.stateUpdates;
  }


  createModel(noUpdate) {
    if (this.formState !== this.formState.rootFormState) {
      throw new Error('createModel should only be called on root form state.');
    }

    let model = {},
      isModelValid = this.recursiveCreateModel(this.formState.getRootFields(), model);

    if (isModelValid) { return model; } // else

    if (!noUpdate) { this.updateFormState(); }
    return null;
  }
}

//
// FormStateValidation
//

class FormStateValidation {

  constructor(value, label) {
    this.value = value;
    this.label = label;
    this.canOverrideMessage = false;
  }

  message(messageOverride) {
    if (typeof(messageOverride) === 'string' && messageOverride.trim() !== '' && this.canOverrideMessage) {
      this._message = messageOverride;
    }
    this.canOverrideMessage = false;
    return this;
  }

  msg(messageOverride) {
    return this.message(messageOverride);
  }

}
