define(function() {

    var re = function(){
        this._saved;
    };

    re.prototype.wire = function(dependencyPath, dependencyToMockPath, mockObject) {

        if (typeof dependencyPath === 'undefined'
         || typeof dependencyPath !== 'string') {
            throw new Error('You must give a dependency path to rewire');
        }

        if (typeof dependencyToMockPath === 'undefined'
         || typeof dependencyToMockPath !== 'string') {
            throw new Error('You must give a path to the dependency we are mocking');
        }

        //Get a name for our mock
        var mockName = this.genID();
        var ourMap = {};

        ourMap[dependencyToMockPath] = mockName;

        require.undef(dependencyPath);
        require.config({
            map: {
                '*' : ourMap
            }
        });

        define(mockName, mockObject);
    };

    re.prototype.store = function() {

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