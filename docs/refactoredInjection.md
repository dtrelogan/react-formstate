# refactored model injection

i realized that a unit of work is geared for calling setState. since you don't do that in a constructor, the old injection api is a little clumsy

```es6
constructor(props) {
  super(props);
  this.formState = FormState.create(this);
  let context = this.formState.createUnitOfWork();
  this.state = context.injectModel(props.model);
  this.state = context.injectField('someOtherField', 'someValue');
}
```

it is now

```es6
constructor(props) {
  super(props);
  this.formState = FormState.create(this);
  this.state = this.formState.injectModel(props.model);
  this.formState.injectField(this.state, 'someOtherField', 'someValue');
}
```

of course if necessary you can still use a unit of work for injection

```es6
constructor(props) {
  super(props);
  this.formState = FormState.create(this);
  this.state = {};
}
componentDidMount() {
  this.props.getModel().then((model) => {
    let context = this.formState.createUnitOfWork();
    context.injectModel(model);
    context.injectField('someOtherField', 'someValue');
    context.updateFormState();
  });
}
```
