# react-formstate

[![Coverage Status](https://coveralls.io/repos/github/dtrelogan/react-formstate/badge.svg?branch=master)](https://coveralls.io/github/dtrelogan/react-formstate?branch=master)
[![Build Status](https://travis-ci.org/dtrelogan/react-formstate.svg?branch=master)](https://travis-ci.org/dtrelogan/react-formstate)

## a flexible, well-designed approach to [react forms](https://facebook.github.io/react/docs/forms.html)

there are a slew of react form packages out there. why react-formstate?

- seamlessly supports dynamic forms, asynchronous validation, and nested, reusable form components.
- clean design allows for stateless input components - no mixin or decoration required.
- simple architecture encapsulates UI validation logic in your form component where it typically belongs.
- feature complete and fully tested - not a half-baked, half-finished library that will leave you hanging.

react-formstate allows you to compose elegant forms quickly and easily, without getting in your way. it saves you hassle and time while still providing effective extension points. in my opinion, no other package does this as successfully.

if you have any feedback i am happy to hear it. thanks.

### setup

    $ npm install react-formstate --save

### features and examples

- [basic example](/docs/basicExample.md)
- [model injection](/docs/modelInjection.md)
- [validation](/docs/validationWiring.md)
- [nested form components](/docs/nestedFormExample.md)
- [asynchronous validation](/docs/asyncExample.md)
- [arrays, adding and removing inputs in response to state changes](/docs/arrayExample.md)
- [other input types: checkbox, checkbox group, radio group, select, and multi-select](/docs/otherInputTypes.md)
- [nonstandard input example: react-datepicker](/docs/datePickerExample.md)
- [file input example](/docs/fileInputExample.md)
- [show validation message on blur](/docs/onBlurExample.md)
- [onUpdate callback](/docs/onUpdateExample.md)

### documentation

- [api](/docs/api.md)

### peer dependencies

- react (!)
- assumes es5 (for example: Object.keys and Array.isArray)

### alternate titles

- friendly full featured finely functioning fantastically fun form framework for [react](https://facebook.github.io/react)
- another [react](https://facebook.github.io/react) form package?!
