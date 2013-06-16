##TODO:
- [ ] Add lib/* to .gitignore
- [ ] Ensure we bower install on `before_script: bower install`

Should we get rid of jQuery?

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

- [ ] Review install process. Export only gconfig, no cruft.
- [ ] Do we need component.json or bower.json is enough?
