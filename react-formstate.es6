import React, { Component } from 'react';

// "backlog"
// name='contacts[0][address][line1]'

//
// private functions, local to module
//

const FORM_STATE_PREFIX = 'formState.';

function prefix(path, name) {
  if (name === undefined) {
    return FORM_STATE_PREFIX + path;
  }
  if (name === '') {
    return path || '';
  }
  return path ? path + '.' + name : name;
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
  if (Array.isArray(v)) { return v.map(x => !exists(x) ? x : (typeof(x) === 'object' ? x : x.toString())); } // else
  return v.toString();
}

function changeHandler(formState, field, e) {
  let context = formState.createUnitOfWork(),
    fieldState = context.getFieldState(field),
    value = fieldState.getValue(); // temporarily set to previous value

  if (field.handlerBindFunction) {
    if (typeof(field.handlerBindFunction) !== 'function') { throw new Error('you specified a handlerBindFunction that is not a function?'); }
    value = field.handlerBindFunction(e);
  } else {
    if (!exists(e) || !exists(e.target) || !exists(e.target.type)) { throw new Error(`you are using a non-standard html input for field ${field.key} - please override the framework generated change handler or specify a handlerBindFunction prop. see the documentation for more details.`); }
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
  }

  fieldState.setValue(value).validate();

  if (formState.root().updateCallback) {
    // accessing internals... clean this up?
    context.formState = formState.root();
    formState.root().updateCallback(context, field.key);
  } else {
    context.updateFormState();
  }
}

function simpleChangeHandler(formState, field, value) {
  let context = formState.createUnitOfWork(),
    fieldState = context.getFieldState(field);

  fieldState.setValue(value).validate();

  if (formState.root().updateCallback) {
    // accessing internals... clean this up?
    context.formState = formState.root();
    formState.root().updateCallback(context, field.key);
  } else {
    context.updateFormState();
  }
}

function blurHandler(formState, field) {
  const context = formState.createUnitOfWork(),
    fieldState = context.getFieldState(field);

  if (formState.ensureValidationOnBlur() && !fieldState.isValidated()) {
    fieldState.validate();
  }

  // TODO: possibly show messages on anything in formState where isValidated && !isMessageVisible
  // for validation that validates multiple fields when one field changes.
  // usually you can get away with resetting validation status on the other fields.
  // but a use case might come up where you might want this proposed behavior.
  // context.showMessages()?

  fieldState.showMessage();
  context.updateFormState();
}


//
// Form
//

export class Form extends Component {
  render() {
    let { formState, model, ...otherProps } = this.props;

    return React.createElement(
      'form',
      otherProps,
      React.createElement(FormObject, {formState: formState, model: model}, this.props.children)
    );
  }
}


//
// FormObject
//

export class FormObject extends Component {

  constructor(props) {
    super(props);

    if (this.props.nestedForm) {
      let nestedProps = this.props.nestedForm.props;
      this.formState = nestedProps.formState;
      this.validationComponent = this.props.nestedForm;
      this.labelPrefix = nestedProps.labelPrefix;

      if (nestedProps.formExtension) {
        this.formExtension = true;
      }

      if (exists(this.props.nestedForm.state)) {
        console.log('warning: nested react-formstate components should not manage their own state.');
      }
    } else {
      this.formState = this.props.formState;
      this.validationComponent = this.props.validationComponent || this.formState.form;
      this.labelPrefix = this.props.labelPrefix;

      this.formState.injectModelProp(this.props.model); // will only apply to root form state
    }

    this.addProps = this.addProps.bind(this);
  }


  render() {
    // to support dynamic removal, upon render, rebuild the field definitions
    if (!this.formExtension) {
      this.formState.clearFields();
    }

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
      props = this.createFieldProps(child);
    }
    else if (exists(child.props.formObject) || exists(child.props.formArray)) {
      props = this.createObjectProps(
        exists(child.props.formObject) ? child.props.formObject : child.props.formArray,
        child.props,
        exists(child.props.formArray)
      );
      this.formState = props.formState;
    }
    else if (exists(child.props.formExtension)) {
      props = this.createExtensionProps(child.props);
    }
    else if (child.type === FormObject || child.type === FormArray) {
      if (!exists(child.props.name)) { throw new Error('a FormObject or FormArray element nested within the same render function should have a "name" property'); }
      props = this.createObjectProps(child.props.name, child.props, child.type === FormArray);
      // let the child FormObject/FormArray create the appropriate props for its children
      return React.cloneElement(child, props, child.props.children);
    }
    else if (child.type === FormExtension) {
      throw new Error('a FormExtension element should not be nested within a Form, FormObject, or FormArray element in the same render function');
    }

