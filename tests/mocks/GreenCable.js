define([],
function(){
    function GreenCable() {
        function calculateSomething() {
            return 1 + 1;
        }

        return {
            calculateSomething: calculateSomething
        };
    }

    return GreenCable;
});