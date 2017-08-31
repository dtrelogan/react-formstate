# Criticisms of react-formstate

### It does not include a library of input components

Nope. Never will.

### It is not driven by a declarative schema or otherwise exclusively data-driven

Nope. It doesn't do everything for you out of the box. (But it also doesn't box you in.)

### It does not provide special support for reusing validation server-side

Nope. Seems a bridge too far.

### It does not automate submitting status for you

Nope. You decide how to use your submit handler.

### There is no form-wide validation feature

Nope. A form-wide validation block would not support additional use cases. IMHO, it [adds more complexity than it's worth](https://github.com/dtrelogan/react-formstate/issues/9).

If a strong case can be made for it actually simplifying code, it's easy to add.

### Uses 'new' rather than factory pattern

In a duck-typed language, isn't this effectively factory pattern?

```es6
import { FormState } from 'react-formstate';
// ...
this.formState = new FormState(this);
```

The react-formstate library could be changed to spit out anything that implements the API, right?

### It does not embody pure functional programming

Nope. It uses a mishmash of styles, just like React. (React uses class inheritance!)

I really like FP, but I think an imperative UnitOfWork class that mutates data presents no risk and is easier to use for its limited intended purpose.

### fieldState prop is not a pure object

Nope. FieldState is a class, so the fieldState prop is a class instance. It is what it is. (Note that it's read-only.)

The only downside I can think of is that it makes it awkward to override fieldState properties:

```jsx
export default ({fieldState, value, ...other}) => {
  // can't think of why you'd want to do this but...
  <input value={value !== undefined ? value : fieldState.getValue()} ... />
}
```

### Form fields are not always one-to-one with the backing form state

Nope. Generally, the model should be generated from the form and not the other way around.

### Implicit initialization

react-formstate steers you toward implicit initialization. For the vast majority of use cases, avoiding explicit initialization saves time and effort:

```es6
// With react-formstate you can do this:
initialModel = {};
// instead of this:
initialModel = {
  firstName: '',
  lastName: '',
  address: {
    line1: '',
    line2: '',
    line3: '',
    city: '',
    zip: ''
  }
  //...
};
```

Of course, you can still do explicit initialization with react-formstate (see an example [here](https://dtrelogan.github.io/react-formstate-demo/?form=dependentsRedux)), but to support implicit initialization, some trade-offs have been made:

#### String coercion

react-formstate coerces initial values to strings by default. In the normal case this can save you time, but it does add a little complexity.

#### Flattening the injected model causes extraneous field states to be injected

Yup. Again, usually this saves work. If it's causing performance issues in an edge case, you can use the 'doNotFlatten' option in 'injectField'.

#### Form-wide isPristine function

Since react-formstate doesn't require explicit initialization, it doesn't provide special support for this feature. If you need this, you can do explicit initialization, store the initial model in state, and perform a "deep equals" between the initial model and the [current model](/docs/reduxIntegration.md#unsubmittedModel) at the start of each render. Since the semantics of "deep equals" might vary between use cases, it might be better for you to control this anyway.

#### No "clear form" function

While react-formstate doesn't provide direct support for this, it's easy to provide a function to reset the form:

```jsx
<SomeForm
  key={this.state.formId}
  clearForm={() => this.setState({formId: uuid()})}
  model={theInitialModel}
  />
```

You have to do something along these lines anyway if the user navigates directly from '/users/10/edit' to '/users/create'.

&nbsp;

(Last, and least)

### Nested form components should leave state management to the root form component

Otherwise, how would 'this.formState.isInvalid()' or 'this.formState.isUploading()' work in the root form component?

Furthermore, in the nested form component, 'this.props.formState.updateFormState({someMetaStateVariable: '...'})' sets 'someMetaStateVariable' in the state of the root form component, such that in the nested form component you cannot access the variable using 'this.state.someMetaStateVariable'.

The best way to "work around" this is to piggyback on the FormState API (remember, since the generated model is based on the fields defined in your JSX, it doesn't hurt to store miscellaneous data in form state):

```jsx
// in your nested form component
const context = this.props.formState.createUnitOfWork();
context.set('someMetaStateVariable', someValue);
context.set('anotherMetaStateVariable', someOtherValue);
context.updateFormState();
// ...
if (this.props.formState.getu('someMetaStateVariable')) {
  // special behavior...
}
```

I can't think of how this might actually limit you, so I'm not sure this is actually a criticism, but it's a consequence of react-formstate's design that seems worth pointing out.
