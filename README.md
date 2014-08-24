[![Build Status](https://secure.travis-ci.org/goliatone/gconfig.png)](http://travis-ci.org/goliatone/gconfig)

## GConfig

Hierarchical configuration management utility.

**NOTE**:
There is a [grunt task][grunt-gconfig] to generate HTML metadata configuration options to be consumed for GConfig. Configurations are loaded from JSON files and you can specify different environments.

### Namespaces
_TODO_

### Plugins

Plugins need to be registered, either at a global level using `GConfig.extend` or at an instance level with the `use` method.  

```javascript
GConfig.extend(GCInterpolate);
config.use(GCInterpolate);
```

**GConfig Interpolate**

The Interpolate plugin provides a simple dependency solver for templated string values.

```javascript
var config = new GConfig();
var data = {
    url:{
        base:'localhost',
        port:'9000'
    },
    app:{
        clientId:'23'
    }
};
var template = 'http://@{url.base}:@{url.port}/@{app.clientId}';
console.log(config.interpolate(template, data));//http://localhost:9000/23
```

It overrides GConfig's default `get` method to automatically detect if the value to be returned is a template string, and in that case solve it by calling `interpolate`.

```html
<meta name="app:port" content="9090">
<meta name="app:host" content="localhost">
<meta name="url:endpoint" content="http://@{app.host}:@{app.port}">
```

```javascript
var config = new GConfig();
console.log(config.get('endpoint', null, 'url')); //http://localhost:9000
```

**GConfig QueryString**

The GConfigQS plugin registers an synchronous loader adding support for configuration options from URL query parameters, providing a way to modify at runtime configuration values and effectively modify application behavior.

```
http://myapp.com/?app[debug]=true
```

The plugin also provides a method to filter attributes of the loaded object before is merged into the configuration data object. By default it does nothing.

```javascript
GConfig.extend(GConfigQS);
var config = GConfig({
    filterAttributes:function(data){
        if(data.app && data.app.host) delete data.app.host;
        return data;
    }
});
```


It provides a `toQueryString` method that will return a string formatted as a query string.

```javascript
var qs = config.toQueryString();
console.log(qs) // "?app[port]=9000&app[host]=localhost"
```


**GConfig Path**

The Path plugin provides support for keypath notation:

```javascript
config.set('app.port', 9000);
var host = config.resolve('app.host');
```


### Loaders

Loaders are used to add a configuration object to a GConfig instance. Most of the times you will want to use the `merge` method to extend the existing data with the loaded object.

Loaders can by synchronous or asynchronous. The loader function is executed in a special context that provides one method `async` that returns a method that **must** be called to continue processing the next loaders.

The loader function when executed receives one single argument, the current GConfig instance. 

A simple example that loads a `config.json` file:

```javascript
var jsonLoader = function(gconfig) {
    //Loading is now blocked until next is called.
    var next = this.async();
    $.ajax({
        url: 'config.json'
    }).done(function(data) {
        gconfig.merge(data, true);
    }).always(function() {
        next();
    });
};
```

You can also check the **GConfigQS** plugin for an example of a synchronous loader.

**Metadata Loader**

The default configuration loader provided with GCconfig is a metadata loader.
You can place your configuration options in `<meta/>` [tags][meta-tags] in your HTML file header and will be available in your GConfig instance.

The meta tag `name` attribute contains the namespace and the attribute name separated by a colon, `name="<namespace>:<attribute>"`. The meta tag `content` attribute holds the value.

```html
<meta name="app:name" content="GConfig Tester">
<meta name="sidebar:style" content="full">
```

The previous example is available to a GConfig instance:

```javascript
var config = GConfig();
console.log(config.get('name'));//GConfig Tester
console.log(config.get('style', 'small', 'sidebar'));//full 
```

<!-- LINKS -->
[meta-tags]: http://www.w3.org/TR/html-markup/meta.name.html
[grunt-gconfig]: https://github.com/goliatone/grunt-gconfig