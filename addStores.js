module.exports = function (...listOfStores) {

  const handlerName = store => 'on' + store.displayName+'Change'

  return function(Component) {

    let storeChangeHandlers = listOfStores.map( handlerName );
    let p = Component.prototype;

    storeChangeHandlers.forEach( callback => {

      if( typeof p[callback] !== 'function') {

        throw new Error( callback + ' handler is expected on ' + Component.name );
      }

    } )

    var componentDidMount = p.componentDidMount;
    var componentWillUnmount = p.componentWillUnmount;

    Object.defineProperties(p, {

      "componentDidMount": {

        value: function() {

          var self = this;
          listOfStores.forEach( store => store.listen(self[handlerName(store)]))
          if( typeof componentDidMount === 'function' ) {

            componentDidMount.apply(this);

          }
        },
        writable: true
      },

      "componentWillUnMount": {

        value: function() {

          var self = this;
          listOfStores.forEach( store => store.unlisten(handlerName(store)))
          if( typeof componentWillUnmount === 'function' ) {

            componentWillUnmount.apply(this);

          }
        },
        writable: true
      }
    })
  }

}
