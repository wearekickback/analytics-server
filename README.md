# KickBack Mixpanel proxy server

[![Build Status](https://travis-ci.org/noblocknoparty/mixpanel-proxy.svg?branch=dev)](https://travis-ci.org/noblocknoparty/mixpanel-proxy)

* Live URL: https://analytics.kickback.events

Because some browsers and ad-blockers prevent the Mixpanel client JS libary from working,
we use this server to proxy requests from our app to Mixpanel.

## Usage

First, deploy this server at a URL, e.g. `mydomain.com`.

Follow the [standard Mixpanel instructions](https://mixpanel.com/help/reference/javascript) to
include Mixpanel into your HTML file.

Then, put the following code before the Mixpanel code you just embedded:

```html
<script type="text/javascript">
  window.MIXPANEL_CUSTOM_LIB_URL = "http://mydomain.com/client.js";
</script>
```

That's it! Now you can use all the normal Mixpanel APIs in your page and
everything will get sent to Mixpanel despite ad blockers.

_Note: Due to the proxy server, the page visitor's IP address does not get
sent to Mixpanel, which means country and city resolution doesn't work. I am
still figuring out how to fix this!_

## Deployment

The `master` branch is auto-deployed by Travis to the live URL.

## License

AGPL v3
