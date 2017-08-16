# [Redux](http://redux.js.org/) integration

Working example [here](https://dtrelogan.github.io/react-formstate-demo/?form=redux)

```es6
class SomeForm extends Component {

  constructor(props) {
    super(props);

    //
    // you can provide functions to get and set the underlying state
    //

    this.formState = new FormState(this, this.getState.bind(this), this.updateState.bind(this));
  }

  getState() {
    return this.props.stateFromReduxStore;
  }

  updateState(updates) {
    this.props.updateStateInReduxStore(updates);
  }

  componentDidMount() {
    const context = this.formState.createUnitOfWork();
    context.injectModel(this.props.model);
    context.updateFormState();
  }

  // The rest works the same as always...

}
```

### <a name='unsubmittedModel'>Making an unsubmitted model available to the rest of your application</a>

```diff
class SomeForm extends Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this, this.getState.bind(this), this.updateState.bind(this));
  }

  getState() {
    return this.props.stateFromReduxStore;
  }

  updateState(updates) {
+   // copy the pending form state updates into a clean work area
+   const context = formState.createUnitOfWork(updates);
+
+   // build a model based on the current form state
+   const model = context.createModelResult().model;
+
+   // make the model available to the rest of the application
+   this.props.updateStateInReduxStore({...updates, model});
  }

  componentDidMount() {
    const context = this.formState.createUnitOfWork();
    context.injectModel(this.props.model);
    context.updateFormState();
  }

  // ...

}
```

### Sample container


The redux store looks like this:

```es6
{
  forms: [
    {
      id: 123,
      state: {...}
    },
    {
      id: 456,
      state: {...}
    }
  ]
}
```



```jsx
import React, { Component } from 'react';


export default (FormComponent) => {

  return class ReduxFormContainer extends Component {

    constructor(props) {
      super(props);
      this.updateFormStore = this.updateFormStore.bind(this);
    }

    componentDidMount() {
      this.createFormStore();
    }

    componentWillUnmount() {
      this.deleteFormStore();
    }

    // simple CRUD actions

    createFormStore() {
      this.props.store.dispatch({
        type: 'CREATE_FORM',
        id: this.props.formId
      });
    }

    readFormStore() {
      return this.props.store.getState().forms.filter(f => f.id === this.props.formId)[0];
    }

    updateFormStore(updates) {
      this.props.store.dispatch({
        type: 'UPDATE_FORM',
        id: this.props.formId,
        updates: updates
      });
    }

    deleteFormStore() {
      this.props.store.dispatch({
        type: 'DELETE_FORM',
        id: this.props.formId
      });
    }

    // render

    render() {
      const formStore = this.readFormStore();

      // initialized?

      if (formStore === undefined) {
        return null;
      }

      // else

      const { formId, store, ...other} = this.props;

      return (
        <FormComponent
          key={formId}
          stateFromReduxStore={formStore.state}
          updateStateInReduxStore={this.updateFormStore}
          {...other}
          />
      );
    }
  };
};
```

### Sample reducers

```es6
export const forms = (state = [], action) => {
  switch (action.type) {
    case 'CREATE_FORM':
      return [...state, form({}, action)];
    case 'UPDATE_FORM':
      return state.map(f => form(f, action));
    case 'DELETE_FORM':
      return state.filter(f => f.id !== action.id);
    default:
      return state;
  }
};

const form = (state = {}, action) => {
  switch (action.type) {
    case 'CREATE_FORM':
      return {
        id: action.id,
        state: {}
      };
    case 'UPDATE_FORM':
      return (state.id !== action.id) ?
        state :
        {...state, state: {...state.state, ...action.updates}};
    default:
      return state;
  }
};
```
