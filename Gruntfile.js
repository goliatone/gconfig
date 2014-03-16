'use strict';
var lrSnippet = require('grunt-contrib-livereload/lib/utils').livereloadSnippet;
var mountFolder = function (connect, dir, next) {
    if(next){
        connect.static(require('path').resolve(dir));
        next();
    }

    return connect.static(require('path').resolve(dir));
};

module.exports = function (grunt) {
    // load all grunt tasks
    require('matchdep').filterDev('grunt-*').forEach(grunt.loadNpmTasks);

    // configurable paths
    var yeomanConfig = {
        name: 'gconfig',
        src: 'src',
        dist: 'dist',
        example:'examples'
    };

    try {
        yeomanConfig.src = require('./component.json').appPath || yeomanConfig.example;
    } catch (e) {}

    grunt.initConfig({
        yeoman: yeomanConfig,
        livereload:{
            port: 35723
        },
        watch: {
            livereload: {
                files: [
                    '<%= yeoman.example %>/{,*/}*.html',
                    '{.tmp,<%= yeoman.example %>}/styles/{,*/}*.css',
                    '{.tmp,<%= yeoman.example %>}/scripts/{,*/}*.js',
                    '<%= yeoman.example %>/images/{,*/}*.{png,jpg,jpeg,gif,webp,svg}'
                ],
                tasks: ['livereload']
            }
        },
        connect: {
            options: {
                port: 9030,
                // Change this to '0.0.0.0' to access the server from outside.
                hostname: 'localhost',
                base:'./example'
            },
            livereload: {
                options: {
                    middleware: function (connect) {
                        return [
                            lrSnippet,
                            // mountFolder(connect, '.tmp'),
                            mountFolder(connect, yeomanConfig.example)
                        ];
                    }
                }
            },
            test: {
                options: {
                    middleware: function (connect) {
                        return [
                            mountFolder(connect, '.tmp'),
                            mountFolder(connect, 'test'),
                        ];
                    }
                }
            },
            dev:{
                options: {
                    /*middleware: function (connect, res, next) {
                        console.log('middleware ', arguments.length);
                        return [
                            mountFolder(connect, yeomanConfig.example, next),
                            // mountFolder(connect, '.', next)
                        ];
                    },*/
                    mappings: [
                        {
                            prefix: '/preview',
                            src: 'preview/'
                        },
                        {
                            prefix: '/',
                            src: [ 'examples/' ]
                        },
                        {
                            prefix: '/readme',
                            src: function ( req ) {
                                var markdown, html, style;

                                markdown = grunt.file.read( 'README.md' );
                                console.log('We are here ', markdown);
                                html = require( 'markdown' ).markdown.toHTML( markdown );

                                style = '<style>body {font-family: "Helvetica Neue", "Arial"; font-size: 16px; color: #333; } pre { background-color: #eee; padding: 0.5em; } hr { margin: 2em 0 }</style>';

                                return style + html;
                            }
                        }
                    ]
                }
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
                        '<%= yeoman.dist %>/*',
                        '!<%= yeoman.dist %>/.git*'
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
                '<%= yeoman.src %>/{,*/}*.js'
            ]
        },
        karma: {
            options: {
                configFile: 'karma.conf.js',
                runnerPort: 9999,
                browsers: ['Chrome']
            },
            unit: {
                reporters: 'dots'
            },
            browser:{
                singleRun:false,
                browsers:['Chrome']
            },
            ci: {
                singleRun: true,
                browsers: ['PhantomJS']
            }
        },
        concat: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/<%= yeoman.name %>.js': [
                        '.tmp/{,*/}*.js',
                        '<%= yeoman.src %>/{,*/}*.js'
                    ]
                }
            }
        },
        uglify: {
            dist: {
                files: {
                    '<%= yeoman.dist %>/<%= yeoman.name %>.min.js': [
                        '<%= yeoman.dist %>/<%= yeoman.name %>.js'
                    ]
                }
            }
        },
        copy: {
            dist: {
                files: [{
                    expand: true,
                    dot: true,
                    cwd: '<%= yeoman.src %>',
                    dest: '<%= yeoman.dist %>',
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
