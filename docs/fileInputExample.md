# File Input Example

file inputs have security restrictions that prevent them from being used like other controlled components in react.

in this example a file input is used to upload a required image asynchronously prior to valid form submission.

the returned image url is stored as part of the form model.

note: the file input selection message causes problems for workflow and styling. see this [stack overflow](http://stackoverflow.com/questions/210643/in-javascript-can-i-make-a-click-event-fire-programmatically-for-a-file-input?answertab=votes#tab-top) for how to hide it.

```es6
import React, { Component } from 'react';
import { FormState, Form } from 'react-formstate';
import HiddenInput from './HiddenInput.jsx';
import Input from './Input.jsx';

export default class SampleForm extends Component {

  constructor(props) {
    super(props);

    this.formState = new FormState(this);
    this.state = this.formState.createUnitOfWork().injectModel(this.props.model);

    this.handleImageSelection = this.handleImageSelection.bind(this);
    this.removeImage = this.removeImage.bind(this);
    this.submit = this.submit.bind(this);
  }

  imageUrl() {
    return this.formState.getFieldState('imageUrl').getValue();
  }

  render() {
    let image = null;

    if (this.imageUrl()) {
      image = (
        <div>
          <img src={this.imageUrl()}/>
          <button onClick={this.removeImage}>Remove</button>
        </div>
      );
    }

    return (
      <Form formState={this.formState}>
        <HiddenInput formField='id' defaultValue='0' intConvert/>
        <h2>General Information</h2>
        <Input formField='name' label='Name' required/>
        <Input formField='anotherField' label='Another Field' required fsv={v=>v.numeric().length(9)}/>
        <h2>Some Important Image</h2>
        <HiddenInput formField='imageUrl' required='please upload an image'/>
        <div>
          <input
            type='file'
            onChange={this.handleImageSelection}
            disabled={this.state.imageLoading}
            ref={(c) => this.imageFileInput = c}
            />
          <div>{this.state.imageMessage || this.formState.getFieldState('imageUrl').getMessage()}</div>
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

    // clear the file input selection
    // makes the form behave consistently across create and edit
    this.imageFileInput.value = '';
  }


  uploadImage(formData) {
    // this example uses xmlHttpRequest. you could alternatively use fetch.
    // at present fetch does not support a "progress" callback but things change fast...

    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest();

      xhr.onload = (response) => {
        if (xhr.status === 200) {
          // get the new image url from the reponse somehow
          // how you do this will depend on your server's response
          resolve({ url: JSON.parse(xhr.responseText).imageUrl });
        } else {
          reject(new Error('an error occurred'));
        }
      };

      xhr.upload.onprogress = (e) => {
        // here you could update a progress bar by calling this.setState appropriately
        console.log('progress...');
        console.log(e);
      };

      // the third parameter is set to true for asynchronous upload
      xhr.open('POST', 'yourFileServerUrlHere', true);

      // you might need to set a header or two to make your server happy
      //xhr.setRequestHeader('Authorization', 'Bearer ' + token);

      xhr.send(formData);
    });
  }


  removeImage() {
    let context = this.formState.createUnitOfWork();
    context.getFieldState('imageUrl').setValue('');
    context.updateFormState();
  }

  submit(e) {
    e.preventDefault();

    // alternatively you can disable the submit button...
    if (this.state.imageLoading) { return; }

    let model = this.formState.createUnitOfWork().createModel();
    if (model) {
      // save to api and update the view
    }
  }
}
```

the Input component was previously shown in the [basic example](./basicExample.md).

the HiddenInput component is simply

```es6
import React, { Component } from 'react';

export default class HiddenInput extends Component {
  render() {
    return (
      <input type='hidden' value={this.props.fieldState.getValue()} />
    );
  }
}
```
