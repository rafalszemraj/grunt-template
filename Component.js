import React from 'react'

export default class Component extends React.Component {

  constructor(props, shouldAutoBind = true ) {
    super();
    shouldAutoBind && this.autoBind();

  }

  autoBind() {
    Object
      .getOwnPropertyNames(this.constructor.prototype)
      .filter(prop => typeof Object.getOwnPropertyDescriptor(this.constructor.prototype, prop).value == 'function')
      .forEach(method => this[method] = this[method].bind(this));
  }


}
