# Form Input Example

form inputs have security restrictions that prevent them from being used like other controlled components in react.

in this example a form input is used to upload a required image asynchronously prior to valid form submission.

the returned image url is stored as part of the form model.

```jsx
import React from 'react';
import { FormState, Form } from 'react-formstate';
import HiddenInput from './HiddenInput.jsx';
import Input from './Input.jsx';

export default class SampleForm extends React.Component {

  constructor(props) {
    super(props);

    this.formState = new FormState(this);
    this.state = this.formState.createUnitOfWork().injectModel(this.props.model);

    this.handleImageSelection = this.handleImageSelection.bind(this);
    this.submit = this.submit.bind(this);
  }
  
  imageUrl() {
    return this.formState.getFieldState('imageUrl').getValue();
  }

  render() {
    let image = null;

    if (this.imageUrl()) {
      image = (
        <img src={this.imageUrl()}/>
      );
    }

    return (
      <Form formState={this.formState}>
        <HiddenInput formField='id' defaultValue='0' intConvert/>
        <h2>General Information</h2>
        <Input formField='name' label='Name' required/>
        <Input formField='anotherField' label='Another Field' required fsv={v=>v.numeric().length(9)}/>
        <h2>Some Important Image</h2>
        <HiddenInput formField='imageUrl'/>
        <div>
          <input type='file' onChange={this.handleImageSelection} disabled={this.state.imageLoading}/>
          <div>{this.state.imageMessage}</div>
        </div>
        {image}
        <br/>
        <input type='submit' value='Submit' onClick={this.submit}/>
      </Form>
    );
  }

  handleImageSelection(e) {
    let files = e.target.files;

    if (files.length > 0) {
      
      let formData = new FormData();
      for(let i = 0, len = files.length; i < len; i++) {
        formData.append('file' + i, files.item(i));
      }

      this.setState({imageLoading: true, imageMessage: 'loading...'});

      this.uploadImage(formData).then(data => {
        
        let context = this.formState.createUnitOfWork(),
          fieldState = context.getFieldState('imageUrl');
        
        fieldState.setValue(data.url).validate();
        context.updateFormState({imageLoading: false, imageMessage: null});
      
      }).catch(err => {
        
        this.setState({imageLoading: false, imageMessage: 'failed to load.'});
      });
    }
    else // user cleared the file selection
    {
      
      let context = this.formState.createUnitOfWork(),
        fieldState = context.getFieldState('imageUrl');

      fieldState.setValue('').validate();
      context.updateFormState();
    }
  }
  
  uploadImage(formData) {
    // simulate using fetch or xhr to upload image to server
    
    return new Promise((resolve, reject) => {
      resolve({ url: 'http://somedomain.com/someapi/images/someId' });
    });
  }

  submit(e) {
    e.preventDefault();

    if (this.state.imageLoading) { return; }

    if (!this.imageUrl()) {
      this.setState({imageMessage: 'please upload some important image'});
      return;
    }

    let model = this.formState.createUnitOfWork().createModel();
    if (model) {
      // save to api and update the view
    }
  }
}
```
