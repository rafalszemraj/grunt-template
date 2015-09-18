(function(){ 
  function factory(/*dep1, dep2*/){
    return function hal(url){
   


var STATUS_NOT_LOADED = 1 << 0
var STATUS_LOADING    = 1 << 1
var STATUS_LOADED     = 1 << 2
  
var root = {}
var instance = createResource(url, null, root)
var onResourceAdded
 , params
 , method
 , loadHandler
 , urlHandler

/**
 * called every time before an async response is returned
 * Can be used for augmenting/parsing/validating the response
 */
root.onResourceAdded = function(func){
  if (!arguments.length) return onResourceAdded
  onResourceAdded = func
  return instance;
}

root.params = function(val){
  if (!arguments.length) return params
  params = val
  return root;
}
root.method = function(val){
  if (!arguments.length) return method
  method = val
  return root;
}

root.loadHandler = function(val){
  if (!arguments.length) return loadHandler
  loadHandler = val
  return root;
}

root.urlHandler = function(val){
  if (!arguments.length) return urlHandler
  urlHandler = val
  return root;
}




function callback(error, data, cb){
  if (!cb) return
  if (cb.length==2) cb(error, data)
  else if (!error) cb(data)
}

/**
 *  super simple promise
 */
function miniPromise(cb){
  var success, fail
   , promise = {}
   , error
   , data
  promise.then = function(cb){
    success = cb
    data && success(data)
    return promise
  }
  promise.fail = function(cb){
    fail = cb
    error && fail(error)
    return promise
  }
    
  return {
    promise: promise,
    resolve: function(data){ 
      callback(null, data, cb)
      success && success(data)
    },
    reject: function(error){ 
      callback(error, null, cb)
      fail && fail(error) 
    }
  }
}

/**
 *  injects params into a templated link
 */ 
function toUrl(url, params){
  params = params || {}
  for(var key in params) {
    url = url.replace("{"+key+"}", params[key])
  }
  return url
}

function toBody(body, params){
  if (!body) return ""
  params = params||{}
  var result = {}
  for (var key in body){
    result[key] = (params.hasOwnProperty(key))
      ? params[key]
      : body[key]
  }
  return result
}

function createRequest(resource, cb){
    var d = miniPromise(cb)
    var request = d.promise
     , self = {}
     , method
     , useCached = true
     , name 
     , params
     , body
     , context
     , contentType = "application/json"
     , headers

    request.name = function(val){
      if (!arguments.length) return name
      if (val && typeof(val)=="object"){
        createResource("", val, context)
        addResourceHandler(val, context)
        return val
      }
      name = val
      return request;
    }
    request.params = function(val){
      if (!arguments.length) return params
      params = val
      return request;
    }

    request.param = function(key, val){
      if (arguments.length==0) return params
      if (arguments.length==1) return params[key]
      params = params || {}
      params[key] = val
      return request;
    }

    request.method = function(val){
      if (!arguments.length) return method
      method = val
      return request;
    }

    request.contentType = function(val){
      if (!arguments.length) return contentType
      contentType = val
      return request;
    }

    request.headers = function(val){
      if(!arguments.length) return headers
      headers = val
      return request;
    }

    request.body = function(val){
      if (!arguments.length) return body
      body = val
      return request;
    }
    
    request.context = function(val){
      if (!arguments.length) return context
      context = val
      return request;
    }

    request.abort = function(){
      request.abort.aborted = true;
      request.abort.pendingRequest && request.abort.pendingRequest.abort()
      return request;
    }

    request.useCached = function(val){
      if (!arguments.length) return useCached
      useCached = val
      return request;
    }

    request.call = function(f){
      f(request)
      return request
    }

    var deferredCall = this.deferredCall||setTimeout
    var _then = request.then
    request.then = function(f){
      resolve()
      return _then(f)
    }

    self.deferredCall = function(cb){
      request.then(cb)
    }

    request.request = function(name, params, cb){
      if (name && typeof(name)=="object"){
        return request.name(name)
      }

      var request = createRequest.bind(self)(instance,cb)
        .name(name)
        .params(params)
        .context(context)
      return request
    }

    cb && resolve()
    function resolve(){
      if (request.abort.aborted) return
      deferredCall(function(){ 
        //TODO check if we can get it from the cache!
        if (resource._embedded 
          && resource._embedded[request.name()] ) {
          d.resolve(resource._embedded[request.name()])
        }
        else {
          if (!name) {
              return d.resolve(resource)
            }
          if (request.abort.aborted) return
          normaliseRequest(request, resource)
          var loadHandler = context.loadHandler()||load
          loadHandler(request,function(error, data){
            if (error) {
              return d.reject(error)
            }

            var childresource = createResource(request.name(), data, context)
            if (context.onResourceAdded()) context.onResourceAdded()(childresource)
            addResourceHandler(childresource, context)
            d.resolve(childresource)
          })
        }

        },1)
    }

    function load(req, cb){
      //nodejs compatibility
      var xhr
      if (!typeof(XMLHttpRequest)) {
        xhr = require("xmlhttprequest").XMLHttpRequest;
      }
      else xhr = XMLHttpRequest
      var request = new xhr()
      req.abort.pendingRequest = request
      request.open(req.method(), req.generatedUrl, true);
      request.setRequestHeader("Content-Type", req.contentType());
      if(req.headers()){
        req.headers().forEach(function(d){
          request.setRequestHeader(d.key, d.value)
        })
      }
      request.onload = function() {
        if (request.status >= 200 && request.status < 400){
          try {
            data = JSON.parse(request.responseText);
          }
          catch(e){
            cb(e)
          }
          cb(null, data)
        } else {
          cb(request)
        }
      }
      request.onerror = function(error) {
        cb(error, null)
      }
      var payload = req.body() || req.generatedBody
      if (typeof(payload)=="object") payload = JSON.stringify(payload,null, "")
      request.send(payload);
    }
    return request
  }


function addResourceHandler(data, context, forceAdd){
  if (!data) return 
  if (typeof(data)=="object") Object.keys(data).forEach(function(key){
    var d = data[key]
    if (d
      && !d.request 
      && typeof(d)=="object" 
      && (d._links || d._embedded || forceAdd)) {
        data[key] = createResource(key, d, context)
        if (context.onResourceAdded()) context.onResourceAdded()(d)
    }
    addResourceHandler(data[key], context, key=="_embedded")
  })
}


function normaliseRequest(request, resource){
  var link = resource._links? resource._links[request.name()]: request.name()
  var url = link.href||link
  if (request.context().urlHandler()) {
    url = request.context().urlHandler()(url)
  }
  request.generatedUrl = toUrl(url, request.params())
  request.generatedBody = toBody(link.body, request.params())
  if (!request.method()) request.method(link.method || "get")
  return request
}




/**
 *  
 */
function createResource(name, resource, context){
  if (name && typeof(name)=="object") {
    var o = name
    var n = o._name?o._name():null
    return createResource(n, o, context||o)
  }
  var status = resource? STATUS_LOADED : STATUS_NOT_LOADED
  var instance= resource||context
    , self = {}
  self.queue = []

  var params
    , method
    , parent
    , loadHandler
    , urlHandler

  instance._name = function(){ 
    return name
  }

  instance.request = function(name, params, cb){
    if (name && typeof(name)=="object"){
        var request = createRequest.bind(self)(instance,cb)
          .context(context)
          .name(name)
        if (cb) cb(request)
        return request
      }

    var request = createRequest.bind(self)(instance,cb)
      .name(name)
      .params(params)
      .context(context)
    return request
  }

  /**
   *  make sure the parent resource is loaded
   */
  self.deferredCall = function(cb, timeout){
    if (status & STATUS_NOT_LOADED) {
      self.queue.push(cb)
      status = STATUS_LOADING
      if (!name) {
        return setTimeout(resolve,timeout)
      }
      var request = createRequest(instance)
          .name(name)
          .params(params)
          .method(method)
          .context(context)
          .then(function(data){
            mergeIn(data)
            resolve()
          })
    }
    else if (status & STATUS_LOADING) {
      self.queue.push(cb)
    }
    else setTimeout(cb,timeout)

    function resolve(){
      while (self.queue.length) self.queue.pop()()
      status = STATUS_LOADED
    }
  }

  
 
    
 

  function mergeIn(data){
    for (var key in data) instance[key] = data[key]
  }
  
  return instance
}



return instance
}}
if (typeof exports === 'object') { // Node.js
    // dep1 = require('dep1');
    // dep2= require('dep2');
    module.exports = factory(/*dep1, dep2*/);

} else {

  if (typeof define === 'function' && define.amd) { // Require.JS
     define("halogen/hal", [/*deps*/], factory);
  } 
  
  // Browser globals
  this.ubs = this.ubs || {}
  this.ubs.halogen = factory(/*dep1, dep2*/);
}
}(this))
