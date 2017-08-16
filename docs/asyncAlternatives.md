# Alternative approaches to asynchronous validation

## onSubmit

You can perform asynchronous validation in your onSubmit handler if desired.

One option is to perform the validation as part of your standard server side validation, and return an appropriate error code if username validation fails, such that the onSubmit handler can make the appropriate updates to form state if it receives that error code.

Or you could explicitly validate the username before submitting the model to your API, such that your API doesn't have to arrange a special return value if server side validation fails (since it normally shouldn't). Here is a rough example of this approach:

```jsx
class UserForm extends Component {
  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = this.formState.injectModel(props.model);

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    let submitMessage = null, submitDisabled = false;

    if (this.formState.isInvalid()){
      submitMessage = 'Please fix validation errors';
      submitDisabled = true;
    } else if (this.state.validatingUsername) {
      submitMessage = 'Validating username...';
      submitDisabled = true;
    }

    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <fieldset disabled={this.state.validatingUsername ? 'disabled' : null}>
          <Input
            formField='username'
            label='Username'
            required
            fsv={v => v.regex(/^\S+$/).msg('Username must not contain spaces')}
            />
        </fieldset>
        <input type='submit' value='Submit' disabled={submitDisabled}/>
        <span>{submitMessage}</span>
      </Form>
    );
  }


  handleSubmit(e) {
    e.preventDefault();
    const context = this.formState.createUnitOfWork();
    const model = context.createModel();
    if (model) {
      if (model.username === context.getFieldState('username').getInitialValue()) {
        this.submitToApi(model);
        return;
      } // else

      context.updateFormState({validatingUsername: true});

      // simulate calling your api to validate username
      window.setTimeout(() => {
        if (model.username !== 'taken') {
          this.submitToApi(model);
          return;
        } // else

        const context = this.formState.createUnitOfWork();
        const fieldState = context.getFieldState('username');
        fieldState.setInvalid('Username already exists');
        context.updateFormState({validatingUsername: false});
      }, 2000);
    }
  }


  submitToApi(model) {
    // do whatever you need to do here...
    this.setState({validatingUsername: false});
    alert(JSON.stringify(model));
  }
}
```

## unpatched onBlur

If you choose to perform asynchronous validation during onBlur, you need to put the field state in "validating" status between onChange and onBlur, such that the form cannot be submitted successfully before onBlur.

There is a tricky edge case to this approach. You have to deal with the "Waiting for username input to blur" use case below. Basically the issue is the user could hit 'enter' from within the username input, such that onSubmit gets called before the field is blurred. It's easy to make the field blur from within the onSubmit handler, and have the "waiting for validation..." message show, but unless you do something special, the user will have to hit submit again once the validation finishes.

One approach to making asynchronous validation during onBlur work better is presented as a second example following this "unpatched onBlur" example.

```jsx
const Input = ({label, type, fieldState, handleValueChange, handleBlur, showMessage}) => {
  return (
    <div>
      <label>{label}</label>
      <input
        type={type || 'text'}
        value={fieldState.getValue()}
        onChange={e => handleValueChange(e.target.value)}
        onBlur={handleBlur}
        />
      <span className='help'>
        {showMessage ? fieldState.getMessage() : null}
      </span>
    </div>
  );
};




class Test extends Component {
  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = this.formState.injectModel(props.model);

    this.formState.showMessageOn('blur');

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.usernameOnBlur = this.usernameOnBlur.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    let submitMessage = null, submitDisabled = false;

    //
    // passing true to isValidating and isInvalid to honor onBlur behavior
    //

    if (this.formState.isValidating() && !this.formState.isValidating(true)) {
      // this means the username field state is "validating", but the
      // message is still not visible, because onBlur hasn't run
      submitMessage = "Waiting for username input to blur?";
      submitDisabled = true; // <---------- user experience issue
    } else if (this.formState.isValidating(true)) {
      submitMessage = 'Waiting for validation to finish...';
      submitDisabled = true;
    } else if (this.formState.isInvalid()) {
      submitMessage = 'Please fix validation errors';
      submitDisabled = true;
    }

    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
        <Input
          formField='username'
          label='Username'
          required
          fsv={v => v.regex(/^\S+$/).msg('Username must not contain spaces')}
          handleValueChange={this.handleUsernameChange}
          handleBlur={this.usernameOnBlur}
          />
        <input type='submit' value='Submit' disabled={submitDisabled}/>
        <span>{submitMessage}</span>
      </Form>
    );
  }


  handleUsernameChange(username) {
    const context = this.formState.createUnitOfWork(),
      fieldState = context.set('username', username);

    fieldState.validate();
    if (fieldState.isInvalid()) {
      context.updateFormState();
      return;
    } // else

    if (username === fieldState.getInitialValue()) {
      fieldState.setValid();
      context.updateFormState();
      return;
    } // else

    fieldState.setValidating('Waiting for onBlur...');
    context.updateFormState();
  }


  usernameOnBlur() {
    const context = this.formState.createUnitOfWork();
    const fieldState = context.getFieldState('username');

    fieldState.setBlurred(); // mark the message "visible"

    if (!fieldState.isValidating()) {
      context.updateFormState();
      return;
    } // else

    const asyncToken = fieldState.setValidating('Verifying username...');
    context.updateFormState();

    // simulate calling your api
    window.setTimeout(() => {
      const context = this.formState.createUnitOfWork();
      const fieldState = context.getFieldState('username', asyncToken);

      // if the token still matches, the username we are verifying is still relevant
      if (fieldState) {
        if (fieldState.getValue() === 'taken') {
          fieldState.setInvalid('Username already exists');
        } else {
          fieldState.setValid('Verified');
        }
        context.updateFormState();
      }
    }, 2000);
  }


  handleSubmit(e) {
    e.preventDefault();
    const model = this.formState.createUnitOfWork().createModel();
    if (model) {
      alert(JSON.stringify(model));
    }
  }
}
```

