/**
 * jQkiss is a surprisingly simple and elegant solution for organizing your javascript code into objects
 * TODO: Add inheritance, mixins/plugins and separate out Ajax, Bindings, and other plugins
 *
 * @param object
 * @author Jim Kass
 * @version 0.1
 */
var jQkiss = {
  bootstrap : function(config) {
    // some sanity checks
    if (!config) {
      return;
    }
    var controllers = config.controllers;
    if ( typeof(controllers) !== 'object' ){ return; }

    for (name in controllers)
    {
      var base = {}; // create a container for the classes
      (function( _classname, _controllers ) {
        base[name] = function(options){
          var _is_init = false;
          var _uniq_class = false;
          var _init_options = {};

          var $self = this;

          // Public Methods

          $.extend( $self,{
            // convenience method to list the bindings associated with the element.
            getBound : function() {
              return $self.getElement().data('events');
            },
            // selects the base element that's used to scope bindings
            getElement : function() {
              return $self.element = $($self.element.selector);
            },
            // resets bindings
            rebind : function() {
              $self.element = $($self.element.selector);
              _initBindings($self.bindings);
            }
          });

          // Private Methods

          var _initBindings = function(bindings){
            $($self.element.selector).ready(function(){
              var delegate_element = $self.getElement() || $(document);
              delegate_element.undelegate(); // prevent rebinding
              $.each(bindings,function(idx,obj){
                $.each(obj,function(selector,actions) {
                  $.each(actions,function(event,action) {
                    var func = (typeof(action) == 'function') ? action : $self['handlers'][action];
                    console.log("here",func,delegate_element,selector);
                      delegate_element.delegate(selector,event,func);
                  });
                })
              });
            });
          };

          // the initialization meat
          (function(options)
          {
            _is_init = false;
            _init_options = options || {};
            $self.element = _init_options.element ? $(_init_options.element) : $('.' + _classname);

            // merges all properties/methods of the controller into the current object without prototype
            $.extend( $self, _controllers[_classname] );
            // Handles all constructor initialization, and via closure creates reference to the main object
            (function(options){
                $this = $self; // makes a class level reference to itself available anywhere within object
                if (typeof($self.__constructor) !== 'undefined' ) {
                  $self.__constructor(options);
                }
            })(_init_options);
            // setup bindings
            _initBindings($self.bindings);
            _is_init = true;
          })(options);
        };
      })( name, controllers );
      // ^^ so for the less JS inclined, if we don't make a self-executing anon function here,
      // JS will evaluate "name" at runtime which will be the last known value as per the for..in above.
    }
    return base; // we return an object with a set of "assembled" classes.
  }
};
