'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir) {
    return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var config = {
        name: 'gmodel',
        src: 'src',
        dist: 'dist',
        libs: 'lib',
        example:'examples'
    };

    try {
        config.src = require('./component.json').appPath || config.src;
    } catch (e) {}

    grunt.initConfig({
        config: config,
        livereload:{
            port: 35723
        },
        watch: {
            livereload: {
                files: [
                    '<%= config.example %>/*.html',
                    '<%= config.example %>/*.js',
                    '{.tmp,<%= config.src %>}/*.js'
                ],
                tasks: ['livereload']
            }
        },
        connect: {
            options: {
                port: 9100,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, config.src),
                            mountFolder(connect, config.libs),
                            mountFolder(connect, config.example)
                        ];
                    }
                }
            },
            test: {
                options: {
                    port:4545,
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test')
                        ];
                    }
                }
            },
            dev:{
                options: {}
            }
        },
        open: {
            server: {
                url: 'http://localhost:<%= connect.options.port %>'
            }
        },
        clean: {
            dist: {
                files: [{
                    dot: true,
                    src: [
                        '.tmp',
                        '<%= config.dist %>/*',
                        '!<%= config.dist %>/.git*'
                    ]
                }]
            },
            server: '.tmp'
        },
        jshint: {
            options: {
                jshintrc: '.jshintrc'
            },
            all: [
                'Gruntfile.js',
                '<%= config.src %>/{,*/}*.js'
            ]
        },
        karma: {
            options: {
                configFile: 'karma.conf.js',
                runnerPort: 9999,
                browsers: ['Chrome', 'Firefox']
            },
            unit: {
                reporters: 'dots'
            },
            continuous: {
                singleRun: true,
                browsers: ['PhantomJS']
            },
            ci: {
                singleRun: true,
                browsers: ['PhantomJS']
            }
        },
        concat: {
            dist: {
                files: {
                    '<%= config.dist %>/<%= config.name %>.js': [
                        '.tmp/{,*/}*.js',
                        '<%= config.src %>/{,*/}*.js'
                    ]
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= config.dist %>/<%= config.name %>.min.js': [
                        '<%= config.dist %>/<%= config.name %>.js'
                    ]
                }
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= config.src %>',
                    dest: '<%= config.dist %>',
                    src: []
                }]
            }
        }
    });

    grunt.renameTask('regarde', 'watch');

    grunt.registerTask('server', [
        'clean:server',
        'livereload-start',
        'connect:livereload',
        'open',
        'watch'
    ]);

    grunt.registerTask('test', [
        'clean:server',
        'connect:test',
        'karma:ci'
    ]);

    grunt.registerTask('build', [
        'clean:dist',
        'jshint',
        'test',
        'concat',
        'copy',
        'uglify',
    ]);

    grunt.registerTask('default', ['build']);
};