## patched onBlur

This is *one approach* to making asynchronous validation work better during onBlur.

note that react-formstate does not provide more streamlined support for this behavior as it would mean taking partial control of your onSubmit handler. react-formstate makes an intentional choice to leave you in full control of your handlers.

```diff
class Test extends Component {
  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = this.formState.injectModel(props.model);

    this.formState.showMessageOn('blur');

    this.handleUsernameChange = this.handleUsernameChange.bind(this);
    this.usernameOnBlur = this.usernameOnBlur.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    let submitMessage = null, submitDisabled = false;

    //
    // passing true to isValidating and isInvalid to honor onBlur behavior
    //

+   if (this.state.submitting) {
+     submitMessage = "Submitting...";
+     submitDisabled = true;
    } else if (this.formState.isValidating(true)) {
      submitMessage = 'Waiting for validation to finish...';
      submitDisabled = true;
    } else if (this.formState.isInvalid()) {
      submitMessage = 'Please fix validation errors';
      submitDisabled = true;
    }

    return (
      <Form formState={this.formState} onSubmit={this.handleSubmit}>
+       <fieldset disabled={this.state.submitting ? 'disabled' : null}>
          <Input
            formField='username'
            label='Username'
            required
            fsv={v => v.regex(/^\S+$/).msg('Username must not contain spaces')}
            handleValueChange={this.handleUsernameChange}
            handleBlur={this.usernameOnBlur}
            />
+       </fieldset>
        <input type='submit' value='Submit' disabled={submitDisabled}/>
        <span>{submitMessage}</span>
      </Form>
    );
  }


  handleUsernameChange(username) {
    const context = this.formState.createUnitOfWork(),
      fieldState = context.set('username', username);

    fieldState.validate();
    if (fieldState.isInvalid()) {
      context.updateFormState();
      return;
    } // else

    if (username === fieldState.getInitialValue()) {
      fieldState.setValid();
      context.updateFormState();
      return;
    } // else

    fieldState.setValidating('Waiting for onBlur...');
    context.updateFormState();
  }


  usernameOnBlur() {
    const context = this.formState.createUnitOfWork();
    const fieldState = context.getFieldState('username');

    fieldState.setBlurred(); // mark the message "visible"

    if (!fieldState.isValidating()) {
      context.updateFormState();
      return;
    } // else

    const asyncToken = fieldState.setValidating('Verifying username...');
    context.updateFormState();

    // simulate calling your api
    window.setTimeout(() => {
      const context = this.formState.createUnitOfWork();
      const fieldState = context.getFieldState('username', asyncToken);

      // if the token still matches, the username we are verifying is still relevant
      if (fieldState) {
        if (fieldState.getValue() === 'taken') {
          fieldState.setInvalid('Username already exists');
        } else {
          fieldState.setValid('Verified');
        }

+       if (this.state.submitting) {
+         this.submit(context);
+       } else {
+         context.updateFormState();
+       }
      }
    }, 2000);
  }


  handleSubmit(e) {
    e.preventDefault();
+   const context = this.formState.createUnitOfWork();
+   const fsUsername = context.getFieldState('username');
+   if (fsUsername.isValidating() && !fsUsername.isBlurred()) {
+     // username isn't blurred. user pressed enter inside of username input.
+     // setting submitted flag will disable the input and cause it to blur
+     // once the async validation finishes it will call this.submit() if valid username
+     this.setState({submitting: true});
+     return;
+   }
+   // else
+   this.submit(context);
  }

+ submit(context) {
+   const model = context.createModel(true);
+   if (model) {
+     alert(JSON.stringify(model));
+     context.updateFormState({submitting: false}); // reset form for further testing
+   } else {
+     context.updateFormState({submitting: false});
+   }
+ }
}
```

## onChange onBlur hybrid

If you want normal validation messages to display immediately upon onChange, but you want to postpone asynchronous validation until onBlur (to save API calls), you could take the asynchronous onBlur example more or less as is, and substitute an input like this:

```jsx
const Input = ({label, type, fieldState, handleValueChange, handleBlur, showMessage}) => {

  let msg = showMessage ? fieldState.getMessage() : null;

  if (fieldState.isValidating() && !fieldState.isBlurred() && !fieldState.isSubmitted()) {
    msg = null;
  }

  return (
    <div>
      <label>{label}</label>
      <input
        type={type || 'text'}
        value={fieldState.getValue()}
        onChange={e => handleValueChange(e.target.value)}
        onBlur={handleBlur}
        />
      <span className='help'>
        {msg}
      </span>
    </div>
  );
};
```
