# custom FieldState properties

sometimes things don't fit in the box and a little flexibility is required.

snippets shown here are extracted from the [file input example](/docs/fileInputExample.md).

### getting custom properties

[react bootstrap](https://react-bootstrap.github.io/) has a 'warning' validation state.

from a standpoint of preventing invalid form submission, warning is equivalent to valid.

hence, from react-formstate's perspective, this is best supported through a custom FieldState property.

```es6
render() {
  let fi = this.props.fieldState, validationState = null;

  if (fi.isValid()) {
    if fi.get('warn') { // <--- CUSTOM PROPERTY
      validationState = 'warning'
    } else {
      validationState = 'success';
    }
  }
  else if (fi.isInvalid()) { validationState = 'error'; }
  else if (fi.isUploading()) { validationState = 'warning'; }

  // ...
}
```

if you have several document inputs in a single form, you can use field states to store intermediate state.

```es6
render() {
  let fi = this.props.fieldState,
    imageFileToCrop = fi.get('imageFileToCrop'); // <--- CUSTOM PROPERTY

  if (imageFileToCrop)
  {
    // ...
  }
  else if (fi.isUploading())
  {
    let file = fi.get('fileToUpload'); // <--- CUSTOM PROPERTY
    // ...
  }

  // ...
}
```

```es6
render() {
  let f = fi => fi.get('isCropping'), // <--- CUSTOM PROPERTY
    formIsCropping = this.formState.anyFieldState(f),
    formIsUploading = this.formState.isUploading();
}
```

### setting custom properties

```es6
// documentState is an object that may contain:
//  documentUrl: only on successful upload
//  isUploading: set to true only while uploading (or cropping)
//  message: only if something useful to communicate
//  warn: to mark the message as a warning
//  also imageFileToCrop, fileToUpload
updateDocumentState(documentState) {
  let context = this.props.formState.createUnitOfWork(),
    fi = context.getFieldState(this.props.fieldState.getName());

  fi.setValue(documentState.documentUrl).validate(); // document might be required

  //
  //
  // SET CUSTOM PROPERTIES
  //
  //

  if (documentState.warn) { fi.set('warn', true); }
  if (documentState.imageFileToCrop) {
    fi.set('imageFileToCrop', documentState.imageFileToCrop);
    fi.set('isCropping', true); // part of contract, changing could break clients
  }
  if (documentState.fileToUpload) {
    fi.set('fileToUpload', documentState.fileToUpload);
  }

  //
  // and the rest of the function for clarity...
  //

  if (documentState.isUploading) {
    fi.setUploading(documentState.message); // overrides required
  }
  else if (fi.isValid()) {
    fi.setValid(documentState.message); // document exists or is not required
  }
  else if (documentState.message) {
    fi.setInvalid(documentState.message); // message overrides required message
  }

  context.updateFormState();
}
```
