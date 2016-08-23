# refactored model injection

i realized that a unit of work is geared for calling setState. you don't do that in a constructor. so the old injection api is a little clumsy

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  let context = this.formState.createUnitOfWork();
  this.state = context.injectModel(props.model);
  this.state = context.add('someOtherField', 'someValue');
}
```

it is now

```es6
constructor(props) {
  super(props);
  this.formState = new FormState(this);
  this.state = this.formState.injectModel(props.model);
  this.formState.add(this.state, 'someOtherField', 'someValue');
}
```

(the old way still works but i hid it from the examples and the documentation)
