import React from 'react'

class Component extends React.Component {

	// binder(...methods) {

	// 	methods.forEach( method => this[method] = this[method].bind(this));

	// }

	constructor() {

		super();
		this.autoBind();
	}

	autoBind() {

		let binder = fnKey => {

			console.log(`binding ${fnKey}`)
			this[fnKey] = this[fnKey].bind(this)

		}

		Object.getOwnPropertyNames(this.constructor.prototype)
			.filter( key => typeof this[key] === 'function')
			.forEach( binder )

	}

}

export default Component;