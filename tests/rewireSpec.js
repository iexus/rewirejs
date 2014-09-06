define(['rewire'], 
function(re) {

    describe ('Loading rewire via requirejs', function() {
        it ('will be defined', function() {
            expect(re).toBeDefined();
        });

        it ('will expose a wire method', function() {
            expect(re.wire).toBeDefined();
        });

        it ('will expose a store method', function() {
            expect(re.store).toBeDefined();
        });
    });

    describe ('rewiring a dependency', function() {

        

    });



});