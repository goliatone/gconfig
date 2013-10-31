##TODO:
- [ ] Add lib/* to .gitignore
- [ ] Ensure we bower install on `before_script: bower install`

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

