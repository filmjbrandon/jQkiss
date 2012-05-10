/**
 * jQkiss
 * Object Oriented jQuery - surprisingly simple!
 *
 * by Jim Kass (http://github.com/filmjbrandon)
 * distributed under Creative Commons Attribution-ShareAlike License - http://creativecommons.org/licenses/by-sa/2.5/
 *
 * @version 0.3
 */
var jqkiss = {
  bootstrap : function(config)
  {
    var jq = {
      debug: function()
      {
        if ( config.debug && config.debug > 1 ) {
          console.log("JQ DEBUG",arguments);
        }
      }
    };
    // some sanity checks
    if (!config) {
      return;
    }
    var controllers = config.controllers;
    if ( typeof(controllers) !== 'object' ){ return; }
    var base = {}; // create a container for the classes

    var mergeInherits = function(_classname,_controllers)
    {
      jq.debug(_classname,_controllers);
      var inherits = _classname.split('::',2);
      if (inherits.length > 1)
      {
        var _inheritee = _controllers[_classname];
        var _inherited = _controllers[inherits[1]];
        // replace classname
        _classname = inherits[0];
        _controllers[_classname] = $.extend( true, _inherited, _inheritee );
      }
      return {inherited:_inherited,base:_controllers[_classname],name:_classname};
    };


    // Compile Plugins
    // Start with sys
    $.each(jqkiss.ext.sys,function(key,val) {
      var extended = mergeInherits(key,jqkiss.ext.sys);
      jqkiss.ext.sys[extended.name] = extended.base;
      jqkiss.ext.sys[extended.name]['$extend'] = jqkiss.ext.sys[extended.name]['$extend'] || {};
      $.extend( jqkiss.ext.sys[extended.name]['$extend'], extended.inherited );
    });

    for (name in controllers)
    {
      (function( _classname, _controllers ) {

        // Inheritance
        var extended = mergeInherits(_classname,_controllers);
        jq.debug('extended',extended);
        _classname = extended.name;
        _controllers[_classname] = extended.base;
        _controllers[_classname]["$parent"] = extended.inherited;

        base[_classname] = function(options){

          jq.debug("controllers",_controllers)

          // no need to use "new" to instantiate
          if (!(this instanceof arguments.callee)) {
            return new base[_classname](options);
          }

          jq.debug("preinit",_controllers[_classname]);

          // Private
          var _is_init = false;
          var _uniq_class = false;
          var _init_options = {};
          var $self = this;

          if ( config.debug ) {
            $self._is_debug = true;
          }


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
            // merges in mixins/extensions
            $.each(_controllers[_classname]['$extend'], function(i,mixin){
              // TODO: find a way to NOT use eval here!
              if (typeof mixin === 'function') {
                jq.debug(_controllers[_classname]['$extend'],i,mixin);
                $.extend( true, _controllers[_classname], _controllers[_classname]['$extend'] );
                delete _controllers[_classname]['$extend'];
              }
              else
              {
                var obj = eval('jqkiss.ext.' + mixin);
                $.extend( true, _controllers[_classname], obj );
              }
            });

            jq.debug("pre-merge",_controllers[_classname]);
            // merges all properties/methods of the controller into the current object without prototype
            $.extend( $self, _controllers[_classname] );
            jq.debug("post-merge",_controllers[_classname]);


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

jqkiss.ext = {};
jqkiss.ext.sys = {
    'Base': {
      getData: function(){
        return this.$_data;
      },
      setData: function(data){
        this.$_data = data;
      },
      setUrl: function(url){
        this.$_url = url;
      },
      getUrl: function() {
        return this.$_url;
      },
      debug: function() {
        if (this._is_debug)
        {
          console.log('USER DEBUG',arguments);
          delete this._is_debug;
        }
      }
    },
    'Ajax::Base' : {
      // TODO: make private vars
      request: function(options) {
        var $_ajax_defaults = {
          url: this.getUrl(),
          data:this.getData()
        };
        var options = $.extend(
          $_ajax_defaults,
          options
        );
        $.ajax(options);
      },
      get: function(options) {
        this.request($.extend({type:'GET'},options));
      },
      post: function(options) {
        this.request($.extend({type:'POST'},options));
      }
    }
}
