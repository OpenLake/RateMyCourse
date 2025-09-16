window.fetch = ((originalFetch) => { return function(...args) { console.log("FETCH", args); return originalFetch.apply(this, args); }; })(window.fetch);
