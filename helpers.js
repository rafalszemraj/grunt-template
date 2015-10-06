import R from 'ramda'

const getPath = R.curry((path,object) => R.path( R.split('.', path), object ))

export default {

  // object helpers
  getPath,
  addTo                 : R.curry((object, property, value) => R.assoc( property, value, object) ),
  emptyObjectOr         : R.defaultTo({}),
  emptyListOr           : R.defaultTo([]),
  hasDefinedProps       : R.curry((propsPaths, object) => R.allPass( R.map( getPath, propsPaths ), object )),
  getPropOr             : R.curry((path, def) => R.ifElse( R.isNil, R.always(def), R.compose( R.defaultTo(def), getPath(path)) )),

  // alt action helpers
  actionDispatcher      : (altAction, transform = R.identity) => R.compose( altAction.dispatch.bind(altAction), transform),
  passDataToAction      : R.curry(( action, transform = R.identity ) => R.compose( action, transform ) ),

    // async
  dispatchAsyncCall     : (promiseOrFunction, name) => {

    let promise = R.is(Promise, promiseOrFunction ) ? promiseOrFunction : promiseOrFunction();
    actions.onAsyncOperation({name, promise});
    return () => promise;

  },

  // components
  dim                   : R.pick(['width', 'height']),
  classed               : R.compose( R.join(' '), R.keys, R.pickBy( R.identity )),



  // d3 helpers
  getElement            : (d3element, elementSelector) => {

    var element = d3element.select(elementSelector);
    return element.empty() ? d3element.append(elementSelector) : element;
  }
}


