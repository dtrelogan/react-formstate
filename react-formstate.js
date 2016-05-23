'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FormState = exports.FormArray = exports.FormObject = exports.Form = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

//
// private functions, local to module
//

var FORM_STATE_PREFIX = 'formState.';

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
  var fields = rootFields,
      fieldnames = key.split('.'),
      len = fieldnames.length;

  var _loop = function _loop(i) {
    var objectField = fields.find(function (x) {
      return x.name === fieldnames[i];
    });
    if (!objectField) {
      if (readOnly) {
        return {
          v: null
        };
      }
      objectField = { key: fieldnames.slice(0, i + 1).join('.'), name: fieldnames[i], fields: [], initialized: false };
      fields.push(objectField);
    }
    fields = objectField.fields || objectField.array;
  };

  for (var i = 0; i < len - 1; i++) {
    var _ret = _loop(i);

    if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
  }

  var field = fields.find(function (x) {
    return x.name === fieldnames[len - 1];
  });
  if (!field) {
    if (readOnly) {
      return null;
    }
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
  var keys = Object.keys(state);
  for (var i = 0, len = keys.length; i < len; i++) {
    var key = keys[i];
    if (key.startsWith(FORM_STATE_PREFIX)) {
      if (f(key.replace(FORM_STATE_PREFIX, ''))) {
        break;
      }
    }
  }
}

function iterateFieldStates(state, f) {
  iterateKeys(state, function (key) {
    var fieldState = new FieldState(_getFieldState(state, key), key);
    if (!fieldState.isDeleted()) {
      return f(fieldState);
    }
  });
}

function anyFieldState(state, f) {
  var result = false;
  iterateFieldStates(state, function (fieldState) {
    if (f(fieldState)) {
      result = true;
      return true; // stop iterating
    }
  });
  return result;
}

function isObject(v) {
  return v !== null && (typeof v === 'undefined' ? 'undefined' : _typeof(v)) === 'object';
}

function coerceToString(v) {
  if (!exists(v)) {
    return '';
  } // else
  if (v === true || v === false) {
    return v;
  } // else
  if (Array.isArray(v)) {
    return v.map(function (x) {
      return exists(x) ? x.toString() : x;
    });
  } // else
  return v.toString();
}

