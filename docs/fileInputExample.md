# File Input Example

file inputs have security restrictions that prevent them from being used like other controlled components in react.

in this example a file input is used to upload a required image asynchronously prior to valid form submission.

the returned image url is stored as part of the form model.

### sample form component

```es6
import React, { Component } from 'react';
import { FormState, Form } from 'react-formstate';
import DocumentInput from './DocumentInput.jsx';

export default class FormComponent extends Component {

  constructor(props) {
    super(props);

    this.formState = new FormState(this);
    this.state = this.formState.injectModel(props.model);
    this.state.isUploadingByKey = {};

    this.updateDocumentState = this.updateDocumentState.bind(this);
    this.submit = this.submit.bind(this);
  }

  render() {
    let submitMessage = null,
      isInvalid = this.formState.isInvalid(),
      isUploading = this.isUploading(),
      disableSubmit = isInvalid || isUploading;

    if (isUploading) { submitMessage = 'Waiting for upload...'; }
    else if (isInvalid) { submitMessage = 'Please fix validation errors'; }

    return (
      <Form formState={this.formState} onSubmit={this.submit}>
        <h3>Optional Document</h3>
        <DocumentInput
          formField='optionalDocumentUrl'
          api={this.props.api}
          fileReferenceName='optionalDocument'
          updateDocumentState={this.updateDocumentState}
          />
        <h3>Required Document</h3>
        <DocumentInput
          formField='requiredDocumentUrl'
          required='Please upload the required document'
          api={this.props.api}
          fileReferenceName='requiredDocument'
          updateDocumentState={this.updateDocumentState}
          />
        <input type='submit' value='Submit' disabled={disableSubmit}/>
        <span>{submitMessage}</span>
      </Form>
    );
  }

  // documentState is an object that may contain:
  //  documentUrl: only on successful upload
  //  isUploading: set to true only while uploading
  //  message: only if something useful to communicate
  updateDocumentState(key, documentState) {
    let context = this.formState.createUnitOfWork(),
      fi = context.getFieldState(key);

    fi.setValue(documentState.documentUrl).validate(); // document might be required

    if (documentState.isUploading) {
      fi.setValidating(documentState.message); // overrides required
    }
    else if (fi.isValid()) {
      fi.setValid(documentState.message); // when document exists or is not required
    }
    else if (documentState.message) {
      fi.setInvalid(documentState.message); // message overrides required message
    }

    let isUploadingByKey = Object.assign({}, this.state.isUploadingByKey);
    isUploadingByKey[key] = Boolean(documentState.isUploading);
    context.updateFormState({isUploadingByKey: isUploadingByKey});
  }
  
  isUploading() {
    return Object.keys(this.state.isUploadingByKey).some(key => this.state.isUploadingByKey[key]);
  }

  submit(e) {
    e.preventDefault();
    let model = this.formState.createUnitOfWork().createModel();
    if (model) {
      alert(JSON.stringify(model)); // proceed with valid data
    }
    // else: createModel called setState to set the appropriate validation messages
  }
}
```

### DocumentInput

```es6
import React, { Component } from 'react';
import DocumentUpload from './DocumentUpload.jsx';

export default class DocumentInput extends Component {

  constructor(props) {
    super(props);

    this.validateFileType = this.validateFileType.bind(this);
    this.removeDocument = this.removeDocument.bind(this);
  }

  render() {
    let document, documentUrl = this.props.fieldState.getValue();

    if (documentUrl) {
      document = (
        <div>
          <a href={documentUrl} target="_blank">{documentUrl}</a>
          <span className='remove-document-spacer'></span>
          <button onClick={this.removeDocument}>Remove</button>
        </div>
      );
    }
    else {
      document = (
        <DocumentUpload
          api={this.props.api}
          fieldState={this.props.fieldState}
          fileReferenceName={this.props.fileReferenceName}
          updateDocumentState={this.props.updateDocumentState}
          accept='.pdf,application/pdf'
          validateFileType={this.validateFileType}
          />
      );
    }

    return (
      <div>
        <input type='hidden' value={documentUrl}/>
        {document}
      </div>
    );
  }

  validateFileType(fileType) {
    if (fileType !== 'application/pdf') { return 'only .pdf files accepted please'; }
  }

  removeDocument() {
    this.props.updateDocumentState(this.props.fieldState.getKey(), {});
  }
}
```

### DocumentUpload

```es6
import React, { Component } from 'react';
import FileInput from './BootstrapFileInput.jsx';

export default class DocumentUpload extends Component {

  constructor(props) {
    super(props);
    this.onChange = this.onChange.bind(this);
  }


  render() {
    let fi = this.props.fieldState, validationState = null;

    // on success unmount this component
    if (fi.getMessage() || fi.isValidating()) { validationState = 'warning'; }
    if (fi.isInvalid()) { validationState = 'error'; }

    return (
      <FileInput
        controlId={fi.getKey()}
        validationState={validationState}
        onChange={this.onChange}
        disabled={fi.isValidating()}
        accept={this.props.accept}
        help={fi.getMessage()}
        />
    );
  }


  update(documentState) {
    this.props.updateDocumentState(this.props.fieldState.getKey(), documentState);
  }


  onChange(e) {
    let files = e.target.files;

    if (files.length === 0) {
      this.update({});
      return;
    }

    let f = files.item(0),
      message = this.props.validateFileType && this.props.validateFileType(f.type);

    if (message) {
      this.update({message: message});
      return;
    }

    // TODO: validate file size...

    let formData = new FormData();
    formData.append(this.props.fileReferenceName, f);

    this.update({isUploading: true, message: 'uploading...'});

    this.uploadImage(formData).then(document => {
      this.update({documentUrl: document.url});
    }).catch(err => {
      this.update({message: 'upload failed'});
    });
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
          resolve({ url: JSON.parse(xhr.responseText).url });
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

      xhr.onerror = () => {
        reject(new Error('an error occurred'));
      };

      // you might need to set a header or two to make your server happy
      //xhr.setRequestHeader('Authorization', 'Bearer ' + token);

      xhr.send(formData);
    });
  }
}

DocumentUpload.propTypes = {
  api: React.PropTypes.object.isRequired,
  fieldState: React.PropTypes.object.isRequired,
  fileReferenceName: React.PropTypes.string.isRequired,
  updateDocumentState: React.PropTypes.func.isRequired,
  accept: React.PropTypes.string,
  validateFileType: React.PropTypes.func
};
```

### [react bootstrap](https://react-bootstrap.github.io/components.html) file input component

```es6
import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl, HelpBlock } from 'react-bootstrap';

export default class FileInput extends Component {

  render() {
    return (
      <FormGroup
        className={this.props.className}
        controlId={this.props.controlId}
        validationState={this.props.validationState}
        >
        <ControlLabel>{this.props.label || ''}</ControlLabel>
        <FormControl
          type='file'
          placeholder={this.props.placeholder}
          onChange={this.props.onChange}
          disabled={this.props.disabled}
          accept={this.props.accept}
          />
        <HelpBlock>{this.props.help || ''}</HelpBlock>
      </FormGroup>
    );
  }
}
```

voila!
