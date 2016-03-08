/* global define */
/* eslint-disable */
/**@license
 * data-components v{{version}} <https://github.com/rafaelrinaldi/data-components>
 * Released under {{license}} license
 * Author: Rafael Rinaldi <http://rinaldi.io>
 **/
/* eslint-enable */
(function (exports) {
  'use strict';

  // Component store
  var store = {};

  // Query selector helper
  function $(selector) {
    var lookup = exports.document.querySelectorAll(selector);
    return [].slice.call(lookup);
  }

  /**
   * Own implementation of `Object.assign` that works in all browsers.
   * Note that it only does shallow copies.
   */
  function mixin(target /* ...sources */) {
    var from;
    var to = target;
    var index = 0;
    var total = arguments.length;
    var hasOwnProperty = Object.prototype.hasOwnProperty;

    while (++index < total) {
      from = arguments[index];

      if (from !== null) {
        for (var key in from) {
          if (hasOwnProperty.call(from, key)) {
            to[key] = from[key];
          }
        }
      }
    }

    return to;
  }

  /**
   * Register a new component to the components store.
   */
  function register(component, implementation) {
    var newItem = {};
    newItem[component] = implementation;
    return mixin(store, newItem);
  }

  function mount(properties, options) {
    // Component properties
    var id = properties.id;
    var node = properties.node;

    // Component options
    var exports = options && options.exports;

    if (!store[id]) {
      console.warn('No implementation found for component "' + id + '"');
      return;
    }

    // Create new component instance
    var Component = store[id];
    var instance = new Component(node, options, properties.sandbox);

    // Handy flag to check if component was actually mounted
    Component.isMounted = true;

    // Save the component instance to sandbox
    properties.sandbox[exports ? exports : id] = instance;
  }

  // Lookup for components to bootstrap on the current context
  function update(sandbox) {
    var selector = '[data-component]';

    // Loop through all `selector` occurrences and bootup components found
    $(selector)
      // Bypass update if component was already mounted
      .filter(function (node) {
        var Component = store[node.dataset.component];
        return Component && !Component.isMounted;
      })
      .forEach(function (node, index) {
        /**
        * `dataset` has its own type (`DOMStringMap`) so we convert it to an
        * actual `Object`.
        */
        var options = mixin({}, node.dataset);

        mount({
          sandbox: sandbox,
          node: node,
          index: index,
          id: options.component
        }, options);
    });

    return sandbox;
  }

  function components(presets) {
    // Add pre defined components to the store if there are any
    if (presets && typeof presets === 'object') {
      store = mixin(store, presets);
    }

    var sandbox = {
      get: function (id) {
        return this[id];
      },

      set: function (id, value) {
        store = register(id, value);
        update(sandbox);
      },

      update: function () {
        return update(this);
      }
    };

    return update(sandbox);
  }

  // UMD export
  if (typeof define === 'function' && define.amd) {
    define(function () {
      return components;
    });
  } else if (typeof module !== 'undefined' && module.exports) {
    module.exports = components;
  } else {
    exports.components = components;
  }
})(window);
