# react-formstate

[![Coverage Status](https://coveralls.io/repos/github/dtrelogan/react-formstate/badge.svg?branch=master)](https://coveralls.io/github/dtrelogan/react-formstate?branch=master)
[![Build Status](https://travis-ci.org/dtrelogan/react-formstate.svg?branch=master)](https://travis-ci.org/dtrelogan/react-formstate)

## A productivity API for React forms based on setState

react-formstate streamlines form components using plain old setState and one-way binding. It's like building a form in raw React... minus the busy work.

[v0.5.0 release notes](/docs/releaseNotes.0.5.0.md)

### Motivation

If you are adding validation to a [React form](https://facebook.github.io/react/docs/forms.html) and you find yourself thinking - *there must be a better way* - that was the impetus behind react-formstate. Since React is all about responding to changes in component state, the key to a React-based solution is to provide an API to easily manage form state, specifically validation status. In doing so, you get productivity gains beyond validation. The end result is you keep your form components DRY.

### A note from the author

react-formstate turned out even better than I expected so I decided to share it with the community. It's a fully formed, optimal-in-its-own-way approach that I believe is worthy of way more traction than it's gotten thus far on NPM, but I'm always open to the idea I'm missing something.

If you have any feedback I am happy to hear it. Thanks.

### Demo (NEW!)

<a href='https://dtrelogan.github.io/react-formstate-demo/'>react-formstate-demo</a>

### Setup

    $ npm install react-formstate --save

### Walkthrough

- [Introduction to react-formstate](/docs/introduction.md)
- [Initializing and reading form state](/docs/workingWithFormState.md)
- [Updating form state](/docs/updatingFormState.md)

### Features and examples

- [Basic example](/docs/basicExample.md)
- [Show messages onChange, onBlur, or onSubmit](/docs/onBlurExample.md)
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

### Arguments for react-formstate

- [Advantages of react-formstate](/docs/advantages.md)
- [Design contrast](/docs/designContrast.md)

### Documentation

- [v0.5.0 release notes](/docs/releaseNotes.0.5.0.md)
- [API](/docs/api.md)
- [React forms](https://facebook.github.io/react/docs/forms.html)

### Peer dependencies

- [React](https://facebook.github.io/react) (!)
- Assumes es5 polyfills (for example: Object.keys and Array.isArray)

### Alternate titles

- Friendly full featured finely functioning fantastically fun form framework for React
- Another React form package?!

### Enhancements

If you have an idea for improving react-formstate, or a feature request, I am happy to hear it.

Or, feel free to fork the repository and send a pull request.

### Contributions

If you see value in [react-formstate](https://www.npmjs.com/package/react-formstate) and [react-formstate-validation](https://www.npmjs.com/package/react-formstate-validation) please star the NPM packages and the GitHub repositories.

Also, you can help others find the packages by recommending them and linking to them. Thanks!
