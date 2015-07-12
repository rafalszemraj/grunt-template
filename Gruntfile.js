module.exports = function(grunt) {


    // time stats
    require('time-grunt')(grunt);

    // Typescript
    grunt.loadNpmTasks('grunt-tsconfig');
    grunt.loadNpmTasks('ntypescript');

    // Browserify
    grunt.loadNpmTasks('grunt-browserify');

    // Cleaning
    grunt.loadNpmTasks('grunt-contrib-clean');

    // Tasks definitions
    grunt.registerTask('default', ['clean:ts']);
    grunt.registerTask('compile', ['ts:build', 'browserify:dev']);
    grunt.registerTask('compileTypescript', ['mytsconfig', 'ntypescript']);
    grunt.registerTask('makets', ['tsconfig', 'ntypescript']);
    grunt.loadTasks('tasks');

    grunt.initConfig( {

        pkg: grunt.file.readJSON('package.json'),
        clean: {

            dist: ["<%= pkg.oputput %>"],
            build: [
                '<%= pkg.sources.typescript %>/**/*.js?(x)?(.map)',
                '<%= pkg.sources.typescript %>/**/.baseDir.**'
            ]
        },

        tsconfig: {

            make: {

                options: {

                    filesGlob: [
                        '<%= pkg.sources.typescript %>/**/*.ts?(x)',
                        'typings/**/*.d.ts',
                        '!node_modules/**/*.*'
                    ],
                    additionalOptions: {

                        compilerOptions: {
                            target: 'ES6',
                            sourceMap: '<%= browserify.options.browserifyOptions.debug %>',
                            jsx: 'react',
                            outDir: '<%= pkg..sources.typescript %>'
                        }
                    }
                }
            }
        },

        ntypescript: {dev: {}},

        browserify: {

            options: {

                browserifyOptions: {

                    debug: true,
                    sourceMap: '<%= browserify.options.browserifyOptions.debug %>',
                    entry: 'src/app.js'

                },

                transform: [
                    'babelify'
                ]

            },

            dev: {

                files: {

                    'dist/app.js': [
                        '<%= pkg.sources.javascript %>/**/*.js?(x)',
                        '<%= pkg.sources.typescript %>/**/*.js?(x)'
                    ]
                }

            }
        },


    });



};