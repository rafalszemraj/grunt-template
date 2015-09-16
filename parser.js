var data = require('./data.json');
import R from 'ramda'

    // type:: rowObject -> {H,N,F}
var type = R.compose( R.head, R.prop('name')),
    // level: rowObject -> Number
    level = R.compose(Number, R.prop(1), R.prop('name')),
    // isGroup :: rowObject -> Boolean
    isData = R.useWith( R.equals('N'), type ),
    isGroup = R.useWith( R.equals('H'), type ),
    isSummary = R.useWith( R.equals('F'), type ),
    // getColumnNames:: [column] => [columnName]
    getColumnNames = R.map( R.prop('internalName')),
    cftRowToObject = R.curry( (columns, row) => {

      return {
        name: R.head(row),
        data: R.zipObj( getColumnNames(columns), R.tail(row))
      }
  }
);


var  toHierarchy = R.curry((columns, cftRows) => {

  var   currentGroup = { name:'ROOT'},
        groupOrder = [currentGroup],
        parsers = {
          'N': R.useWith( R.T, R.identity, R.identity),
          'H': R.useWith( R.gt, level, level ),
          'F': R.useWith( R.equals, level, level )
        },
        getParser = row => parsers[type(row)](row),
        getGroup = lookupFn => R.findLast( lookupFn, groupOrder ) || R.head(groupOrder),
        addChild = R.curry((child, group) => group.children = R.append( child, group.children || [] )),
        reducer = (group,row) => {

          R.compose( addChild(row), getGroup, getParser )(row);
          isGroup(row) && groupOrder.push(row);
          return group;

        }

    return R.prop('children', R.reduce( reducer, currentGroup, R.map( cftRowToObject( columns ), cftRows ) ));
});

/**
 * dataRowMapper:: {name, data:{}} => {}
 */
var  toGrid = R.curry(( groups, dataRowMapper, hierarchy ) => {

  var makeHeader = groupRow => {

    var key = groups[level(groupRow)].column;
    return {
      key,
      label: groupRow.data[key],
      children: R.map(mapper, groupRow.children)
    }

  };
  var mapper = R.ifElse( isGroup, makeHeader, R.ifElse( isData, dataRowMapper, R.identity) );
  return R.map( mapper, hierarchy );



})

var cftRowsToGridConverter = R.curry( (columns, groups, dataRowMapper ) => R.compose( toGrid(groups, dataRowMapper), toHierarchy(columns)));


export {cftRowsToGridConverter, toGrid, toHierarchy}


class Balance {

  static fromDataRow(cftDataRow) {

    return new Balance(cftDataRow)
  }

  constructor(cftDataRow) {

    this.data = R.prop('data', cftDataRow);
  }

  get isCashDivident() {

    return R.propEq('Cash Divident', 'event', data );
  }

}

// test
var data = require('./mocks/allevents/scarletletter/reportData.json');


// create builder based on columns set
var baseBuilder = cftRowsToGridConverter( data.columns );
var builderWithGroups = baseBuilder( data.transforms.groups );

// grid builder for plain values
var plainGridBuilder = builderWithGroups( R.prop('data') );

// grid builder for Balances
var balanceGridBuilder = builderWithGroups( Balance.fromDataRow );


var plain = plainGridBuilder(data.rows);
var balances = balanceGridBuilder(data.rows);

console.log('done');


