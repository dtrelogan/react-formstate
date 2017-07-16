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
          onChange={this.props.updateFormState}
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
