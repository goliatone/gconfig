##TODO:
- [ ] Add lib/* to .gitignore
- [ ] Ensure we bower install on `before_script: bower install`
- [ ] Make loaders handle async methods.

Should we get rid of jQuery?
We use `$.proxy` and `$.extend`

```
var metaTags=document.getElementsByTagName("meta");
var selector = options.selector.replace('::NAMESPACE::', namespace);

var content = {}, attr;
for (var i = 0; i < metaTags.length; i++) {
    attr = metaTags[i].getAttribute("name");
    if(selector.test(attr)) {
        content[attr.replace( namespace +'-','')] = metaTags[i].getAttribute("content");
    }
}
```

- [x] Review install process. Export only gconfig, no cruft.
- [ ] Do we need component.json or bower.json is enough?
- [ ] Plugins: persistence? db manager? 

Refactor data to use a data provider, so we can use different _drivers_ ie: DOM (meta), JSON service, local storage...

## Make POJOs of self.
It would be interesting to attach all properties to the resulting config object so that:

```html
<meta name="app:name" content="GConfig Tester">
<meta name="app:baseurl" content="http://localhost:9030">
<meta name="app:default-controller" content="Controller">
<meta name="sidebar:controller" content="SidebarController">
<meta name="widget:id" content="widgetId">
```
Could be accessed like:

```javascript
var config = new GConfig();
console.log(config.app.name) //GConfig Tester
console.log(config.app.baseurl) //http://localhost:9030
console.log(config.app['default-controller']) //Controller
console.log(config.sidebar.controller) //SidebarController
console.log(config.widget.id) //widgetId
```

Should default namespace be merged into the `config` object?!


Async forEach:
http://stackoverflow.com/questions/17860089/array-and-asynchronous-function-callback
http://zef.me/3420/async-foreach-in-javascript


## TESTING
How do we test plugins? We should test the plugin code, but also make sure that when attached they do not break `GConfig` tests.
We could have an autoregister option so that when we run tests, we directly attach plugins that are loaded.
