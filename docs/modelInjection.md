# Model Injection

given a model:

```jsx
{
  firstName: 'buster',
  lastName: 'brown',
  email: 'buster@dogs.org'
}
```

there are several ways to edit it.

longhand:

```jsx
render() {
  let model = this.props.model;
  return (
    <Form formState={this.formState}>
      <Input formField='firstName' label='First' defaultValue={model.firstName}/>
      <Input formField='lastName' label='Last' defaultValue={model.lastName}/>
      <Input formField='email' label='Email' defaultValue={model.email}/>
      <input type='submit' value='Submit' onClick={this.handleSubmit}/>
    </Form>
  );
}
```

shorthand:

```jsx
render() {
  return (
    <Form formState={this.formState} model={this.props.model}>
      <Input formField='firstName' label='First'/>
      <Input formField='lastName' label='Last'/>
      <Input formField='email' label='Email'/>
      <input type='submit' value='Submit' onClick={this.handleSubmit}/>
    </Form>
  );
}
```

robust form, for dynamic behavior:

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
      <Input formField='email' label='Email'/>
      <input type='submit' value='Submit' onClick={this.handleSubmit}/>
    </Form>
  );
}
```


note: do not confuse the use of defaultValue here. react-formstate uses [controlled components](https://facebook.github.io/react/docs/forms.html#controlled-components)
