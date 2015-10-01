const logPromise = (name, promise ) => console.log( "call: %s ::: data: %o, failReason: %s, isPending: %o",
  name,
  promise.isFulfilled() ? promise.value() : undefined,
  promise.isRejected()  ?promise.reason() : undefined,
  promise.isPending() );



export default class AsyncStore {

    constructor() {

      this.isPending = false;
      this.failReason = null;
    }

    // AsyncStatus -> void
    asyncStatus( promise ) {

      let updateOnPromise = promise => () => {

        this.isPending = promise.isPending();
        this.failReason = promise.isRejected() ? promise.reason() : null;
        this.emitChange();

      }

      updateOnPromise(promise)();
      promise.then( updateOnPromise(promise) )
        .catch( updateOnPromise(promise))

    }

}


