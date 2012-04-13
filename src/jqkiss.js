/**
 * jQkiss
 * Object Oriented jQuery - surprisingly simple!
 *
 * by Jim Kass (http://github.com/filmjbrandon)
 * distributed under Creative Commons Attribution-ShareAlike License - http://creativecommons.org/licenses/by-sa/2.5/
 *
 * @todo: Add inheritance, mixins/plugins and separate out Ajax, Bindings, and other plugins
 * @version 0.2
 */
var jQkiss = {
  bootstrap : function(config) {
    // some sanity checks
    if (!config) {
      return;
    }
    var controllers = config.controllers;
    if ( typeof(controllers) !== 'object' ){ return; }

    var base = {}; // create a container for the classes
    for (name in controllers)
    {
      (function( _classname, _controllers ) {
        base[_classname] = function(options){

          // no need to use "new" to instantiate
          if (!(this instanceof arguments.callee)) {
            return new base[_classname](options);
          }

          // Private
          var _is_init = false;
          var _uniq_class = false;
          var _init_options = {};
          var $self = this;

          // Private Methods
          var _initBindings = function(bindings){
            if (!bindings) { return; }
            var delegate_element = $self.element.parent() || $(document); // falls back to global bindings
            delegate_element.ready(function(){
              delegate_element.undelegate(); // prevent rebinding
              $.each(bindings,function(idx,obj){
                $.each(obj,function(selector,actions) {
                  $.each(actions,function(event,action) {
                    var func = (typeof(action) == 'function') ? action : function(){ $self['handlers'][action].apply($self, arguments); }
                    delegate_element.delegate(selector,event,func);
                  });
                })
              });
            });
          };

          // Public Methods (uses jQuery $.extend instead of prototype)
          $.extend( $self,{
            // convenience method to list the bindings associated with the element.
            getBound : function() {
              return $self.getElement().data('events');
            },
            // selects the base element that's used to scope bindings
            getElement : function() {
              return $self.element; //= $($self.element.selector);
            },
            // resets bindings
            rebind : function() {
//              $self.element = $($self.element.selector);
              _initBindings($self.bindings);
            }
          });


          // the initialization meat
          (function(options)
          {
            _is_init = false;
            _init_options = options || {};
            $self.element = _init_options.element ? $(_init_options.element) : $('.' + _classname);

            // wrap element with a uniqid
            if ( $self.element.length ) {
              $self.element.wrap('<div class="__jk" id="el-'+ new Date().getTime() + '"/>');
            }
            // merges all properties/methods of the controller into the current object without prototype
            $.extend( $self, _controllers[_classname] );

            // Handles constructor initialization, and via closure creates reference to the main object
            (function(options){
              // this makes a global var, we need it to be a class var
                if (typeof($self.__constructor) !== 'undefined' ) {
                  $self.__constructor(options);
                }
                if ($self.bindings){
                  _initBindings($self.bindings);
                }
            })(_init_options);
            // setup bindings
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
