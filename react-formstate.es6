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

  let field = fields && fields.find(x => x.name === fieldnames[len - 1]);
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

  fieldState.setBlurred();
  fieldState.showMessage(); // for backward compatibility

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

    let props = null;
    if (typeof(this.props.className) === 'string' && this.props.className.trim() !== '') {
      props = {className: this.props.className};
    }

    return React.createElement(
      'div',
      props,
      React.Children.map(this.props.children, this.addProps)
    );
  }


  addProps(child) {
    if (!child || !child.props) { return child; } // else

    let props = null, formState = this.formState, swallowProps = false;

    if (exists(child.props[formState.constructor.rfsProps.formField.name])) {
      swallowProps = true;
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

    let result = null;

    if (swallowProps) {
      result = React.createElement(
        child.type,
        this.constructor.computeFilteredProps(child, props),
        child.props.children && React.Children.map(child.props.children, this.addProps)
      );
    }
    else {
      result = React.cloneElement(
        child,
        props,
        child.props.children && React.Children.map(child.props.children, this.addProps)
      );
    }

    this.formState = formState;

    return result;
  }


  static computeFilteredProps(child, props) {
    const computedProps = {};

    conditionallyAddProps(child.props, computedProps);
    conditionallyAddProps(props, computedProps);

    if (child.key) {computedProps.key = child.key;}
    if (child.ref) {computedProps.ref = child.ref;}

    return computedProps;
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
  }


  createExtensionProps(props) {
    return {
      formState: this.formState,
      labelPrefix: (this.labelPrefix || '') + (props.labelPrefix || '')
    };
  }


  createFieldProps(child) {

    const props = child.props;

    let formState = this.formState,
      fieldName = props[formState.constructor.rfsProps.formField.name].toString(),
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
      field.fsValidate = props.fsValidate || props[formState.constructor.rfsProps.fsv.name];
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

    const showMessage = formState.getFieldState(field).isMessageVisibleOn(props.showMessageOn || formState.showingMessageOn());

    const generatedProps = {
      label: field.label,
      updateFormState: props.updateFormState || changeHandler.bind(null, formState, field), // deprecated
      formState: this.formState
    };

    const boundBlurHandler = blurHandler.bind(null, formState, field);

    generatedProps[formState.constructor.rfsProps.fieldState.name] = formState.getFieldState(field); // read-only
    generatedProps[formState.constructor.rfsProps.handleValueChange.name] = props[formState.constructor.rfsProps.handleValueChange.name] || simpleChangeHandler.bind(null, formState, field);
    generatedProps[formState.constructor.rfsProps.showValidationMessage.name] = props[formState.constructor.rfsProps.showValidationMessage.name] || boundBlurHandler;
    generatedProps[formState.constructor.rfsProps.handleBlur.name] = props[formState.constructor.rfsProps.handleBlur.name] || boundBlurHandler;
    generatedProps[formState.constructor.rfsProps.showMessage.name] = props[formState.constructor.rfsProps.showMessage.name] || showMessage;

    return generatedProps;
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

    // If you delete a fieldState and then createModelResult before calling setState,
    // you might need to update the deleted fieldState in createModelResult. This can
    // happen for instance, in the demo app, where the unsubmitted model is displayed
    // to the user upon each call to updateFormState. The fieldState is marked deleted,
    // but the field behind it isn't deleted until the subsequent render.

    // if (this.isDeleted()) { throw new Error('Cannot update a deleted field state.'); }
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
    this.fieldState.modified = true;
    this.fieldState.deleted = true;
  }

  coerce(value) {
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

  _setValue(value, isInitialValue) {
    this.assertCanUpdate();

    if (isInitialValue) {
      this.fieldState.initialValue = value;
    } else {
      this.fieldState.initialValue = this.getUncoercedInitialValue();
    }

    Object.keys(this.fieldState).forEach(k => {
      if (k !== 'initialValue') { delete this.fieldState[k]; }
    });

    this.fieldState.modified = true;
    this.fieldState.value = value;

    if (!isInitialValue) {
      this.fieldState.changed = true;
    }

    return this;
  }

  setInitialValue(value) { return this._setValue(value, true); }

  flag(flagName) {
    this.assertCanUpdate();
    if (!this.fieldState[flagName]) { // prevents unnecessary calls to setState
      this.fieldState.modified = true;
      this.fieldState[flagName] = true;
    }
    return this;
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

  getValue() { return this.coerce(this.fieldState.value); }
  getUncoercedValue() { return this.fieldState.value; }
  getInitialValue() { return this.coerce(this.getUncoercedInitialValue()); }
  getUncoercedInitialValue() {
    if (Object.keys(this.fieldState).indexOf('initialValue') !== -1) {
      return this.fieldState.initialValue;
    }
    return this.fieldState.value;
  }
  getMessage() { return this.fieldState.message; }

  isCoerced() { return false; } // deprecated
  isValidated() { return exists(this.fieldState.validity); }
  isValid() { return this.fieldState.validity === 1 }
  isInvalid() { return this.fieldState.validity === 2; }
  isValidating() { return this.fieldState.validity === 3; }
  isUploading() { return this.fieldState.validity === 4; }
  isDeleted() { return Boolean(this.fieldState.deleted); }
  isChanged() { return Boolean(this.fieldState.changed); }
  isBlurred() { return Boolean(this.fieldState.blurred); }
  isSubmitted() { return Boolean(this.fieldState.submitted); }
  isMessageVisible() { return Boolean(this.fieldState.messageVisible); }
  //isPristine() { would have to do deep compare on arrays and the like }

  isMessageVisibleOn(showMessageOn) {
    const { changed, blurred, submitted } = this.fieldState;
    if (showMessageOn === 'submit') { return Boolean(submitted); }
    if (showMessageOn === 'blur') { return Boolean(blurred || submitted); }
    return Boolean(changed || blurred || submitted);
  }

  getField() { return this.field; }

  //
  // set value
  // should wipe the entire field state
  //

  setValue(value) { return this._setValue(value, false); }
  setCoercedValue(value) { return this.setValue(value); } // deprecated

  //
  // set validity
  // preserve custom properites? best guess is yes.
  //

  setValidity(validity, message) {
    this.assertCanUpdate();
    this.fieldState.modified = true;
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

  showMessage(submitting) {
    if (!submitting) {
      // retain backward compatibility for async alternatives example.
      // (a custom blur handler with async validation still using showMessage.)
      // so that FormState.isValidating still works.
      this.flag('blurred');
    }
    return this.flag('messageVisible');
  }

  setBlurred() { return this.flag('blurred'); }
  setSubmitted() { return this.flag('submitted'); }

  //
  // set custom property
  // preserve custom properties
  //

  set(name, value) {
    this.assertCanUpdate();
    this.fieldState.modified = true;
    this.fieldState[name] = value;
    return this;
  }

  // when you hit submit the message gets wiped by validation. use setValid instead.
  // setMessage(message) { ...nevermind }

}


const _showMessageOn = (target, value) => {
  target.showOnSubmit = false;
  target.showOnBlur = false;
  target.showOnChange = false;

  if (value === 'submit') {
    target.showOnSubmit = true;
  } else if (value === 'blur') {
    target.showOnBlur = true;
  } else {
    // default to change
    target.showOnChange = true;
  }
};

const _showingMessageOn = (target) => {
  if (target.showMessageOnSubmit()) { return 'submit'; }
  if (target.showMessageOnBlur()) { return 'blur'; }
  return 'change';
}

//
// FormState
//

export class FormState {

  // change || blur || submit
  static showMessageOn(value) {
    _showMessageOn(this, value);
  }

  static showingMessageOn() {
    return _showingMessageOn(this);
  }

  // deprecated
  static showMessageOnChange() {
    return Boolean(this.showOnChange);
  }

  static showingMessageOnChange() {
    return this.showMessageOnChange();
  }

  // deprecated
  static setShowMessageOnBlur(value) {
    this.showOnBlur = exists(value) ? value : true;
  }

  // deprecated
  static showMessageOnBlur() {
    return Boolean(this.showOnBlur);
  }

  static showingMessageOnBlur() {
    return this.showMessageOnBlur();
  }

  static setEnsureValidationOnBlur(value) {
    this.validateOnBlur = exists(value) ? value : true;
  }

  static ensureValidationOnBlur() {
    return Boolean(this.validateOnBlur);
  }

  // deprecated
  static setShowMessageOnSubmit(value) {
    this.showOnSubmit = exists(value) ? value : true;
  }

  // deprecated
  static showMessageOnSubmit() {
    return Boolean(this.showOnSubmit);
  }

  static showingMessageOnSubmit() {
    return this.showMessageOnSubmit();
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

  static create(form, stateFunction, setStateFunction) {
    return new FormState(form, stateFunction, setStateFunction);
  }

  constructor(form, stateFunction, setStateFunction) {
    this.form = form;
    this.stateFunction = stateFunction;
    this.setStateFunction = setStateFunction;
    this.path = null;
    this.rootFormState = this;
    this.fields = [];
    this.anyFieldState = (f) => anyFieldState(this.getState(), f);
  }


  createFormState(name) {
    let formState = new FormState(this.form, this.stateFunction, this.setStateFunction);
    formState.path = this.buildKey(name);
    formState.rootFormState = this.rootFormState;
    formState.fields = undefined;
    return formState;
  }


  getState() {
    const state = this.stateFunction ? this.stateFunction() : (this.form && this.form.state);
    return state || {};
  }


  root() {
    return this.rootFormState;
  }


  // change || blur || submit
  showMessageOn(value) {
    _showMessageOn(this, value);
  }

  showingMessageOn() {
    return _showingMessageOn(this);
  }

  // deprecated
  showMessageOnChange() {
    const root = this.root();
    return exists(root.showOnChange) ? root.showOnChange : root.constructor.showMessageOnChange();
  }

  showingMessageOnChange() {
    return this.showMessageOnChange();
  }

  // deprecated
  setShowMessageOnBlur(value) {
    this.showOnBlur = exists(value) ? value : true;
  }

  // deprecated
  showMessageOnBlur() {
    const root = this.root();
    return exists(root.showOnBlur) ? root.showOnBlur : root.constructor.showMessageOnBlur();
  }

  showingMessageOnBlur() {
    return this.showMessageOnBlur();
  }

  // deprecated
  setShowMessageOnSubmit(value) {
    this.showOnSubmit = exists(value) ? value : true;
  }

  // deprecated
  showMessageOnSubmit() {
    const root = this.root();
    return exists(root.showOnSubmit) ? root.showOnSubmit : root.constructor.showMessageOnSubmit();
  }

  showingMessageOnSubmit() {
    return this.showMessageOnSubmit();
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


  // A better name for this function would be 'isVisiblyInvalid'
  //
  isInvalid(brokenVisibleMessagesOnlyParameter) {

    // Because of a poor choice made in the original API, if you want to see if ANY field state is invalid,
    // you now have to explicitly pass 'false' to this function. (Yuck.)

    // However, if you're interested in that behavior, 'createModel' is probably what you're after - this
    // function is typically only used to determine whether to disable the submit button.

    const visibleMessagesOnly = (
      brokenVisibleMessagesOnlyParameter !== undefined ?
      brokenVisibleMessagesOnlyParameter :
      true
    );

    return this.anyFieldState(fi => {
      const visible = fi.isMessageVisibleOn(this.showingMessageOn());
      return fi.isInvalid() && (visible || !visibleMessagesOnly);
    });
  }


  isValidating(performingAsynchronousValidationOnBlur) {
    return this.anyFieldState(fi => fi.isValidating() && (fi.isBlurred() || fi.isSubmitted() || !performingAsynchronousValidationOnBlur));
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
      _fieldState = _getFieldState(this.getState(), key);

    // if model prop provided to root FormObject
    // decided not to replace a deleted fieldState here, hopefully that's the right call
    if (!_fieldState && this.root().flatModel) {
      _fieldState = _getFieldState(this.root().flatModel, key);
    }

    if (!_fieldState || _fieldState.deleted) {
      _fieldState = {};

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
    let _fieldState = _getFieldState(this.getState(), this.buildKey(name));
    return Boolean(_fieldState && _fieldState.deleted);
  }


  createUnitOfWork(updates) {
    let clonedUpdates = undefined;

    if (isObject(updates)) {
      // copy the fieldstates to create a clean work area
      clonedUpdates = Object.keys(updates).reduce((r,k) => {
        r[k] = {...updates[k]};
        return r;
      }, {});
    }

    return new UnitOfWork(this, clonedUpdates);
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
          if (Object.keys(this.getState()).some(k => k.startsWith(FORM_STATE_PREFIX))) {
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

FormState.showOnChange = true;

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
    fi.setInitialValue(model);

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


  recursiveCreateModel(fields, model, options) {
    let isModelValid = true;

    const { doTransforms, markSubmitted } = (options || {});

    for (let i = 0, len = fields.length; i < len; i++) {
      let value, field = fields[i];

      let fieldState = this.getFieldState(field);

      if (field.fields || field.array) { // nested object
        if (field.fields) {
          value = {};
        } else {
          value = [];
        }

        let formState = this.formState;
        this.formState = formState.createFormState(field.name);
        if (!this.recursiveCreateModel(field.fields || field.array, value, options)) {
          isModelValid = false;
        }
        this.formState = formState;
      }
      else {
        if (!fieldState.isValidated() || field.revalidateOnSubmit) { fieldState.validate(); }

        if (markSubmitted) {
          fieldState.setSubmitted();
          fieldState.showMessage(true); // for backward compatibility
        }

        value = fieldState.getValue();

        if (!fieldState.isValid()) {
          isModelValid = false;
        }
        else if (doTransforms) {
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
      }

      if (doTransforms && field.preferNull) {
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
      result.fieldState = {...result.fieldState, modified: false};
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
      if (fi.modified) {
        const fiClone = {...fi};
        delete fiClone['modified'];
        updates[k] = fiClone;
      }
      if (resetContext) { fi.modified = false; }
    });

    return updates;
  }


  updateFormState(additionalUpdates) {
    const updates = Object.assign(this.getUpdates(true), additionalUpdates || {});

    if (Object.keys(updates).length > 0) {
      this.formState.setStateFunction ? this.formState.setStateFunction(updates) : this.formState.form.setState(updates);
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
      fi.setInitialValue(value);
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

    iterateKeys(this.formState.getState(), key => {
      if (key.startsWith(keyDot)) {
        // have to transform the absolute path to something relative to the context's path.
        // there's probably a better way to code this... might involve rejiggering getFieldState somehow.
        fi = this.getFieldState(key.slice(amtToSlice));
        fi.delete();
      }
    });
  }


  createModelResult(options) {
    if (this.formState !== this.formState.root()) {
      throw new Error('createModel should only be called on root form state.');
    }

    const model = {},
      isModelValid = this.recursiveCreateModel(this.formState.getRootFields(), model, options);

    return {
      model: model,
      isValid: isModelValid
    };
  }


  createModel(noUpdate) {
    const result = this.createModelResult({doTransforms: true, markSubmitted: true});

    if (result.isValid) { return result.model; } // else

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


//
// rfsProps
//

FormState.rfsProps = {
  formState: { suppress: false },
  fieldState: { suppress: false, name: 'fieldState' },
  handleValueChange: { suppress: false, name: 'handleValueChange' },
  handleBlur: { suppress: false, name: 'handleBlur' },
  showMessage: { suppress: false, name: 'showMessage' },
  required: { suppress: false },
  label: { suppress: false },
  showValidationMessage: { suppress: false, name: 'showValidationMessage' }, // deprecated ... reverse compatibility
  updateFormState: { suppress: false }, // deprecated ... reverse compatibility
  // suppressed
  formField: { suppress: true, name: 'formField' },
  validate: { suppress: true },
  fsValidate: { suppress: true },
  fsv: { suppress: true, name: 'fsv' },
  noTrim: { suppress: true },
  preferNull: { suppress: true },
  intConvert: { suppress: true },
  defaultValue: { suppress: true },
  noCoercion: { suppress: true },
  revalidateOnSubmit: { suppress: true },
  handlerBindFunction: { suppress: true },
  validationMessages: { suppress: true },
  msgs: { suppress: true },
  showMessageOn: { suppress: true }
};

function conditionallyAddProps(source, dest) {
  const rfsProps = {};
  Object.keys(FormState.rfsProps).forEach(k => {
    const propSpec = FormState.rfsProps[k];
    rfsProps[k] = propSpec;
    if (propSpec.name) {
      rfsProps[propSpec.name] = propSpec;
    }
  });
  Object.keys(source).forEach(k => {
    const propSpec = rfsProps[k];
    if (!propSpec || !propSpec.suppress) {
      dest[k] = source[k];
    }
  });
}
