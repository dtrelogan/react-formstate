# api

- [Field](#Field)
- [FieldState](#FieldState)
- [FormArray](#FormObject)
- [FormObject](#FormObject)
- [FormState](#FormState)
- [UnitOfWork](#UnitOfWork)

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

```jsx
{
  name: 'roleIds',
  label: 'Roles',
  required: false,
  validate: [['minLength',1]],
  noTrim: false,
  preferNull: false,
  intConvert: true,
  defaultValue: [],
  noCoercion: false
}
```

### name

ties an input component to an [injected](#UnitOfWork.injectModel) model by way of form state. fields, as defined during a render, also form a specification of the model to be [generated](#UnitOfWork.createModel) upon form submission.

### label

for purposes of display.

### required

see [validation](/validationWiring.md)

### validate

see [validation](/validationWiring.md)

### <a name='Field.noTrim'>noTrim</a>

string values are trimmed by default. noTrim overrides this behavior. see [UnitOfWork.createModel](#UnitOfWork.createModel)

### <a name='Field.preferNull'>preferNull</a>

produces a null value rather than an empty string or an empty array. see [UnitOfWork.createModel](#UnitOfWork.createModel)

### <a name='Field.intConvert'>intConvert</a>

casts a string to an integer, or an array of strings to an array of integers. see [UnitOfWork.createModel](#UnitOfWork.createModel)

useful for a select input for instance.

### defaultValue

defines a default value for your input.

if a model is [injected](#UnitOfWork.injectModel) into form state, the model value takes precedence over the default value. *be careful*: when inputs do not align exactly with your backing model, some inputs could receive an initial value from the injected model while other unaligned inputs could receive the configured default value. this could be a source of confusion and/or bugs during development.

*important*: if using the framework generated change handler, for select-multiple and checkbox group inputs *always* supply an array default value in your jsx. you must do this because otherwise the framework has no idea whether *your* component contains a text input or a select input.

do not confuse this property with the defaultValue for a react [uncontrolled component](https://facebook.github.io/react/docs/forms.html#uncontrolled-components). input components managed by the framework are [controlled components](https://facebook.github.io/react/docs/forms.html#controlled-components). always supply a value property to your inputs.

### <a name='noCoercion'>noCoercion</a>

most html inputs work with string values. [injected](#UnitOfWork.injectModel) values are coerced to strings by default. the noCoercion setting disables this logic:

```jsx
if (!isDefined(v)) { return ''; } // else
if (v === true || v === false) { return v; } // else
if (Array.isArray(v)) { return v.map(x => isDefined(x) ? x.toString() : x); } // else
return v.toString();
```

## <a name='FieldState'>FieldState</a>

a field state is essentially a collection of the following properties:

- value
- validity (1 = valid, 2 = invalid, 3 = validating, undefined or null = unvalidated)
- message
- asyncToken
- isMessageVisible (for showing messages [on blur](/onBlurExample.md))

### <a name='FieldState.equals'>boolean equals(FieldState fieldState)</a>

use this to determine whether to render an input component. (it's a form of logical equivalence meant solely for this purpose.)

```jsx
shouldComponentUpdate(nextProps, nextState) {
  return !nextProps.fieldState.equals(this.props.fieldState);
}
```

### <a name='FieldState.getField'>Field getField()</a>

returns the [Field](#Field) associated with the field state, if there is one.

```jsx
let field = fieldState.getField();
fieldState.setValidating(`Verifying ${field.label}`);
```

### <a name='FieldState.getKey'>string getKey()</a>

returns the canonical name for a field state. nesting is represented by a dot, i.e.

```jsx
workContact.address.line1
contacts.0.address.city
```

if you aren't using ajax to submit your data, you could use the key to create an appropriate 'name' property for your input. the proper structure of the name field may depend on your server side framework.

```jsx
<input name={makeName(this.props.fieldState.getKey())} ...
```

### <a name='FieldState.getMessage'>string getMessage()</a>

### <a name='FieldState.getValue'>string getValue()</a>

### <a name='FieldState.isInvalid'>boolean isInvalid()</a>

### <a name='FieldState.isMessageVisible'>boolean isMessageVisible()</a>

see the [on blur](/onBlurExample.md) example

### <a name='FieldState.isValid'>boolean isValid()</a>

### <a name='FieldState.isValidated'>boolean isValidated()</a>

### <a name='FieldState.isValidating'>boolean isValidating()</a>

### <a name='FieldState.setInvalid'>void setInvalid(string message)</a>

### <a name='FieldState.setValid'>void setValid(string message)</a>

### <a name='FieldState.setValidating'>string setValidating(string message)</a>

updates validity, sets a message, and returns an 'asyncToken' for use in asynchronous validation. see [UnitOfWork.getFieldState](#UnitOfWork.getFieldState)

```jsx
// careful: user might type more letters into the username input box
let asyncToken = fieldState.setValidating('Verifying username...');
context.updateFormState();

function validateAsync() {
//...
```

### <a name='FieldState.setValue'>void setValue(string message)</a>

### <a name='FieldState.showMessage'>boolean showMessage()</a>

see the [on blur](/onBlurExample.md) example

### <a name='FieldState.validate'>void validate()</a>

calls the appropriate validation function(s). uses the result to update the validity and message properties appropriately. see the [validation](/validationWiring.md) documentation.

*important*: a validation function called in this manner *must be synchronous*.

```jsx
fieldState.setValue(value).validate();
```

## <a name='FormObject'>FormObject/FormArray</a>

FormObject and FormArray components are meant to align with your backing model. for instance, if you have a model like this:

```jsx
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

then ideally your jsx is structured along the following lines:

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

if you absolutely cannot align your model with your jsx in this manner, transform your model before [injection](#UnitOfWork.injectModel) and after [generation](#UnitOfWork.createModel). see [UnitOfWork.add](#UnitOfWork.add)

### required props

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

```jsx
export default class Contact extends React.Component {
  render() {
    return (
      <FormObject nestedForm={this}>
      </FormObject>
```

### optional props

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

### property generation

FormObjects and FormArrays are essentially property generators. for a nested "formField", the following props are added:

- label: a label modified by an optional labelPrefix (see [above](#labelPrefix))
- fieldState: a [FieldState](#FieldState) contains props useful to an input component
- updateFormState: the onChange handler for your input component
- showValidationMessage: an optional onBlur handler

note: for asynchronous validation you must override the framework generated updateFormState handler. see an example [here](/asyncExample.md)

FormObjects and FormArrays pass the following properties to nested FormObjects and FormArrays.

- formState: [pathed](#UnitOfWork.getFieldState) appropriately
- validationComponent: for [auto-wiring](/validationWiring.md#autowiring) validation functions
- labelPrefix: see [above](#labelPrefix)

## <a name='FormState'>FormState</a>

### <a name="FormState.registerValidation">static void registerValidation(string name, function validationHandler)</a>

adds a reusable validation function with custom messaging

```jsx
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

```jsx
FormState.setRequired(function(value, label) {
  if (value.trim() === '') { return `${label} is required`; }
});
```

### <a name="FormState.constructor">constructor(React.Component formComponent)</a>

creates a root form state instance.

pass your root form component to the constructor to allow the form state instance to manipulate component state.

```jsx
export default class UserForm extends React.Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this); // invoke the constructor
    this.state = {};
  }
  
  //...
}
```

### <a name="FormState.createUnitOfWork">FormState.UnitOfWork createUnitOfWork()</a>

creates a unit of work "context" for making changes to immutable form state.

```jsx
handleUsernameChange(e) {
  let username = e.target.value,
    context = this.formState.createUnitOfWork(),
    fieldState = context.getFieldState('username');

  fieldState.setValue(username).validate();
  context.updateFormState();
}
```

### <a name="FormState.isDeleted">boolean isDeleted(string name)</a>

determines whether a branch of your form state was removed (using [UnitOfWork.remove](#UnitOfWork.remove)).

typically used to conditionally show inputs during render.

```jsx
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
<input type='submit' value='Submit' onClick={this.handleSubmit.bind(this)} />
<span>{this.formState.isInvalid() ? 'Please fix validation errors' : null}</span>
```

### <a name="FormState.isValidating">boolean isValidating()</a>

returns true if the form is waiting for asynchronous validation to finish.

```jsx
<input type='submit' value='Submit' onClick={this.handleSubmit.bind(this)} />
<span>{this.formState.isValidating() ? 'Waiting for validation to finish...' : null}</span>
```

### <a name="FormState.getFieldState">FieldState getFieldState(string name)</a>

retrieves form state for a particular field. returns a read-only FieldState instance.

typically field state is retrieved through a [context](#UnitOfWork.getFieldState).

this is potentially useful in a render function.

```jsx
let fieldState = this.formState.getFieldState('fieldName');
```

## <a name='UnitOfWork'>UnitOfWork</a>

### <a name="UnitOfWork.add">object add(string name, ? value)</a>

adds a value directly to your form state, or updates an existing value.

returns the state updates from the unit of work. this makes it easier to transform injected form state

```jsx
let context = this.formState.createUnitOfWork();
context.injectModel(model);
// the model field is named 'disabled'
// but the jsx presents it as 'active'
this.state = context.add('active', !model.disabled);
```

another potential use is to add input components dynamically. here is a very contrived example:

```jsx
gotSomeNewDataFromTheStore(newContact) {
  let context = this.formState.createUnitOfWork(),
    numContacts = this.state.numContacts;
  
  // add the new contact to the array.
  // new inputs will be rendered dynamically.
  context.add(`contacts.${numContacts}`, newContact);
  context.updateFormState({ numContacts: numContacts + 1 });
}
```

### <a name="UnitOfWork.createModel">object createModel(boolean noUpdate)</a>

creates a model upon form submission.

returns null if form state is invalid or if waiting on asynchronous validation.

```jsx
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

```jsx
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

also see [noTrim](#Field.noTrim), [preferNull](#Field.preferNull), and [intConvert](#Field.intConvert)

### <a name="UnitOfWork.getFieldState">FieldState getFieldState(string name, string asyncToken)</a>

retrieves form state for a particular field.

if asyncToken is passed, returns null unless the token matches the token embedded in the field state. (in an asynchronous validation callback, validate *only* if the fieldstate hasn't changed before the callback is invoked. see [FieldState.setValidating](#FieldState.setValidating))

```jsx
function validateAsync() {
  let context = this.formState.createUnitOfWork(),
    fieldState = context.getFieldState(field.name, asyncToken);
  
  if (fieldState) { // if it hasn't changed in the meantime
    // ...
```

in a nested form component, name is relative to the path embedded in the nested form state.

```jsx
export default class Contact extends React.Component {
  function handleEmailChange(e) {
    // a pathed formState is passed to a nested component
    let context = this.props.formState.createUnitOfWork(),
      fieldState = context.getFieldState('email');
      
    // the retrieved fieldState might be for homeContact.email
    // or for workContact.email
    // the nested component doesn't know or care
```

### <a name="UnitOfWork.injectModel">object injectModel(object model)</a>

initializes form state. values are [coerced](#noCoercion) to strings by default.

```jsx
export default class UserForm extends React.Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = this.formState.createUnitOfWork().injectModel(props.model);
  }
  
  //...
}
```

### <a name="UnitOfWork.remove">void remove(string name)<a/>

removes form state prior to form submission.

typically used to dynamically remove an input component. see [FormState.isDeleted](#FormState.isDeleted)

```jsx
removeContact(i) {
  return function(e) {
    e.preventDefault();
    let context = this.formState.createUnitOfWork();
    context.remove(`contacts.${i}`);
    context.updateFormState();
  }.bind(this);
}
```

### <a name="UnitOfWork.updateFormState">void updateFormState(object additionalUpdates)</a>

calls setState on your root form component.

optionally accepts additional state updates to merge with the unit of work updates.

```jsx
handleUsernameChange(e) {
  let username = e.target.value,
    context = this.formState.createUnitOfWork(),
    fieldState = context.getFieldState('username');

  fieldState.setValue(username).validate();
  context.updateFormState({ setSomeOtherProperty: 'someValue' });
}
```

