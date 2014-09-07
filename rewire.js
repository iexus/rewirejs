define(function() {

    var _saved = {};
    var re = function(){};

    re.prototype.wire = function(dependencyPath, dependencyToMockPath, mockObject) {
        if (typeof dependencyPath === 'undefined'
         || typeof dependencyPath !== 'string') {
            throw new Error('Path to dependency was undefined / not a string');
        }

        if (typeof dependencyToMockPath === 'undefined'
         || typeof dependencyToMockPath !== 'string') {
            throw new Error('Path to dependency to mock was undefined / not a string');
        }

        if (typeof mockObject === "undefined") {
            throw new Error('Mock object was undefined');
        }

        //Get a name for our mock
        var mockName = this.genID();

        //We need to set the path to this generated mock name
        var mockMapping = {};
        mockMapping[dependencyToMockPath] = mockName;

        //Save the dependency against mock path so we know how to clean up later
        _saved[dependencyPath] = {
            path: dependencyToMockPath,
            name: mockName
        };

        //Undefine the existing dependency (forces it to reload using mock)
        require.undef(dependencyPath);
        //Map every instance to this mock version
        require.config({
            map: {
                '*' : mockMapping
            }
        });

        //Define the actual mock object so it can be retrieved as a dependency
        define(mockName, mockObject);
    };

    re.prototype.store = function(dependencyPath) {
        if (typeof dependencyPath === 'undefined'
         || typeof dependencyPath !== 'string') {
            throw new Error("You must specify a path to a dependency");
        }

        //Undefine the module with the now mocked dependency (force a reload with real objects)
        require.undef(dependencyPath);

        //Check we actual remember this mock dependency
        var mockedDependency = _saved[dependencyPath];
        if (mockedDependency) {
            //Create a mapping back to the real objects.
            var resetMapping = {};
            resetMapping[mockedDependency.path] = mockedDependency.path;
            require.config({
                map: {
                    '*' : resetMapping
                }
            });

            //Undefine the mock object so it doesn't hang around.
            require.undef(mockedDependency.name);

            //Tidy up after ourselves.
            delete _saved[dependencyPath];
        }
    };

    re.prototype.genID = function() {
        //This is completely ripped from: http://stackoverflow.com/a/2117523
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
            var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
            return v.toString(16);
        });
    }

    return new re();
});