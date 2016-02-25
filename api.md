still working on this...

# api

## FormState

### static void registerValidation(function validationHandler)

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

### static void setRequired(function validationHandler)

override the default required field validation.

```jsx
FormState.setRequired(function(value, label) {
  if (value.trim() === '') { return `${label} is required`; }
});
```

### constructor(React.Component formComponent)

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

### FormState.UnitOfWork createUnitOfWork()

create a unit of work "context" for making changes to immutable form state.

```jsx
// assigning directly to state should only be done in your root form component constructor
this.state = this.formState.createUnitOfWork().injectModel(props.model);
// anywhere else you should use UnitOfWork.updateFormState, which calls React.Component.setState
```

### boolean isDeleted(string name)

whether branches of your form state have been removed (using FormState.UnitOfWork.remove). use this to determine whether to show inputs

```jsx
render() {
  let contacts = [];

  for (let i = 0; i < this.state.numContacts; i++) {
    if (!this.formState.isDeleted(`contacts.${i}`)) {
      contacts.push(
        // ...
```

### boolean isInvalid(boolean visibleMessagesOnly)

use this to determine whether to show a form-level validation message, or disable the submit button, etc.

if you are showing validation messages on blur you should pass 'true' to this function

```jsx
<input type='submit' value='Submit' onClick={this.handleSubmit.bind(this)} />
<span>{this.formState.isInvalid() ? 'Please fix validation errors' : null}</span>
```

### boolean isValidating()

returns true if the form is waiting for asynchronous validation to finish.

```jsx
<input type='submit' value='Submit' onClick={this.handleSubmit.bind(this)} />
<span>{this.formState.isValidating() ? 'Waiting for validation to finish...' : null}</span>
```

## FormState.UnitOfWork

### void add(string name, ? value)

use this if you need to add values directly to your form state. typically this is done if inputs are created dynamically during a render. here is a very contrived example:

```jsx
gotSomeNewDataFromTheStore(newContact) {
  let context = this.formState.createUnitOfWork(),
    numContacts = this.state.numContacts + 1;
  
  context.add(`contacts.${numContacts}`, newContact);
  context.updateFormState({ numContacts: numContacts });
}
```

### void createModel()

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


### FieldState getFieldState(string name, string asyncToken)

retrieve form state for a particular field. if asyncToken is passed, this will return null unless the token matches the token embedded in the field state. in asynchronous validation you should only validate if the fieldstate hasn't already changed by the time your callback is invoked.

```jsx
function validateAsync() {
  let context = this.formState.createUnitOfWork();
  let fieldState = context.getFieldState(field.name, asyncToken);
  if (fieldState) { // if it hasn't changed in the meantime
    // ...
```

### object injectModel(object model)

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

### void remove(string name)

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

### void updateFormState(object additionalUpdates)

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

