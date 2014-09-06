define(['tests/mocks/RedCable'],
function(RedCable) {
    function BlueCable() {
        function useRedToDoSomething(){
            return RedCable.doSomething();
        }

        return {
            useRedToDoSomething: useRedToDoSomething
        };
    }

    return BlueCable;
});