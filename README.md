# react-formstate

[![Coverage Status](https://coveralls.io/repos/github/dtrelogan/react-formstate/badge.svg?branch=master)](https://coveralls.io/github/dtrelogan/react-formstate?branch=master)
[![Build Status](https://travis-ci.org/dtrelogan/react-formstate.svg?branch=master)](https://travis-ci.org/dtrelogan/react-formstate)

## An optimal productivity API for React forms

react-formstate streamlines form components without imposing on your workflow. It relies almost exclusively on React's built-in support for one-way binding. In essence, it's a simple matter of auto-generating event handlers and allowing you to override them when necessary (as in, you surrender nothing in the bargain).

It's as lightweight as you can get, yet it does everything you'd want.

You can use it with setState or you can hook it up to Redux.

    $ npm install react-formstate --save

Since react-formstate is essentially building a form in raw React, it will support your use case.

It truly is the optimal API for React forms. The only thing it lacks is users. Maybe you can help with that?

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

### Motivation

If you are adding validation to a [React form](https://facebook.github.io/react/docs/forms.html) and you find yourself thinking - there must be a better way - that was the impetus behind react-formstate. Since React is all about responding to changes in component state, the key to a React-based solution is to provide an API to easily manage form state, specifically validation status. In doing so, you get productivity gains beyond validation. The end result is you keep your form components DRY.

### Documentation

- [Advantages of react-formstate](/docs/advantages.md)
- [Criticisms of react-formstate](/docs/criticisms.md)
- [v0.6.0 release notes](/docs/releaseNotes.0.6.0.md)
- [v0.5.0 release notes](/docs/releaseNotes.0.5.0.md)
- [API](/docs/api.md)
- [React forms](https://facebook.github.io/react/docs/forms.html)

### Peer dependencies

- [React](https://facebook.github.io/react)
- es5 polyfills (for example: Object.keys and Array.isArray)
- That's it!

### Enhancements

If you have an idea for improving react-formstate, or a feature request, I am happy to hear it.

Or, feel free to fork the repository and send a pull request.

### Contributions

If you see value in [react-formstate](https://www.npmjs.com/package/react-formstate) and [react-formstate-validation](https://www.npmjs.com/package/react-formstate-validation) please star the NPM packages and the GitHub repositories.

Also, you can help others find the packages by recommending them and linking to them. Thanks!
