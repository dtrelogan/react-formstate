# get and set helpers

### get and set

after extensive use i found the following syntax tedious (particularly because in react-formstate, nested form components should not manage their own state)

```es6
render() {
  if (this.formState.getFieldState('someField').getValue() === 'someValue') {
    // do something...
  }
  // ...
}

customHandler(e) {
  let context = this.formState.createUnitOfWork(),
    fieldState = context.getFieldState('someField');

  fieldState.setValue(e.target.value);
  // ...
}
```

so i added functions to streamline things a bit

```es6
render() {
  if (this.formState.get('someField') === 'someValue') {
    // do something...
  }
  // ...
}

customHandler(e) {
  let context = this.formState.createUnitOfWork(),
    fieldState = context.set('someField', e.target.value);

  // ...
}
```

### getu

getu is an alternative that retrieves an uncoerced value.

when is this useful? for starters, see the [react-datepicker example](./datePickerExample.md).

then, if you are using react-datepicker and injecting a model, you might have conditional logic in your render function like so

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = this.formState.injectModel(props.model);
}

render() {
  let yay = null, dateValue = this.formState.getu('someInjectedDate');
  if (dateValue && dateValue.date() === 1) {
    yay = "it's the first of the month!";
  }
  // ...
}
```

### setc

lastly setc can be used when you know the value you are setting has been coerced. for example if you do this:

```es6
customHandler(e) {
  let context = this.formState.createUnitOfWork(),
    fieldState = context.set('someField', e.target.value);

  // ...
}
```

the next time you do a get on 'someField' the coercion function will be called to coerce the newly set value.

if you know the value is already coerced, you can save a future call to the coercion function by using setc instead

```es6
customHandler(e) {
  let context = this.formState.createUnitOfWork(),
    fieldState = context.setc('someField', e.target.value);

  // or
  // fieldState = context.getFieldState('someField').setCoercedValue(e.target.value);

  // ...
}
```

it's not going to make much of a performance difference, but one might consider it a matter of principle not to do unnecessary work, right?
