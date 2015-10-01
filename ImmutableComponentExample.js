import Component from './component/Component'
import AsyncStore from '../stores/AsyncStore'
import AsyncActions from '../actions/AsyncActions'
import addStores from '../utils/addStores'
import {is, Record, Map} from 'immutable'
import {tap,curry,forEach} from 'ramda'

let log = x => y => console.log( x, y );

let set = curry( (property, mapperOrValue, immutableObj) => {

    return immutableObj.set( property, mapperOrValue )

} );
let transformer = (statusProperty, mapper) => status => {

    return {[statusProperty]:mapper(status[statusProperty])}
}

let dataTransformer = curry((property, transformer, data) => data.update(property, transformer) )
let setLoadingState = dataTransformer('status', dataTransformer('asyncStatus', ()=>'isLoading...'));
let setLoadedState = dataTransformer('status', record => record.set( 'asyncStatus', 'Loaded'));


const Status = Record({asyncStatus:"Empty"})

@addStores(AsyncStore)
export default class Main extends Component {

    constructor() {

        super();
        this.state = {

            data: Map({ status:new Status()})

        }
    }

    componentDidMount() {

        AsyncActions.getData();
        //this.setState( ({status}) => ({status:status.set('asyncStatus', "Empty")}));
        //this.setState( transformer('status', set('asyncStatus', 'Empty')));
        this.update( setLoadingState );
    }

    onAsyncStoreChange(state) {

        console.log("main, new state ", state)
        this.update( setLoadedState );
    }

    shouldComponentUpdate( nextProps, nextState ) {

        return tap( log("should component update => %o"), super.shouldComponentUpdate(nextProps, nextState) );
    }

    update( ...transforms ) {

        forEach( transform => this.setState( ({data}) => ({data:transform(data)})), transforms );

    }

    render() {

        return <div>Hello World! <b>{this.state.data.get('status').get('asyncStatus')}</b></div>;
    }
}
