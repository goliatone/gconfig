[![Build Status](https://secure.travis-ci.org/goliatone/gconfig.png)](http://travis-ci.org/goliatone/gconfig)

## GConfig

Hierarchical configuration management utility. It provides and facilitates aggregation of different data sources, each data source adding properties or overriding existing ones. 

GConfig lets you define a configuration hierarchy where you start with a set of hardcoded default options, environment options in HTML metatags, and _runtime_ flags in query string format. Each level in the hierarchy overrides or augments the previous level.

**NOTE**:
There is a [grunt task][grunt-gconfig] to generate HTML metadata configuration options to be consumed for GConfig. Configurations are loaded from JSON files and you can specify different environments, i.e development vs production where you might have a service consuming different end point URLs.


### Namespaces

Namespaces are top level identifiers for different sections of a configuration object.

You would first instantiate a GConfig instance with a set of default values. Here, `sidebar` is a namespaces.

```javascript
var config = new GConfig({
    data: {
        sidebar: {
            style: 'small'
        }
    }
});
```

If your HTML page contains this metadata tags, after being parsed by GConfig it would override the attribute `style` in the `sidebar` namespace. It would also create a new `media` namespace with an attribute `url`.

```html
<meta name="sidebar:style" content="full">
<meta name="media:url" content="http://localhost/media">
```

There is a default namespace- `app`- which will be used when no namespace argument is defined in methods that ask for one.


### Merging configurations

GConfig provides the `merge` method, which will perform a deep extend of the provided object with the existing data, adding new properties or overriding existing ones.


### Interface methods

One idea behind the library is that of single responsibility, making use of functionality such as logging or events but leaving the implementation to the developer. 

#### Events

GConfig provides an `emit` stub method that gets called with event types. The method is not implemented, and is provided as a convenience to be overridden with any event emitter library preferred by the developer. 

By default two events are emitted:

- `initialized`: Emitted after the first time we call `init`. If `autoinitialize` is set to `true`, that will be on a `new` instance. 
- `ondata`: Emitted after all loaders are completed and data is ready for use. Note that it is scheduled to be fired on the next tick so you can pass in options to the constructor and then attach listeners. 

If you don't have an event library of choice, you could use [GPub][gpub] which provides a mixin `GPub.observable` which adds a bunch of methods similar to `jQuery` event interface- plus one `emits` method which tells you if an instance has listeners for a certain event type.

```javascript
GPub.observable(GConfig);
```


#### Logger

GConfig defines a `logger` object in its prototype that by default is simply a reference to the `console` global object, and if not available it will create a shim with no real functionality- just ensuring that calls to any method in `logger` do not throw errors.


### Loaders

Loaders are used to add a configuration object to a GConfig instance. Most of the times you will want to use the `merge` method to extend the existing data with the loaded object.

Loaders can by synchronous or asynchronous. The loader function is executed in a special context that provides one method `async`, that returns a method that **must** be called to continue processing the next loaders.

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
You can place your configuration options in `<meta/>` [tags][meta-tags] in your HTML file header and those options will be available in your GConfig instance.

Think of the metadata loader as an environment aware loader, similar to node's `process.env`. 

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

Think of the functionality provided by the QueryString plugin analogous to a runtime flag options override in that let's you selectively override certain configuration options when you load a page.

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

It adds one method to the GConfig prototype:
- `resolve`: Returns the value of a property addressed with dot notation.

It also overrides the behavior of the `set` method, enabling setting an attribute at the end of a property chain.


### Writing plugins

A plugin is a simple object providing one `register` method which gets passed in the GConfig object, providing access to its prototype and top level methods.
It is recommended that the plugin object also specifies an `ID` and a `VERSION` attributes.

```javascript
var SamplePlugin = {};
SamplePlugin.ID = 'SamplePlugin';
SamplePlugin.VERSION = '0.0.1';

SamplePlugin.register = function(GConfig){
    if(GConfig.PLUGINS[this.ID]) return true;
    GConfig.prototype.helloPlugin = function(message){
        this.logger.info(SamplePlugin.ID, 'says:', message);
    };
};
```

To enable a plugin for all instances, add it with the `GConfig.extend` method: 

```javascript
GConfig.extend(SamplePlugin);
```

To enable a plugin only for an specific instance, add it with the instance's `use` method:

```javascript
config.use(SamplePlugin);
```

Then, you can use the provided functionality as intended:

```javascript
var config = new GConfig();
config.helloPlugin('Hola!'); // SamplePlugin says: Hola!
```


<!-- LINKS -->
[meta-tags]: http://www.w3.org/TR/html-markup/meta.name.html
[grunt-gconfig]: https://github.com/goliatone/grunt-gconfig
[gpub]: https://github.com/goliatone/gpub