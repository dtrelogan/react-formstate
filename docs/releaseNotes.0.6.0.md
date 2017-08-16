# 0.6.0 Release Notes

There are **no breaking changes** in this release, but it significantly changes best practices.

## Showing messages

The functionality around when to show validation messages is [significantly enhanced](/docs/showingMessages.md). It is now much more robust and supports the possibility of a form-wide validation block.

While this release is fully backwards compatible, consider migrating your input components to make use of the new features. They're better.

## Initial values

FieldState instances now capture initial value. They are set explicitly when using 'injectModel' or 'injectField', or implicitly upon the first call to 'setValue' (which will store whatever the default value was before the change).

```es6
const username = this.formState.getFieldState('username');

if (newValue === username.getInitialValue()) {
  // ...
}
```

## createModelResult

You can now generate an unsubmitted model using [createModelResult](/docs/api.md#UnitOfWork.createModelResult). Unlike 'createModel', it can return an invalid model.

## Redux support

It was easy enough to add, so why not? An example is provided [here](/docs/reduxIntegration.md).
