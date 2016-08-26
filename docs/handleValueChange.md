# handleValueChange

the original change handler, updateFormState, was passed an event

```jsx
<Input formField='firstName'/>
```

```es6
export default class Input extends Component {
  render() {
    return (
      <div>
        <label>{this.props.label}</label>
        <input
          type={this.props.type || 'text'}
          value={this.props.fieldState.getValue()}
          onChange={this.updateFormState}
          />
        <span>{this.props.fieldState.getMessage()}</span>
      </div>
    );
  }
}
```

the new change handler, handleValueChange, is passed a value

```es6
export default class Input extends Component {
  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }

  render() {
    return (
      <div>
        <label>{this.props.label}</label>
        <input
          type={this.props.type || 'text'}
          value={this.props.fieldState.getValue()}
          onChange={this.onChange}
          />
        <span>{this.props.fieldState.getMessage()}</span>
      </div>
    );
  }

  onChange(e) {
    this.props.handleValueChange(e.target.value);
  }
}
```

in normal circumstances, updateFormState was less work for the user, particularly in the [CheckboxGroup](/docs/otherInputTypes.md#checkboxgroup) and [Select](/docs/otherInputTypes.md#select-and-multi-select) input components.

however, for nonstandard inputs it created [flawed choices](/docs/deprecatedDatePickerExample.md).

handleValueChange [remedies](/docs/datePickerExample.md) this problem.

### getUncoercedValue

if you compare the two react-datepicker examples you'll also notice the 'noCoercion' property is no longer necessary.

the advantage of using 'getUncoercedValue' is you don't have to remember to set 'noCoercion' on every usage, you only spell it out once in the input component.

```es6
render() {
  // there is no longer a need to do this
  return (
    <div>
      <DateInput formField='date1' noCoercion/>
      <DateInput formField='date2' noCoercion/>
      <DateInput formField='date3' noCoercion/>
    </div>
  );
}
```

you might have noticed 'handlerBindFunction' is gone in the new example as well. the onChange function in the input component now serves this purpose.

*note* there are no plans to remove any of the updateFormState handler, the noCoercion property, nor the handlerBindFunction property. they have simply been replaced in the examples by handleValueChange and getUncoercedValue.
