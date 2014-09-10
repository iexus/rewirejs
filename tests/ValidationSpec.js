define(['rewire',
        'tests/mocks/RedCable',
        'tests/mocks/BlueCable'
    ],
function(re, RedCable, BlueCable) {
    
    describe("Validating Spec", function() {

        describe("Loading rewire via requirejs", function() {
            it("will be defined", function() {
                expect(re).toBeDefined();
            });

            it("will expose a wire method", function() {
                expect(re.wire).toBeDefined();
            });

            it("will expose a store method", function() {
                expect(re.store).toBeDefined();
            });
        });

        describe("while re.wire'ing a modules dependency", function() {
            it("will throw an error if you do not specify a dependency to replace", function() {
                expect(function() {
                    re.wire();
                }).toThrow();
            });

            it("will throw an error if you do not spcify the dependencyName as a string", function() {
                expect(function() {
                    re.wire({
                        something: "something"
                    });
                }).toThrow();
            });

            it("will throw an error if you do not specify a path to the dependency to mock", function() {
                expect(function() {
                    re.wire("aPath");
                }).toThrow();
            });

            it("will throw an error if you do not specify the path to the mock dependency as a string", function() {
                expect(function() {
                    re.wire("aPath", {
                        something: "something"
                    });
                }).toThrow();
            });

            it("will throw an error if you do not give it an object to use as a mock", function() {
                expect(function() {
                    re.wire("something", "anotherSomething");
                }).toThrow();
            });
        });

        describe("while re.store'ing a module", function() {
            it("will error if you do not give a dependency path", function() {
                expect(function() {
                    re.store();
                }).toThrow();
            });

            it("will throw an error if you do not use a string for path", function() {
                expect(function() {
                    re.store({});
                }).toThrow();
            });
        });
    });
});