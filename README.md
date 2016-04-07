# react-formstate

[![Coverage Status](https://coveralls.io/repos/github/dtrelogan/react-formstate/badge.svg?branch=master)](https://coveralls.io/github/dtrelogan/react-formstate?branch=master)
[![Build Status](https://travis-ci.org/dtrelogan/react-formstate.svg?branch=master)](https://travis-ci.org/dtrelogan/react-formstate)

## a clean, simple form framework for [react](https://facebook.github.io/react)

- no mixin or decoration, just an api
- framework provides props, you lay out your inputs
- form state lives with your form component until the form is submitted with valid data
- works with react [controlled components](https://facebook.github.io/react/docs/forms.html#controlled-components)
- comprehensive and feature complete - give it a try!

### setup

    $ npm install react-formstate --save

### features and examples

- [basic example](/docs/basicExample.md)
- [validation](/docs/validationWiring.md)
- [nested form components](/docs/nestedFormExample.md)
- [asynchronous validation](/docs/asyncExample.md)
- [arrays, adding and removing inputs in response to state changes](/docs/arrayExample.md)
- [other input types: checkbox, checkbox group, radio group, select, and multi-select](/docs/otherInputTypes.md)
- [show validation message on blur](/docs/onBlurExample.md)
- [onUpdate callback](/docs/onUpdateExample.md)

### documentation

- [api](/docs/api.md)

### peer dependencies

- react (!)
- assumes es5 (for example: Object.keys and Array.isArray)
