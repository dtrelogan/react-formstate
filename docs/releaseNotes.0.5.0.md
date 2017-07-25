# 0.5.0 Release Notes

The better part of this release is simply to clean up internal code. There is one breaking change and a few other changes that have the potential to break existing code if the API is being used in unexpected ways.

## New Functionality

### UnitOfWork.getUpdates

As an alternative to using the *updateFormState* method like so:

```es6
// the additional updates will be merged into the context's pending updates for the call to setState.
context.updateFormState({additionalUpdate1: 'someValue', additionalUpdate2: 'anotherValue'});
```

Now you can do:

```es6
const updates = context.getUpdates();
const otherUpdates = {additionalUpdate1: 'someValue', additionalUpdate2: 'anotherValue'};
this.setState(Object.assign(updates, otherUpdates));
```

This could have utility, for instance, for initialization code that is shared between a constructor and a componentWillReceiveProps method, where the constructor needs to assign to this.state but componentWillReceiveProps needs to make a call to setState.

## One breaking change

### setCoercedValue and setc are deprecated, use noCoercion or rfsNoCoercion instead

This [example](/docs/datePickerExample.md) documents the corrected approach to non-HTML inputs that do not work with string values. Basically, you need to set the *rfsNoCoercion* flag on your input component, or pass a *noCoercion* prop on each *use* of that input component. The *rfsNoCoercion* flag is recommended. (Again, see the [example](/docs/datePickerExample.md).)

The v0.4.x approach was to use getUncoercedValue in the input component like so:

```jsx
const DateInput = ({label, fieldState, handleValueChange}) => {
  return (
    <div>
      <label>{label}</label>
      <DatePicker
        selected={fieldState.getUncoercedValue()}
        onChange={handleValueChange}
        />
      <span>{fieldState.getMessage()}</span>
    </div>
  );
};
```

Then have the standard change handler use setCoercedValue, such that upon retrieving the value from the fieldState in the validation code, the value would not be coerced:

```es6
handleValueChange(newValue) {
  const context = this.formState.createUnitOfWork();
  const fieldState = context.getFieldState('someField');
  fieldState.setCoercedValue(newValue).validate();
  context.updateFormState();
}
```

This works great 99% of the time and spares the use of *rfsNoCoercion* or *noCoercion*, however it does not account for the case where you have validation on the field, and the change handler never fires before a submit.

This means *setCoercedValue* and *setc* add complexity without really solving anything, so they are deprecated. They now do **exactly** the same thing as *setValue* and *set* respectively. They will be kept around for backward compatibility, but they will be removed from the examples and *rfsNoCoercion* or *noCoercion* should be used instead.

## Other changes

- rfs props are now consumed
- this.formState.getu('notInState') === undefined
- 'add' is deprecated, use 'injectField'

### rfs props are now consumed

Prior to this release, if you were to specify this input component:

```jsx
<Input formField='description' required validate={this.validateDescription} noTrim preferNull/>
```

The props passed to the input component would include *formField*, *validate*, *noTrim*, and *preferNull*.

As of this release, react-formstate specific props are consumed and are not passed to the input component. The only react-formstate related props that are passed along are *label*, *required*, *formState*, *fieldState*, *handleValueChange*, *showValidationMessage*, and *updateFormState*. (Of course, non-rfs props like className and autoComplete continue to be passed.)

The deprecated *updateFormState* prop is passed by default for backward compatibility. If you want, you can stop this property from being passed by doing the following:

```es6
import { FormState } from 'react-formstate';
FormState.rfsProps.updateFormState.suppress = true;
```

Note you can suppress or unsuppress other props if you'd like.

### this.formState.getu('notInState') === undefined

Prior to this release:

```es6
const fi = this.formState.getFieldState('notInState');
// fi --> {value: null}
// fi.getUncoercedValue() === null; <------------------
// fi.getValue() === ''
```

This was changed to:

```es6
const fi = this.formState.getFieldState('notInState');
// fi --> {}
// fi.getUncoercedValue() === undefined;  <------------------
// fi.getValue() === ''
```

### 'add' is deprecated, use 'injectField'

'FormState.add' and 'UnitOfWork.add' have been replaced by 'FormState.injectField' and 'UnitOfWork.injectField'.

The only substantive difference is that 'UnitOfWork.injectField' does not return a value.

The original API was this:

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  const context = this.formState.createUnitOfWork();
  this.state = context.injectModel(props.model);
  this.state = context.add('someAdditionalField', 'someValue');
}
```

A while back it was revised to:

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = this.formState.injectModel(props.model);
  this.formState.add(this.state, 'someAdditionalField', 'someValue');
}
```

With the revised API, returning all the pending state updates for each call to 'UnitOfWork.add' is pointless and inefficient, particularly since as of this release a *copy* of all the pending state updates is returned.

The 'add' methods will be kept around for backward compatibility, but all the documentation and examples will be changed to use 'injectField' instead.

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = this.formState.injectModel(props.model);
  this.formState.injectField(this.state, 'someAdditionalField', 'someValue');
}
```
