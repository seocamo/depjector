require("babel-register");

module.exports = function(grunt){

    grunt.initConfig({
        mocha_istanbul: {
            coverage: {
                src: './test/**', // a folder works nicely
                options: {
                    //scriptPath: require.resolve('isparta/bin/isparta'),
                    //nodeExec: require.resolve('C:/Users/Shark/AppData/Roaming/npm/babel-node.cmd'), // for Windows, you MUST use .bin/babel-node.cmd instead
                    //mochaOptions: ['--compilers', 'js:babel-register'] // if you are writing your tests with ES2015+ as well
                }
            },
            coveralls: {
                src: ['./test/**'], // multiple folders also works
                options: {
                    coverage: true, // this will make the grunt.event.on('coverage') event listener to be triggered
                    check: {
                        lines: 75,
                        statements: 75
                    },
                    root: '!inc', // define where the cover task should consider the root of libraries that are covered by tests
                    reportFormats: ['html'],
                    //scriptPath: require.resolve('isparta/bin/isparta'),
                    //nodeExec: require.resolve('C:/Users/Shark/AppData/Roaming/npm/babel-node.cmd'), // for Windows, you MUST use .bin/babel-node.cmd instead
                    //mochaOptions: ['--compilers', 'js:babel-register'] // if you are writing your tests with ES2015+ as well
                }
            }
        }
    });

    grunt.event.on('coverage', function(lcovFileContents, done){
        // Check below on the section "The coverage event"
        done();
    });

    grunt.loadNpmTasks('grunt-mocha-istanbul');


    grunt.registerTask('default', ['mocha_istanbul']);
    grunt.registerTask('coveralls', ['mocha_istanbul:coveralls']);
    grunt.registerTask('coverage', ['mocha_istanbul:coverage']);
};