# Design contrast


Upstream store
     |
     |
     V
Form component
     |
     |
     V
Input components


Which layer should hold the state of an unsubmitted form?

### Upstream store

[Redux](https://github.com/reactjs/redux) advocates storing all data upstream in a store. This is consistent with React's core concept of one-way binding. Typical benefits of a Redux/Flux architecture include supporting real-time applications, undo/redo functionality, and replay.

Consider these features in the context of an HTML form. Is pushing real-time data into an HTML form a useful feature? Most likely not. Is sophisticated undo/redo beyond what's offered by standard HTML inputs important? Probably not. Is watching a replay of a user manipulating a form a valuable feature? Potentially. Is it worth the additional effort of wrapping an HTML form in command pattern? Probably not. Does it introduce additional security concerns? Good chance.

As an argument against a full-on Redux approach, one questions the need for an upstream store to touch invalid state. Insulating an application from transient form state seems a sensible design choice. It has the added benefit of encapsulating validation logic in the form component where it arguably belongs. Storing transient form state in a form component is compatible with Redux/Flux. Once valid data is submitted you can update the store in the usual manner.

Another goal of an upstream store might be to write validation logic once and have it service both a client UI and a server-side database. However, since validation in a client UI typically has fundamentally different requirements from that of server side data repositories, one can argue the goal of writing validation logic once is a chimera (unfortunately).

The challenges and requirements of a client UI are also likely to wreak havoc on the many schema-driven validation packages you can find on npm. It's hard to fit UI into a data-driven box. In practice, coding is usually necessary.

### Input components

A library such as [formsy-react](https://www.npmjs.com/package/formsy-react) chooses to store state downstream in the input components and extract it upon form submission.

Given the reasons why a Redux design is overkill for an HTML form, eschewing React's core concept of one-way binding is a reasonable choice for an HTML form. However, as your form requirements grow in complexity, you are likely to find there is a downside to doing so.

### Form component

react-formstate makes the simple choice of storing transient form state in your form component. Its design allows for stateless input and nested form components without the use of React's controversial [context api](https://facebook.github.io/react/docs/context.html). react-formstate provides an api to facilitate one-way binding, validation, immutable state, and form reuse. It seamlessly supports dynamic behavior and asynchronous validation, streamlining React forms for both simple AND complex use cases. react-formstate has taken a solid approach for its intended purpose.
