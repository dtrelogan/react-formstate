# Model Injection

given a model you want to edit:

```jsx
{
  firstName: 'buster',
  lastName: 'brown'
}
```

you have a choice of methods

### longhand

```jsx
render() {
  let model = this.props.model;
  return (
    <Form formState={this.formState}>
      <Input formField='firstName' label='First' defaultValue={model.firstName}/>
      <Input formField='lastName' label='Last' defaultValue={model.lastName}/>
      <input type='submit' value='Submit' onClick={this.handleSubmit}/>
    </Form>
  );
}
```

### shorthand

```jsx
render() {
  return (
    <Form formState={this.formState} model={this.props.model}>
      <Input formField='firstName' label='First'/>
      <Input formField='lastName' label='Last'/>
      <input type='submit' value='Submit' onClick={this.handleSubmit}/>
    </Form>
  );
}
```

### true injection

a more flexible approach that facilitates dynamic forms:

```jsx
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = this.formState.createUnitOfWork().injectModel(this.props.model);
  
  this.handleSubmit = this.handleSubmit.bind(this);
}

render() {
  return (
    <Form formState={this.formState}>
      <Input formField='firstName' label='First'/>
      <Input formField='lastName' label='Last'/>
      <input type='submit' value='Submit' onClick={this.handleSubmit}/>
    </Form>
  );
}
```

#### Note

do not read too much into the use of defaultValue as a property name. react-formstate uses [controlled components](https://facebook.github.io/react/docs/forms.html#controlled-components)
