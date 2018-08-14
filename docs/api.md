# api

- [Field](#Field)
  - [name](#Field.name)
  - [key](#Field.key)
  - [label](#Field.label)
  - [required](#Field.required)
  - [validate](#Field.validate)
  - [noCoercion](#Field.noCoercion)
  - [noTrim](#Field.noTrim)
  - [preferNull](#Field.preferNull)
  - [intConvert](#Field.intConvert)
  - [defaultValue](#Field.defaultValue)
  - [revalidateOnSubmit](#Field.revalidateOnSubmit)
- [FieldState](#FieldState)
  - [get](#FieldState.get)
  - [getField](#FieldState.getField)
  - [getInitialValue](#FieldState.getInitialValue)
  - [getKey](#FieldState.getKey)
  - [getMessage](#FieldState.getMessage)
  - [getName](#FieldState.getName)
  - [getValue](#FieldState.getValue)
  - [getUncoercedInitialValue](#FieldState.getUncoercedInitialValue)
  - [getUncoercedValue](#FieldState.getUncoercedValue)
  - [isChanged](#FieldState.isChanged)
  - [isBlurred](#FieldState.isBlurred)
  - [isInvalid](#FieldState.isInvalid)
  - [isMessageVisibleOn](#FieldState.isMessageVisibleOn)
  - [isSubmitted](#FieldState.isSubmitted)
  - [isUploading](#FieldState.isUploading)
  - [isValid](#FieldState.isValid)
  - [isValidated](#FieldState.isValidated)
  - [isValidating](#FieldState.isValidating)
  - [set](#FieldState.set)
  - [setBlurred](#FieldState.setBlurred)
  - [setInvalid](#FieldState.setInvalid)
  - [setSubmitted](#FieldState.setSubmitted)
  - [setUploading](#FieldState.setUploading)
  - [setValid](#FieldState.setValid)
  - [setValidating](#FieldState.setValidating)
  - [setValue](#FieldState.setValue)
  - [validate](#FieldState.validate)
- [Form](#Form)
- [FormArray](#FormObject)
- [FormObject](#FormObject)
  - [required props](#FormObject.requiredProps)
  - [optional props](#FormObject.optionalProps)
  - [generated props](#FormObject.generatedProps)
- [FormExtension](#FormExtension)
- [FormState](#FormState)
  - [rfsProps](#FormState.rfsProps)
  - [registerValidation](#FormState.registerValidation)
  - [setRequired](#FormState.setRequired)
  - [setEnsureValidationOnBlur](#FormState.setEnsureValidationOnBlur)
  - [ensureValidationOnBlur](#FormState.ensureValidationOnBlur)
  - [showMessageOn](#FormState.showMessageOn)
  - [showingMessageOn](#FormState.showingMessageOn)
  - [showingMessageOnChange](#FormState.showingMessageOnChange)
  - [showingMessageOnBlur](#FormState.showingMessageOnBlur)
  - [showingMessageOnSubmit](#FormState.showingMessageOnSubmit)
  - [create](#FormState.create)
  - [anyFieldState](#FormState.anyFieldState)
  - [createUnitOfWork](#FormState.createUnitOfWork)
  - [inject](#FormState.inject)
  - [injectField](#FormState.injectField)
  - [injectModel](#FormState.injectModel)
  - [isDeleted](#FormState.isDeleted)
  - [isInvalid](#FormState.isInvalid)
  - [isUploading](#FormState.isUploading)
  - [isValidating](#FormState.isValidating)
  - [get](#FormState.get)
  - [getFieldState](#FormState.getFieldState)
  - [getu](#FormState.getu)
  - [onUpdate](#FormState.onUpdate)
  - [root](#FormState.root)
- [UnitOfWork](#UnitOfWork)
  - [createModel](#UnitOfWork.createModel)
  - [createModelResult](#UnitOfWork.createModelResult)
  - [get](#UnitOfWork.get)
  - [getFieldState](#UnitOfWork.getFieldState)
  - [getu](#UnitOfWork.getu)
  - [getUpdates](#UnitOfWork.getUpdates)
  - [injectField](#UnitOfWork.injectField)
  - [injectModel](#UnitOfWork.injectModel)
  - [remove](#UnitOfWork.remove)
  - [set](#UnitOfWork.set)
  - [updateFormState](#UnitOfWork.updateFormState)
- [Deprecated](#Deprecated)
  - [Field.handlerBindFunction](#Field.handlerBindFunction)
  - [Field.updateFormState](#Field.updateFormState)
  - [FieldState.equals](#FieldState.equals)
  - [FieldState.isMessageVisible](#FieldState.isMessageVisible)
  - [FieldState.showMessage](#FieldState.showMessage)
  - [FieldState.setCoercedValue](#FieldState.setCoercedValue)
  - [FormState.add](#FormState.add)
  - [FormState.setShowMessageOnBlur](#FormState.setShowMessageOnBlur)
  - [FormState.setShowMessageOnSubmit](#FormState.setShowMessageOnSubmit)
  - [FormState.showMessageOnBlur](#FormState.showMessageOnBlur)
  - [FormState.showMessageOnSubmit](#FormState.showMessageOnSubmit)
  - [UnitOfWork.add](#UnitOfWork.add)
  - [UnitOfWork.setc](#UnitOfWork.setc)

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

a Field instance is created with the following properties:

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

### <a name='Field.noCoercion'>Field.noCoercion</a>

see the [date picker example](/docs/datePickerExample.md)

it's preferable to set an rfsNoCoercion property on your input component class (again see the date picker example). then you don't have to specify noCoercion every time the input is used

```jsx
<Input formField='startDate' noCoercion/>
<Input formField='endDate' noCoercion/>
<Input formField='anotherDate' noCoercion/>
...
```

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

do not confuse this property with the defaultValue for a react [uncontrolled component](https://facebook.github.io/react/docs/forms.html#uncontrolled-components). input components managed by react-formstate are [controlled components](https://facebook.github.io/react/docs/forms.html#controlled-components). always supply a value property to your inputs.

note: if you are using the DEPRECATED 'updateFormState' change handler, for select-multiple and checkbox group inputs *always* supply an array default value in your jsx. you must do this because otherwise the react-formstate has no idea whether your component contains a text input or a select input. it is better to use the new 'handleValueChange' handler where this is no longer a concern.

### <a name='Field.revalidateOnSubmit'>revalidateOnSubmit</a>

react-formstate, in the way it supports asynchronous validation, normally does not revalidate previously validated fields upon form submission.

the reason? consider a username validation that calls an api to ensure a username does not already exist. if you perform the asynchronous validation as the user edits the username field, you do not want to perform it again (at least not client-side) when the user hits submit.

now consider a confirm password validation. since it validates against another field that might change, you *do* want to revalidate the password confirmation upon form submission. since this is not the common case, if you want this behavior you have to add a *revalidateOnSubmit* prop to your jsx input element.

revalidateOnSubmit should *not* be added to fields that perform asynchronous validation. [UnitOfWork.createModel](#UnitOfWork.createModel) is purposefully designed to run synchronously.

## <a name='FieldState'>FieldState</a>

a field state is an object that may contain the following properties:

- value
- initialValue
- validity (1 = valid, 2 = invalid, 3 = validating, undefined or null = unvalidated)
- message
- asyncToken
- changed
- blurred
- submitted
- (other custom properties)

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

### <a name='FieldState.getInitialValue'>? getInitialValue()</a>

returns the initial value set during injection or the first time the field is changed.

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

### <a name='FieldState.getValue'>? getValue()</a>

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

### <a name='FieldState.getUncoercedInitialValue'>? getUncoercedInitialValue()</a>

this is a real edge case. if you are trying to obtain an initial value in the render method and you need to retrieve the value without coercion.

### <a name='FieldState.getUncoercedValue'>? getUncoercedValue()</a>

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

### <a name='FieldState.isChanged'>boolean isChanged()</a>

### <a name='FieldState.isBlurred'>boolean isBlurred()</a>

### <a name='FieldState.isInvalid'>boolean isInvalid()</a>

### <a name='FieldState.isMessageVisibleOn'>boolean isMessageVisibleOn()</a>

intended to be used like this

```es6
const msg = fieldState.isMessageVisibleOn('blur') ? fieldState.getMessage() : null;
```

or

```es6
fieldState.isMessageVisibleOn(formState.showingMessageOn())
```

here's the code

```es6
isMessageVisibleOn(showMessageOn) {
  const { changed, blurred, submitted } = this.fieldState;
  if (showMessageOn === 'submit') { return Boolean(submitted); }
  if (showMessageOn === 'blur') { return Boolean(blurred || submitted); }
  return Boolean(changed || blurred || submitted);
}
```

### <a name='FieldState.isSubmitted'>boolean isSubmitted()</a>

### <a name='FieldState.isUploading'>boolean isUploading()</a>

### <a name='FieldState.isValid'>boolean isValid()</a>

### <a name='FieldState.isValidated'>boolean isValidated()</a>

### <a name='FieldState.isValidating'>boolean isValidating()</a>

### <a name='FieldState.set'>FieldState set(string propertyName, ? value)</a>

use this to set custom property values

```es6
fieldState.set('warn', true);
assert.equal(true, true === fieldState.get('warn'));
```

### <a name='FieldState.setBlurred'>FieldState setBlurred()</a>

### <a name='FieldState.setInvalid'>FieldState setInvalid(string message)</a>

### <a name='FieldState.setSubmitted'>FieldState setSubmitted()</a>

### <a name='FieldState.setUploading'>FieldState setUploading(string message)</a>

### <a name='FieldState.setValid'>FieldState setValid(string message)</a>

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

### <a name='FieldState.setValue'>FieldState setValue(string message)</a>

Sets a value, marks the record changed, and if there was no injected value, stores the initial value.

```es6
let context = this.formState.createUnitOfWork();
let fieldState = context.getFieldState('x');
fieldState.setValue(3);
assert(true, fieldState.getValue() === '3');
assert(true, fieldState.getUncoercedValue() === 3);
```

### <a name='FieldState.validate'>FieldState validate()</a>

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
<form>
  <FormObject formState={this.formState}>
  </FormObject>
</form>
```

though most of the time you will use the shorthand

```
<Form formState={this.formState}>
</Form>
```

pass a 'name' prop to a FormObject or FormArray nested within the same render function

```jsx
<Form formState={this.formState}>
  <FormArray name='contacts'>
    <FormObject name='0'>
    </FormObject>
  </FormArray>
</Form>
```

a 'formObject' attribute allows a "hop" from one component to another

```jsx
<Form formState={this.formState}>
  <FormArray name='contacts'>
    <Contact formObject='0' />
  </FormArray>
</Form>
```

to complete the "hop", within the nested form component, place a FormExtension at the root of its jsx. pass the FormExtension the nested form component using a 'nestedForm' prop

```es6
import React, { Component } from 'react';
import { FormExtension } from 'react-formstate';

export default class Contact extends Component {
  render() {
    return (
      <FormExtension nestedForm={this}>
      </FormExtension>
```

you can also use the formExtension prop to enable reuse.

```jsx
<Form formState={this.formState}>
  <Contact formExtension />
</Form>
```

to better understand the difference between formObject and formExtension see a more complete example [here](/docs/formExtension.md).

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
- showMessage: whether the fieldState's associated message is meant to be shown
- handleValueChange: the new change handler that takes a value parameter rather than an event
- handleBlur: an optional onBlur handler
- formState: the relevant formState object

the following deprecated props are also passed:

- showValidationMessage: the old name for the blur handler.
- updateFormState: the DEPRECATED onChange handler for your input component (takes an event parameter)

note: for asynchronous validation you must override the handleValueChange handler. see an example [here](/docs/asyncExample.md)

FormObjects and FormArrays pass the following properties to nested FormObjects and FormArrays.

- formState: [pathed](#UnitOfWork.getFieldState) appropriately
- validationComponent: for [auto-wiring](/docs/validationWiring.md#autowiring) validation functions
- labelPrefix: see [above](#labelPrefix)

## <a name='FormExtension'>FormExtension</a>

similar to FormObject. see [FormExtension](/docs/formExtension.md) for an explanation.

## <a name='FormState'>FormState</a>

### <a name='FormState.rfsProps'>static object rfsProps</a>

```es6
FormState.rfsProps = {
  formState: { suppress: false },
  fieldState: { suppress: false },
  handleValueChange: { suppress: false },
  handleBlur: { suppress: false },
  showMessage: { suppress: false },
  required: { suppress: false },
  label: { suppress: false },
  showValidationMessage: { suppress: false }, // deprecated ... reverse compatibility
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
  msgs: { suppress: true },
  showMessageOn: { suppress: true }
};
```

You can [rename](/docs/renameProps.md) some of the standard props if you wish.

You can suppress react-formstate props that would otherwise propagate to an input component tagged with 'formField'. The deprecated *updateFormState* and *showValidationMessage* props are passed by default for backward compatibility. If you want, you can stop these properties from being passed by doing the following:

```es6
import { FormState } from 'react-formstate';
FormState.rfsProps.updateFormState.suppress = true;
FormState.rfsProps.showValidationMessage.suppress = true;
```

You can suppress or unsuppress other props if you'd like.

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

### <a name="FormState.setEnsureValidationOnBlur">static void setEnsureValidationOnBlur(boolean)</a>
### <a name="FormState.ensureValidationOnBlur">static boolean ensureValidationOnBlur()</a>
### <a name="FormState.showMessageOn">static void showMessageOn(string)</a>
### <a name="FormState.showingMessageOn">static string showingMessageOn()</a>
### <a name="FormState.showingMessageOnChange">static boolean showingMessageOnChange()</a>
### <a name="FormState.showingMessageOnBlur">static boolean showingMessageOnBlur()</a>
### <a name="FormState.showingMessageOnSubmit">static boolean showingMessageOnSubmit()</a>

and non-static versions...

see [showing messages](/docs/showingMessages.md)

### <a name="FormState.create">static FormState create(React.Component formComponent, optional function stateFunction, optional function setStateFunction)</a>

creates a root form state instance.

pass your root form component to allow the form state instance to manipulate component state.

```es6
import React, { Component } from 'react';

export default class UserForm extends Component {

  constructor(props) {
    super(props);
    this.formState = FormState.create(this); // create an instance of the API
    this.state = {};
  }

  //...
}
```

You can pass optional functions that serve to outsource your underlying state. See the [Redux example](/docs/reduxIntegration.md).

### <a name="FormState.anyFieldState">boolean anyFieldState(function givenAFieldStateReturnABoolean)</a>

primarily used to determine whether you can submit the form. for example:

```es6
// are we waiting on any of the field states?
let isTheFormWaitingOnSomething = this.formState.anyFieldState(fi => Boolean(fi.get('isProcessing')));
// ... might need to disable submit and provide an explanatory message
```

### <a name="FormState.createUnitOfWork">FormState.UnitOfWork createUnitOfWork(object updatesToClone)</a>

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

you can optionally pass updatesToClone to create a clean workspace with the pending form state. this is useful for generating an unsubmitted model without side effects on the initial context. see the [Redux example](/docs/reduxIntegration.md).

### <a name="FormState.inject">void inject(object state, object model, boolean doNotFlatten)</a>

alternate syntax for [injectModel](#FormState.injectModel)

```es6
import React, { Component } from 'react';

export default class UserForm extends Component {

  constructor(props) {
    super(props);
    this.formState = FormState.create(this);
    this.state = {};
    this.formState.inject(this.state, props.model);
  }

  //...
}
```

works in tandem with the [injectField](#FormState.injectField) method.

see [injectField](#FormState.injectField) for an explanation of the doNotFlatten parameter.

### <a name="FormState.injectField">void injectField(object state, string name, ? value, boolean doNotFlatten)</a>

adds a value directly to your form state, or updates an existing value.

sets the initial value for the field state.

this helps to transform injected form state since it is tricky to transform an immutable props.model prior to injection:

```es6
this.state = this.formState.injectModel(model);
// the model field is named 'disabled' but the jsx presents it as 'active'
this.formState.injectField(this.state, 'active', !model.disabled);
```

it also helps to initialize form state:

```es6
this.state = this.formState.injectModel(model);
if (!this.formState.get('country')) {
  this.formState.injectField(this.state, 'country', 'USA');
}
```

you can add object, array, and primitive values:

```es6
this.state = this.formState.injectModel({});

this.formState.injectField(this.state, 'x', 3);
// { 'formState.x': { value: 3 } }

this.formState.injectField(this.state, 'obj', { y: 4, z: { a: 5 } });
// {
//   'formState.x': { value: 3 },
//   'formState.obj': { value: { y: 4, z: { a: 5 } } },
//   'formState.obj.y': { value: 4 },
//   'formState.obj.z': { value: { a: 5 } },
//   'formState.obj.z.a': { value: 5 }
// }

this.formState.injectField(this.state, 'arrayValue', [1]);
// {
//   'formState.x': { value: 3 },
//   'formState.obj': { value: { y: 4, z: { a: 5 } } },
//   'formState.obj.y': { value: 4 },
//   'formState.obj.z': { value: { a: 5 } },
//   'formState.obj.z.a': { value: 5 },
//   'formState.arrayValue': { value: [1] },
//   'formState.arrayValue.0' : { value: 1 }
// }
```

you can avoiding flattening an object into form state using the doNotFlatten parameter:

```es6
this.state = this.formState.injectModel({});

this.formState.injectField(this.state, 'obj', { y: 4, z: { a: 5 } }, true);
// {
//   'formState.obj': { value: { y: 4, z: { a: 5 } } }
// }
// formState.obj.y and the like are NOT injected...

this.formState.injectField(this.state, 'arrayValue', [1,2,3,4,5], true);
// {
//   'formState.obj': { value: { y: 4, z: { a: 5 } } },
//   'formState.arrayValue': { value: [1,2,3,4,5] }
// }
// formState.arrayValue.0, formState.arrayValue.1 and the like are NOT injected...
```

the doNotFlatten option is especially useful for working with a nonstandard input like [react-datepicker](https://github.com/Hacker0x01/react-datepicker), which works with [moment](https://momentjs.com/) values:

```es6
this.formState.injectField(this.state, 'someDate', moment(), true);
// { 'formState.someDate': { an object with LOTS of fields } }
// NOT added, a hundred other fields... 'formState.someDate.field1' (and field2 and so on...)
```

### <a name="FormState.injectModel">object injectModel(object model, boolean doNotFlatten)</a>

initializes form state. values will be [coerced](#FieldState.getValue) to strings by default.

sets the initial value for each injected field.

see [injectField](#FormState.injectField) for an explanation of the doNotFlatten parameter.

```es6
import React, { Component } from 'react';

export default class UserForm extends Component {

  constructor(props) {
    super(props);
    this.formState = FormState.create(this);
    this.state = this.formState.injectModel(props.model);
  }

  //...
}
```

works in tandem with the [injectField](#FormState.injectField) method.

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

### <a name="FormState.isInvalid">boolean isInvalid(boolean brokenVisibleMessagesOnlyParameter)</a>

determines whether to show a form-level validation message, or disable the submit button, etc.

a better name for this method would be 'isVisiblyInvalid'.

if you want to see if ANY field state is invalid (not just visibly invalid) explicitly pass false to this method. if you are looking for that functionality you might be more interested in [UnitOfWork.createModel](#UnitOfWork.createModel) or [UnitOfWork.createModelResult](#UnitOfWork.createModelResult)

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

### <a name="FormState.isValidating">boolean isValidating(boolean asyncValidateOnBlur)</a>

returns true if the form is waiting for asynchronous validation to finish.

if you are performing asynchronous validation on blur you can pass 'true' to this function.

```jsx
<input type='submit' value='Submit' disabled={this.formState.isValidating()} />
<span>{this.formState.isValidating() ? 'Waiting for validation to finish...' : null}</span>
```

### <a name="FormState.get">? get(string name)<a/>

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

### <a name="FormState.getu">? getu(string name)<a/>

```es6
let value = this.formState.getFieldState('x').getUncoercedValue();
```

can be shortened to:

```es6
let value = this.formState.getu('x');
```

### <a name='FormState.onUpdate'>void onUpdate(function callback)</a>

sets a callback from the standard handleValueChange onChange handler.

if you add an onUpdate callback, be sure to call context.updateFormState in your callback, as react-formstate delegates that responsibility.

if you override the standard event handler for any of your fields, remember to call your onUpdate callback from your change handler.

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

### <a name="formState.root">FormState root()</a>

If you are working with a formState prop in a nested form component, you can use formState.root() to access the formState for the root form component.

## <a name='UnitOfWork'>UnitOfWork</a>

### <a name="UnitOfWork.createModel">object createModel(boolean noUpdate)</a>

this calls [createModelResult](#UnitOfWork.createModelResult), passing { doTransforms: true, markSubmitted: true }, and if the result is invalid, by default calls setState to set the validation messages (which you can disable by passing true to this method), and returns the model if valid and null if invalid. it's a shortcut for what you typically want to do in an onSubmit handler.

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

react-formstate can perform common transformations for you. see [noTrim](#Field.noTrim), [preferNull](#Field.preferNull), and [intConvert](#Field.intConvert)

note that createModel is meant to run *synchronously*.

### <a name="UnitOfWork.createModelResult">object createModelResult(object options)</a>

Returns { model: generatedModel, isValid: whetherTheModelIsValid }

Options are { doTransforms: defaultsToFalse, markSubmitted: defaultsToFalse }

It is different from [createModel](#UnitOfWork.createModel) in that

- it will return an invalid model
- it will never call setState.
- by default it does not do transforms like intConvert (it's probably a bad idea to try to do transforms on an invalid model)
- by default it does not set fieldstates as submitted.

This is used to share an unsubmitted model with the rest of your application, see the [Redux example](/docs/reduxIntegration.md).

### <a name="UnitOfWork.get">? get(string name)<a/>

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

### <a name="UnitOfWork.getu">? getu(string name)<a/>

```es6
let context = this.formState.createUnitOfWork();
let value = context.getFieldState('x').getUncoercedValue();
```

can be shortened to:

```es6
let context = this.formState.createUnitOfWork();
let value = context.getu('x');
```

### <a name="UnitOfWork.getUpdates">object getUpdates(boolean resetContext)<a/>

You can use the *updateFormState* method as follows:

```es6
// the additional updates will be merged into the context's pending updates for the call to setState.
context.updateFormState({additionalUpdate1: 'someValue', additionalUpdate2: 'anotherValue'});
```

Now you can alternatively do:

```es6
const updates = context.getUpdates();
const otherUpdates = {additionalUpdate1: 'someValue', additionalUpdate2: 'anotherValue'};
this.setState(Object.assign(updates, otherUpdates));
```

This could have utility, for instance, for initialization code that is shared between a constructor and a componentWillReceiveProps method, where the constructor needs to assign to this.state but componentWillReceiveProps needs to make a call to setState.

providing false for 'resetContext' (or something with truthiness false):

```es6
context.getUpdates();
// { 'formState.name': { value: 'newName' }}

context.getUpdates();
// { 'formState.name': { value: 'newName' }}

context.set('username', 'newUsername');
context.getUpdates();
// { 'formState.name': { value: 'newName' }, 'formState.username': { value: 'newUsername'} }
```

passing true for 'resetContext':

```es6
context.getUpdates(true);
// { 'formState.name': { value: 'newName' }}

context.getUpdates(true);
// {}

context.set('username', 'newUsername');
context.getUpdates(true);
// { 'formState.username': { value: 'newUsername'} }
```

### <a name='UnitOfWork.injectField'>void injectField(string name, object model, boolean doNotFlatten)</a>

before you use this see [FormState.injectField](#FormState.injectField)

if you need to inject outside your constructor you can use this

```es6
constructor(props) {
  super(props);
  this.formState = FormState.create(this);
  this.state = {};
}
componentDidMount() {
  this.props.getModel().then((model) => {
    const context = this.formState.createUnitOfWork();
    context.injectModel(model);
    context.injectField('someOtherField', 'someValue');
    context.updateFormState();
  });
}
```

see [FormState.injectField](#FormState.injectField) for an explanation of the doNotFlatten parameter.

### <a name='UnitOfWork.injectModel'>void injectModel(object model, boolean doNotFlatten)</a>

before you use this see [FormState.injectModel](#FormState.injectModel)

if you need to inject outside your constructor you can use this

```es6
constructor(props) {
  super(props);
  this.formState = FormState.create(this);
  this.state = {};
}
componentDidMount() {
  this.props.getModel().then((model) => {
    const context = this.formState.createUnitOfWork();
    context.injectModel(model);
    context.injectField('someOtherField', 'someValue');
    context.updateFormState();
  });
}
```

see [FormState.injectField](#FormState.injectField) for an explanation of the doNotFlatten parameter.

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

### <a name='Field.handlerBindFunction'>Field.handlerBindFunction</a>

is only relevant to the [deprecated updateFormState handler](#Field.updateFormState)

### <a name='Field.updateFormState'>Field.updateFormState</a>

see [handleValueChange](/docs/handleValueChange.md) for why this is deprecated.

### <a name='FieldState.equals'>boolean equals(otherFieldState)</a>

this was intended to support React's 'shouldComponentUpdate' method, but making a calculation in that regard is more complicated than just comparing the fieldstate data. it is exceedingly difficult to write this method so that it meets the requirements of all the different ways it might be used. it is still in the code but now it always returns false.

### <a name='FieldState.isMessageVisible'>boolean isMessageVisible()</a>

replaced by the showMessage prop. see the [showing messages](/docs/showingMessages.md) example.

### <a name='FieldState.setCoercedValue'>void setCoercedValue(string message)</a>

now simply calls [setValue](#FieldState.setValue). see the [noCoercion example](/docs/datePickerExample.md) for context.

### <a name='FieldState.showMessage'>FieldState showMessage()</a>

replaced by [setBlurred](#FieldState.setBlurred) and [setSubmitted](#FieldState.setSubmitted). see the [showing messages](/docs/showingMessages.md) example.

### <a name="FormState.add">void add(object state, string name, ? value, boolean doNotFlatten)</a>

replaced by [injectField](#FormState.injectField)

### <a name="FormState.setShowMessageOnBlur">static void setShowMessageOnBlur(boolean)</a>
### <a name="FormState.setShowMessageOnSubmit">static void setShowMessageOnSubmit(boolean)</a>

replaced by [showMessageOn](#FormState.showMessageOn)

### <a name="FormState.showMessageOnBlur">static boolean showMessageOnBlur()</a>

replaced by [showingMessageOnBlur](#FormState.showingMessageOnBlur)

### <a name="FormState.showMessageOnSubmit">static boolean showMessageOnSubmit()</a>

replaced by [showingMessageOnSubmit](#FormState.showingMessageOnSubmit)

### <a name='UnitOfWork.add'>object add(string name, ? value, boolean doNotFlatten)</a>

replaced by [injectField](#UnitOfWork.injectField)

### <a name="UnitOfWork.setc">FieldState setc(string name, ? value)<a/>

now simply calls [UnitOfWork.set](#UnitOfWork.set). see the [noCoercion example](/docs/datePickerExample.md) for context.
