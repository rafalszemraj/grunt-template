import alt from '../alt';
import api from '../services/base/api'
import {Promise} from 'bluebird';
import R from 'ramda'
import {eventsMockApi} from '../services/base/halAPI'
import {dispatchAsyncCall} from '../utils/helpers'
const passDataToAction = R.curry(( action, transform = R.identity ) => R.compose( action, transform ) );


function asyncDispatch(AltActionsClass) {

    let p = AltActionsClass.prototype;

      Object.defineProperties(p, {

        "asyncStatus": {

          value:function(promiseOrFunction) {

            let promise = R.is(Promise, promiseOrFunction) ? promiseOrFunction : promiseOrFunction();
            this.dispatch(promise);
            return promise;
          }
        }
    })
}


@asyncDispatch
class EventsActions {

  constructor() {

    this.generateActions('data', 'header', 'summary');
  }


  getEvents() {

    const getHeader     = eventsMockApi.getEventsHeader;
    const getData       = eventsMockApi.getEventsData;
    const getSummary    = eventsMockApi.getEventsSummary;

    const processHeader   = R.compose( actions.header, R.prop('reportInstanceHeader') );
    const processData   = R.compose(actions.data, R.pick(['columns', 'rows', 'transforms', 'moreRows']));
    const processSummary  = /*() => Promise.reject("summary not in the cache");*/R.compose( actions.summary, R.prop("summary") );


    let status = this.actions.asyncStatus;

    return status(getHeader()
      .then(processHeader)
      .then(getData)
      .then(processData)
      .then(getSummary)
      .then(processSummary)
    );


  }

}


const actions = alt.createActions(EventsActions);
export default actions;