    let result = React.cloneElement(
      child,
      props,
      child.props.children && React.Children.map(child.props.children, this.addProps)
    );

    this.formState = formState;

    return result;
  }


  createObjectProps(normalizedName, props, isArray) {
    normalizedName = normalizedName.toString();

    let formState = this.formState,
      key = formState.buildKey(normalizedName),
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
      formState: formState.createFormState(normalizedName),
      validationComponent: this.validationComponent, // ignored by a nested COMPONENT
      labelPrefix: (this.labelPrefix || '') + (props.labelPrefix || '')
    };

    // this was a waste of time. react.cloneElement merges props. it doesn't replace them.
    //
    // let { name, formObject, formArray, labelPrefix, preferNull, ...newProps } = props;
    // newProps.formState = formState.createFormState(normalizedName);
    // newProps.validationComponent = this.validationComponent; // ignored by a nested COMPONENT
    // newProps.labelPrefix = (this.labelPrefix || '') + (props.labelPrefix || '');
    // return newProps;
  }


  createExtensionProps(props) {
    return {
      formState: this.formState,
      labelPrefix: (this.labelPrefix || '') + (props.labelPrefix || '')
    };
  }


  createFieldProps(child) {

    const props = child.props;

    // this was a waste of time. react.cloneElement merges props. it doesn't replace them.
    // let {formField,label,required,validate,etc,...newProps} = props;

    let fieldName = props.formField.toString(),
      formState = this.formState,
      key = formState.buildKey(fieldName),
      field = findField(formState.getRootFields(), key);

    if (!field.initialized) {
      field.initialized = true;
      field.label = (this.labelPrefix || '') + (props.label || '');
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
      if (exists(props.noCoercion)) {
        field.noCoercion = Boolean(props.noCoercion);
      } else {
        // you can add noCoercion to the component so you don't have to specify every time it's used.
        field.noCoercion = Boolean(child.type && child.type.rfsNoCoercion);
      }
      field.fsValidate = props.fsValidate || props.fsv;
      if (!field.fsValidate) {
        let f = this.validationComponent['fsValidate' + capitalize(field.name)];
        if (f) { field.fsValidate = f; }
      }
      field.validationMessages = props.validationMessages || props.msgs;
      field.revalidateOnSubmit = Boolean(props.revalidateOnSubmit);

      if (typeof(props.noCoercion) === 'function') {
        field.handlerBindFunction = props.noCoercion; // deprecated
      } else {
        field.handlerBindFunction = props.handlerBindFunction; // deprecated
      }
    }

    return {
      label: field.label,
      fieldState: formState.getFieldState(field), // read-only
      updateFormState: props.updateFormState || changeHandler.bind(null, formState, field), // deprecated
      handleValueChange: props.handleValueChange || simpleChangeHandler.bind(null, formState, field),
      showValidationMessage: props.showValidationMessage || blurHandler.bind(null, formState, field),
      formState: this.formState
    };
  }

}

//
// FormArray
//

export class FormArray extends FormObject {}

//
// FormExtension
//

export class FormExtension extends FormObject {}

//
// FieldState
//

class FieldState {

  //
  //
  // "private"
  //
  //

  constructor(_fieldState, key, field, stateContext) {
    this.fieldState = _fieldState;
    this.key = key;
    this.field = field;
    this.stateContext = stateContext;
  }

  assertCanUpdate() {
    if (!this.stateContext) { throw new Error('Cannot update a read-only field state'); }
    // should have gotten this through getFieldState, and if the persisted fieldState was deleted, it would have returned a new, empty fieldState instead.
    if (this.isDeleted()) { throw new Error('Cannot update a deleted field state.'); }
  }

  getValidity() {
    return this.fieldState.validity;
  }

