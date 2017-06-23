# react-formstate

[![Coverage Status](https://coveralls.io/repos/github/dtrelogan/react-formstate/badge.svg?branch=master)](https://coveralls.io/github/dtrelogan/react-formstate?branch=master)
[![Build Status](https://travis-ci.org/dtrelogan/react-formstate.svg?branch=master)](https://travis-ci.org/dtrelogan/react-formstate)

## A practical approach to React forms

If you are adding validation to a [React form](https://facebook.github.io/react/docs/forms.html) and you find yourself thinking - *there must be a better way* - that was the impetus behind react-formstate. Since React is all about responding to changes in component state, the key to a React-based solution is to provide an API to easily manage form state, specifically validation status. In doing so, you get productivity gains beyond validation. The end result is you keep your form components DRY.

react-formstate is a productivity solution for [React forms](https://facebook.github.io/react/docs/forms.html) that supports real-world, non-trivial use cases. It eliminates busy work without sacrificing flexibility.

react-formstate turned out even better than I expected. If you give it a try, I think you'll be happy with the solution too.

If you have any feedback I am happy to hear it. Thanks.

### Setup

    $ npm install react-formstate --save

### Walkthrough

- [Introduction to react-formstate](/docs/introduction.md)
- [Initializing and reading form state](/docs/workingWithFormState.md)
- [Updating form state](/docs/updatingFormState.md)

### Features and examples

- [Basic example](/docs/basicExample.md)
- [Show validation message on blur](/docs/onBlurExample.md)
- [Validation](/docs/validationWiring.md)
- [React-Bootstrap example](/docs/reactBootstrapExample.md)
- [Nonstandard input example: react-datepicker](/docs/datePickerExample.md)

### Advanced features and examples

- [Asynchronous validation](/docs/asyncExample.md)
- [Nested form components](/docs/nestedFormExample.md)
- [Form extension](/docs/formExtension.md)
- [Arrays](/docs/arrayExample.md)
- [Other input types: checkbox, checkbox group, radio group, select, and multi-select](/docs/otherInputTypes.md)
- [The onUpdate callback](/docs/onUpdateExample.md)

### Documentation

- [API](/docs/api.md)
- [React forms](https://facebook.github.io/react/docs/forms.html)
- [Design contrast](/docs/designContrast.md)

### Peer dependencies

- [React](https://facebook.github.io/react) (!)
- Assumes es5 polyfills (for example: Object.keys and Array.isArray)

### Alternate titles

- Friendly full featured finely functioning fantastically fun form framework for React
- Another React form package?!

### File input examples

- [File input example - iteration 1](/docs/deprecatedFileInputExample.md)
- [File input example - iteration 2](/docs/fileInputExampleIteration2.md)
- [File input example - iteration 3](/docs/fileInputExample.md)
