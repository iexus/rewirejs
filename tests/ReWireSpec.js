define(['rewire',
        'tests/mocks/RedCable',
        'tests/mocks/BlueCable'
    ],
function(re, RedCable, BlueCable) {

    var redCablePath = "tests/mocks/RedCable";
    var blueCablePath = "tests/mocks/BlueCable";
    var greenCablePath = "tests/mocks/GreenCable";

    describe("rewire spec", function() {
        beforeEach(function() {
            re.moveAllMocks();
        });

        describe("rewiring a dependency", function() {
            it("will undefine an already defined dependency", function() {
                spyOn(require, "undef");
                re.wire(blueCablePath, "otherPath", {});
                expect(require.undef).toHaveBeenCalledWith(blueCablePath);
            });

            describe("mapping the dependency to the mock", function() {
                var uniqueId = "herpDerp";

                it("will call to require config to alter the mapping for the dependency we are to mock", function() {
                    spyOn(require, "config");
                    re.wire("Apath", "anotherPath", {
                        something: "something"
                    });
                    expect(require.config).toHaveBeenCalled();
                });

                it("will map the dependency to mock for ALL require calls (uses '*')", function() {
                    spyOn(require, "config");
                    re.wire("Apath", "anotherPath", {
                        something: "something"
                    });
                    expect(require.config.calls.count()).toBe(1);
                    var callArgs = require.config.calls.argsFor(0);
                    var map = callArgs[0].map;
                    expect(map['*']).toBeDefined();
                });

                it("will generate uinque id's for mocks when defining them", function() {
                    spyOn(re, "genID").and.callThrough();
                    re.wire(blueCablePath, redCablePath, {
                        something: "something"
                    });
                    expect(re.genID).toHaveBeenCalled();
                });

                it("will map the dependency being mocked to this unique id", function() {
                    spyOn(re, "genID").and.callFake(function() {
                        return uniqueId;
                    });

                    spyOn(require, "config");

                    re.wire(blueCablePath, redCablePath, {
                        amock: "mock"
                    });
                    var callArgs = require.config.calls.argsFor(0);
                    var mapping = callArgs[0].map['*'];
                    expect(mapping[redCablePath]).toEqual(uniqueId);
                });

                it("will define the mock using the unique id", function() {
                    spyOn(re, "genID").and.callFake(function() {
                        return uniqueId;
                    });

                    spyOn(window, "define");
                    var mock = {
                        something: "something"
                    };

                    re.wire(blueCablePath, redCablePath, mock);
                    expect(window.define).toHaveBeenCalledWith(uniqueId, mock);
                });

                it("will check to see if the genID is used already", function() {
                    spyOn(re, "genID").and.callFake(function() {
                        return uniqueId
                    });

                    spyOn(require, "config");

                    re.wire(blueCablePath, redCablePath, {});
                    re.wire("aDifferentPath", "differentDependency", {});
                    re.wire("anotherPath", "somethingElse", {});

                    var secondMapping = require.config.calls.argsFor(1)[0].map['*'];
                    expect(secondMapping["differentDependency"]).toEqual(uniqueId + 1 + '');

                    var thirdMapping = require.config.calls.argsFor(2)[0].map['*'];
                    expect(thirdMapping["somethingElse"]).toEqual(uniqueId + 2 + '');
                });
            });

            describe("loading a module with the new mock dependency", function() {
                it("will load the mock as a dependency on the module", function(done) {
                    var mockString = "mock something!";
                    var mockRedCable = {
                        doSomething: function() {
                            return mockString;
                        }
                    };

                    re.wire(blueCablePath, redCablePath, mockRedCable);
                    require([blueCablePath], function(BlueCable) {
                        var blue = new BlueCable();
                        expect(blue.useRedCable()).toEqual(mockString);
                        done();
                    });
                });

                it("will allow us to spy on the mock too", function(done) {
                    var mockRedCable = {
                        doSomething: function() {
                            return mockString;
                        }
                    };

                    re.wire(blueCablePath, redCablePath, mockRedCable);
                    require([blueCablePath], function(BlueCable) {
                        spyOn(mockRedCable, "doSomething");

                        var blue = new BlueCable();
                        blue.useRedCable();
                        expect(mockRedCable.doSomething).toHaveBeenCalled();
                        done();
                    });
                });

                it("will let us mock a whole class rather than just a function", function(done) {
                    var magicNumber = 42;
                    //This is a bit odd as you have to mock the whole function rather
                    //than just a plain object, but it lets you build whatever
                    //the hell you want inside this object.
                    var mockGreenClass = function() {
                        return function() {
                            return {
                                calculateSomething: function() {
                                    return magicNumber;
                                }
                            };
                        };
                    };

                    re.wire(blueCablePath, greenCablePath, mockGreenClass);
                    require([blueCablePath], function(BluCable) {
                        var bluCable = new BluCable();
                        expect(bluCable.useGreenCable()).toBe(magicNumber);

                        re.store(blueCablePath);
                        done();
                    });
                });

                it ("will let you mock a whole class and spy on a method inside", function(done) {

                    var mockGreenInner = {
                        calculateSomething: function() {
                            return 23;
                        }
                    };

                    var mockGreenClass = function() {
                        return function() {
                            return mockGreenInner;
                        }   
                    }

                    re.wire(blueCablePath, greenCablePath, mockGreenClass);
                    require([blueCablePath], function(BluCable) {

                        spyOn(mockGreenInner, "calculateSomething");
                        var blu = new BluCable();
                        blu.useGreenCable();

                        expect(mockGreenInner.calculateSomething).toHaveBeenCalled();

                        done();
                    });
                });
            });
        });
    });
});