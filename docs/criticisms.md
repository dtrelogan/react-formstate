# Criticisms of react-formstate

### Not driven by a declarative schema or otherwise exclusively data-driven

Nope. It doesn't do everything for you out of the box.

### Does not automate submitting status for you

Nope. You decide how to use your submit handler.

### No form-wide validation block

Nope. Not sure it would simplify things or support more use cases, but [it can be added](https://github.com/dtrelogan/react-formstate/issues/9).

### Does not include a library of input components

Nope. Never will.

### Uses 'new' rather than factory pattern

Could be missing something, but in a duck-typed language, isn't this effectively factory pattern?

```es6
import { FormState } from 'react-formstate';
// ...
this.formState = new FormState(this);
```

### Not pure functional programming

Nope. I have a tremendous amount of respect for FP. I think an imperative UnitOfWork class that mutates data presents no risk and is easier to use for its limited intended purpose.

### fieldState and formState props are not pure objects

Nope. They are class instances. This might be out of style, but keep in mind that React uses class inheritance.

### Implicit initialization

react-formstate favors implicit initialization. For the vast majority of use cases, avoiding explicit initialization saves time and effort:

```jsx
// with react-formstate you can avoid doing this
// initialize a bunch of empty strings to make HTML inputs happy
initialModel = { firstName: '', lastName: '', address: { line1: '', line2: '', line3: '', city: '', zip: '' } ... };
```

But there are trade-offs:

#### String coercion

To support implicit initialization, react-formstate coerces initial values to strings by default. In the normal case this will save you time - including when you are injecting an existing model from your database - but it does add some complexity.

#### Using an unsubmitted model

If you explicitly initialize a model, you can make that model available to the rest of your application while the user manipulates the form, updating it upon each update to form state:

```es6
{
  'formState.firstName': { value: 'Huckle', validity: 1 },
  'formState.lastName': { value: '', validity: 2, message: 'Last Name is required'},
  // this could be made available to other parts of your application prior to form submission
  model: { firstName: 'Huckle', lastName: '' }
}
```

There are caveats, however.

Upon valid submission, you often have to transform your model back to a slightly different format before submitting to your database. It's unclear if you'd want to do that for a transient, unsubmitted model.

Along the same lines, it seems odd to want to use a library like react-formstate for this purpose. react-formstate adds the most value for validated forms. If your model requires validation prior to a submit, it's unclear why you'd want to make an invalid model available to the rest of your application. If your model does not require validation prior to a submit, it should be easy enough to write the form in raw React.

That being said, if you want to get react-formstate involved, you can. See the [redux example](/docs/reduxIntegration.md).

#### Form-wide isPristine function

This requires explicit initialization. Upon every update to form state you could then do a "deep equals" between the initial model and the current model.

react-formstate doesn't provide any support for this other than giving you the ability to create the current model upon each update (see the [redux example](/docs/reduxIntegration.md)). You'd have to do the "deep equals" against your initial model.

#### No "clear form" function

Also requires explicit initialization. While react-formstate doesn't provide direct support for this, it's easy to provide a function to reset the form:

```jsx
<SomeForm
  key={this.state.formKey}
  clearForm={() => this.setState({formKey: createANewFormKey()})}
  model={theInitialModel}
  />
```

You have to do something along these lines anyway if the user navigates from '/users/10/edit' to '/users/create'.

&nbsp;

(Last, and least)

### Nested form components must be stateless

This is a trade-off against configuring form fields in JSX. You can piggyback on the FormState API to work around it (remember, since the generated model is based on the fields defined in your JSX, it doesn't hurt to store miscellaneous data in form state):

```jsx
// in your nested form component
const context = this.props.formState.createUnitOfWork();
context.set('someMetaStateVariable', someValue);
context.set('anotherMetaStateVariable', someOtherValue);
context.updateFormState();
// ...
this.props.formState.getu('someMetaStateVariable');
```
