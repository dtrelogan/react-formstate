# [Redux](http://redux.js.org/) integration

You'll have to wire it up to Redux, but it's straightforward.

```es6
class SomeForm extends Component {

  constructor(props) {
    super(props);

    //
    // you can provide functions to get and set the underlying state
    //

    this.formState = new FormState(this, this.getFormState.bind(this), this.updateFormState.bind(this));
  }

  getFormState() {
    return this.props.reduxStore.getState().formStateForThisForm;
  }

  updateFormState(updates) {
    this.props.reduxStore.dispatch(updateFormStateForThisForm(updates));
  }

  componentDidMount() {
    const context = this.formState.createUnitOfWork();
    context.injectModel(this.props.model);
    context.updateFormState(); // will call this.updateFormState
  }

  // The rest works the same as always...

}
```

### Making an unsubmitted model available to the rest of your application

```diff
class SomeForm extends Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this, this.getFormState.bind(this), this.updateFormState.bind(this));
  }

  getFormState() {
    return this.props.reduxStore.getState().formStateForThisForm;
  }

  updateFormState(updates) {
+   if (!updates.model) {
+     // build the current model for use by the rest of your application
+     updates = {...updates, model: this.formState.createUnitOfWork().createModelResult().model};
+   }
    this.props.reduxStore.dispatch(updateFormStateForThisForm(updates));
  }

  componentDidMount() {
    const context = this.formState.createUnitOfWork();
    context.injectModel(this.props.model);
+   // include the initial model in the redux store.
+   context.updateFormState({model: this.props.model});
  }

  // ...

}
```es6
