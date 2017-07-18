# file input example

these examples make use of [react bootstrap](https://react-bootstrap.github.io/components.html) components

the crop component uses [react avatar editor](https://github.com/mosch/react-avatar-editor)

### document select component

```es6
import React, { Component } from 'react';
import { Button } from 'react-bootstrap';

// let client layer on a label and a help block
// use css to lay out and/or hide the buttons, might need to use an overlay trick:
// http://stackoverflow.com/questions/210643/in-javascript-can-i-make-a-click-event-fire-programmatically-for-a-file-input?answertab=votes#tab-top
export function documentSelect(DocumentGraphic) {

  let DocumentSelectComponent = class DocumentSelect extends Component {

    constructor(props) {
      super(props);
      this.onClick = this.onClick.bind(this);
      this.onChange = this.onChange.bind(this);
    }

    render() {
      let documentGraphic = null;

      if (this.props.documentUrl || this.props.blankDocumentUrl) {
        documentGraphic = (
          <div className='document-select-graphic'>
            <DocumentGraphic url={this.props.documentUrl || this.props.blankDocumentUrl} onClick={this.props.disabled ? null : this.onClick}/>
          </div>
        );
      }

      let removeDocumentButton = null;

      if (this.props.documentUrl) {
        removeDocumentButton = (
          <Button className='document-select-remove-button' onClick={this.props.onRemove} bsStyle='warning' disabled={this.props.disabled}>
            Remove
          </Button>
        );
      }

      return (
        <div className='document-select'>
          {documentGraphic}
          <input
            className='document-select-file-input'
            type='file'
            ref={c=>this.fileInput=c}
            onChange={this.onChange}
            disabled={this.props.disabled}
            accept={this.props.accept}
            />
          <div className='document-select-button-group'>
            <Button bsStyle='success' className='document-select-upsert-button' onClick={this.onClick} disabled={this.props.disabled}>
              {this.props.documentUrl ? 'Change' : 'Add'}
            </Button>
            {removeDocumentButton}
          </div>
        </div>
      );
    }

    onClick(e) {
      e.preventDefault();
      this.fileInput.focus();
      this.fileInput.click();
    }

    onChange(e) {
      e.preventDefault();

      let files = e.target.files;

      if (files.length === 0) {
        this.props.onCancel();
      } else {
        this.props.onSelect(files.item(0));
      }

      this.fileInput.value = ''; // otherwise if you select the same file again nothing fires
    }
  }

  DocumentSelectComponent.propTypes = {
    documentUrl: React.PropTypes.string,
    blankDocumentUrl: React.PropTypes.string,
    accept: React.PropTypes.string,
    disabled: React.PropTypes.bool,
    onCancel: React.PropTypes.func.isRequired,
    onSelect: React.PropTypes.func.isRequired,
    onRemove: React.PropTypes.func.isRequired
  };

  return DocumentSelectComponent;
}
```

### image crop component

```es6
import React, { Component } from 'react';
import AvatarEditor from 'react-avatar-editor';
import ReactDOM from 'react-dom';

export class ImageCrop extends Component {

  constructor(props) {
    super(props);
    this.state = {scale: 1.2};

    this.handleScale = this.handleScale.bind(this);
  }

  componentDidMount() {
    const reader = new FileReader();

    reader.onload = () => {
      this.setState({imageToCrop: reader.result});
    };

    reader.addEventListener('error', (e) => {
      this.props.onError(e);
    }, false);

    reader.readAsDataURL(this.props.file);
  }

  render() {
    if (!this.state.imageToCrop) { return null; }

    return (
      <div className={this.props.className}>
        <AvatarEditor
          ref={(c)=>this.editor=c}
          image={this.state.imageToCrop}
          width={250}
          height={250}
          border={0}
          scale={this.state.scale}
          />
        <input
          className='image-crop-scale'
          type="range"
          value={this.state.scale}
          onChange={this.handleScale}
          min="1"
          max="3"
          step="0.01"
          />
      </div>
    );
  }

  // AvatarEditor works as an uncontrolled component and forces my hand here...
  // client has to capture a ref to this component and in event handler for onSave
  // or onCrop button, then use the ref to call this crop function.
  crop(mimeType) {
    return new Promise(resolve => {
      ReactDOM.findDOMNode(this.editor).toBlob(file => {
        resolve(file);
      }, mimeType || 'image/jpeg');
    });
  }

  handleScale(e) {
    this.setState({scale: parseFloat(e.target.value)});
  }
}

ImageCrop.propTypes = {
  file: React.PropTypes.object.isRequired,
  onError: React.PropTypes.func.isRequired,
  className: React.PropTypes.string
};
```

### upload/progress component

```es6
import React, { Component } from 'react';

export function documentUpload(Progress) {

  let DocumentUploadComponent = class DocumentUpload extends Component {

    constructor(props) {
      super(props);
      this.state = {};
      this.onProgress = this.onProgress.bind(this);
    }

    componentDidMount() {
      // TODO: validate file size. server max file size is 5 MB

      let formData = new FormData();
      formData.append(this.props.fileReferenceName, this.props.file);

      this.props.uploadDocument(formData, this.onProgress).then(document => {
        this.props.onSuccess(document);
      }).catch(err => {
        this.props.onError(err);
      });
    }

    render() {
      return (
        <Progress progress={this.state.progress}/>
      );
    }

    onProgress(progress) {
      this.setState({progress: progress});
    }
  };

  DocumentUploadComponent.propTypes = {
    file: React.PropTypes.object.isRequired,
    fileReferenceName: React.PropTypes.string.isRequired,
    uploadDocument: React.PropTypes.func.isRequired,
    onSuccess: React.PropTypes.func.isRequired,
    onError: React.PropTypes.func.isRequired
  };

  return DocumentUploadComponent;
}
```

### putting it together: document input component

you might make very different choices about how to put together selection, crop, and upload. modifying this should be straightforward.

for an example of using xhr to upload a document see the [previous iteration](/docs/fileInputExampleIteration2.md) of this example.

```es6
import React, { Component } from 'react';
import { FormGroup, ControlLabel, FormControl, HelpBlock, Button, Image, Well } from 'react-bootstrap';
import { documentSelect, ImageCrop, documentUpload } from './documentComponents.jsx';

const ImageGraphic = function({url, onClick}) {
  return (
    <Image src={url} responsive onClick={onClick}/>
  );
};

const DocumentGraphic = function({url}) {
  return (
    <Well>
      <a href={url} target="_blank">{url}</a>
    </Well>
  );
}

const ProgressBar = function() {
  return null;
};

const DocumentUploadNoProgress = documentUpload(ProgressBar);

export default class DocumentInput extends Component {

  constructor(props) {
    super(props);

    this.onSelect = this.onSelect.bind(this);
    this.onCancel = this.onCancel.bind(this);
    this.onRemove = this.onRemove.bind(this);

    this.onCrop = this.onCrop.bind(this);
    this.onCropError = this.onCropError.bind(this);

    this.uploadDocument = this.props.api.documents().create.bind(this.props.api.documents());

    this.onUpload = this.onUpload.bind(this);
    this.onUploadError = this.onUploadError.bind(this);
  }

  render() {
    let fi = this.props.fieldState, validationState = null, documentUrl = fi.getValue();

    if (fi.isValid()) { validationState = fi.get('warn') ? 'warning' : 'success'; }
    else if (fi.isInvalid()) { validationState = 'error'; }
    else if (fi.isUploading()) { validationState = 'warning'; }

    let imageFileToCrop = fi.get('imageFileToCrop'),
      selectDiv = null,
      imageCropDiv = null,
      uploadDiv = null,
      label = this.props.label || '',
      DocumentSelect = this.props.image ? documentSelect(ImageGraphic) : documentSelect(DocumentGraphic);

    if (imageFileToCrop) {
      if (label) { label = 'Crop Image'; }
      imageCropDiv = (
        <div className='image-crop-container'>
          <ImageCrop className='image-crop-editor' file={imageFileToCrop} onError={this.onCropError} ref={c=>this.imageCropRef=c}/>
          <div className='image-crop-button-group'>
            <Button bsStyle='success' className='image-crop-confirm-button' onClick={this.onCrop}>Crop</Button>
            <Button bsStyle='warning' className='image-crop-cancel-button' onClick={this.onCancel}>Cancel</Button>
          </div>
        </div>
      );
    } else if (fi.isUploading()) {
      if (label) { label = 'Upload Image'; }
      uploadDiv = (
        <DocumentUploadNoProgress
          file={fi.get('fileToUpload')}
          fileReferenceName={this.props.fileReferenceName}
          uploadDocument={this.uploadDocument}
          onSuccess={this.onUpload}
          onError={this.onUploadError}
          />
      );
    } else {
      selectDiv = (
        <DocumentSelect
          documentUrl={documentUrl}
          blankDocumentUrl={this.props.blankDocumentUrl}
          accept={this.props.image ? '.jpg,.jpeg,image/jpeg' : '.pdf,application/pdf'}
          disabled={fi.isUploading()}
          onCancel={this.onCancel}
          onSelect={this.onSelect}
          onRemove={this.onRemove}
          />
      );
    }

    return (
      <FormGroup className={this.props.className} controlId={fi.getKey()} validationState={validationState}>
        <input type='hidden' value={documentUrl}/>
        <ControlLabel className='document-select-label'>{label}</ControlLabel>
        {selectDiv}
        {imageCropDiv}
        {uploadDiv}
        <HelpBlock>{fi.getMessage()}</HelpBlock>
      </FormGroup>
    );
  }

  onCancel(e) {
    e.preventDefault();
    this.updateDocumentState({});
  }

  onSelect(file) {
    if (this.props.image) {
      if (file.type !== 'image/jpeg') {
        this.updateDocumentState({message: 'only jpeg files accepted please', warn: true});
        return;
      }
    } else {
      if (file.type !== 'application/pdf') {
        this.updateDocumentState({message: 'only .pdf files accepted please', warn: true});
        return;
      }
    }

    if (this.props.crop) {
      this.updateDocumentState({isUploading: true, imageFileToCrop: file, message: 'You can drag and resize'});
    } else {
      this.updateDocumentState({isUploading: true, fileToUpload: file});
    }
  }

  onRemove(e) {
    e.preventDefault();
    let context = this.props.formState.createUnitOfWork(),
      fi = context.set(this.props.fieldState.getName(), '').validate();
    if (fi.isValid()) { fi.setValid('Please submit form to finalize removal'); }
    context.updateFormState();
  }

  onCrop(e) {
    e.preventDefault();
    this.imageCropRef.crop().then(file => {
      this.updateDocumentState({isUploading: true, fileToUpload: file});
    });
  }

  onCropError(err) {
    this.updateDocumentState({message: 'Failed to read image file', warn: true});
  }

  onUpload(document) {
    this.updateDocumentState({documentUrl: document.url, message: 'Please submit form to save changes'});
  }

  onUploadError(err) {
    this.updateDocumentState({message: 'Upload failed', warn: true});
  }

  // documentState is an object that may contain:
  //  documentUrl: only on successful upload
  //  isUploading: set to true only while uploading (or cropping)
  //  message: only if something useful to communicate
  //  warn: to mark the message as a warning
  //  also imageFileToCrop, fileToUpload
  updateDocumentState(documentState) {
    let context = this.props.formState.createUnitOfWork(),
      fi = context.getFieldState(this.props.fieldState.getName());

    let documentUrl = documentState.documentUrl;

    if (!documentUrl) {
      documentUrl = this.props.fieldState.getValue();
    }

    fi.setValue(documentUrl).validate(); // document might be required

    if (documentState.isUploading) {
      fi.setUploading(documentState.message); // overrides required
    }
    else if (fi.isValid()) {
      fi.setValid(documentState.message); // document exists or is not required
    }
    else if (documentState.message) {
      fi.setInvalid(documentState.message); // message overrides required message
    }

    if (documentState.warn) { fi.set('warn', true); }
    if (documentState.imageFileToCrop) {
      fi.set('imageFileToCrop', documentState.imageFileToCrop);
      fi.set('isCropping', true); // part of contract, changing could break clients
    }
    if (documentState.fileToUpload) { fi.set('fileToUpload', documentState.fileToUpload); }

    context.updateFormState();
  }
}


// DocumentInput.propTypes = {
//   formField... react-formstate generated props...
//   className: React.PropTypes.string,
//   label: React.PropTypes.string,
//   blankDocumentUrl: React.PropTypes.string,
//   api: React.PropTypes.object.isRequired,
//   image: React.PropTypes.bool,
//   crop: React.PropTypes.bool,
//   fileReferenceName: React.PropTypes.string.isRequired
// };
```

### usage example

```es6
import React, { Component } from 'react';
import { FormState, Form } from 'react-formstate';
import { Grid, Row, Col } from 'react-bootstrap';
import Input from '../widgets/FsBootstrapInput.jsx';
import HiddenInput from '../widgets/HiddenInput.jsx';
import Submit from '../widgets/BootstrapSubmit.jsx';
import { DocumentInput } from '../widgets/DocumentInput.jsx';

export default class AccountForm extends Component {

  constructor(props) {
    super(props);
    this.formState = new FormState(this);
    this.state = this.formState.injectModel(props.accountForm.account);

    this.submit = this.submit.bind(this);
  }

  render() {
    let isCropping = this.formState.anyFieldState(fi => fi.get('isCropping'));

    return (
      <Form formState={this.formState} onSubmit={this.submit}>
        <Grid fluid>
          <Row>
            <Col xs={12} sm={6} lg={4}>
              <HiddenInput formField='id' defaultValue='0' intConvert/>
              <Input formField='firstName' label='First Name' required/>
              <Input formField='lastName' label='Last Name' required/>
              <Input formField='email' label='Email' required fsv={v => v.email()}/>
            </Col>
            <Col xs={12} sm={6} lg={4}>
              <DocumentInput
                className = 'avatar-input'
                formField='imageUrl'
                label='Image'
                image
                crop
                blankDocumentUrl='/public/images/blankAvatar.svg'
                api={this.props.api}
                fileReferenceName='avatar'
                />
            </Col>
            <Col xsHidden lg={4}/>
          </Row>
          <Row>
            <Col xs={12}>
              <Submit
                invalid={this.formState.isInvalid()}
                uploading={this.formState.isUploading()}
                message={isCropping ? 'Please crop the image' : null}
                bsSize='large'
                />
            </Col>
          </Row>
        </Grid>
      </Form>
    );
  }

  submit(e) {
    e.preventDefault();
    let model = this.formState.createUnitOfWork().createModel();
    if (model) {
      let upsert = (model.id === 0) ? this.props.api.account().create : this.props.api.account().update;
      upsert = upsert.bind(this.props.api.account());
      upsert(model).thenRouteTo('session.home').catch(APP.handleApiError());
    }
  }
}
```

### sample css

```css
.document-select-button-group button {width: 85px;}
.document-select-file-input {position: absolute; left: -9999px; width: 0px; height: 0px;}

.avatar-input .document-select-graphic,
.charity-image-input .document-select-graphic {display: inline-block; width: calc(100% - 100px); min-width: 150px; margin-right: 5px; cursor: pointer;}

.avatar-input .document-select-graphic {max-width: 250px;}

.avatar-input .document-select-button-group,
.charity-image-input .document-select-button-group {vertical-align: top; display: inline-block;}

.avatar-input .document-select-upsert-button,
.charity-image-input .document-select-upsert-button {display: block; margin-bottom: 5px;}
```