function changeHandler(formState, field, e) {
  var context = formState.createUnitOfWork(),
      fieldState = context.getFieldState(field),
      value = fieldState.getValue(); // temporarily set to previous value

  if (Array.isArray(value)) {
    if (e.target.type === 'checkbox') {
      // checkbox group
      if (e.target.checked) {
        value = value.slice(0); // copy the existing array
        if (!value.some(function (x) {
          return x === e.target.value;
        })) {
          value.push(e.target.value);
          value.sort();
        }
      } else {
        value = value.filter(function (x) {
          return x !== e.target.value;
        });
      }
    } else {
      // select-multiple
      if (e.target.type !== 'select-multiple') {
        throw new Error('only select-multiple and checkbox group supported for array value types. you will need to override the framework event handler or request an enhancement');
      }
      value = [];
      var options = e.target.options;
      for (var i = 0, len = options.length; i < len; i++) {
        if (options[i].selected) {
          value.push(options[i].value);
        }
      }
    }
  } else {
    if (e.target.type === 'checkbox') {
      value = e.target.checked;
    } else {
      // note that select-one and radio group work like every other input in this regard
      if (e.target.type === 'select-multiple') {
        throw new Error('a select-multiple input must have defaultValue={[]} specified');
      }
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
  var context = formState.createUnitOfWork(),
      fieldState = context.getFieldState(field);

  fieldState.showMessage();
  context.updateFormState();
}

//
// Form
//

var Form = exports.Form = function (_React$Component) {
  _inherits(Form, _React$Component);

  function Form() {
    _classCallCheck(this, Form);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(Form).apply(this, arguments));
  }

  _createClass(Form, [{
    key: 'render',
    value: function render() {
      var _props = this.props;
      var formState = _props.formState;

      var otherProps = _objectWithoutProperties(_props, ['formState']);

      return _react2.default.createElement('form', otherProps, _react2.default.createElement(FormObject, { formState: formState }, this.props.children));
    }
  }]);

  return Form;
}(_react2.default.Component);

//
// FormObject
//

var FormObject = exports.FormObject = function (_React$Component2) {
  _inherits(FormObject, _React$Component2);

  function FormObject(props) {
    _classCallCheck(this, FormObject);

    var _this2 = _possibleConstructorReturn(this, Object.getPrototypeOf(FormObject).call(this, props));

    if (_this2.props.nestedForm) {
      var nestedProps = _this2.props.nestedForm.props;
      _this2.formState = nestedProps.formState;
      _this2.validationComponent = _this2.props.nestedForm;
      _this2.labelPrefix = nestedProps.labelPrefix;
    } else {
      _this2.formState = _this2.props.formState;
      _this2.validationComponent = _this2.props.validationComponent || _this2.formState.form;
      _this2.labelPrefix = _this2.props.labelPrefix;
    }

    _this2.addProps = _this2.addProps.bind(_this2);
    return _this2;
  }

  _createClass(FormObject, [{
    key: 'render',
    value: function render() {
      // to support dynamic removal, upon render, rebuild the field definitions
      this.formState.clearFields();

      return _react2.default.createElement('div', null, _react2.default.Children.map(this.props.children, this.addProps));
    }
  }, {
    key: 'addProps',
    value: function addProps(child) {
      if (!child || !child.props) {
        return child;
      } // else

      var props = null,
          formState = this.formState;

      if (exists(child.props.formField)) {
        props = this.createFieldProps(child.props);
      } else if (exists(child.props.formObject) || exists(child.props.formArray)) {
        props = this.createObjectProps(exists(child.props.formObject) ? child.props.formObject : child.props.formArray, child.props, exists(child.props.formArray));
        this.formState = props.formState;
      } else if (child.type === FormObject || child.type === FormArray) {
        if (!exists(child.props.name)) {
          throw new Error('a FormObject or FormArray element nested within the same render function should have a "name" property');
        }
        props = this.createObjectProps(child.props.name, child.props, child.type === FormArray);
        // let the child FormObject/FormArray create the appropriate props for its children
        return _react2.default.cloneElement(child, props, child.props.children);
      }

      var result = _react2.default.cloneElement(child, props, child.props.children && _react2.default.Children.map(child.props.children, this.addProps));

      this.formState = formState;

      return result;
    }
  }, {
    key: 'createObjectProps',
    value: function createObjectProps(name, props, isArray) {
      name = name.toString();

      var formState = this.formState,
          key = formState.buildKey(name),
          field = findField(formState.getRootFields(), key);

      if (!field.initialized) {
        field.initialized = true;

        if (isArray) {
          field.array = [];
        } else {
          if (!field.fields) {
            field.fields = [];
          }
        }

        field.preferNull = Boolean(props.preferNull);
      }

      return {
        formState: formState.createFormState(name),
        validationComponent: this.validationComponent, // ignored by a nested COMPONENT
        labelPrefix: (this.labelPrefix || '') + (props.labelPrefix || '')
      };
    }
  }, {
    key: 'createFieldProps',
    value: function createFieldProps(props) {
      var name = props.formField.toString();

      var formState = this.formState,
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
        if (field.required && typeof props.required === 'string' && props.required.length > 0) {
          field.requiredMessage = props.required;
        }
        if (props.validate) {
          field.validate = props.validate;
        } else {
          var f = this.validationComponent['validate' + capitalize(field.name)];
          if (f) {
            field.validate = f;
          }
        }
        field.noTrim = Boolean(props.noTrim);
        field.preferNull = Boolean(props.preferNull);
        field.intConvert = Boolean(props.intConvert);
        if (exists(props.defaultValue)) {
          field.defaultValue = props.defaultValue;
        }
        field.noCoercion = Boolean(props.noCoercion);
        field.fsValidate = props.fsValidate || props.fsv;
        if (!field.fsValidate) {
          var f = this.validationComponent['fsValidate' + capitalize(field.name)];
          if (f) {
            field.fsValidate = f;
          }
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
  }]);

  return FormObject;
}(_react2.default.Component);

//
// FormArray
//

var FormArray = exports.FormArray = function (_FormObject) {
  _inherits(FormArray, _FormObject);

  function FormArray() {
    _classCallCheck(this, FormArray);

    return _possibleConstructorReturn(this, Object.getPrototypeOf(FormArray).apply(this, arguments));
  }

  return FormArray;
}(FormObject);

//
// FieldState
//

var FieldState = function () {

  //
  // "private"
  //

  function FieldState(_fieldState, key, field, isModified, stateContext) {
    _classCallCheck(this, FieldState);

    this.fieldState = _fieldState;
    this.key = key;
    this.field = field;
    this.isModified = isModified;
    this.stateContext = stateContext;
  }

  _createClass(FieldState, [{
    key: 'assertCanUpdate',
    value: function assertCanUpdate() {
      if (!this.stateContext) {
        throw new Error('Cannot update a read-only field state');
      }
      if (this.isDeleted()) {
        throw new Error('Cannot update a deleted field state.');
      }
    }
  }, {
    key: 'getValidity',
    value: function getValidity() {
      return this.fieldState.validity;
    }
  }, {
    key: 'getAsyncToken',
    value: function getAsyncToken() {
      return this.fieldState.asyncToken;
    }
  }, {
    key: 'setProps',
    value: function setProps(value, validity, message, asyncToken, isMessageVisible) {
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
  }, {
    key: 'callValidationFunction',
    value: function callValidationFunction(f) {
      if (typeof f === 'function') {
        return f(this.getValue(), this.stateContext, this.field);
      } // else
      throw new Error('validation provided for ' + this.getKey() + ' is not a function?');
    }
  }, {
    key: 'callRegisteredValidationFunction',
    value: function callRegisteredValidationFunction(f, params) {
      return f.apply(undefined, [this.getValue(), this.field.label].concat(_toConsumableArray(params)));
    }

    //
    // public
    //

  }, {
    key: 'equals',
    value: function equals(fieldState) {
      if (fieldState.getMessage() !== this.getMessage()) {
        return false;
      } // else
      if (fieldState.isMessageVisible() !== this.isMessageVisible()) {
        return false;
      } // else
      var a = fieldState.getValue(),
          b = this.getValue();
      if (!Array.isArray(a)) {
        return a === b;
      } // else
      return a.length === b.length && a.every(function (v, i) {
        return v === b[i];
      });
    }
  }, {
    key: 'getKey',
    value: function getKey() {
      return this.key;
    }
  }, {
    key: 'getValue',
    value: function getValue() {
      return this.fieldState.value;
    }
  }, {
    key: 'getMessage',
    value: function getMessage() {
      return this.fieldState.message;
    }
  }, {
    key: 'isValidated',
    value: function isValidated() {
      return exists(this.fieldState.validity);
    }
  }, {
    key: 'isValid',
    value: function isValid() {
      return this.fieldState.validity === 1;
    }
  }, {
    key: 'isInvalid',
    value: function isInvalid() {
      return this.fieldState.validity === 2;
    }
  }, {
    key: 'isValidating',
    value: function isValidating() {
      return this.fieldState.validity === 3;
    }
  }, {
    key: 'isDeleted',
    value: function isDeleted() {
      return Boolean(this.fieldState.isDeleted);
    }
  }, {
    key: 'isMessageVisible',
    value: function isMessageVisible() {
      return Boolean(this.fieldState.isMessageVisible);
    }
  }, {
    key: 'getField',
    value: function getField() {
      return this.field;
    }
  }, {
    key: 'setValue',
    value: function setValue(value) {
      if (this.isModified) {
        throw new Error('setting value on a modified field state? if you are changing the value do that first');
      }
      return this.setProps(value);
    }
  }, {
    key: 'validate',
    value: function validate() {
      this.assertCanUpdate();

      if (this.field.validate && this.field.fsValidate) {
        console.log('warning: both validate and fsValidate defined on ' + this.field.key + '. fsValidate will be used.');
      }

      var message = undefined;
      if (this.field.required) {
        message = this.callRegisteredValidationFunction(FormState.required, []);
        if (message && this.field.requiredMessage) {
          message = this.field.requiredMessage;
        }
      }

      if (!message && this.field.fsValidate) {
        if (typeof this.field.fsValidate !== 'function') {
          throw new Error('fsValidate defined on ' + this.field.key + ' is not a function?');
        }
        var result = this.field.fsValidate(new FormStateValidation(this.getValue(), this.field.label), this.stateContext, this.field);
        if (typeof result === 'string') {
          message = result;
        } else {
          message = result && result._message;
        }
      } else if (!message && this.field.validate) {
        var f = this.field.validate,
            msgs = this.field.validationMessages;
        if (typeof f === 'string') {
          f = [f];
        }
        if (typeof msgs === 'string') {
          msgs = [msgs];
        }
        if (Array.isArray(f)) {
          for (var i = 0, len = f.length; i < len; i++) {
            var validationName = f[i],
                params = [];

            if (Array.isArray(validationName)) {
              params = validationName.slice(1);
              validationName = validationName[0];
            }

            var g = FormState.lookupValidation(validationName);
            if (g) {
              message = this.callRegisteredValidationFunction(g, params);
            } else {
              throw new Error('no validation function registered as ' + validationName);
            }
            if (message) {
              if (Array.isArray(msgs)) {
                if (typeof msgs[i] === 'string') {
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

      if (message) {
        return this.setInvalid(message);
      } // else
      return this.setValid();
    }
  }, {
    key: 'setValid',
    value: function setValid(message) {
      return this.setProps(this.getValue(), 1, message);
    }
  }, {
    key: 'setInvalid',
    value: function setInvalid(message) {
      return this.setProps(this.getValue(), 2, message);
    }
  }, {
    key: 'setValidating',
    value: function setValidating(message) {
      var asyncToken = generateQuickGuid();
      this.setProps(this.getValue(), 3, message, asyncToken, true);
      return asyncToken; // thinking this is more valuable than chaining
    }
  }, {
    key: 'showMessage',
    value: function showMessage() {
      // i don't think chaining adds any value to this method. can always change it later.
      if (exists(this.getMessage()) && !this.isMessageVisible()) {
        // prevents unnecessary rendering
        this.setProps(this.getValue(), this.getValidity(), this.getMessage(), this.getAsyncToken(), true);
      }
    }
  }]);

  return FieldState;
}();

//
// FormState
//

var FormState = exports.FormState = function () {
  _createClass(FormState, null, [{
    key: 'setRequired',
    value: function setRequired(f) {
      if (typeof f !== 'function') {
        throw new Error('registering a required function that is not a function?');
      }
      this.required = f;
    }
  }, {
    key: 'registerValidation',
    value: function registerValidation(name, f) {
      if (typeof f !== 'function') {
        throw new Error('registering a validation function that is not a function?');
      }
      this.validators[name] = f;
      FormStateValidation.prototype[name] = function () {
        if (!this._message) {
          this._message = f.apply(undefined, [this.value, this.label].concat(Array.prototype.slice.call(arguments)));
          if (this._message) {
            this.canOverrideMessage = true;
          }
        } else {
          this.canOverrideMessage = false;
        }
        return this;
      };
    }
  }, {
    key: 'unregisterValidation',
    value: function unregisterValidation(name) {
      delete this.validators[name];
      delete FormStateValidation.prototype[name];
    }
  }, {
    key: 'lookupValidation',
    value: function lookupValidation(name) {
      return this.validators[name];
    }
  }, {
    key: 'createValidator',
    value: function createValidator(value, label) {
      return new FormStateValidation(value, label);
    }
  }]);

  function FormState(form) {
    _classCallCheck(this, FormState);

    this.form = form;
    this.path = null;
    this.rootFormState = this;
    this.fields = [];
  }

  _createClass(FormState, [{
    key: 'createFormState',
    value: function createFormState(name) {
      var formState = new FormState(this.form);
      formState.path = this.buildKey(name);
      formState.rootFormState = this.rootFormState;
      formState.fields = undefined;
      return formState;
    }
  }, {
    key: 'isInvalid',
    value: function isInvalid(visibleMessagesOnly) {
      return anyFieldState(this.form.state, function (x) {
        return x.isInvalid() && (!visibleMessagesOnly || x.isMessageVisible());
      });
    }
  }, {
    key: 'isValidating',
    value: function isValidating() {
      return anyFieldState(this.form.state, function (fieldState) {
        return fieldState.isValidating();
      });
    }
  }, {
    key: 'buildKey',
    value: function buildKey(name) {
      return prefix(this.path, name);
    }
  }, {
    key: 'getRootFields',
    value: function getRootFields() {
      return this.rootFormState.fields;
    }
  }, {
    key: 'getFieldState',
    value: function getFieldState(fieldOrName, asyncToken, stateContext) {
      var field = findFieldByFieldOrName(this, fieldOrName),
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
        var defaultValue = field && field.defaultValue;
        _fieldState = { value: noCoercion ? defaultValue : coerceToString(defaultValue) };
      }

      if (asyncToken && _fieldState.asyncToken !== asyncToken) {
        return null;
      } else {
        return new FieldState(_fieldState, key, field, false, stateContext);
      }
    }
  }, {
    key: 'isDeleted',
    value: function isDeleted(name) {
      var _fieldState = _getFieldState(this.form.state, this.buildKey(name));
      return Boolean(_fieldState && _fieldState.isDeleted);
    }
  }, {
    key: 'createUnitOfWork',
    value: function createUnitOfWork() {
      return new UnitOfWork(this);
    }
  }, {
    key: 'clearFields',
    value: function clearFields() {
      if (this === this.rootFormState) {
        this.fields.length = 0;
      }
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate(f) {
      if (typeof f !== 'function') {
        throw new Error('adding an update callback that is not a function?');
      }
      if (this !== this.rootFormState) {
        throw new Error('cannot add an update callback to nested form state');
      }
      this.updateCallback = f;
    }
  }]);

  return FormState;
}();

FormState.required = function (value) {
  if (typeof value !== 'string' || value.trim() === '') {
    return 'Required field';
  }
};

FormState.validators = {};

//
// UnitOfWork
//

var UnitOfWork = function () {

  //
  // "private"
  //

  function UnitOfWork(formState) {
    _classCallCheck(this, UnitOfWork);

    this.formState = formState;
    this.stateUpdates = {};
  }

  _createClass(UnitOfWork, [{
    key: 'recursiveCreateModel',
    value: function recursiveCreateModel(fields, model) {
      var isModelValid = true;

      for (var i = 0, len = fields.length; i < len; i++) {
        var value = undefined,
            field = fields[i];

        if (field.fields || field.array) {
          // nested object
          if (field.fields) {
            value = {};
          } else {
            value = [];
          }

          var formState = this.formState;
          this.formState = formState.createFormState(field.name);
          if (!this.recursiveCreateModel(field.fields || field.array, value)) {
            isModelValid = false;
          }
          this.formState = formState;
        } else {
          var fieldState = this.getFieldState(field);

          if (!fieldState.isValidated() || field.revalidateOnSubmit) {
            fieldState.validate();
          }
          fieldState.showMessage();
          if (!fieldState.isValid()) {
            isModelValid = false;
          }
          if (!isModelValid) {
            continue;
          } // else

          value = fieldState.getValue();

          if (field.intConvert) {
            value = Array.isArray(value) ? value.map(function (x) {
              return parseInt(x);
            }) : parseInt(value);
          }

          if (typeof value === 'string') {
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
            if (value.length === 0) {
              value = null;
            }
          } else if (isObject(value)) {
            if (Object.keys(value).length === 0) {
              value = null;
            }
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

  }, {
    key: 'getFieldState',
    value: function getFieldState(fieldOrName, asyncToken) {
      var field = findFieldByFieldOrName(this.formState, fieldOrName),
          key = field ? field.key : this.formState.buildKey(fieldOrName),
          _fieldState = _getFieldState(this.stateUpdates, key);

      if (_fieldState) {
        return new FieldState(_fieldState, key, field, true, this);
      } else {
        return this.formState.getFieldState(field ? field : fieldOrName, asyncToken, this);
      }
    }
  }, {
    key: 'updateFormState',
    value: function updateFormState(additionalUpdates) {
      if (additionalUpdates) {
        this.formState.form.setState(Object.assign(this.stateUpdates, additionalUpdates));
      } else if (Object.keys(this.stateUpdates).length > 0) {
        this.formState.form.setState(this.stateUpdates);
      }
    }
  }, {
    key: 'add',
    value: function add(name, value) {
      if (isObject(value)) {
        var formState = this.formState;
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
        var _fieldState = { value: value };
        _setFieldState(this.stateUpdates, this.formState.buildKey(name), _fieldState);
      }

      return this.stateUpdates; // for transforming form state in form component constructor
    }
  }, {
    key: 'remove',
    value: function remove(name) {
      var _this4 = this;

      var key = this.formState.buildKey(name);

      _setFieldState(this.stateUpdates, key, { isDeleted: true });

      // remove the whole branch

      var keyDot = key + '.';

      iterateKeys(this.formState.form.state, function (key) {
        if (key.startsWith(keyDot)) {
          _setFieldState(_this4.stateUpdates, key, { isDeleted: true });
        }
      });
    }
  }, {
    key: 'injectModel',
    value: function injectModel(model) {
      model = model || {};

      if ((typeof model === 'undefined' ? 'undefined' : _typeof(model)) !== 'object') {
        throw new Error('injectModel only accepts object types (including arrays)');
      }

      // a place to hold deleted status and validation messages
      _setFieldState(this.stateUpdates, this.formState.path || '', {});

      if (Array.isArray(model)) {
        for (var i = 0, len = model.length; i < len; i++) {
          this.add(i.toString(), model[i]);
        }
      } else {
        var names = Object.keys(model);

        for (var i = 0, len = names.length; i < len; i++) {
          var name = names[i];
          this.add(name, model[name]);
        }
      }

      return this.stateUpdates;
    }
  }, {
    key: 'createModel',
    value: function createModel(noUpdate) {
      if (this.formState !== this.formState.rootFormState) {
        throw new Error('createModel should only be called on root form state.');
      }

      var model = {},
          isModelValid = this.recursiveCreateModel(this.formState.getRootFields(), model);

      if (isModelValid) {
        return model;
      } // else

      if (!noUpdate) {
        this.updateFormState();
      }
      return null;
    }
  }]);

  return UnitOfWork;
}();

//
// FormStateValidation
//

var FormStateValidation = function () {
  function FormStateValidation(value, label) {
    _classCallCheck(this, FormStateValidation);

    this.value = value;
    this.label = label;
    this.canOverrideMessage = false;
  }

  _createClass(FormStateValidation, [{
    key: 'message',
    value: function message(messageOverride) {
      if (typeof messageOverride === 'string' && messageOverride.trim() !== '' && this.canOverrideMessage) {
        this._message = messageOverride;
      }
      this.canOverrideMessage = false;
      return this;
    }
  }, {
    key: 'msg',
    value: function msg(messageOverride) {
      return this.message(messageOverride);
    }
  }]);

  return FormStateValidation;
}();
