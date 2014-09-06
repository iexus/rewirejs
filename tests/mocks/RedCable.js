define([],
function(){
    function RedCable() {
        function doSomething() {
            return "I did something";
        }

        return {
            doSomething: doSomething
        };
    };
    return RedCable;
});