  getAsyncToken() {
    return this.fieldState.asyncToken;
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

  delete() {
    this.assertCanUpdate();
    Object.keys(this.fieldState).forEach(k => delete this.fieldState[k]);
    this.fieldState.isModified = true;
    this.fieldState.isDeleted = true;
  }

  //
  //
  // public
  //
  //

  validate() {
    // if there is no input for this fieldstate don't bother validating
    // you might be managing form state such that the inputs are dynamically shown or hidden based on that form state
    if (!this.field) {
      return this;
    }

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

    if (message) { return this.setInvalid(message); }
    // else
    if (this.isValid() || this.isInvalid()) { return this; } // user used fieldState API in validation block, do not wipe what they did.
    // else
    return this.setValid();
  }

  equals(fieldState) { // deprecated
    // this turned out to be overly simplistic in terms of preventing unnecessary renders.
    // the calculation ultimately will depend on that nature of the specific input component and all its features.
    return false;
    // validity?
    // if (fieldState.getMessage() !== this.getMessage()) { return false; } // else
    // if (fieldState.isMessageVisible() !== this.isMessageVisible()) { return false; } // else
    // let a = fieldState.getValue(), b = this.getValue();
    // if (!Array.isArray(a)) { return a === b; } // else
    // return a.length === b.length && a.every((v,i) => v === b[i]);
  }

  get(name) { return this.fieldState[name]; }

  getKey() { return this.key; }
  getName() { return this.field && this.field.name; }

  getValue() {
    let value = this.fieldState.value;

    if (this.field && this.field.noCoercion) {
      return value;
    }

    if (!exists(value) && this.field && Array.isArray(this.field.defaultValue)) {
      // if injected model.value is null and you are providing the value to, say, a select-multiple
      // note that you can use 'preferNull' to reverse this upon model generation
      return [];
    }

    return coerceToString(value);
  }

  getUncoercedValue() { return this.fieldState.value; }
  getMessage() { return this.fieldState.message; }

  isCoerced() { return false; } // deprecated
  isValidated() { return exists(this.fieldState.validity); }
  isValid() { return this.fieldState.validity === 1 }
  isInvalid() { return this.fieldState.validity === 2; }
  isValidating() { return this.fieldState.validity === 3; }
  isUploading() { return this.fieldState.validity === 4; }
  isDeleted() { return Boolean(this.fieldState.isDeleted); }
  isMessageVisible() { return Boolean(this.fieldState.isMessageVisible); }

  getField() { return this.field; }

  //
  // set value
  // should wipe the entire field state
  //

  setValue(value) {
    if (this.fieldState.isModified) { throw new Error('setting value on a modified field state? if you are changing the value do that first'); }
    this.assertCanUpdate();
    Object.keys(this.fieldState).forEach(k => delete this.fieldState[k]);
    this.fieldState.isModified = true;
    this.fieldState.value = value;
    return this;
  }
  setCoercedValue(value) { return this.setValue(value); } // deprecated

  //
  // set validity
  // preserve custom properites? best guess is yes.
  //

  setValidity(validity, message) {
    this.assertCanUpdate();
    this.fieldState.isModified = true;
    this.fieldState.validity = validity;
    this.fieldState.message = message;
    return this;
  }

  setValid(message) { return this.setValidity(1, message); }
  setInvalid(message) { return this.setValidity(2, message);  }
  setValidating(message) {
    this.setValidity(3, message);
    this.fieldState.asyncToken = generateQuickGuid();
    return this.fieldState.asyncToken; // in retrospect i wish i had used a custom property for asyncToken... but not worth a breaking change.
  }
  setUploading(message) { return this.setValidity(4, message); }

  //
  // show message
  // preserve custom properties
  //

  showMessage() {
    this.assertCanUpdate();
    if (!this.isMessageVisible()) { // prevents unnecessary calls to setState
      this.fieldState.isModified = true;
      this.fieldState.isMessageVisible = true;
    }
    return this;
  }

  //
  // set custom property
  // preserve custom properties
  //

  set(name, value) {
    this.assertCanUpdate();
    this.fieldState.isModified = true;
    this.fieldState[name] = value;
    return this;
  }

  // when you hit submit the message gets wiped by validation. use setValid instead.
  // setMessage(message) { ...nevermind }

}

//
// FormState
//

export class FormState {

  static setShowMessageOnBlur(value) {
    this.showOnBlur = exists(value) ? value : true;
  }

  static showMessageOnBlur() {
    return Boolean(this.showOnBlur);
  }

  static setEnsureValidationOnBlur(value) {
    this.validateOnBlur = exists(value) ? value : true;
  }

  static ensureValidationOnBlur() {
    return Boolean(this.validateOnBlur);
  }

  static setShowMessageOnSubmit(value) {
    this.showOnSubmit = exists(value) ? value : true;
  }

