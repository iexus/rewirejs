define(['rewire',
        'tests/mocks/RedCable',
        'tests/mocks/BlueCable'], 
function(re, RedCable, BlueCable) {

    var redCablePath = "tests/mocks/RedCable";
    var blueCablePath = "tests/mocks/BlueCable";

    describe ("Loading rewire via requirejs", function() {
        it ("will be defined", function() {
            expect(re).toBeDefined();
        });

        it ("will expose a wire method", function() {
            expect(re.wire).toBeDefined();
        });

        it ("will expose a store method", function() {
            expect(re.store).toBeDefined();
        });
    });

    describe ("rewiring a dependency", function() {
        describe ("validation", function() {
            it ("will throw an error if you do not specify a dependency to replace", function() {
                expect(function(){
                    re.wire();
                }).toThrow();
            });

            it ("will throw an error if you do not spcify the dependencyName as a string", function() {
                expect(function(){
                    re.wire({ something: "something"});
                }).toThrow();
            });

            it ("will throw an error if you do not specify a path to the dependency to mock", function() {
                expect(function(){
                    re.wire("aPath");
                }).toThrow();
            });

            it ("will throw an error if you do not specify the path to the mock dependency as a string", function() {
                expect(function(){
                    re.wire("aPath", {something: "something"});
                }).toThrow();
            });

            it ("will throw an error if you do not give it an object to use as a mock", function() {
                expect(function(){
                    re.wire("something", "anotherSomething");
                }).toThrow();
            });
        });

        it ("will undefine an already defined dependency", function() {
            spyOn(require, "undef");
            re.wire(blueCablePath, "otherPath", {});
            expect(require.undef).toHaveBeenCalledWith(blueCablePath);
        });

        describe ("mapping the dependency to the mock", function() {
            var uniqueId = "herpDerp";

            it ("will call to require config to alter the mapping for the dependency we are to mock", function() {
                spyOn(require, "config");
                re.wire("Apath", "anotherPath", {something: "something"});
                expect(require.config).toHaveBeenCalled();
            });

            it ("will map the dependency to mock for ALL require calls (uses '*')", function() {
                spyOn(require, "config");
                re.wire("Apath", "anotherPath", {something: "something"});
                expect(require.config.calls.count()).toBe(1);
                var callArgs = require.config.calls.argsFor(0);
                var map = callArgs[0].map;
                expect(map['*']).toBeDefined();
            });

            it ("will generate uinque id's for mocks when defining them", function() {
                spyOn(re, "genID").and.callThrough();
                re.wire(blueCablePath, redCablePath, {something: "something"});
                expect(re.genID).toHaveBeenCalled();
            });

            it ("will map the dependency being mocked to this unique id", function() {
                spyOn(re, "genID").and.callFake(function() {
                    return uniqueId;
                });

                spyOn(require, "config");

                re.wire(blueCablePath, redCablePath, {amock: "mock"});
                var callArgs = require.config.calls.argsFor(0);
                var mapping = callArgs[0].map['*'];
                expect(mapping[redCablePath]).toEqual(uniqueId);
            });

            it ("will define the mock using the unique id", function() {
                spyOn(re, "genID").and.callFake(function() {
                    return uniqueId;
                });

                spyOn(window, "define");
                var mock = { something: "something" };

                re.wire(blueCablePath, redCablePath, mock);
                expect(window.define).toHaveBeenCalledWith(uniqueId, mock);
            });
        });

        describe ("loading a module with the new mock dependency", function() {
            it ("will load the mock as a dependency on the module", function(done) {
                var mockString = "mock something!";
                var mockRedCable = {
                    doSomething: function() {
                        return mockString;
                    }
                };

                re.wire(blueCablePath, redCablePath, mockRedCable);
                require([blueCablePath], function(BlueCable) {
                    var blue = new BlueCable();
                    expect(blue.useRedToDoSomething()).toEqual(mockString);
                    done();
                });
            });

            it ("will allow us to spy on the mock too", function (){
                var mockRedCable = {
                    doSomething: function() {
                        return mockString;
                    }
                };

                re.wire(blueCablePath, redCablePath, mockRedCable);
                require([blueCablePath], function(BlueCable) {
                    spyOn(mockRedCable, "doSomething");

                    var blue = new BlueCable();
                    blue.useRedToDoSomething();
                    expect(mockRedCable.doSomething).toHaveBeenCalled();
                    done();
                });
            });
        });
    });

    describe ("restoring a dependency we have mocked", function() {

        describe ("validation", function() {
            it ("will error if you do not give a dependency path", function(){
                expect(function() {
                    re.store();
                }).toThrow();
            });

            it ("will throw an error if you do not use a string for path", function() {
                expect(function() {
                    re.store({});
                }).toThrow();
            });
        });

        it ("will undefine the dependency to force it to be reloaded", function() {
            spyOn(require, "undef");
            re.store(blueCablePath);
            expect(require.undef).toHaveBeenCalledWith(blueCablePath);
        });

        it ("will set the mapping for the mocked dependency back to normal", function() {
            re.wire(blueCablePath, redCablePath, {});

            spyOn(require, "config");
            re.store(blueCablePath);

            var callArgs = require.config.calls.argsFor(0);
            var map = callArgs[0].map;
            expect(map['*']).toBeDefined();

            var mapping = map['*'];
            expect(mapping[redCablePath]).toEqual(redCablePath);
        });

        it ("will not do anything if we have already restored a dependency", function(){
            re.wire(blueCablePath, redCablePath, {});
            re.store(blueCablePath);

            spyOn(require, "config");
            re.store(blueCablePath);

            expect(require.config).not.toHaveBeenCalled();
        });

        it ("will undefine the mock", function() {
            var uniqueId = "An ID for a mock";
            spyOn(re, "genID").and.callFake(function() {
                return uniqueId;
            });

            re.wire(blueCablePath, redCablePath, {});

            spyOn(require, "undef");
            re.store(blueCablePath);

            expect(require.undef).toHaveBeenCalledWith(blueCablePath);
            expect(require.undef).toHaveBeenCalledWith(uniqueId);
        });
    });
});







