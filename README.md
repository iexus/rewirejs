# rewirejs - re.wire and re.store to inject your mock dependencies into a module using requirejs!

Mocking dependencies is useful. So is injecting them into a module or class you would like to test.
Requirejs is also useful however when I want to mock a dependency in my tests requirejs has already loaded the real one! At the moment I am using Karma with the requirejs plugin + Jasmine for tests. I have tried using tools like Squirejs or Testr but I wasn't happy with either. 

This is a small file to include in your project that allows you to simply add and remove a mock dependency. 

## Usage

Just import rewire as a dependency in your module for testing:

```javascript
define([rewire],
function(re) {
```

*I like the define it with the name 're' as this makes sense with the method names :D*

In your test you can mock a dependency on another module and hand through a mock object that you can spyOn using Jasmine: 

```javascript
var mockDependency = {
    aMethodOnDependency: function(){}
};

spyOn(mockDependency, "aMethodOnDependency");
re.wire('path/to/module', 'path/to/dependency/used', mockDependency);
```

After you have replaced the dependency you have to RE-require that module in order to force it to load, this is an asynchronous call so in your jasmine test you need to use the done(); argument:

```javascript
require(['path/to/module'], function(ModuleName) {
   //test here

   //Tidy up here or outside test
   re.store('path/to/module');

   //End test asynchronously
   done();
});
```

To tidy up after yourself you can then just call the following:

```javascript
re.store('path/to/module');
```

## Bit of a more detailed example

Take a typical class called Shoes that depends on laces to ensure they don't fall off feet:

```javascript
define(['Laces'],
function(Laces){
    
    function Shoes(){
        function putOnFeet() {
            Laces.tie();
        }

        return {
            putOnFeet: putOnFeet
        };
    }

    return Shoes();
});

```

If we wanted to test the behaviour of shoes, how do we test that it is calling Laces? Well we can do it by mocking the Laces themselves and spying on them!

```javascript
//Typical Jasmine test
describe ('mocking laces', function() {
   
    //Note done is handed through to function for asynch test
    it ('will let us call the mock method and see that in a spy', function(done) {

        var mockLaces = {
            tie: function() {}
        };

        re.wire('Shoes', 'Laces', mockLaces);
        spyOn(mockLaces, 'tie');

        require([Shoes], function(Shoes) {

            //Make a new instance of the module (with mock inside) and cause the behaviour to occur
            var newShoes = new Shoes();
            newShoes.putOnFeet();

            //Here we test if the shoes behaved as we expected by listening to the mock!
            expect(mockLaces.tie).toHaveBeenCalled();

            //Now we have tested the behaviour tidy up!
            re.store('Shoes');

            //End the test
            done();
        });
    });
});
```

It's pretty simple and not as complicated as other solutions but that's all I wanted :) Feel free to use it / alter / let me know if something is stupid.
