define(['rewire',
        'tests/mocks/RedCable',
        'tests/mocks/BlueCable'
    ],
function(re, RedCable, BlueCable) {

    var redCablePath = "tests/mocks/RedCable";
    var blueCablePath = "tests/mocks/BlueCable";

    describe("Restoring Spec", function() {
        beforeEach(function() {
            re.moveAllMocks();
        });

        describe("resetting state", function() {
            it("will re.move all mocks", function() {
                re.wire("oneModule", "aDep", {});
                re.wire("twoModule", "anotherDep", {});
                re.wire("threeModule", "reallyLoveDeps", {});

                spyOn(require, "config");

                re.moveAllMocks();

                expect(require.config.calls.count()).toBe(3);
            });
        });

        describe("restoring a dependency we have mocked", function() {
            it("will undefine the dependency to force it to be reloaded", function() {
                spyOn(require, "undef");
                re.store(blueCablePath);
                expect(require.undef).toHaveBeenCalledWith(blueCablePath);
            });

            it("will set the mapping for the mocked dependency back to normal", function() {
                re.wire(blueCablePath, redCablePath, {});

                spyOn(require, "config");
                re.store(blueCablePath);

                var callArgs = require.config.calls.argsFor(0);
                var map = callArgs[0].map;
                expect(map['*']).toBeDefined();

                var mapping = map['*'];
                expect(mapping[redCablePath]).toEqual(redCablePath);
            });

            it("will not do anything if we have already restored a dependency", function() {
                re.wire(blueCablePath, redCablePath, {});
                re.store(blueCablePath);

                spyOn(require, "config");
                re.store(blueCablePath);

                expect(require.config).not.toHaveBeenCalled();
            });

            it("will undefine the mock", function() {
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
});