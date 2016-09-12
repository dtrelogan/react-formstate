# FormExtension

using FormObject like so:

```jsx
  render() {
    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <Input formField='name' label='Name' />
        <FormObject name='contact' >
          <Input formField='email' label='Email' />
        </FormObject>
        <input type='submit' value='Submit'/>
      </Form>
    );
  }
```

results in a model like this:

```es6
{
  name: 'buster',
  contact: {
    email: 'buster@dogs.org'
  }
}
```

sometimes you'll want to use a separate component without a level of nesting within your model.

in other words, you'll want to use a separate component for the contact information but you'll want the resulting model to look like this:

```es6
{
  name: 'buster',
  email: 'buster@dogs.org'
}
```

using FormExtension as below does exactly that:

```jsx
  render() {
    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <Input formField='name' label='Name' />
        <Contact formExtension labelPrefix='Home '/>
        <input type='submit' value='Submit'/>
      </Form>
    );
  }

  // ...

  render() {
    return (
      <FormExtension nestedForm={this}>
        <Input formField='email' label='Email' />
      </FormExtension>
    );
  }
```
an added benefit of FormExtension is that you can leave the contact component as is and instead use a form object in the parent

```jsx
render() {
  return (
    <Form formState={this.formState} onSubmit={this.handleSubmit}>
      <Input formField='name' label='Name' />
      <Contact formObject='homeContact' labelPrefix='Home '/>
      <input type='submit' value='Submit'/>
    </Form>
  );
}
```

that way the nested component can remain oblivious to how it is used.
