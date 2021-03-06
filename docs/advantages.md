# Advantages of react-formstate

## [Controlled components](https://facebook.github.io/react/docs/forms.html#controlled-components)

Not [uncontrolled components](https://facebook.github.io/react/docs/uncontrolled-components.html).

## No dependencies

react-formstate should be compatible with most architectures. The only dependency is React.

## Simple

Form state is managed through a simple API. There is no form controller involved. **You** control every aspect of your form.

## Clean

One-way binding supports stateless input components and nested form components.

## Easy to understand

Form logic is encapsulated in your form components, making for compact code that is easy to follow.

## Concise

Form fields are specified directly in your JSX (no need for a redundant schema specification):

```jsx
<Input formField='password' label='Password' type='password' required
  fsv={v => v.regex(/^\S+$/)
    .msg('Password must not contain whitespace')
    .minLength(8)
    .msg('Password must be at least 8 characters')}
  />
```

## Unobtrusive

react-formstate does not trap you in a workflow and it isn't magical, so it won't get in your way.

You can write plain old validation code:

```es6
validateConfirmNewPassword(confirmationValue, context) {
  if (confirmationValue !== context.get('newPassword')) {
    return 'Password confirmation does not match';
  }
}
```

and you can override the standard change handler using a simple API:

```jsx
<Input formField='password' ... handleValueChange={this.handlePasswordChange}/>
```

```es6
handlePasswordChange(newPassword) {
  const context = this.formState.createUnitOfWork();
  const fieldState = context.set('newPassword', newPassword).validate();
  context.set('confirmNewPassword', ''); // clear the confirmation field
  if (fieldState.isValid() && newPassword.length < 12) {
    fieldState.setValid('Passwords ideally are at least 12 characters');
    fieldState.set('warn', true);
  }
  context.updateFormState(); // make a call to setState
}
```

## Straightforward

It is essentially building a form using raw React... minus the busy work.
