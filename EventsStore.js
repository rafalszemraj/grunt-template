import alt from '../alt'
import EventsActions from '../actions/EventsActions'
import Event from '../domain/event'
import {dataProcessor} from '../utils/cft'
import R from 'ramda'
import AsyncStore from './AsyncStore'

class EventsStore extends AsyncStore{

  constructor() {

    super();
    this.bindActions(EventsActions)
    this.eventsData;
    this.gridSetup;

  }

  on

  onGetEvents(events) {

    let converter = dataProcessor.cftRowsToGridConverter( R.identity, events.data.columns, events.data.transforms.groups );
    this.eventsData = converter(events.data.rows)

    this.gridSetup = {

      columns: [

        {key: "accountname"}
      ]

    }


    console.log(this.eventsData);

  }

  onHeader(header) {

    console.log( "header for report: ", header)

  }

  onData(data) {

    console.log( "data for report: ", data)

  }

  onSummary(summary) {

    console.log( "summary for report: ", summary );
  }


}

export default alt.createStore( EventsStore, 'EventsStore');
