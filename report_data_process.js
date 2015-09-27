import hal from 'halogen';
import R from 'ramda';
import Promise from 'bluebird';
import {getReportInfo} from './request';

// === tools


let getPath = R.curry((path,object) => R.path( R.split('.', path), object ));
let addTo = R.curry((object, property, value) => R.assoc( property, value, object) );
let emptyObjectOr = R.defaultTo({});
let emptyListOr = R.defaultTo([]);
let hasDefinedProps = R.curry((propsPaths, object) => R.allPass( R.map( getPath, propsPaths ), object ));

// === report tools

    let matchFilterWithSummary = filter => summary => filter.column === summary.column

//

let reportData = {};




let processVisualFilters = () => {

    if( hasDefinedProps(['summary', 'header'], reportData ) ) {
        let filters = emptyListOr(getPath('reportInstanceHeader.visualFilters', reportData.header));
        let summaries = emptyListOr(getPath('summary.columnSummaries', reportData.summary));

        //let findSummaryForFilter = filter => R.find( matchFilterWithSummary(filter), summaries );
        let findSummaryForFilter2 = R.compose(R.find(R.__, summaries), matchFilterWithSummary);
        let getValuesFromSummary = R.compose(getPath('valueOccurrences'), findSummaryForFilter2);

        let mapper = filter => addTo(filter, "values", getValuesFromSummary(filter));

        var newFilters = R.map(mapper, filters);
        console.log(newFilters);
    }
    return Promise.resolve(reportData);
}




let processHeader = header => {

    return Promise.resolve(reportData = addTo(reportData, 'header', header));
}
let processSummary = summary => {

    return Promise.resolve(reportData = addTo( reportData, 'summary', summary ));
}


getReportInfo('header.json')
    .then( processHeader)
    .then( getReportInfo('summary.json'))
    .then( processSummary )
    .then( processVisualFilters )
//getReportInfo('data.json').then( processHeaderData("data") );
//getReportInfo('summary.json').then( processSummary );


// test

var arr = [1,2,3,4];
let matchNum = template => value => template === value

let findNum         = num => R.find( matchNum(num), arr );
let findNumComposed = num => R.compose( R.find( R.__, arr), matchNum )(num);
console.log( findNum(3) )
console.log( findNumComposed(3) )

var ob = { one:1, two:{ three:3 } };


console.log( hasDefinedProps(["one"], ob ));
console.log( hasDefinedProps(["one", "two"], ob ));
console.log( hasDefinedProps(["one", "two.three"], ob ));
console.log( hasDefinedProps(["one", "two.four"], ob ));
