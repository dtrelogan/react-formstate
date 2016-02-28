'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.FormState = exports.FormArray = exports.FormObject = undefined;

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

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

function isDefined(v) {
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
      objectField = { key: key, name: fieldnames[i], fields: [], initialized: false };
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
  if (isDefined(fieldOrName.name)) {
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
  if (!isDefined(v)) {
    return '';
  } // else
  if (v === true || v === false) {
    return v;
  } // else
  if (Array.isArray(v)) {
    return v.map(function (x) {
      return isDefined(x) ? x.toString() : x;
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
        console.log('warning: select-multiple expected?');
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
        throw 'error: select-multiple without defaultValue={[]} specified';
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
// FormObject
//

var FormObject = exports.FormObject = function (_React$Component) {
  _inherits(FormObject, _React$Component);

  function FormObject(props) {
    _classCallCheck(this, FormObject);

    var _this = _possibleConstructorReturn(this, Object.getPrototypeOf(FormObject).call(this, props));

    if (_this.props.nestedForm) {
      var nestedProps = _this.props.nestedForm.props;
      _this.formState = nestedProps.formState;
      _this.validationComponent = _this.props.nestedForm;
      _this.labelPrefix = nestedProps.labelPrefix;
    } else {
      _this.formState = _this.props.formState;
      _this.validationComponent = _this.props.validationComponent || _this.formState.form;
      _this.labelPrefix = _this.props.labelPrefix;
    }
    return _this;
  }

  _createClass(FormObject, [{
    key: 'render',
    value: function render() {
      // to support dynamic removal, upon render, rebuild the field definitions
      this.formState.clearFields();

      return _react2.default.createElement('div', null, _react2.default.Children.map(this.props.children, this.addProps.bind(this)));
    }
  }, {
    key: 'addProps',
    value: function addProps(child) {
      if (!child || !child.props) {
        return child;
      } // else

      var props = null,
          formState = this.formState;

      if (isDefined(child.props.formField)) {
        props = this.createFieldProps(child.props);
      } else if (isDefined(child.props.formObject) || isDefined(child.props.formArray)) {
        props = this.createObjectProps(isDefined(child.props.formObject) ? child.props.formObject : child.props.formArray, child.props, isDefined(child.props.formArray));
        this.formState = props.formState;
      } else if (child.type === FormObject || child.type === FormArray) {
        if (!isDefined(child.props.name)) {
          throw 'error: a FormObject or FormArray element nested within the same render function should have a "name" property';
        }
        props = this.createObjectProps(child.props.name, child.props, child.type === FormArray);
        // let the child FormObject/FormArray create the appropriate props for its children
        return _react2.default.cloneElement(child, props, child.props.children);
      }

      var result = _react2.default.cloneElement(child, props, child.props.children && _react2.default.Children.map(child.props.children, this.addProps.bind(this)));

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
        field.required = Boolean(props.required);
        if (props.validate) {
          field.validate = props.validate;
        } else {
          var f = this.validationComponent['validate' + capitalize(field.name)];
          if (f) {
            field.validate = f.bind(this.validationComponent);
          }
        }
        field.noTrim = Boolean(props.noTrim);
        field.preferNull = Boolean(props.preferNull);
        field.intConvert = Boolean(props.intConvert);
        if (isDefined(props.defaultValue)) {
          field.defaultValue = props.defaultValue;
        }
        field.noCoercion = Boolean(props.noCoercion);
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
        throw 'Cannot update a read-only field state';
      }
      if (this.isDeleted()) {
        throw 'Cannot update a deleted field state.';
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
      throw 'error: validation provided for ' + this.getKey() + ' is not a function?';
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
      return isDefined(this.fieldState.validity);
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
        throw 'error: setting value on a modified field state? if you are changing the value do that first';
      }
      return this.setProps(value);
    }
  }, {
    key: 'validate',
    value: function validate() {
      this.assertCanUpdate();
      var message = undefined;
      if (this.field.required) {
        message = this.callRegisteredValidationFunction(FormState.required, []);
      }
      if (!message && this.field.validate) {
        var f = this.field.validate;
        if (typeof f === 'string') {
          f = [f];
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
              throw 'error: no validation function registered as ' + validationName;
            }
            if (message) {
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
      if (isDefined(this.getMessage())) {
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
      this.required = f;
    }
  }, {
    key: 'registerValidation',
    value: function registerValidation(name, f) {
      if (typeof f !== 'function') {
        throw 'error: trying to register a validation function that is not a function?';
      }
      this.validators[name] = f;
    }
  }, {
    key: 'unregisterValidation',
    value: function unregisterValidation(name) {
      delete this.validators[name];
    }
  }, {
    key: 'lookupValidation',
    value: function lookupValidation(name) {
      return this.validators[name];
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

      if (_fieldState && !_fieldState.isCoerced) {
        if (!isDefined(_fieldState.value) && field && Array.isArray(field.defaultValue)) {
          _fieldState = { value: [] };
        } else {
          _fieldState = { value: noCoercion ? _fieldState.value : coerceToString(_fieldState.value) };
        }
      }

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
      return _fieldState && _fieldState.isDeleted;
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
        throw 'error: trying to add an update callback that is not a function?';
      }
      if (this !== this.rootFormState) {
        throw 'error: cannot add an update callback to nested form state';
      }
      this.updateCallback = f;
    }
  }]);

  return FormState;
}();

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

          if (!fieldState.isValidated()) {
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
      var key = this.formState.buildKey(name);

      _setFieldState(this.stateUpdates, key, { isDeleted: true });

      // remove the whole branch

      var keyDot = key + '.';

      iterateKeys(this.formState.form.state, function (key) {
        if (key.startsWith(keyDot)) {
          _setFieldState(this.stateUpdates, key, { isDeleted: true });
        }
      }.bind(this));
    }
  }, {
    key: 'injectModel',
    value: function injectModel(model) {
      // a place to hold deleted status and validation messages
      _setFieldState(this.stateUpdates, this.formState.path || '', {});

      if (Array.isArray(model)) {
        for (var i = 0, len = model.length; i < len; i++) {
          this.add(i.toString(), model[i]);
        }
      } else {
        var names = Object.keys(model || {});

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

FormState.required = function (value) {
  if (value.trim() === '') {
    return 'Required field';
  }
};

FormState.validators = {};
