define(['tests/mocks/RedCable',
        'tests/mocks/GreenCable'],
function(RedCable, GreenCable) {
    function BlueCable() {
        function useRedCable(){
            return RedCable.doSomething();
        }

        function useGreenCable() {
            var green = new GreenCable();
            return green.calculateSomething();
        }

        return {
            useRedCable: useRedCable,
            useGreenCable: useGreenCable
        };
    }

    return BlueCable;
});