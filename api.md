still working on this...

# api

## FieldState

a field state is essentially a collection of the following properties:

- value
- validity (1 = valid, 2 = invalid, 3 = validating, undefined = unvalidated)
- message
- asyncToken
- isMessageVisible (for showing messages on blur)

here is a list of all FieldState methods. i'll elaborate only where necessary

```jsx
equals(fieldState)

getField()
getKey()
getMessage()
getValue()

isInvalid()
isMessageVisible()
isValid()
isValidated()
isValidating()

setInvalid(message)
setValid(message)
setValidating(message)
setValue(value)

showMessage()

validate()
```

### <a name='FieldState.equals'>boolean equals(FieldState fieldState)</a>

use this to determine whether to render an input component. (it's a form of logical equivalence meant solely for this purpose.)

```jsx
shouldComponentUpdate(nextProps, nextState) {
  return !nextProps.fieldState.equals(this.props.fieldState);
}
```

### <a name='FieldState.getField'>Field getField()</a>

a field is a representation of an input component within your form component. if you create an input like this:

```jsx
<CheckboxGroup
  formField='roleIds'
  checkboxValues={this.roles}
  label='Roles'
  defaultValue={[]}
  intConvert
  validate={[['minLength',1]]} />
```

an object will be created with the following properties:

```jsx
{
  name: 'roleIds',
  label: 'Roles',
  required: false,
  validate: [['minLength',1]],
  noTrim: false,
  preferNull: false,
  intConvert: true,
  defaultValue: []
}
```

at present i'm only aware of the label field being useful in client code.

### <a name='FieldState.getKey'>string getKey()</a>

returns the canonical name for a field state. nesting is represented by a dot, i.e.

```jsx
workContact.address.line1
contacts.0.address.city
```

if you aren't using ajax to submit your data, you could use the key to create an appropriate 'name' property for your input.

```jsx
<input name={makeNameForRails(this.props.fieldState.getKey())} ...
```

### <a name='FieldState.setValidating'>string setValidating(string message)</a>

use this to create an 'asyncToken' for use in asynchronous validation. see [FormState.UnitOfWork.getFieldState](#UnitOfWork.getFieldState)

```jsx
// careful: user might type more letters into the username input box
let asyncToken = fieldState.setValidating('Verifying username...');
context.updateFormState();

function validateAsync() {
//...
```

### <a name='FieldState.validate'>void validate()</a>

this will call the appropriate validation function(s). the validity and message properties are set based on what the validation function(s) return(s). validation functions called in this manner *must be synchronous*.

```jsx
fieldState.setValue(value).validate();
```

## FormState

### <a name="FormState.registerValidation">static void registerValidation(string name, function validationHandler)</a>

add a reusable validation function with custom messaging

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

override the default required field validation.

```jsx
FormState.setRequired(function(value, label) {
  if (value.trim() === '') { return `${label} is required`; }
});
```

### <a name="FormState.constructor">constructor(React.Component formComponent)</a>

create a root form state instance. please pass your root form component so that the form state instance can manipulate its state.

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

create a unit of work "context" for making changes to immutable form state.

```jsx
handleUsernameChange(e) {
  let username = e.target.value,
    context = this.formState.createUnitOfWork(),
    fieldState = context.getFieldState('username');

  fieldState.setValue(username);
  // you would do validation here
  context.updateFormState();
}
```

### <a name="FormState.isDeleted">boolean isDeleted(string name)</a>

whether branches of your form state have been removed (using FormState.UnitOfWork.remove). use this to determine whether to show inputs

```jsx
render() {
  let contacts = [];

  for (let i = 0; i < this.state.numContacts; i++) {
    if (!this.formState.isDeleted(`contacts.${i}`)) {
      contacts.push(
        // ...
```

### <a name="FormState.isInvalid">boolean isInvalid(boolean visibleMessagesOnly)</a>

use this to determine whether to show a form-level validation message, or disable the submit button, etc.

if you are showing validation messages on blur you should pass 'true' to this function

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

look up form state for a particular field. returns a read-only FieldState instance.

typically you'd look up field state through a unit of work, but maybe you could use this in your render function.

```jsx
let fieldState = this.formState.getFieldState('fieldName');
```

## FormState.UnitOfWork

### <a name="UnitOfWork.add">void add(string name, ? value)</a>

use this if you need to add values directly to your form state. typically this is done if inputs are created dynamically during a render. here is a very contrived example:

```jsx
gotSomeNewDataFromTheStore(newContact) {
  let context = this.formState.createUnitOfWork(),
    numContacts = this.state.numContacts + 1;
  
  context.add(`contacts.${numContacts - 1}`, newContact);
  context.updateFormState({ numContacts: numContacts });
}
```

### <a name="UnitOfWork.createModel">object createModel()</a>

use this to create a model upon form submission. returns null if form state is invalid or if waiting for asynchronous validation to complete.

```jsx
handleSubmit(e) {
  e.preventDefault();
  let model = this.formState.createUnitOfWork().createModel();
  if (model) {
    alert(JSON.stringify(model)); // submit to your api or store or whatever
  }
  // else: createModel called setState to set the appropriate validation messages
}
```


### <a name="UnitOfWork.getFieldState">FieldState getFieldState(string name, string asyncToken)</a>

retrieve form state for a particular field.

if asyncToken is passed, this will return null unless the token matches the token embedded in the field state. (in asynchronous validation you should only validate if the fieldstate hasn't already changed by the time your callback is invoked.) see [FieldState.setValidating](#FieldState.setValidating)

```jsx
function validateAsync() {
  let context = this.formState.createUnitOfWork(),
    fieldState = context.getFieldState(field.name, asyncToken);
  
  if (fieldState) { // if it hasn't changed in the meantime
    // ...
```

### <a name="UnitOfWork.injectModel">object injectModel(object model)</a>

use this to initialize form state.

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

if you need to remove form state prior to form submission. typically this is done so that inputs are removed dynamically during a render.

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

call setState on your root form component. you can optionally pass additional state updates to merge with the updates accumulated in your unit of work.

```jsx
handleUsernameChange(e) {
  let username = e.target.value,
    context = this.formState.createUnitOfWork(),
    fieldState = context.getFieldState('username');

  fieldState.setValue(username);
  // you would do validation here
  context.updateFormState({ setSomeOtherProperty: 'someValue' });
}
```

