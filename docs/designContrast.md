# design contrast

upstream store -> form component -> input components

which layer should hold the state of an unsubmitted form?

### upstream store

[redux](https://github.com/reactjs/redux) advocates storing all data upstream in a store. this is consistent with react's core concept of one-way binding. typical benefits of a redux/flux architecture include supporting real-time applications, undo/redo functionality, and replay.

consider these features in the context of an html form. is pushing real-time data into an html form a useful feature? most likely not. is sophisticated undo/redo beyond what's offered by standard html inputs important? probably not. is watching a replay of a user manipulating a form a valuable feature? potentially. is it worth the additional effort of wrapping an html form in command pattern? probably not. does it introduce additional security concerns? good chance.

as an argument against a full-on redux approach, i question the need for an upstream store to touch invalid state. insulating an application from transient form state seems a sensible design choice. it has the added benefit of encapsulating validation logic in the form component where it arguably belongs. storing transient form state in a form component is compatible with redux/flux. once valid data is submitted you can update the store in the usual manner.

another goal of an upstream store might be to write validation logic once and have it service both a client UI and a server-side database. however, since validation in a client UI typically has fundamentally different requirements from that of server side data repositories, i believe the goal of writing validation logic once is a chimera (unfortunately).

the challenges and requirements of a client UI are also likely to wreak havoc on the many schema-driven validation packages you can find on npm. it's hard to fit UI into a data-driven box. in practice, coding is usually necessary.

### input components

a library such as [formsy-react](https://www.npmjs.com/package/formsy-react) chooses to store state downstream in the input components and extract it upon form submission.

given the reasons why a redux design is overkill for an html form, eschewing react's core concept of one-way binding is a reasonable choice for an html form. however, as your form requirements grow in complexity, you are likely to find there is a downside to doing so.

### form component

react-formstate makes the simple choice of storing transient form state in your form component. its design allows for stateless input and nested form components without the use of react's controversial [context api](https://facebook.github.io/react/docs/context.html). react-formstate provides an api to facilitate one-way binding, validation, immutable state, and form reuse as best it can. it seamlessly supports dynamic behavior and asynchronous validation, streamlining react forms for both simple AND complex use cases. react-formstate has taken a solid approach for its intended purpose.
