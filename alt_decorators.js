import Immutable from 'immutable'
function immutableComponent(Component) {

    let p = Component.prototype;
    Object.defineProperties(p, {

      "data": {
        get: function() {

          return this.state ? this.state.data : Immutable.fromJs({})
        }
        //get: () => this ? (this.state ? this.state.data : Immutable.fromJS({})) : Immutable.fromJS({})
      },

      // updater:: Immutable -> Immutable
      "updateData": {
        value: function(updater) {
          this.setState(({data}) => ({data: updater(data)}))
        },
        writable: true
      },

      "updateProperty": {
        value: function(prop, updater) {
          return data => data.update(prop, updater)
        } ,
        writable: true
      }

    })
}


function addStores(listOfStores) {

  return function(Component) {

    let stores = Array.isArray(listOfStores) ? listOfStores : [listOfStores];
    let p = Component.prototype;
    var componentDidMount = p.componentDidMount;
    var componentWillUnmount = p.componentWillUnmount;

    Object.defineProperties(p, {

      "componentDidMount": {

        value: function() {

          var self = this;
          stores.forEach( store => store.listen(self.onChange))
          if( typeof componentDidMount === 'function' ) {

            componentDidMount.apply(this);

          }
        },
        writable: true
      },

      "componentWillUnMount": {

        value: function() {

          var self = this;
          stores.forEach( store => store.unlisten(self.onChange))
          if( typeof componentWillUnmount === 'function' ) {

            componentWillUnmount.apply(this);

          }
        },
        writable: true
      }

    })


  }


}

export default {immutableComponent,addStores}

