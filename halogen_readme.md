halogen
==========

Halogen is an async javascript library for consuming `application+hal` resources.

 - HAL specification: http://stateless.co/hal_specification.html

Halogen allows you to access any resource via a simple async `request("resourceName")` API. 
<br>If it can't find a resource in `_embedded`, it will automatically load it for you from the `_links` definition

Halogen has no dependencies, it likes nodeJS and the browser, it plays nicely with commonJS or RequireJS.
### Examples
If your JSON looks like this:
```js
//http://example.com/api/v1/orders
{
    "currentlyProcessing": 14,
    "shippedToday": 20,
    "_embedded": {
        "ea:order": {
            "total": 30,
            "currency": "USD",
            "status": "shipped",
            "_links": {
                "self": { "href": "/orders/123" },
                "ea:basket": { "href": "/baskets/98712" },
                "ea:customer": { "href": "/customers/7809" }
            },
        }
    },
    "_links": {
        "self": { "href": "/orders" },
        "ea:find": {
            "href": "/orders{?id}",
            "templated": true
        }
    }
}
```
You can retrieve resources like this:
```javascript
hal("http://example.com/api/v1/orders")
  .then(callback) //returns { currentlyProcessing:30, ...}
```
You can follow `_link`-s or `_embedded` resources like this:
```javascript
hal("http://example.com/api/v1/orders")
  .request("ea:order")
  .then(callback) //returns { total:30, currency:"USD", ...}
```

```javascript
hal("http://example.com/api/v1/orders")
  .request("ea:find")
  .params({ id:"1" })
  .then(callback) 
  .fail(boohoo)
```

> __Pro tip:__ The resource returned in the `.then(cb)` callback is also a halogen resource, so you can do subsequest requests on them!
>
> eg.:
> 
> ```javascript
> hal("http://example.com/api/v1/orders")
>   .request("ea:find")
>   .params({ id:"1" })
>   .then(function(subResource){
>
>     subResource
>      .request("ea:person")
>      .then(cb)
>   })
> ```

### API

 - `.params({ name:"bob" , phone:123123})` - params for building the URI or the request body
 - `.method("PUT")` - request method. Optional, the default is "GET"
 - `.body("cat")` - Payload for the request
 - `.then(function(resource){})`
 - `.fail(function(error){})`

### How to chain requests
You can chain multiple calls by using subsequent `.request()` calls:
```javascript
hal()  
  .request("http://someservice")
  .request("fsr:funds")  
  .request("fsr:fund")  
  .then(function(resource) {  
    // resource is the fund array list   
  })  
```


### How to cancel requests
Hal allows you to cancel pending requests using `.abort()`
```javascript
var service = hal()  
  .request("http://someservice")
  .params({ id:"1" })
  .then(callback)
  .fail(boohoo)
  
  
d3.select("cancel-button")
  .on("click", service.abort)
```
Cancelled requests will never call `.then` or `.fail`.

### How to create a halogen object from a javascript object
You can turn any javascript object into a halogen object by simply requesting it:
```javascript
hal()
  .request({
    _links: { 
     test: {
      href: "http://someservice"
     }}
  })
  .request("test")
  .then(function(resource) {  
    
  })  
```
The newly created halogen object will carry all configuration settings from the parent halogen object

### `call()` function
the `.call()` api allows you to get a reference to the hal instance in a more functional way:
```javascript
// Instead of doing this:
someFunction(hal()  
  .request("http://someservice")
  .then(callback)
  .fail(boohoo)
)

// do this:
hal()  
  .request("http://someservice")
  .then(callback)
  .fail(boohoo)
  .call(someFunction)
  
someFunction(halInstance){
  d3.select(".cancelButton")
    .on("click", halInstance.abort)
}
```
`someFunction` is executed immediately with the hal instance, before the request is executed.

__Note:__ You can chain multiple `.call()`-s:
```js
hal()  
  .request("http://someservice")
  .then(callback)
  .fail(boohoo)
  .call(cancellationFeature)
  .call(logFeature)
  .call(someOtherFeature)

```


### Handlers
#### urlHandler
`urlHandler` is useful if you consume an API via a proxy, or you want to rewrite some of the _link-s at runtime
```javascript
hal("http://someservice")
  .urlHandler(function(url){
    return url.replace("http://someservice.com", "localhost:8080/yourproxy")
  })
  .request("report")
  .then(callback)
```


#### contentType
`contentType` allows you to send the xhr request with a custom contentType header. 
<br>The default is `"application/json"`
```javascript
hal("http://someservice")
  .request("http://someservice")
  .contentType("application/hal+json")
  .then(callback)
```

### Installation
`bower install HTML/halogen --save`

### how to import halogen into your project:
1. via requireJS:
```
define("halogen/dist/halogen.js", function(halogen){
  ...
})
```
2. via commonjs require(node or browserify):
```
var hal = require("halogen/dist/halogen.js")
```
3. via a script tag:
```
<script src="lib/halogen/dist/halogen.js" type="text/javascript"></script>
```


### how to build halogen
clone this repo, run `npm install`
- `grunt` - builds a new dist/hal.js
- `grunt watch` - builds a new dist/hal.js on file change
- `start tests/index.html` run unit tests in the browser
