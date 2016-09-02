# api

- [Field](#Field)
  - [name](#Field.name)
  - [key](#Field.key)
  - [label](#Field.label)
  - [required](#Field.required)
  - [validate](#Field.validate)
  - [noTrim](#Field.noTrim)
  - [preferNull](#Field.preferNull)
  - [intConvert](#Field.intConvert)
  - [defaultValue](#Field.defaultValue)
  - [revalidateOnSubmit](#Field.revalidateOnSubmit)
- [FieldState](#FieldState)
  - [equals](#FieldState.equals)
  - [get](#FieldState.get)
  - [getField](#FieldState.getField)
  - [getKey](#FieldState.getKey)
  - [getMessage](#FieldState.getMessage)
  - [getName](#FieldState.getName)
  - [getValue](#FieldState.getValue)
  - [getUncoercedValue](#FieldState.getUncoercedValue)
  - [isInvalid](#FieldState.isInvalid)
  - [isMessageVisible](#FieldState.isMessageVisible)
  - [isUploading](#FieldState.isUploading)
  - [isValid](#FieldState.isValid)
  - [isValidated](#FieldState.isValidated)
  - [isValidating](#FieldState.isValidating)
  - [set](#FieldState.set)
  - [setInvalid](#FieldState.setInvalid)
  - [setUploading](#FieldState.setUploading)
  - [setValid](#FieldState.setValid)
  - [setValidating](#FieldState.setValidating)
  - [setValue](#FieldState.setValue)
  - [setCoercedValue](#FieldState.setCoercedValue)
  - [showMessage](#FieldState.showMessage)
  - [validate](#FieldState.validate)
- [Form](#Form)
- [FormArray](#FormObject)
- [FormObject](#FormObject)
  - [required props](#FormObject.requiredProps)
  - [optional props](#FormObject.optionalProps)
  - [generated props](#FormObject.generatedProps)
- [FormExtension](#FormExtension)
- [FormState](#FormState)
  - [registerValidation](#FormState.registerValidation)
  - [setRequired](#FormState.setRequired)
  - [constructor](#FormState.constructor)
  - [add](#FormState.add)
  - [createUnitOfWork](#FormState.createUnitOfWork)
  - [inject](#FormState.inject)
  - [injectModel](#FormState.injectModel)
  - [isDeleted](#FormState.isDeleted)
  - [isInvalid](#FormState.isInvalid)
  - [isUploading](#FormState.isUploading)
  - [isValidating](#FormState.isValidating)
  - [get](#FormState.get)
  - [getFieldState](#FormState.getFieldState)
  - [getu](#FormState.getu)
  - [onUpdate](#FormState.onUpdate)
- [UnitOfWork](#UnitOfWork)
  - [add](#UnitOfWork.add)
  - [createModel](#UnitOfWork.createModel)
  - [get](#UnitOfWork.get)
  - [getFieldState](#UnitOfWork.getFieldState)
  - [getu](#UnitOfWork.getu)
  - [injectModel](#UnitOfWork.injectModel)
  - [remove](#UnitOfWork.remove)
  - [set](#UnitOfWork.set)
  - [setc](#UnitOfWork.setc)
  - [updateFormState](#UnitOfWork.updateFormState)
- [Deprecated](#Deprecated)
  - [Field.noCoercion](#Field.noCoercion)
  - [Field.handlerBindFunction](#Field.handlerBindFunction)
  - [the updateFormState handler](#updateFormStateHandler)

## <a name='Field'>Field</a>

a Field is a representation of a rendered input component. if you define an input like this:

```jsx
<CheckboxGroup
  formField='roleIds'
  checkboxValues={this.roles}
  label='Roles'
  defaultValue={[]}
  intConvert
  validate={[['minLength',1]]}
  />
```

a framework object is created with the following properties:

```es6
{
  name: 'roleIds',
  key: 'roleIds',
  label: 'Roles',
  required: false,
  validate: [['minLength',1]],
  noTrim: false,
  preferNull: false,
  intConvert: true,
  defaultValue: [],
  revalidateOnSubmit: false,
  noCoercion: false, // DEPRECATED
  handlerBindFunction: undefined // DEPRECATED
}
```

### <a name='Field.name'>name</a>

ties an input component to an [injected](#FormState.injectModel) model by way of form state. fields, as defined during a render, also form a specification of the model to be [generated](#UnitOfWork.createModel) upon form submission.

### <a name='Field.key'>key</a>

the fully [pathed](#UnitOfWork.getFieldState) field name, for example:

```es6
{
  name: line1,
  key: workContact.address.line1,
  // ...
}
```

### <a name='Field.label'>label</a>

for purposes of display.

### <a name='Field.required'>required</a>

see [validation](/docs/validationWiring.md)

### <a name='Field.validate'>validate</a>

see [validation](/docs/validationWiring.md)

### <a name='Field.noTrim'>noTrim</a>

string values are trimmed by default. noTrim overrides this behavior. see [UnitOfWork.createModel](#UnitOfWork.createModel)

### <a name='Field.preferNull'>preferNull</a>

produces a null value rather than an empty string or an empty array. see [UnitOfWork.createModel](#UnitOfWork.createModel)

### <a name='Field.intConvert'>intConvert</a>

casts a string to an integer, or an array of strings to an array of integers. see [UnitOfWork.createModel](#UnitOfWork.createModel)

useful for a select input for instance.

### <a name='Field.defaultValue'>defaultValue</a>

defines a default value for your input. values will be [coerced](#FieldState.getValue) to strings by default.

if a model is [injected](#FormState.injectModel) into form state, the model value takes precedence over the default value. *be careful*: when inputs do not align exactly with your backing model, some inputs could receive an initial value from the injected model while other unaligned inputs could receive the configured default value. this could be a source of confusion and/or bugs during development.

do not confuse this property with the defaultValue for a react [uncontrolled component](https://facebook.github.io/react/docs/forms.html#uncontrolled-components). input components managed by the framework are [controlled components](https://facebook.github.io/react/docs/forms.html#controlled-components). always supply a value property to your inputs.

note: if you are using the DEPRECATED framework generated 'updateFormState' change handler, for select-multiple and checkbox group inputs *always* supply an array default value in your jsx. you must do this because otherwise the framework has no idea whether your component contains a text input or a select input. it is better to use the new 'handleValueChange' handler where this is no longer a concern.

### <a name='Field.revalidateOnSubmit'>revalidateOnSubmit</a>

react-formstate, in the way it supports asynchronous validation, normally does not revalidate previously validated fields upon form submission.

the reason? consider a username validation that calls an api to ensure a username does not already exist. if you perform the asynchronous validation as the user edits the username field, you do not want to perform it again (at least not client-side) when the user hits submit.

now consider a confirm password validation. since it validates against another field that might change, you *do* want to revalidate the password confirmation upon form submission. since this is not the common case, if you want this behavior you have to add a *revalidateOnSubmit* prop to your jsx input element.

revalidateOnSubmit should *not* be added to fields that perform asynchronous validation. [UnitOfWork.createModel](#UnitOfWork.createModel) is purposefully designed to run synchronously.

## <a name='FieldState'>FieldState</a>

a field state is essentially a collection of the following properties:

- value
- validity (1 = valid, 2 = invalid, 3 = validating, undefined or null = unvalidated)
- message
- asyncToken
- isMessageVisible (for showing messages [on blur](/docs/onBlurExample.md))

### <a name='FieldState.equals'>boolean equals(FieldState fieldState)</a>

use this to determine whether to render an input component. (it's a form of logical equivalence meant solely for this purpose.)

```es6
shouldComponentUpdate(nextProps, nextState) {
  return !nextProps.fieldState.equals(this.props.fieldState);
}
```

### <a name='FieldState.get'>string get(string propertyName)</a>

use this to retrieve custom property values

```es6
fieldState.set('warn', true);
assert.equal(true, true === fieldState.get('warn'));
```

### <a name='FieldState.getField'>Field getField()</a>

returns the [Field](#Field) associated with the field state, if there is one.

```es6
let field = fieldState.getField();
fieldState.setValidating(`Verifying ${field.label}`);
```

### <a name='FieldState.getKey'>string getKey()</a>

returns the canonical name for a field state. nesting is represented by a dot, i.e.

```es6
workContact.address.line1
contacts.0.address.city
```

if you aren't using ajax to submit your data, you could use the key to create an appropriate 'name' property for your input. the proper structure of the name field may depend on your server side framework.

```jsx
<input name={makeName(this.props.fieldState.getKey())} ...
```

### <a name='FieldState.getMessage'>string getMessage()</a>

### <a name='FieldState.getName'>string getName()</a>

### <a name='FieldState.getValue'>string getValue()</a>

returns the value for the field state. values are typically coerced to strings. for example:

```es6
let context = this.formState.createUnitOfWork();
let fieldState = context.getFieldState('x');
fieldState.setValue(3);
assert(true, fieldState.getValue() === '3');
assert(true, fieldState.getUncoercedValue() === 3);
```

here is the coercion logic for reference:

```es6
if (!isDefined(v)) { return ''; } // else
if (v === true || v === false) { return v; } // else
if (Array.isArray(v)) { return v.map(x => !exists(x) ? x : (typeof(x) === 'object' ? x : x.toString())); } // else
return v.toString();
```

you can override this behavior with [getUncoercedValue](#FieldState.getUncoercedValue)

### <a name='FieldState.getUncoercedValue'>string getUncoercedValue()</a>

bypasses string coercion, see [getValue](#FieldState.getValue)

for example

```es6
let context = this.formState.createUnitOfWork();
let fieldState = context.getFieldState('x');
fieldState.setValue(3);
assert(true, fieldState.getValue() === '3');
assert(true, fieldState.getUncoercedValue() === 3);
```

see the [get and set helpers example](/docs/getSetHelpers.md)
and the [react-datepicker example](/docs/datePickerExample.md)

### <a name='FieldState.isInvalid'>boolean isInvalid()</a>

### <a name='FieldState.isMessageVisible'>boolean isMessageVisible()</a>

see the [on blur](/docs/onBlurExample.md) example

### <a name='FieldState.isUploading'>boolean isUploading()</a>

### <a name='FieldState.isValid'>boolean isValid()</a>

### <a name='FieldState.isValidated'>boolean isValidated()</a>

### <a name='FieldState.isValidating'>boolean isValidating()</a>

### <a name='FieldState.set'>string set(string propertyName, ? value)</a>

use this to set custom property values

```es6
fieldState.set('warn', true);
assert.equal(true, true === fieldState.get('warn'));
```

### <a name='FieldState.setInvalid'>void setInvalid(string message)</a>

### <a name='FieldState.setValid'>void setValid(string message)</a>

### <a name='FieldState.setValidating'>string setValidating(string message)</a>

updates validity, sets a message, and returns an 'asyncToken' for use in asynchronous validation. see [UnitOfWork.getFieldState](#UnitOfWork.getFieldState)

```es6
// ...
// careful: user might type more letters into the username input box
let asyncToken = fieldState.setValidating('Verifying username...');
context.updateFormState();

validateAsync().then((result) => {
  //...
});
```

### <a name='FieldState.setUploading'>string setUploading(string message)</a>

### <a name='FieldState.setValue'>void setValue(string message)</a>

typical behavior. contrast with [setCoercedValue](#FieldState.setCoercedValue)

```es6
let context = this.formState.createUnitOfWork();
let fieldState = context.getFieldState('x');
fieldState.setValue(3);
assert(true, fieldState.getValue() === '3');
assert(true, fieldState.getUncoercedValue() === 3);
```

### <a name='FieldState.setCoercedValue'>void setCoercedValue(string message)</a>

retrieved values are typically coerced to strings, see [getValue](#FieldState.getValue)

to avoid wasted effort in the getValue function, if the value you are setting is already coerced, you can use setCoercedValue:

```es6
let context = this.formState.createUnitOfWork();
let fieldState = context.getFieldState('x');
fieldState.setCoercedValue('3');
assert(true, fieldState.getValue() === '3');
assert(true, fieldState.getUncoercedValue() === '3');
```

the default change handler uses this function since html inputs produce string values.

### <a name='FieldState.showMessage'>boolean showMessage()</a>

see the [on blur](/docs/onBlurExample.md) example

### <a name='FieldState.validate'>void validate()</a>

calls the appropriate validation function(s). uses the result to update the validity and message properties appropriately. see the [validation](/docs/validationWiring.md) documentation.

*important*: a validation function called in this manner *must be synchronous*.

```es6
fieldState.setValue(value).validate();
```

## <a name='Form'>Form</a>

this:

```jsx
<Form formState={this.formState} model={this.props.model} onSubmit={this.onSubmit} id='foo'>
  <Input formField='name' label='Name'/>
  <input type='submit' value='Submit'/>
</Form>
```

is equivalent to:

```jsx
<form onSubmit={this.onSubmit} id='foo'>
  <FormObject formState={this.formState} model={this.props.model}>
    <Input formField='name' label='Name'/>
    <input type='submit' value='Submit'/>
  </FormObject>
</form>
```

## <a name='FormObject'>FormObject/FormArray</a>

FormObject and FormArray components are meant to align with your backing model. for instance, if you have a model like this:

```es6
{
  name: 'buster brown',
  contacts: [
    {
      email: 'buster@dogmail.com',
      address: {
        line1: '123 some street'
      }
    },
    {
      email: 'buster@dogs.org',
      address: {
        line1: '456 another street'
      }
    }
  ]
}
```

then you can structure your jsx along the following lines:

```jsx
<FormObject formState={this.formState}>
  <Input formField='name' />
  <FormArray name='contacts'>
    <FormObject name='0'>
      <Input formField='email' />
      <FormObject name='address'>
        <Input formField='line1' />
      </FormObject>
    </FormObject>
    <FormObject name='1'>
      <Input formField='email' />
      <FormObject name='address'>
        <Input formField='line1' />
      </FormObject>
    </FormObject>
  </FormArray>
</FormObject>
```

alternatively, for nested objects (not arrays), you can flatten your jsx:

```jsx
<FormObject formState={this.formState}>
  <Input formField='name' />
  <FormArray name='contacts'>
    <Input formField='0.email' />
    <Input formField='0.address.line1' />
    <Input formField='1.email' />
    <Input formField='1.address.line1' />
  </FormArray>
</FormObject>
```

if for some reason your use case simply won't fit in the box, you can always transform your model during [injection](#FormState.injectModel) and after [generation](#UnitOfWork.createModel).

### <a name='FormObject.requiredProps'>required props</a>

FormObjects and FormArrays require different props in different situations.

always pass a 'formState' prop to the root FormObject

```jsx
<FormObject formState={this.formState}>
</FormObject>
```

pass a 'name' prop to a FormObject or FormArray nested within the same render function

```jsx
<FormObject formState={this.formState}>
  <FormArray name='contacts'>
    <FormObject name='0'>
    </FormObject>
  </FormArray>
</FormObject>
```

a 'formObject' attribute allows a "hop" from one component to another

```jsx
<FormObject formState={this.formState}>
  <FormArray name='contacts'>
    <Contact formObject='0' />
  </FormArray>
</FormObject>
```

to complete the "hop", within the nested form component, place a FormObject at the root of its jsx. pass the FormObject the nested form component using a 'nestedForm' prop

```es6
import React, { Component } from 'react';

export default class Contact extends Component {
  render() {
    return (
      <FormObject nestedForm={this}>
      </FormObject>
```

### <a name='FormObject.optionalProps'>optional props</a>

<a name='modelProp'>*model*</a>

shorthand injection of model data into your form fields, suitable for common use cases.

```jsx
<FormObject formState={this.formState} model={this.props.model}>
  <Input formField='name' label='Name/>
</FormObject>
```

see [model injection](/docs/modelInjection.md) for a slightly better example.

the model prop only applies to your root FormObject. typically it is used with a [Form](#Form) component:

```jsx
<Form formState={this.formState} model={this.props.model}>
  <Input formField='name' label='Name/>
</Form>
```

the model prop is syntactic sugar and works differently from [true injection](#FormState.injectModel).

true injection is more appropriate for dynamic forms, as your render function can then key off your form component's state.

<a name='labelPrefix'>*labelPrefix*</a>

prefixes all the labels of the nested components. in the following example, the label for the email input will be set to 'Work Email'

```jsx
<FormObject formState={this.formState}>
  <FormObject name='workContact' labelPrefix='Work '>
    <Input formField='email' label='Email' />
  </FormObject>
</FormObject>
```

*preferNull*

for a FormArray with no elements, upon model [generation](#UnitOfWork.createModel), sets the 'contacts' property to null rather than an empty array.

```jsx
<FormArray name='contacts' preferNull>
</FormArray>
```

### <a name='FormObject.generatedProps'>generated props</a>

FormObjects and FormArrays are essentially property generators. for a nested "formField", the following props are added:

- label: a label modified by an optional labelPrefix (see [above](#labelPrefix))
- fieldState: a [FieldState](#FieldState) contains props useful to an input component
- handleValueChange: the new change handler that takes a value parameter rather than an event
- showValidationMessage: an optional onBlur handler
- formState: the relevant formState object

the following deprecated prop is also passed:

- updateFormState: the DEPRECATED onChange handler for your input component (takes an event parameter)

note: for asynchronous validation you must override the framework generated handleValueChange handler. see an example [here](/docs/asyncExample.md)

FormObjects and FormArrays pass the following properties to nested FormObjects and FormArrays.

- formState: [pathed](#UnitOfWork.getFieldState) appropriately
- validationComponent: for [auto-wiring](/docs/validationWiring.md#autowiring) validation functions
- labelPrefix: see [above](#labelPrefix)

## <a name='FormExtension'>FormExtension</a>

similar to FormObject. see [FormExtension](/docs/formExtension.md) for an explanation.

## <a name='FormState'>FormState</a>

### <a name="FormState.registerValidation">static void registerValidation(string name, function validationHandler)</a>

adds a reusable validation function with custom messaging

```es6
FormState.registerValidation('minLength', function(value, label, minLength) {
  if (value.length < minLength) {
    return `${label} must be at least ${minLength} characters`;
  }
});
```

```jsx
<Input formField='password' type='password' label='Password' required validate={[['minLength',8]]} />
```

### <a name="FormState.setRequired">static void setRequired(function validationHandler)</a>

overrides the default required field validation.

```es6
FormState.setRequired(function(value, label) {
  if (value.trim() === '') { return `${label} is required`; }
});
```

### <a name="FormState.constructor">constructor(React.Component formComponent)</a>

creates a root form state instance.

pass your root form component to the constructor to allow the form state instance to manipulate component state.

```es6
import React, { Component } from 'react';

export default class UserForm extends Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this); // invoke the constructor
    this.state = {};
  }

  //...
}
```

### <a name="FormState.add">object add(object state, string name, ? value)</a>

adds a value directly to your form state, OR UPDATES an existing value. 'upsert' might have been a better name.

this helps to transform injected form state since it is tricky to transform an immutable props.model prior to injection:

```es6
this.state = this.formState.injectModel(model);
// the model field is named 'disabled' but the jsx presents it as 'active'
this.formState.add(this.state, 'active', !model.disabled);
```

you can add object, array, and primitive values:

```es6
{
  this.state = this.formState.injectModel({});
  this.formState.add(this.state, 'x', 3);
  // { 'formState.x': 3 }
  this.formState.add(this.state, 'obj', { y: 4, z: { a: 5 } });
  // { 'formState.x': 3, 'formState.obj.y': 4, 'formState.obj.z.a': 5 }
  this.formState.add(this.state, 'arrayValue', [1]);
  // { 'formState.x': 3, 'formState.obj.y': 4, 'formState.obj.z.a': 5, 'formState.arrayValue': [1], 'formState.arrayValue.0' : 1 }
}
```

### <a name="FormState.createUnitOfWork">FormState.UnitOfWork createUnitOfWork()</a>

creates a [UnitOfWork](#UnitOfWork) "context" for making changes to immutable form state.

```es6
handleUsernameChange(e) {
  let username = e.target.value,
    context = this.formState.createUnitOfWork(),
    fieldState = context.getFieldState('username');

  fieldState.setValue(username).validate();
  context.updateFormState();
}
```

### <a name="FormState.inject">void inject(object state, object model)</a>

alternate syntax for [injectModel](#FormState.injectModel)

```es6
import React, { Component } from 'react';

export default class UserForm extends Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = {};
    this.formState.inject(this.state, props.model);
  }

  //...
}
```

if necessary, during injection, you can transform the injected form state using the [add](#FormState.add) method.


### <a name="FormState.injectModel">object injectModel(object model)</a>

initializes form state. values will be [coerced](#FieldState.getValue) to strings by default.

```es6
import React, { Component } from 'react';

export default class UserForm extends Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = this.formState.injectModel(props.model);
  }

  //...
}
```

if necessary, during injection, you can transform the injected form state using the [add](#FormState.add) method.

### <a name="FormState.isDeleted">boolean isDeleted(string name)</a>

determines whether a branch of your form state was removed (using [UnitOfWork.remove](#UnitOfWork.remove)).

typically used to conditionally show inputs during render.

```es6
render() {
  let contacts = [];

  for (let i = 0; i < this.state.numContacts; i++) {
    if (!this.formState.isDeleted(`contacts.${i}`)) {
      contacts.push(
        // ...
```

### <a name="FormState.isInvalid">boolean isInvalid(boolean visibleMessagesOnly)</a>

determines whether to show a form-level validation message, or disable the submit button, etc.

if you are showing validation messages on blur pass 'true' to this function

```jsx
<input type='submit' value='Submit' disabled={this.formState.isInvalid()} />
<span>{this.formState.isInvalid() ? 'Please fix validation errors' : null}</span>
```

### <a name="FormState.isUploading">boolean isUploading()</a>

returns true if the form is waiting for an upload to finish.

```jsx
<input type='submit' value='Submit' disabled={this.formState.isUploading()} />
<span>{this.formState.isUploading() ? 'Uploading...' : null}</span>
```

### <a name="FormState.isValidating">boolean isValidating()</a>

returns true if the form is waiting for asynchronous validation to finish.

```jsx
<input type='submit' value='Submit' disabled={this.formState.isValidating()} />
<span>{this.formState.isValidating() ? 'Waiting for validation to finish...' : null}</span>
```

### <a name="FormState.get">FieldState get(string name)<a/>

```es6
let value = this.formState.getFieldState('x').getValue();
```

can be shortened to:

```es6
let value = this.formState.get('x');
```

### <a name="FormState.getFieldState">FieldState getFieldState(string name)</a>

retrieves read-only form state for a particular field.

this is typically used for dynamic behavior during a render function.

see [UnitOfWork.getFieldState](#UnitOfWork.getFieldState) for more information.

```es6
let fieldState = this.formState.getFieldState('fieldName');
if (fieldState.getValue() === 'success') {
  // ...
}
```

### <a name="FormState.getu">FieldState getu(string name)<a/>

```es6
let value = this.formState.getFieldState('x').getUncoercedValue();
```

can be shortened to:

```es6
let value = this.formState.getu('x');
```

### <a name='FormState.onUpdate'>void onUpdate(function callback)</a>

sets a callback from the framework generated onChange handler.

if you add an onUpdate callback, be sure to call context.updateFormState in your callback, as the framework delegates that responsibility.

if you override the framework generated event handler for any of your fields, remember to call your onUpdate callback from your change handler.

an onUpdate callback may only be added to a root form state instance (i.e., not a nested one).

the callback function is passed two parameters: context (a [UnitOfWork](#UnitOfWork)) and key (a string).

context will always be "[pathed](#UnitOfWork.getFieldState)" relative to your root form component.

key identifies the field that was updated, which is potentially a nested field (for example: 'workContact.address.line1')

```es6
this.formState.onUpdate((context, key) => {
  let oldValue = this.formState.getFieldState(key).getValue(),
    newValue = context.getFieldState(key).getValue();
  // ...
  context.updateFormState(additionalUpdates);
});
```

## <a name='UnitOfWork'>UnitOfWork</a>

### <a name='UnitOfWork.add'>add(string name, ? value)</a>

see [injectModel](#UnitOfWork.injectModel)
and [add](#FormState.add)

### <a name="UnitOfWork.createModel">object createModel(boolean noUpdate)</a>

creates a model upon form submission.

returns null if form state is invalid or if waiting on asynchronous validation or uploading.

```es6
handleSubmit(e) {
  e.preventDefault();
  let model = this.formState.createUnitOfWork().createModel();
  if (model) {
    alert(JSON.stringify(model)); // submit to your api or store or whatever
  }
  // else: createModel called updateFormState to set the appropriate validation messages
}
```

passing true prevents a call to updateFormState

```es6
handleSubmit(e) {
  e.preventDefault();
  let context = this.formState.createUnitOfWork(),
    model = context.createModel(true);
  if (model) {
    alert(JSON.stringify(model)); // submit to your api or store or whatever
  } else {
    // do additional work
    context.updateFormState(withAdditionalUpdates);
  }
}
```

if necessary, you can transform your model afterward:

```es6
handleSubmit(e) {
  e.preventDefault();
  let model = this.formState.createUnitOfWork().createModel();
  if (model) {
    model.disabled = !model.active; // transform the data
    alert(JSON.stringify(model)); // submit to your api or store or whatever
  }
}
```

the framework can perform common transformations for you. see [noTrim](#Field.noTrim), [preferNull](#Field.preferNull), and [intConvert](#Field.intConvert)

note that createModel is meant to run *synchronously*. if an asynchronous validation were triggered directly by a form submission, the user would have to hit the submit button again after validation completes. this is not seen as a limitation of the framework, however, as a field with an asynchronous validation is typically accompanied by a synchronous required field validation. maybe there is a legitimate use case that would suggest enhancement in this regard, but it is not currently understood by the author.

### <a name="UnitOfWork.get">FieldState get(string name)<a/>

```es6
let context = this.formState.createUnitOfWork();
let value = context.getFieldState('x').getValue();
```

can be shortened to:

```es6
let context = this.formState.createUnitOfWork();
let value = context.get('x');
```

### <a name="UnitOfWork.getFieldState">FieldState getFieldState(string name, string asyncToken)</a>

retrieves form state for a particular field, aka [FieldState](#FieldState).

if asyncToken is passed, returns null unless the token matches the token embedded in the field state. (in an asynchronous validation callback, validate *only* if the fieldstate hasn't changed before the callback is invoked. see [FieldState.setValidating](#FieldState.setValidating))

```es6
validateAsync().then((result) => {
  let context = this.formState.createUnitOfWork(),
    fieldState = context.getFieldState(field.name, asyncToken);

  if (fieldState) { // if it hasn't changed in the meantime
    // ...
  }
}
```

in a nested form component, name is relative to the path embedded in the nested form state.

```es6
import React, { Component } from 'react';

export default class Contact extends Component {
  handleEmailChange(e) {
    // a pathed formState is passed to a nested component
    let context = this.props.formState.createUnitOfWork(),
      fieldState = context.getFieldState('email');

    // the retrieved fieldState might be for homeContact.email
    // or for workContact.email
    // the nested component doesn't know or care
    // ...
  }
```

### <a name="UnitOfWork.getu">FieldState getu(string name)<a/>

```es6
let context = this.formState.createUnitOfWork();
let value = context.getFieldState('x').getUncoercedValue();
```

can be shortened to:

```es6
let context = this.formState.createUnitOfWork();
let value = context.getu('x');
```

### <a name='UnitOfWork.injectModel'>injectModel(object model)</a>

before you use this see [injectModel](#FormState.injectModel)

if you need to inject outside your constructor you can use this

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = {};
}
componentDidMount() {
  this.props.getModel().then((model) => {
    let context = this.formState.createUnitOfWork();
    context.injectModel(model);
    context.add('someOtherField', 'someValue');
    context.updateFormState();
  });
}
```

### <a name="UnitOfWork.remove">void remove(string name)<a/>

removes form state. analogous to javascript's delete function.

typically used to dynamically remove an input component. see [FormState.isDeleted](#FormState.isDeleted)

```es6
removeContact(i) {
  return (e) => {
    e.preventDefault();
    let context = this.formState.createUnitOfWork();
    context.remove(`contacts.${i}`);
    context.updateFormState();
  };
}
```

### <a name="UnitOfWork.set">FieldState set(string name, ? value)<a/>

```es6
let context = this.formState.createUnitOfWork();
let fieldState = context.getFieldState('x');
fieldState.setValue(3);
```

can be shortened to:

```es6
let context = this.formState.createUnitOfWork();
let fieldState = context.set('x', 3);
```

### <a name="UnitOfWork.setc">FieldState setc(string name, ? value)<a/>


```es6
let context = this.formState.createUnitOfWork();
let fieldState = context.getFieldState('x');
fieldState.setCoercedValue(3);
```

can be shortened to:

```es6
let context = this.formState.createUnitOfWork();
let fieldState = context.setc('x', 3);
```

### <a name="UnitOfWork.updateFormState">void updateFormState(object additionalUpdates)</a>

calls setState on your root form component.

optionally accepts additional state updates to merge with the unit of work updates.

```es6
handleUsernameChange(e) {
  let username = e.target.value,
    context = this.formState.createUnitOfWork(),
    fieldState = context.getFieldState('username');

  fieldState.setValue(username).validate();
  context.updateFormState({ setSomeOtherProperty: 'someValue' });
}
```

## <a name='Deprecated'>Deprecated</a>

there are no plans to remove these functions but they are no longer part of the examples.

### <a name='Field.noCoercion'>Field.noCoercion</a>
### <a name='Field.handlerBindFunction'>Field.handlerBindFunction</a>
### <a name='updateFormStateHandler'>the updateFormState handler</a>

see [handleValueChange](/docs/handleValueChange.md) for why these are deprecated
