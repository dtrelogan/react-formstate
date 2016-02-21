# nested form components

### one way to do it

```jsx
  render() {
    return (
      <form>
        <FormObject formState={this.formState}>
          <Input formField='name' label='Name' />
          <FormObject name='contact' >
            <Input formField='email' label='Email' />
            <Input formField='phone' label='Phone' />
            <FormObject name='address' labelPrefix='Address ' >
              <Input formField='line1' label='Line 1' />
            </FormObject>
          </FormObject>
        </FormObject>
        <input type='submit' value='Submit' onClick={this.handleSubmit.bind(this)} />
      </form>
    );
  }
```

### another way to do it

```jsx
  render() {
    return (
      <form>
        <FormObject formState={this.formState}>
          <Input formField='name' label='Name' />
          <h3>Home Contact Information</h3>
          <Contact formObject='homeContact' labelPrefix='Home ' />
          <h3>Work Contact Information</h3>
          <Contact formObject='workContact' labelPrefix='Work ' />
        </FormObject>
        <input type='submit' value='Submit' onClick={this.handleSubmit.bind(this)} />
      </form>
    );
  }
```

```jsx
export default class Contact extends React.Component {

  validateEmail(email) {
    let emailPattern = /.+@.+\..+/;
    if (email && !emailPattern.test(email)) { return 'Not a valid email'; }
  }

  render() {
    return (
      <FormObject nestedForm={this}>
        <Input formField='email' label='Email' />
        <Input formField='phone' label='Phone' />
        <Address formObject='address' labelPrefix='Address ' />
      </FormObject>
    );
  }
}
```

```jsx
export default class Address extends React.Component {

  validateLine1(line1) {
    if (line1.trim() === '') { return 'Required field'; }
  }

  render() {
    return (
      <FormObject nestedForm={this}>
        <Input formField='line1' label='Line 1' />
      </FormObject>
    );
  }
}
```

### yet another way to do it

```jsx
  render() {
    return (
      <form>
        <FormObject formState={this.formState}>
          <Input formField='name' label='Name' />
          <h3>Home Contact Information</h3>
          <Contact formObject='homeContact' labelPrefix='Home '>
            <Address formObject='address' labelPrefix='Address ' />
          </Contact>
          <h3>Work Contact Information</h3>
          <Contact formObject='workContact' labelPrefix='Work '>
            <Address formObject='address' labelPrefix='Address ' />
          </Contact>
        </FormObject>
        <input type='submit' value='Submit' onClick={this.handleSubmit.bind(this)} />
      </form>
    );
  }
```

```jsx
export default class Contact extends React.Component {

  validateEmail(email) {
    let emailPattern = /.+@.+\..+/;
    if (email && !emailPattern.test(email)) { return 'Not a valid email'; }
  }

  render() {
    return (
      <FormObject nestedForm={this}>
        <Input formField='email' label='Email' />
        <Input formField='phone' label='Phone' />
        {this.props.children}
      </FormObject>
    );
  }
}
```

