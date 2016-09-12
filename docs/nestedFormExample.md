# nested form components

```es6
import React, { Component } from 'react';
import { Form, FormObject, FormExtension } from 'react-formstate';
```

### one way to do it

```jsx
  render() {
    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <Input formField='name' label='Name' />
        <FormObject name='contact' >
          <Input formField='email' label='Email' />
          <Input formField='phone' label='Phone' />
          <FormObject name='address' labelPrefix='Address ' >
            <Input formField='line1' label='Line 1' />
          </FormObject>
        </FormObject>
        <input type='submit' value='Submit'/>
      </Form>
    );
  }
```

### another way to do it

```jsx
  render() {
    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <Input formField='name' label='Name' />
        <h3>Home Contact Information</h3>
        <Contact formObject='homeContact' labelPrefix='Home ' />
        <h3>Work Contact Information</h3>
        <Contact formObject='workContact' labelPrefix='Work ' />
        <input type='submit' value='Submit'/>
      </Form>
    );
  }
```

```jsx
export default class Contact extends Component {

  validateEmail(email) {
    let emailPattern = /.+@.+\..+/;
    if (email && !emailPattern.test(email)) { return 'Not a valid email'; }
  }

  render() {
    return (
      <FormExtension nestedForm={this}>
        <Input formField='email' label='Email' />
        <Input formField='phone' label='Phone' />
        <Address formObject='address' labelPrefix='Address ' />
      </FormExtension>
    );
  }
}
```

```jsx
export default class Address extends Component {

  validateLine1(line1) {
    if (line1.trim() === '') { return 'Required field'; }
  }

  render() {
    return (
      <FormExtension nestedForm={this}>
        <Input formField='line1' label='Line 1' />
      </FormExtension>
    );
  }
}
```

### yet another way to do it

```jsx
  render() {
    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <Input formField='name' label='Name' />
        <h3>Home Contact Information</h3>
        <Contact formObject='homeContact' labelPrefix='Home '>
          <Address formObject='address' labelPrefix='Address ' />
        </Contact>
        <h3>Work Contact Information</h3>
        <Contact formObject='workContact' labelPrefix='Work '>
          <Address formObject='address' labelPrefix='Address ' />
        </Contact>
        <input type='submit' value='Submit'/>
      </Form>
    );
  }
```

```jsx
export default class Contact extends Component {

  validateEmail(email) {
    let emailPattern = /.+@.+\..+/;
    if (email && !emailPattern.test(email)) { return 'Not a valid email'; }
  }

  render() {
    return (
      <FormExtension nestedForm={this}>
        <Input formField='email' label='Email' />
        <Input formField='phone' label='Phone' />
        {this.props.children}
      </FormExtension>
    );
  }
}
```

(address component not repeated)

### or you can flatten your jsx

```jsx
  render() {
    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <Input formField='name' label='Name' />
        <Input formField='contact.email' label='Email' />
        <Input formField='contact.phone' label='Phone' />
        <Input formField='contact.address.line1' label='Address Line 1' />
        <input type='submit' value='Submit'/>
      </Form>
    );
  }
```

### alternatively

```jsx
  render() {
    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <Input formField='name' label='Name' />
        <h3>Home Contact Information</h3>
        <Contact formObject='homeContact' labelPrefix='Home ' />
        <Address formObject='homeContact.address' labelPrefix='Home Address ' />
        <h3>Work Contact Information</h3>
        <Contact formObject='workContact' labelPrefix='Work '/>
        <Address formObject='workContact.address' labelPrefix='Work Address ' />
        <input type='submit' value='Submit'/>
      </Form>
    );
  }
```

## formExtension alternative

see explanation [here](/docs/formExtension.md)
