'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FormState = exports.FormExtension = exports.FormArray = exports.FormObject = exports.Form = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function _objectWithoutProperties(obj, keys) { var target = {}; for (var i in obj) { if (keys.indexOf(i) >= 0) continue; if (!Object.prototype.hasOwnProperty.call(obj, i)) continue; target[i] = obj[i]; } return target; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

// "backlog"
// name='contacts[0][address][line1]'

//
// private functions, local to module
//

var FORM_STATE_PREFIX = 'formState.';

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
      return !exists(x) ? x : (typeof x === 'undefined' ? 'undefined' : _typeof(x)) === 'object' ? x : x.toString();
    });
  } // else
  return v.toString();
}

function changeHandler(formState, field, e) {
  var context = formState.createUnitOfWork(),
      fieldState = context.getFieldState(field),
      value = fieldState.getValue(); // temporarily set to previous value

  if (field.handlerBindFunction) {
    if (typeof field.handlerBindFunction !== 'function') {
      throw new Error('you specified a handlerBindFunction that is not a function?');
    }
    value = field.handlerBindFunction(e);
  } else {
    if (!exists(e) || !exists(e.target) || !exists(e.target.type)) {
      throw new Error('you are using a non-standard html input for field ' + field.key + ' - please override the framework generated change handler or specify a handlerBindFunction prop. see the documentation for more details.');
    }
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
  var context = formState.createUnitOfWork(),
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
  var context = formState.createUnitOfWork(),
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

var Form = exports.Form = function (_Component) {
  _inherits(Form, _Component);

  function Form() {
    _classCallCheck(this, Form);

    return _possibleConstructorReturn(this, (Form.__proto__ || Object.getPrototypeOf(Form)).apply(this, arguments));
  }

  _createClass(Form, [{
    key: 'render',
    value: function render() {
      var _props = this.props,
          formState = _props.formState,
          model = _props.model,
          otherProps = _objectWithoutProperties(_props, ['formState', 'model']);

      return _react2.default.createElement('form', otherProps, _react2.default.createElement(FormObject, { formState: formState, model: model }, this.props.children));
    }
  }]);

  return Form;
}(_react.Component);

//
// FormObject
//

var FormObject = exports.FormObject = function (_Component2) {
  _inherits(FormObject, _Component2);

  function FormObject(props) {
    _classCallCheck(this, FormObject);

    var _this2 = _possibleConstructorReturn(this, (FormObject.__proto__ || Object.getPrototypeOf(FormObject)).call(this, props));

    if (_this2.props.nestedForm) {
      var nestedProps = _this2.props.nestedForm.props;
      _this2.formState = nestedProps.formState;
      _this2.validationComponent = _this2.props.nestedForm;
      _this2.labelPrefix = nestedProps.labelPrefix;

      if (nestedProps.formExtension) {
        _this2.formExtension = true;
      }

      if (exists(_this2.props.nestedForm.state)) {
        console.log('warning: nested react-formstate components should not manage their own state.');
      }
    } else {
      _this2.formState = _this2.props.formState;
      _this2.validationComponent = _this2.props.validationComponent || _this2.formState.form;
      _this2.labelPrefix = _this2.props.labelPrefix;

      _this2.formState.injectModelProp(_this2.props.model); // will only apply to root form state
    }

    _this2.addProps = _this2.addProps.bind(_this2);
    return _this2;
  }

  _createClass(FormObject, [{
    key: 'render',
    value: function render() {
      // to support dynamic removal, upon render, rebuild the field definitions
      if (!this.formExtension) {
        this.formState.clearFields();
      }

      var props = null;
      if (typeof this.props.className === 'string' && this.props.className.trim() !== '') {
        props = { className: this.props.className };
      }

      return _react2.default.createElement('div', props, _react2.default.Children.map(this.props.children, this.addProps));
    }
  }, {
    key: 'addProps',
    value: function addProps(child) {
      if (!child || !child.props) {
        return child;
      } // else

      var props = null,
          formState = this.formState,
          swallowProps = false;

      if (exists(child.props.formField)) {
        swallowProps = true;
        props = this.createFieldProps(child);
      } else if (exists(child.props.formObject) || exists(child.props.formArray)) {
        props = this.createObjectProps(exists(child.props.formObject) ? child.props.formObject : child.props.formArray, child.props, exists(child.props.formArray));
        this.formState = props.formState;
      } else if (exists(child.props.formExtension)) {
        props = this.createExtensionProps(child.props);
      } else if (child.type === FormObject || child.type === FormArray) {
        if (!exists(child.props.name)) {
          throw new Error('a FormObject or FormArray element nested within the same render function should have a "name" property');
        }
        props = this.createObjectProps(child.props.name, child.props, child.type === FormArray);
        // let the child FormObject/FormArray create the appropriate props for its children
        return _react2.default.cloneElement(child, props, child.props.children);
      } else if (child.type === FormExtension) {
        throw new Error('a FormExtension element should not be nested within a Form, FormObject, or FormArray element in the same render function');
      }

      var result = null;

      if (swallowProps) {

        var computedProps = {};

        conditionallyAddProps(child.props, computedProps);
        conditionallyAddProps(props, computedProps);

        if (child.key) {
          computedProps.key = child.key;
        }
        if (child.ref) {
          computedProps.ref = child.ref;
        }

        result = _react2.default.createElement(child.type, computedProps, child.props.children && _react2.default.Children.map(child.props.children, this.addProps));
      } else {
        result = _react2.default.cloneElement(child, props, child.props.children && _react2.default.Children.map(child.props.children, this.addProps));
      }

      this.formState = formState;

      return result;
    }
  }, {
    key: 'createObjectProps',
    value: function createObjectProps(normalizedName, props, isArray) {
      normalizedName = normalizedName.toString();

      var formState = this.formState,
          key = formState.buildKey(normalizedName),
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
        formState: formState.createFormState(normalizedName),
        validationComponent: this.validationComponent, // ignored by a nested COMPONENT
        labelPrefix: (this.labelPrefix || '') + (props.labelPrefix || '')
      };
    }
  }, {
    key: 'createExtensionProps',
    value: function createExtensionProps(props) {
      return {
        formState: this.formState,
        labelPrefix: (this.labelPrefix || '') + (props.labelPrefix || '')
      };
    }
  }, {
    key: 'createFieldProps',
    value: function createFieldProps(child) {

      var props = child.props;

      var fieldName = props.formField.toString(),
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
        if (exists(props.noCoercion)) {
          field.noCoercion = Boolean(props.noCoercion);
        } else {
          // you can add noCoercion to the component so you don't have to specify every time it's used.
          field.noCoercion = Boolean(child.type && child.type.rfsNoCoercion);
        }
        field.fsValidate = props.fsValidate || props.fsv;
        if (!field.fsValidate) {
          var _f = this.validationComponent['fsValidate' + capitalize(field.name)];
          if (_f) {
            field.fsValidate = _f;
          }
        }
        field.validationMessages = props.validationMessages || props.msgs;
        field.revalidateOnSubmit = Boolean(props.revalidateOnSubmit);

        if (typeof props.noCoercion === 'function') {
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
  }]);

  return FormObject;
}(_react.Component);

//
// FormArray
//

var FormArray = exports.FormArray = function (_FormObject) {
  _inherits(FormArray, _FormObject);

  function FormArray() {
    _classCallCheck(this, FormArray);

    return _possibleConstructorReturn(this, (FormArray.__proto__ || Object.getPrototypeOf(FormArray)).apply(this, arguments));
  }

  return FormArray;
}(FormObject);

//
// FormExtension
//

var FormExtension = exports.FormExtension = function (_FormObject2) {
  _inherits(FormExtension, _FormObject2);

  function FormExtension() {
    _classCallCheck(this, FormExtension);

    return _possibleConstructorReturn(this, (FormExtension.__proto__ || Object.getPrototypeOf(FormExtension)).apply(this, arguments));
  }

  return FormExtension;
}(FormObject);

//
// FieldState
//

var FieldState = function () {

  //
  //
  // "private"
  //
  //

  function FieldState(_fieldState, key, field, stateContext) {
    _classCallCheck(this, FieldState);

    this.fieldState = _fieldState;
    this.key = key;
    this.field = field;
    this.stateContext = stateContext;
  }

  _createClass(FieldState, [{
    key: 'assertCanUpdate',
    value: function assertCanUpdate() {
      if (!this.stateContext) {
        throw new Error('Cannot update a read-only field state');
      }
      // should have gotten this through getFieldState, and if the persisted fieldState was deleted, it would have returned a new, empty fieldState instead.
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
  }, {
    key: 'delete',
    value: function _delete() {
      var _this5 = this;

      this.assertCanUpdate();
      Object.keys(this.fieldState).forEach(function (k) {
        return delete _this5.fieldState[k];
      });
      this.fieldState.isModified = true;
      this.fieldState.isDeleted = true;
    }

    //
    //
    // public
    //
    //

  }, {
    key: 'validate',
    value: function validate() {
      // if there is no input for this fieldstate don't bother validating
      // you might be managing form state such that the inputs are dynamically shown or hidden based on that form state
      if (!this.field) {
        return this;
      }

      this.assertCanUpdate();

      if (this.field.validate && this.field.fsValidate) {
        console.log('warning: both validate and fsValidate defined on ' + this.field.key + '. fsValidate will be used.');
      }

      var message = void 0;
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
      }
      // else
      if (this.isValid() || this.isInvalid()) {
        return this;
      } // user used fieldState API in validation block, do not wipe what they did.
      // else
      return this.setValid();
    }
  }, {
    key: 'equals',
    value: function equals(fieldState) {
      // deprecated
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
  }, {
    key: 'get',
    value: function get(name) {
      return this.fieldState[name];
    }
  }, {
    key: 'getKey',
    value: function getKey() {
      return this.key;
    }
  }, {
    key: 'getName',
    value: function getName() {
      return this.field && this.field.name;
    }
  }, {
    key: 'getValue',
    value: function getValue() {
      var value = this.fieldState.value;

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
  }, {
    key: 'getUncoercedValue',
    value: function getUncoercedValue() {
      return this.fieldState.value;
    }
  }, {
    key: 'getMessage',
    value: function getMessage() {
      return this.fieldState.message;
    }
  }, {
    key: 'isCoerced',
    value: function isCoerced() {
      return false;
    } // deprecated

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
    key: 'isUploading',
    value: function isUploading() {
      return this.fieldState.validity === 4;
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

    //
    // set value
    // should wipe the entire field state
    //

  }, {
    key: 'setValue',
    value: function setValue(value) {
      var _this6 = this;

      if (this.fieldState.isModified) {
        throw new Error('setting value on a modified field state? if you are changing the value do that first');
      }
      this.assertCanUpdate();
      Object.keys(this.fieldState).forEach(function (k) {
        return delete _this6.fieldState[k];
      });
      this.fieldState.isModified = true;
      this.fieldState.value = value;
      return this;
    }
  }, {
    key: 'setCoercedValue',
    value: function setCoercedValue(value) {
      return this.setValue(value);
    } // deprecated

    //
    // set validity
    // preserve custom properites? best guess is yes.
    //

  }, {
    key: 'setValidity',
    value: function setValidity(validity, message) {
      this.assertCanUpdate();
      this.fieldState.isModified = true;
      this.fieldState.validity = validity;
      this.fieldState.message = message;
      return this;
    }
  }, {
    key: 'setValid',
    value: function setValid(message) {
      return this.setValidity(1, message);
    }
  }, {
    key: 'setInvalid',
    value: function setInvalid(message) {
      return this.setValidity(2, message);
    }
  }, {
    key: 'setValidating',
    value: function setValidating(message) {
      this.setValidity(3, message);
      this.fieldState.asyncToken = generateQuickGuid();
      return this.fieldState.asyncToken; // in retrospect i wish i had used a custom property for asyncToken... but not worth a breaking change.
    }
  }, {
    key: 'setUploading',
    value: function setUploading(message) {
      return this.setValidity(4, message);
    }

    //
    // show message
    // preserve custom properties
    //

  }, {
    key: 'showMessage',
    value: function showMessage() {
      this.assertCanUpdate();
      if (!this.isMessageVisible()) {
        // prevents unnecessary calls to setState
        this.fieldState.isModified = true;
        this.fieldState.isMessageVisible = true;
      }
      return this;
    }

    //
    // set custom property
    // preserve custom properties
    //

  }, {
    key: 'set',
    value: function set(name, value) {
      this.assertCanUpdate();
      this.fieldState.isModified = true;
      this.fieldState[name] = value;
      return this;
    }

    // when you hit submit the message gets wiped by validation. use setValid instead.
    // setMessage(message) { ...nevermind }

  }]);

  return FieldState;
}();

//
// FormState
//

var FormState = exports.FormState = function () {
  _createClass(FormState, null, [{
    key: 'setShowMessageOnBlur',
    value: function setShowMessageOnBlur(value) {
      this.showOnBlur = exists(value) ? value : true;
    }
  }, {
    key: 'showMessageOnBlur',
    value: function showMessageOnBlur() {
      return Boolean(this.showOnBlur);
    }
  }, {
    key: 'setEnsureValidationOnBlur',
    value: function setEnsureValidationOnBlur(value) {
      this.validateOnBlur = exists(value) ? value : true;
    }
  }, {
    key: 'ensureValidationOnBlur',
    value: function ensureValidationOnBlur() {
      return Boolean(this.validateOnBlur);
    }
  }, {
    key: 'setShowMessageOnSubmit',
    value: function setShowMessageOnSubmit(value) {
      this.showOnSubmit = exists(value) ? value : true;
    }
  }, {
    key: 'showMessageOnSubmit',
    value: function showMessageOnSubmit() {
      return Boolean(this.showOnSubmit);
    }
  }, {
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
    var _this7 = this;

    _classCallCheck(this, FormState);

    this.form = form;
    this.path = null;
    this.rootFormState = this;
    this.fields = [];
    this.anyFieldState = function (f) {
      return anyFieldState(_this7.form.state, f);
    };
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
    key: 'root',
    value: function root() {
      return this.rootFormState;
    }
  }, {
    key: 'setShowMessageOnBlur',
    value: function setShowMessageOnBlur(value) {
      this.showOnBlur = exists(value) ? value : true;
    }
  }, {
    key: 'showMessageOnBlur',
    value: function showMessageOnBlur() {
      var root = this.root();
      return exists(root.showOnBlur) ? root.showOnBlur : root.constructor.showMessageOnBlur();
    }
  }, {
    key: 'setShowMessageOnSubmit',
    value: function setShowMessageOnSubmit(value) {
      this.showOnSubmit = exists(value) ? value : true;
    }
  }, {
    key: 'showMessageOnSubmit',
    value: function showMessageOnSubmit() {
      var root = this.root();
      return exists(root.showOnSubmit) ? root.showOnSubmit : root.constructor.showMessageOnSubmit();
    }
  }, {
    key: 'setEnsureValidationOnBlur',
    value: function setEnsureValidationOnBlur(value) {
      this.validateOnBlur = exists(value) ? value : true;
    }
  }, {
    key: 'ensureValidationOnBlur',
    value: function ensureValidationOnBlur() {
      var root = this.root();
      return exists(root.validateOnBlur) ? root.validateOnBlur : root.constructor.ensureValidationOnBlur();
    }
  }, {
    key: 'injectModel',
    value: function injectModel(model, doNotFlatten) {
      return this.createUnitOfWork().injectModel(model, doNotFlatten);
    }
  }, {
    key: 'inject',
    value: function inject(state, model, doNotFlatten) {
      new UnitOfWork(this, state).injectModel(model, doNotFlatten);
    }
  }, {
    key: 'add',
    value: function add(state, name, value, doNotFlatten) {
      // deprecated
      this.injectField(state, name, value, doNotFlatten);
    }
  }, {
    key: 'injectField',
    value: function injectField(state, name, value, doNotFlatten) {
      new UnitOfWork(this, state).injectField(name, value, doNotFlatten);
    }
  }, {
    key: 'remove',
    value: function remove(state, name) {
      new UnitOfWork(this, state).remove(name);
    }
  }, {
    key: 'isInvalid',
    value: function isInvalid(visibleMessagesOnly) {
      var visibleOnly = this.showMessageOnBlur() || this.showMessageOnSubmit();
      if (exists(visibleMessagesOnly)) {
        visibleOnly = visibleMessagesOnly;
      }
      return this.anyFieldState(function (fi) {
        return fi.isInvalid() && (!visibleOnly || fi.isMessageVisible());
      });
    }
  }, {
    key: 'isValidating',
    value: function isValidating(visibleMessagesOnly) {
      return this.anyFieldState(function (fi) {
        return fi.isValidating() && (!visibleMessagesOnly || fi.isMessageVisible());
      });
    }
  }, {
    key: 'isUploading',
    value: function isUploading() {
      return this.anyFieldState(function (fi) {
        return fi.isUploading();
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
      return this.root().fields;
    }
  }, {
    key: 'getFieldState',
    value: function getFieldState(fieldOrName) {
      var field = findFieldByFieldOrName(this, fieldOrName),
          key = field ? field.key : this.buildKey(fieldOrName),
          _fieldState = this.form && this.form.state ? _getFieldState(this.form.state, key) : null;

      // if model prop provided to root FormObject
      // decided not to replace a deleted fieldState here, hopefully that's the right call
      if (!_fieldState && this.root().flatModel) {
        _fieldState = _getFieldState(this.root().flatModel, key);
      }

      if (!_fieldState || _fieldState.isDeleted) {
        _fieldState = {};

        if (field && field.defaultValue !== undefined) {
          _fieldState.value = field.defaultValue;
        }
      }

      return new FieldState(_fieldState, key, field);
    }
  }, {
    key: 'get',
    value: function get(name) {
      return this.getFieldState(name).getValue();
    }
  }, {
    key: 'getu',
    value: function getu(name) {
      return this.getFieldState(name).getUncoercedValue();
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
      if (this === this.root()) {
        this.fields.length = 0;
      }
    }
  }, {
    key: 'onUpdate',
    value: function onUpdate(f) {
      if (typeof f !== 'function') {
        throw new Error('adding an update callback that is not a function?');
      }
      if (this !== this.root()) {
        throw new Error('cannot add an update callback to nested form state');
      }
      this.updateCallback = f;
    }
  }, {
    key: 'injectModelProp',
    value: function injectModelProp(model) {
      if (this === this.root()) {
        if (!this.flatModel) {
          // one-time only
          if (isObject(model)) {
            if (isObject(this.form.state) && Object.keys(this.form.state).some(function (k) {
              return k.startsWith(FORM_STATE_PREFIX);
            })) {
              console.log('warning: react-formstate: a model prop was provided to the root FormObject element even though a model was injected in the constructor?');
            }
            this.flatModel = this.createUnitOfWork().injectModel(model);
          } else {
            this.flatModel = {};
          }
        }
      }
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

  function UnitOfWork(formState, state) {
    _classCallCheck(this, UnitOfWork);

    this.formState = formState;
    this.stateUpdates = state || {};
  }

  _createClass(UnitOfWork, [{
    key: '_injectModel',
    value: function _injectModel(model, doNotFlatten) {
      var _this8 = this;

      model = model || {};

      if ((typeof model === 'undefined' ? 'undefined' : _typeof(model)) !== 'object') {
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

      var fi = this.getFieldState('');
      fi.setValue(model);

      if (doNotFlatten) {
        return;
      }

      // else

      if (Array.isArray(model)) {
        for (var i = 0, len = model.length; i < len; i++) {
          this.injectField(i.toString(), model[i]);
        }
      } else {
        Object.keys(model).forEach(function (name) {
          return _this8.injectField(name, model[name]);
        });
      }
    }
  }, {
    key: 'recursiveCreateModel',
    value: function recursiveCreateModel(fields, model) {
      var isModelValid = true;

      for (var i = 0, len = fields.length; i < len; i++) {
        var value = void 0,
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

      var result = _fieldState ? new FieldState(_fieldState, key, field, this) : this.formState.getFieldState(field ? field : fieldOrName);

      if (asyncToken && result.getAsyncToken() !== asyncToken) {
        return null;
      }

      if (!_fieldState) {
        result.stateContext = this;
        result.fieldState = _extends({}, result.fieldState, { isModified: false });
        _setFieldState(this.stateUpdates, key, result.fieldState);
      }

      return result;
    }
  }, {
    key: 'get',
    value: function get(name) {
      return this.getFieldState(name).getValue();
    }
  }, {
    key: 'getu',
    value: function getu(name) {
      return this.getFieldState(name).getUncoercedValue();
    }
  }, {
    key: 'set',
    value: function set(name, value) {
      return this.getFieldState(name).setValue(value);
    }
  }, {
    key: 'setc',
    value: function setc(name, value) {
      // deprecated
      return this.set(name, value);
    }
  }, {
    key: 'getUpdates',
    value: function getUpdates(resetContext) {
      var _this9 = this;

      var updates = {};

      Object.keys(this.stateUpdates).forEach(function (k) {
        var fi = _this9.stateUpdates[k];
        if (fi.isModified) {
          var fiClone = _extends({}, fi);
          delete fiClone['isModified'];
          updates[k] = fiClone;
        }
        if (resetContext) {
          fi.isModified = false;
        }
      });

      return updates;
    }
  }, {
    key: 'updateFormState',
    value: function updateFormState(additionalUpdates) {
      var updates = this.getUpdates(true);

      if (additionalUpdates) {
        this.formState.form.setState(Object.assign(updates, additionalUpdates));
      } else if (Object.keys(updates).length > 0) {
        this.formState.form.setState(updates);
      }
    }
  }, {
    key: 'injectModel',
    value: function injectModel(model, doNotFlatten) {
      this._injectModel(model, doNotFlatten);
      return this.getUpdates(false); // this is wasteful, but reverse compatible
    }
  }, {
    key: 'add',
    value: function add(name, value, doNotFlatten) {
      // deprecated. 'injectField' is preferable.
      this.injectField(name, value, doNotFlatten);
      return this.getUpdates(false); // this is wasteful, but reverse compatible.
    }
  }, {
    key: 'injectField',
    value: function injectField(name, value, doNotFlatten) {
      if (isObject(value)) {
        var formState = this.formState;
        this.formState = formState.createFormState(name);
        this._injectModel(value, doNotFlatten);
        this.formState = formState;
      } else {
        var fi = this.getFieldState(name);
        fi.setValue(value);
      }
    }
  }, {
    key: 'remove',
    value: function remove(name) {
      var _this10 = this;

      var fi = this.getFieldState(name);
      fi.delete();

      // remove the whole branch
      var contextBranch = this.formState.buildKey('');
      var amtToSlice = contextBranch.length > 0 ? contextBranch.length + 1 : 0;

      var key = this.formState.buildKey(name);
      var keyDot = key + '.';

      iterateKeys(this.formState.form.state, function (key) {
        if (key.startsWith(keyDot)) {
          // have to transform the absolute path to something relative to the context's path.
          // there's probably a better way to code this... might involve rejiggering getFieldState somehow.
          fi = _this10.getFieldState(key.slice(amtToSlice));
          fi.delete();
        }
      });
    }
  }, {
    key: 'createModel',
    value: function createModel(noUpdate) {
      if (this.formState !== this.formState.root()) {
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

//
// rfsProps
//

FormState.rfsProps = {
  formState: { suppress: false },
  fieldState: { suppress: false },
  handleValueChange: { suppress: false },
  showValidationMessage: { suppress: false },
  required: { suppress: false },
  label: { suppress: false },
  updateFormState: { suppress: false }, // deprecated ... reverse compatibility
  // suppressed
  formField: { suppress: true },
  validate: { suppress: true },
  fsValidate: { suppress: true },
  fsv: { suppress: true },
  noTrim: { suppress: true },
  preferNull: { suppress: true },
  intConvert: { suppress: true },
  defaultValue: { suppress: true },
  noCoercion: { suppress: true },
  revalidateOnSubmit: { suppress: true },
  handlerBindFunction: { suppress: true },
  validationMessages: { suppress: true },
  msgs: { suppress: true }
};

function conditionallyAddProps(source, dest) {
  Object.keys(source).forEach(function (k) {
    var propSpec = FormState.rfsProps[k];
    if (!propSpec || !propSpec.suppress) {
      dest[k] = source[k];
    }
  });
}
