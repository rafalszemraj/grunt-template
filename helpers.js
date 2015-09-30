import R from 'ramda'

function getElement( d3element, elementSelector) {

    var element = d3element.select(elementSelector);
    return element.empty() ? d3element.append(elementSelector) : element;
}

export default {

  // object helpers
  getPath               : R.curry((path,object) => R.path( R.split('.', path), object )),
  addTo                 : R.curry((object, property, value) => R.assoc( property, value, object) ),
  emptyObjectOr         : R.defaultTo({}),
  emptyListOr           : R.defaultTo([]),
  hasDefinedProps       : R.curry((propsPaths, object) => R.allPass( R.map( getPath, propsPaths ), object )),

  // alt action helpers
  actionDispatcher      : (altAction, transform = R.identity) => R.compose( altAction.dispatch.bind(altAction), transform),
  passDataToAction      : R.curry(( action, transform = R.identity ) => R.compose( action, transform ) ),

  // d3 helpers
  getElement
}


