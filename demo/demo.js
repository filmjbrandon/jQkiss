/**
 * Simple Demo controllers for jQkiss
 */

var DemoControllers = {
    Foo: {
      // set some properties
       msg : "Instantiated Foo!",

       // constructors are optional, but can be used to perform global
       // bindings or other initializations...
        __constructor: function(options) {
            this.setMessage();
        },
        // Add methods
        setMessage: function() {
            this.element.find('span')
              .html(this.msg)
              .css('fontWeight','bold');
            this.counter++;
        }
    },

    Bar: {
      counter: 0,
      // Set bindings scoped to "this.getElement()";
      bindings: [
          { 'button.add'      : { click : 'addToCounter' } },
          { 'button.subtract' : { click : 'subtractFromCounter' } }
      ],
      // We have a special array for event handlers associated to the above bindings
      // but they still have access to all the object properties
      handlers: {
          addToCounter: function(event){
              $(event.target).css('color','green');
              this.counter++;
              // call out to a non-handler method
              this.setCounter(this.counter);
          },
          subtractFromCounter: function(event){
              event.preventDefault();
              $(event.target).css('color','red');
              this.element.find('span').text(--this.counter);
          }
      },
      // handlers only accept the event param, so we add
      // methods that can accept params outside of
      // the handlers array.
      setCounter: function(counter){
          this.element.find('span').text(counter);
      }
    }
}



// Now we want to convert these to instantiable JS classes
var jQDemo = jQkiss.bootstrap( { controllers : DemoControllers } );

// remove so it's not browsable - security first :)
delete DemoControllers;