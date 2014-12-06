#bower-kaazing-amqp-0-9-1-client-javascript

kaazing-amqp-0-9-1-client-javascript delivers ```Amqp-0-9-1.js``` Javascript library for running AMQP 0-9-1 over WebSocket. Using the Javascript library, developers will be able to send and receive AMQP messages from within a browser and communicate with an AMQP 0-9-1 compliant message broker such as Apache QPid or Pivotal RabbitMQ by way of the Kaazing Gateway AMQP Proxy service.


## About this Project

This project contains the build artifacts from the Kaazing Github project kaazing-amqp-0-9-1-client-javascript (https://github.com/kaazing/kaazing-amqp-0-9-1-client-javascript).

This project is not intended to be built or changed directly. Instead, it will be updated whenever the kaazing-client-javascript-demo project is updated and released.

##Directory structure
* javascript: Has the complete demo package, which includes generated Amqp-0-9-1.js library, amqp.html demo file, resources directory which has css and image files.
* jsdoc: API docs generated from source files

##Notes
* Amqp-0-9-1.js library will not work with the WebSocket implementation available in Android stock(default) browser. To make it work with Android stock(default) browser, please use Amqp-0-9-1.js with Kaazing's WebSocket.js.


