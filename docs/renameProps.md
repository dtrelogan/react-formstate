# Renaming standard props

If you are persnickety (like me) and if you dislike the standard prop names (I have mixed feelings about some of them myself), you can rename them.

For now, only five props can be renamed: *formField*, *fsv*, *fieldState*, *handleValueChange*, *showValidationMessage*

```es6
import { FormState } from 'react-formstate';

// you can only rename them globally
// you will have to translate examples from the documentation and the demo...

FormState.rfsProps.formField.name = 'fieldFor';
FormState.rfsProps.fsv.name = 'fluentValidate';
FormState.rfsProps.fieldState.name = 'fi';
FormState.rfsProps.handleValueChange.name = 'setValue';
FormState.rfsProps.showValidationMessage.name = 'setTouched';
```

```jsx
<Input
  fieldFor='name'
  label='Name'
  required
  fluentValidate={v => v.capitalize()}
  />
```

```jsx
export default ({fi, setValue, setTouched, ...other}) => {
  return (
    <Input
      value={fi.getValue()}
      help={fi.getMessage()}
      onChange={e => setValue(e.target.value)}
      onBlur={setTouched}
      {...other}
      />
  );
};
```

I am open to adding aliases for some of the methods in the FieldState class too.

One of my hopes though, honestly, is that this example shows that the names really are not that important...

Note you can also [configure](/docs/releaseNotes.0.5.0.md#rfs-props-are-now-consumed) which props are passed to your input components.
