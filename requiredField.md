# Required Fields

a required field is such a common validation it's worth adding some sugar

```jsx
<Input formField='name' label='Name' required validate={this.otherValidationForName} />
```

you can still autowire other validation of course

```jsx
validateName() {
  // other validation goes here
}

// ...

<Input formField='name' label='Name' required />
```

default behavior for required:

```jsx
function(value) {
  if (value.trim() === '') { return 'Required field'; }
}
```

if you want it to work differently you can override it. i might suggest:

```jsx
import { FormState } from 'react-formstate';

//...

FormState.setRequired(function(value, context, field) {
  if (value.trim() === '') { return `${field.label} is required`; }
});
```