  static showMessageOnSubmit() {
    return Boolean(this.showOnSubmit);
  }

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
    this.anyFieldState = (f) => anyFieldState(this.form.state, f);
  }


  createFormState(name) {
    let formState = new FormState(this.form);
    formState.path = this.buildKey(name);
    formState.rootFormState = this.rootFormState;
    formState.fields = undefined;
    return formState;
  }


  root() {
    return this.rootFormState;
  }


  setShowMessageOnBlur(value) {
    this.showOnBlur = exists(value) ? value : true;
  }

  showMessageOnBlur() {
    const root = this.root();
    return exists(root.showOnBlur) ? root.showOnBlur : root.constructor.showMessageOnBlur();
  }

  setShowMessageOnSubmit(value) {
    this.showOnSubmit = exists(value) ? value : true;
  }

  showMessageOnSubmit() {
    const root = this.root();
    return exists(root.showOnSubmit) ? root.showOnSubmit : root.constructor.showMessageOnSubmit();
  }

  setEnsureValidationOnBlur(value) {
    this.validateOnBlur = exists(value) ? value : true;
  }

  ensureValidationOnBlur() {
    const root = this.root();
    return exists(root.validateOnBlur) ? root.validateOnBlur : root.constructor.ensureValidationOnBlur();
  }


  injectModel(model, doNotFlatten) {
    return this.createUnitOfWork().injectModel(model, doNotFlatten);
  }


  inject(state, model, doNotFlatten) {
    new UnitOfWork(this, state).injectModel(model, doNotFlatten);
  }


  add(state, name, value, doNotFlatten) { // deprecated
    this.injectField(state, name, value, doNotFlatten);
  }


  injectField(state, name, value, doNotFlatten) {
    new UnitOfWork(this, state).injectField(name, value, doNotFlatten);
  }


  remove(state, name) {
    new UnitOfWork(this, state).remove(name);
  }

  isInvalid(visibleMessagesOnly) {
    var visibleOnly = this.showMessageOnBlur() || this.showMessageOnSubmit();
    if (exists(visibleMessagesOnly)) {
      visibleOnly = visibleMessagesOnly;
    }
    return this.anyFieldState(fi => fi.isInvalid() && (!visibleOnly || fi.isMessageVisible()));
  }


  isValidating(visibleMessagesOnly) {
    return this.anyFieldState(fi => fi.isValidating() && (!visibleMessagesOnly || fi.isMessageVisible()));
  }


  isUploading() {
    return this.anyFieldState(fi => fi.isUploading());
  }


  buildKey(name) {
    return prefix(this.path, name);
  }


  getRootFields() {
    return this.root().fields;
  }


  getFieldState(fieldOrName) {
    let field = findFieldByFieldOrName(this, fieldOrName),
      key = field ? field.key : this.buildKey(fieldOrName),
      _fieldState = (this.form && this.form.state) ? _getFieldState(this.form.state, key) : null;

    // if model prop provided to root FormObject
    // decided not to replace a deleted fieldState here, hopefully that's the right call
    if (!_fieldState && this.root().flatModel) {
      _fieldState = _getFieldState(this.root().flatModel, key);
    }

    if (!_fieldState || _fieldState.isDeleted) {
      _fieldState = { value: null }; // would {} have been a better choice?

      if (field && (field.defaultValue !== undefined)) {
        _fieldState.value = field.defaultValue;
      }
    }

    return new FieldState(_fieldState, key, field);
  }


  get(name) {
    return this.getFieldState(name).getValue();
  }


  getu(name) {
    return this.getFieldState(name).getUncoercedValue();
  }


  isDeleted(name) {
    let _fieldState = _getFieldState(this.form.state, this.buildKey(name));
    return Boolean(_fieldState && _fieldState.isDeleted);
  }


  createUnitOfWork() {
    return new UnitOfWork(this);
  }


  clearFields() {
    if (this === this.root()) {
      this.fields.length = 0;
    }
  }


  onUpdate(f) {
    if (typeof(f) !== 'function') { throw new Error('adding an update callback that is not a function?'); }
    if (this !== this.root()) { throw new Error('cannot add an update callback to nested form state'); }
    this.updateCallback = f;
  }


