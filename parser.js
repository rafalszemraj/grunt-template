var data = require('./data.json');
var R = require('ramda');

var rowMapper = row => {

    return {
        name: R.prop(0, row),
        data: row,
        add: function(element) {
            this.children = R.append( element, this.children || [] )
        }
    }

}



function parse(flatRows) {

    var currentGroup = rowMapper(['ROOT']),
        type = R.compose(R.prop(0), R.prop('name')),
        level = R.compose(Number, R.prop(1), R.prop('name')),
        findParent = R.useWith( R.gt, level, level ),
        findSame = R.useWith( R.equals, level, level ),
        findLast = (row) => true,
        groupOrder = [currentGroup],
        addToGroupOrder = row => groupOrder.push(row),
        addToGroup = R.curry((row, group) => group.add(row))
        getGroup = R.curry((lookupFn, row) => R.findLast( lookupFn(row), groupOrder ) || R.head(groupOrder));
        reducer = (group, row ) => {

            switch( type(row) ) {

                //case 'N': R.last(groupOrder).add(row); break;
                    case 'N': R.compose( addToGroup(row), getGroup(findLast))(row); break;
                case 'H':
                {
                    R.compose( addToGroup(row), getGroup(findParent) )(row);
                    groupOrder.push(row);
                    break;
                }
                case 'F': {
                    R.compose( addToGroup(row), getGroup(findSame) )(row);
                    //getGroup(findSame, row).add(row);
                    break;
                }
                default:;

            }
            return group;



        }

     return R.reduce( reducer, currentGroup, flatRows );
}





var rows = R.map( rowMapper, data.rows );
var h = parse( rows );

var p = R.project(['name', 'children'], h.children );

console.log(h);
