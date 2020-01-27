function SKSJ() {
    var self = this;
    var extensionId = "fmpmimlmjgfnplmmfenbpgikbdgjcdim";

    function postMessage(method) {
        var message = {"method": {"name": method, "types": [], "args": []}};
        for (var i = 1; i < arguments.length;) {
            message.method.types.push(arguments[i++]);
            message.method.args.push(arguments[i++]);
        }

        return new Promise(function(resolve) {
            console.log("Send: " + JSON.stringify(message));
            chrome.runtime.sendMessage(extensionId, message, function(response) {
                console.log("Received: " + JSON.stringify(response));
                if (response) {
                    if (response.error) {
                        console.log("Error: " + response.error.code + " - " + response.error.text);
                        resolve(self.resetError().then(function () {
                            throw {code: response.error.code, message: response.error.text};
                        }));
                    } else {
                        resolve(response.value);
                    }
                } else {
                    resolve(new Promise(function () {
                        throw {code: 14, message: chrome.runtime.lastError.message}
                    }));
                }
            });
        });
    }

    //--------------------------------------------------------------
    // SKSJObject functionality
    //--------------------------------------------------------------
    this.resetError = function() {
        return postMessage("resetError");
    };

    this.getVersion = function() {
        return postMessage("getVersion");
    };

    this.setProvider = function(id) {
        return postMessage("setProvider", "int", id);
    };

    this.getProviderAttr = function(index, attr) {
        return postMessage("getProviderAttr", "int", index, "int", attr);
    };

    this.getProviders = function() {
        var chain = Promise.resolve();
        var providers = [];
        var provider = {};

        [0, 1, 2, 3, 4, 5, 6, 7, 8, 9].forEach(function(i) {
            chain = chain
                .then(function() {
                    return self.getProviderAttr(i, 0);
                })
                .then(function(id) {
                    provider.id = id;
                    return self.getProviderAttr(i, 1);
                })
                .then(function(name) {
                    if (name != null) {
                        provider.name = name.replace(" provider used by SKS", "");
                        providers.push(provider);
                        provider = {};
                    } else {
                        return Promise.reject();
                    }
                });
        });

        chain = chain.catch(function() {
            console.log("providers: ");
            console.dir(providers);
            return providers;
        });

        return chain;
    };

    this.getCurrentProviderId = function () {
        return postMessage("getCurrentProviderAttr", "int", 0);
    };

    this.importKey = function(isSignOnly) {
        return postMessage("importKey", "int", isSignOnly);
    };

    this.getKeyDir = function() {
        return postMessage("getKeyDir");
    };

    this.changeKeyDir = function() {
        return postMessage("changeKeyDir");
    };

    this.getCert = function(isSignOnly){
        return postMessage("getCert", "int", isSignOnly);
    };

    this.getCertInfo = function(cert){
        return postMessage("getCertInfo", "java.lang.String", cert);
    };

    this.createSignature = function(xml) {
        return postMessage("createSignature", "java.lang.String", xml);
    };

    this.verifySignature = function(xml) {
        return postMessage("verifySignature", "java.lang.String", xml);
    };
}

window.sks = new SKSJ();