# onUpdate callback

```jsx
import { FormState, FormObject } from 'react-formstate';
import Input from './Input.jsx';

export default class LoginForm extends React.Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);

    // set a callback from the framework generated onChange handler
    this.formState.onUpdate(this.onUpdate.bind(this));

    this.state = {};
  }

  onUpdate(context) {
    // after a failed login, clear 'Invalid username or password' message

    // if you add an onUpdate callback,
    // be sure to call context.updateFormState,
    // as the framework delegates that responsibility to the callback

    context.updateFormState({loggingIn: false, failedLogin: false});
  }

  render() {
    let submitMessage;

    if (this.formState.isInvalid()) {
      submitMessage = 'Please fix validation errors';
    }
    if (this.state.loggingIn) {
      submitMessage = 'Logging in...';
    }

    return (
      <form>
        <FormObject formState={this.formState}>
          <div>{this.state.failedLogin ? 'Invalid username or password' : null}</div>
          <Input formField='username' label='Username' required />
          <Input formField='password' label='Password' required type='password' />
        </FormObject>
        <input type='submit' value='Submit' onClick={this.handleSubmit.bind(this)} />
        <span>{submitMessage}</span>
      </form>
    );
  }

  handleSubmit(e) {
    e.preventDefault();

    let model = this.formState.createUnitOfWork().createModel();

    if (model) {
      let token = Date.now();

      this.setState({loggingIn: token});

      // simulate a login attempt
      window.setTimeout(function() {
        if (this.state.loggingIn !== token) { return; }

        if (model.username === 'fail') {
          this.setState({loggingIn: false, failedLogin: true});
        } else {
          alert('successful login');
        }
      }.bind(this), 2000);
    }
  }
}
```