  injectModelProp(model) {
    if (this === this.root()) {
      if (!this.flatModel) { // one-time only
        if (isObject(model)) {
          if (isObject(this.form.state) && Object.keys(this.form.state).some(k => k.startsWith(FORM_STATE_PREFIX))) {
            console.log('warning: react-formstate: a model prop was provided to the root FormObject element even though a model was injected in the constructor?');
          }
          this.flatModel = this.createUnitOfWork().injectModel(model);
        } else {
          this.flatModel = {};
        }
      }
    }
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

  constructor(formState, state) {
    this.formState = formState;
    this.stateUpdates = state || {};
  }


  _injectModel(model, doNotFlatten) {
    model = model || {};

    if (typeof(model) !== 'object') {
      throw new Error('injectModel only accepts object types (including arrays)');
    }

    // at this point there is no way to know how an array value will be used by the jsx.
    // will it be for a FormArray or for a select-multiple or checkbox group?
    // to cover either case, add an additional fieldState record for array values below.
    // understand that the jsx will define the model that gets generated,
    // so the extraneous fieldState entries should be harmless since they won't be referenced.
    // that is, assuming isInvalid() is sufficient wrt the api...
    // if formState.isValid() becomes necessary this could be problematic.
    //
    // object values also stored, for instance, react-datepicker uses a 'moment' data type.

    const fi = this.getFieldState('');
    fi.setValue(model);

    if (doNotFlatten) {
      return;
    }

    // else

    if (Array.isArray(model)) {
      for (let i = 0, len = model.length; i < len; i++) {
        this.injectField(i.toString(), model[i]);
      }
    }
    else {
      Object.keys(model).forEach(name => this.injectField(name, model[name]));
    }
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

    const result = _fieldState ?
      new FieldState(_fieldState, key, field, this) :
      this.formState.getFieldState(field ? field : fieldOrName);

    if (asyncToken && result.getAsyncToken() !== asyncToken) { return null; }

    if (!_fieldState) {
      result.stateContext = this;
      result.fieldState = {...result.fieldState, isModified: false};
      _setFieldState(this.stateUpdates, key, result.fieldState);
    }

    return result;
  }


  get(name) {
    return this.getFieldState(name).getValue();
  }


  getu(name) {
    return this.getFieldState(name).getUncoercedValue();
  }


  set(name, value) {
    return this.getFieldState(name).setValue(value);
  }


  setc(name, value) { // deprecated
    return this.set(name, value);
  }


  getUpdates(resetContext) {
    const updates = {};

    Object.keys(this.stateUpdates).forEach(k => {
      const fi = this.stateUpdates[k];
      if (fi.isModified) {
        const fiClone = {...fi};
        delete fiClone['isModified'];
        updates[k] = fiClone;
      }
      if (resetContext) { fi.isModified = false; }
    });

    return updates;
  }


  updateFormState(additionalUpdates) {
    const updates = this.getUpdates(true);

    if (additionalUpdates) {
      this.formState.form.setState(Object.assign(updates, additionalUpdates));
    }
    else if (Object.keys(updates).length > 0) {
      this.formState.form.setState(updates);
    }
  }


  injectModel(model, doNotFlatten) {
    this._injectModel(model, doNotFlatten);
    return this.getUpdates(false); // this is wasteful, but reverse compatible
  }


  add(name, value, doNotFlatten) { // deprecated. 'injectField' is preferable.
    this.injectField(name, value, doNotFlatten);
    return this.getUpdates(false); // this is wasteful, but reverse compatible.
  }


  injectField(name, value, doNotFlatten) {
    if (isObject(value)) {
      let formState = this.formState;
      this.formState = formState.createFormState(name);
      this._injectModel(value, doNotFlatten);
      this.formState = formState;
    }
    else {
      const fi = this.getFieldState(name);
      fi.setValue(value);
    }
  }


  remove(name) {
    let fi = this.getFieldState(name);
    fi.delete();

    // remove the whole branch
    const contextBranch = this.formState.buildKey('');
    const amtToSlice = contextBranch.length > 0 ? contextBranch.length + 1 : 0;

    let key = this.formState.buildKey(name);
    let keyDot = key + '.';

    iterateKeys(this.formState.form.state, key => {
      if (key.startsWith(keyDot)) {
        // have to transform the absolute path to something relative to the context's path.
        // there's probably a better way to code this... might involve rejiggering getFieldState somehow.
        fi = this.getFieldState(key.slice(amtToSlice));
        fi.delete();
      }
    });
  }



  createModel(noUpdate) {
    if (this.formState !== this.formState.root()) {
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
