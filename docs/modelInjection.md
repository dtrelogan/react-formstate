# Model Injection

There are different ways to edit a model:

```jsx
{
  firstName: 'buster',
  lastName: 'brown'
}
```

### Longhand

Supply default values explicitly:

```jsx
render() {
  let model = this.props.model;
  return (
    <Form formState={this.formState} onSubmit={this.handleSubmit}>
      <Input formField='firstName' label='First' defaultValue={model.firstName}/>
      <Input formField='lastName' label='Last' defaultValue={model.lastName}/>
      <input type='submit' value='Submit'/>
    </Form>
  );
}
```

### Shorthand

Supply a set of default values with a single statement:

```jsx
render() {
  return (
    <Form formState={this.formState} model={this.props.model} onSubmit={this.handleSubmit}>
      <Input formField='firstName' label='First'/>
      <Input formField='lastName' label='Last'/>
      <input type='submit' value='Submit'/>
    </Form>
  );
}
```

### True injection

Default values are only used if there is no corresponding value in your form's state object. They are most useful when you are initializing an empty form in 'create' mode rather than loading pre-existing data into a form in 'edit' or 'update' mode.

You can alternatively load a provided model directly into your state. This is generally a better approach that facilitates dynamic forms:

```jsx
constructor(props) {
  super(props);
  this.formState = new FormState(this);

  this.state = this.formState.injectModel(props.model);
  this.formState.injectField(this.state, 'someOtherField', 'someValue');

  this.handleSubmit = this.handleSubmit.bind(this);
}

render() {
  let firstName = this.formState.get('firstName'),
    dynamicBehavior = (firstName === 'buster' ? 'hi buster!' : '');

  return (
    <Form formState={this.formState} onSubmit={this.handleSubmit}>
      <p>{dynamicBehavior}</p>
      <Input formField='firstName' label='First'/>
      <Input formField='lastName' label='Last'/>
      <input type='submit' value='Submit'/>
    </Form>
  );
}
```

#### Note

Do not read too much into the use of defaultValue as a property name, react-formstate uses [controlled components](https://facebook.github.io/react/docs/forms.html#controlled-components)

#### Injecting outside of the constructor

If necessary you can alternatively use a unit of work for injection (a unit of work in react-formstate is a wrapper around a call to this.setState):

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = {};
}
componentDidMount() {
  this.props.getModel().then((model) => {
    let context = this.formState.createUnitOfWork();
    context.injectModel(model);
    context.injectField('someOtherField', 'someValue');
    context.updateFormState();
  });
}
```
