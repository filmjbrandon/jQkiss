#jQkiss
A simplistic (KISS!) object framework for javascript

##Requirements:
* jQuery 1.4+

##Setup:

1. git clone git://github.com/filmjbrandon/jQkiss.git
3. add controllers...

```JS
var MyControllers = {
    Foo: {
       counter: 1,
        // constructors are optional, but can be used to perform global
        // bindings or other initializations...
        __constructor: function(options) {
            console.log("i can refer to myself",this);
            this.methodA();
        },
        methodA: function() {
            this.element.find('span').html("<b>The current counter: "+ this.counter +"</b>");
            this.counter++;
        },
        getCounter: function() {
          return this.counter;
        }
    },

    Bar: {
      counter: 0,
      bindings: [
          { 'button.add' : { click : 'addToCounter' } },
          { 'button.subtract' : { click : 'subtractFromCounter' } }
      ],
      handlers: {
          addToCounter: function(event){
              $(event.target).css('color','green');
              this.counter++;
              // call out to a non-handler method
              this.methodB();
          },
          subtractFromCounter: function(event){
              event.preventDefault();
              $(event.target).css('color','red');
              this.element.find('span').text(--this.counter);
          }
      },
      methodB: function(){
          this.element.find('span').text(this.counter);
      }
    }
}
```

4.Assemble the object specifications into classes:

```JS
  var classes = jQkiss.bootloader( { controllers : MyControllers } );
```

5.Instantiate as desired:

```JS
  $(document).ready(function(){
      x = new classes.Foo();
      y = new classes.Bar();
      z = new classes.Bar( { element : $('div.Bar2') } )
      x.methodA(); // will show counter of 2;
      x.getCounter() //  will return 3
  })
```

##HTML Sample:
```HTML
<script src="jQkiss.js"></script>
<div class="Foo">
    <span></span>
</div>

<div class="Bar">
    <span></span>
    <button type="button" class="add">Click Me To Add</button>
    <button type="submit" class="subtract">Click Me To Subtract</button>
</div>

<div class="Bar2">
    <span></span>
    <button type="button" class="add">Click Me To Add</button>
    <button type="submit" class="subtract">Click Me To Subtract</button>
```

##Special Variables:
 * `this.element`
  * represents the bound/scoped DOM element.  By default, if you do not set this when instantiating the class, it will use the class as a classname and bind all methods to any DOM elements using this classname.
 * `this._settings`
  * represents the original settings object passed during instantiation

##Special Methods:
 * `this.getBound()`
  * displays the binding data associated to ```this.element```.
 * `this.getElement()`
  * getter synonomous with ```this.element```.
 * `this.rebind()`
  * this is a method that will reset all bindings scoped to ```this.element```.
