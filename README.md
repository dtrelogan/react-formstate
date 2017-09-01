# react-formstate

[![Coverage Status](https://coveralls.io/repos/github/dtrelogan/react-formstate/badge.svg?branch=master)](https://coveralls.io/github/dtrelogan/react-formstate?branch=master)
[![Build Status](https://travis-ci.org/dtrelogan/react-formstate.svg?branch=master)](https://travis-ci.org/dtrelogan/react-formstate)

## Form validation in React

### A blatant request for feedback

After a year and a half on NPM, looking at overall downloads and GitHub stars, this package has received lukewarm response at best, and that's okay. The thing I get stuck on, is when I analyze this package and compare it to alternative packages, I keep coming up with a favorable picture of this one, which is why I threw so much into trying to make it accessible and available to the community. So I'm curious to understand, in the eyes of the React community, how this is coming up short. If you are willing to provide feedback [here](https://github.com/dtrelogan/react-formstate/issues/10), you'd be helping me out a great deal. Thanks.

(To existing users, sorry for the undignified readme updates over the past day or so. It has reached a point where I really needed to shake things up. Thanks for your understanding.)

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
- es5 (for example: Object.keys and Array.isArray)
- That's it!
