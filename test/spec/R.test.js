import {expect} from 'chai'
import {getPropOr, getPath, classed} from '../../lib/utils/helpers'
describe('getProps test', function() {

    it('should return default when nil object', function() {

      expect( getPropOr("something", 1)(null) ).to.be.equal(1);

    });

    it('should return default when prop does not exist', function() {

        expect( getPropOr("something", 1)({}) ).to.be.equal(1);

    });

    it('should return default when prop is null', function() {

      expect( getPropOr("something", 1)({something:null}) ).to.be.equal(1);

    });

  it('should return default when prop is undefined', function() {

    expect( getPropOr("something", 1)({something:undefined}) ).to.be.equal(1);

  });

  it('should return given prop', function() {

    expect( getPropOr("something", 1)({something:"someValue"}) ).to.be.equal("someValue");

  });

  it('should return given nested property', function() {

    expect( getPropOr("something.deep", 1)({something: {deep:"someValue"}}) ).to.be.equal("someValue");

  });

});

describe('getPath test', function() {

  it('should return null', function() {

    expect( getPath('something', {} )).to.be.undefined;
  });

  it('should return null', function() {

    expect( getPath('something.deep', { something:10, deep:10 } )).to.be.undefined;
  });

  it('should return null', function() {

    expect( getPath('some.deep.value', { some: { deep: { value:10 }}} )).to.be.equal(10);
  })

});

describe('classed test', function() {

  it('should get proper classes', function() {


    expect(classed({class1:true, class2:false, class3:true})).to.be.equal("class1 class3")


  })



})


