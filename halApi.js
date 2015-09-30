import hal from 'halogen';
import {Promise} from "bluebird"


// Prime Services API Namespace
const PRIME_API_V1 = '/api/prime/v1/'
const PRIME_ENTITLEMENT_API_V1 = '/api/prime/entitlement/v1/'
const ENTITLEMENTS_API = '/api/entitlements/v1/'


let promisify = halInstance => {

    return new Promise( function( resolve, reject ) {
      halInstance.then( resolve );
      halInstance.fail( reject );
    });

}

const eventsRequest = resource => hal(PRIME_API_V1 + "corporate/events/" + resource).request();
const clients = hal(PRIME_ENTITLEMENT_API_V1 + "clients");


export default {

  eventsMockApi: {

    getEventsHeader   : () => promisify(eventsRequest("header").request()),
    getEventsData     : () => promisify(eventsRequest("data").request()),
    getEventsSummary  : () => promisify(eventsRequest("summary").request())

  },
  getClients        : () => promisify(clients.request("gfs:client")),
  getAccounts       : (clientId) => promisify(hal().request(clientId).request("gfs:accounts"))
}



