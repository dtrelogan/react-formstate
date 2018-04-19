# react-formstate

[![Coverage Status](https://coveralls.io/repos/github/dtrelogan/react-formstate/badge.svg?branch=master)](https://coveralls.io/github/dtrelogan/react-formstate?branch=master)
[![Build Status](https://travis-ci.org/dtrelogan/react-formstate.svg?branch=master)](https://travis-ci.org/dtrelogan/react-formstate)

## An API to manage your form state...

react-formstate has two competing titles:

1. DRY form validation in React.
2. A comprehensive productivity API for React forms.

The thing is, you can't have one without the other.

The advantage of react-formstate is it's not a form controller. It doesn't drive your workflow. The only trade-off you make in using it is learning how to manage your form state through the API. Other than that you retain total control over your form component, even as you maximize productivity. The only thing it's not optimal for is extremely rapid prototyping from scratch.

react-formstate is actively used in real enterprise projects, so if you are evaluating this, you can check that box.

### Contributing

For those who see its benefits, thank you for starring the package or for any other form of advocacy. Feedback, code contributions, and ideas for improvement are always welcome.

### Setup

    $ npm install react-formstate --save

### Demo

Validated react-bootstrap components: [react-formstate-demo](https://dtrelogan.github.io/react-formstate-demo/)

### Walkthrough

- [Introduction to react-formstate](/docs/introduction.md)
- [Initializing and reading form state](/docs/workingWithFormState.md)
- [Updating form state](/docs/updatingFormState.md)

### Features and examples

- [Basic example](/docs/basicExample.md)
- [Show messages onChange, onBlur, or onSubmit](/docs/showingMessages.md)
- [Validation](/docs/validationWiring.md)
- [React-Bootstrap example](/docs/reactBootstrapExample.md)
- [Checkbox, CheckboxGroup, RadioGroup, Select](/docs/otherInputTypes.md)
- [Nonstandard input example: react-datepicker](/docs/datePickerExample.md)

### Advanced features and examples

- [Asynchronous validation](/docs/asyncExample.md)
- [Nested form components](/docs/nestedFormExample.md)
- [Form extension](/docs/formExtension.md)
- [Arrays](/docs/arrayExample.md)
- [The onUpdate callback](/docs/onUpdateExample.md)
- [Redux integration](/docs/reduxIntegration.md)

### Documentation

- [Advantages of react-formstate](/docs/advantages.md)
- [Criticisms of react-formstate](/docs/criticisms.md)
- [v0.6.0 release notes](/docs/releaseNotes.0.6.0.md)
- [v0.5.0 release notes](/docs/releaseNotes.0.5.0.md)
- [API](/docs/api.md)
- [React forms](https://facebook.github.io/react/docs/forms.html)

### Peer dependencies

- [React](https://facebook.github.io/react)
- es5 (for example: Object.keys and Array.isArray)
- That's it!
