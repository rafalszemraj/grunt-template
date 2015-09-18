import {React} from 'prime-js-react'
import Component from './base/Component'
import EntitlementStore from "../stores/EntitlementStore";
import Immutable from 'immutable'
import R from 'ramda'
import {immutableComponent,addStores} from '../utils/decorators'

@immutableComponent
@addStores(EntitlementStore)
class Module extends Component {

  //get counter() { return data() };
  initData = data => this.state = {data:Immutable.fromJS(data)}



  constructor() {

    super();
    this.state = {data:Immutable.fromJS({counter:0})}
  }

  getStateFromStore() {

    return EntitlementStore.getState();

  }

  componentDidMount () {

    console.log('original didMount')
  }

  componentWillUnmount () {
    console.log('original willUnMount')
  }

  onChange(store) {

  }

  render() {

    return <div>Cropo Actions {this.data.get('counter')}
        <button onClick={this.btnClick}>clickme (update)</button>
        <button onClick={this.btnClickNoUpdate}>clickme (no update)</button>
    </div>
  }

  shouldComponentUpdate( nextProps, nextState ) {

    var should = this.data !== nextState.data;
    console.log("will update" + should);
    return should;

  }

  btnClick(event) {

    this.updateData( data => data.update('counter', c => c+1))

  }

  btnClickNoUpdate(event) {

    this.updateData( data => data.update('counter', c => c))

  }

  upddateFromHere = (updater) => this.setState(({data}) => ({data: updater(data)}))

}

module.exports = Module;
