/*global module:false*/
module.exports = function (grunt) {

    //Load NPM tasks for dependencies
    require("matchdep").filterDev("grunt-*").forEach(grunt.loadNpmTasks);
    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        version: '<%= pkg.version %>',
        file_version: '',

        browserify: {
            options: {
                transform: ['babelify', ['uglifyify', {
                    global: true
                }]],
                plugin: [
                    ['browserify-derequire']
                ]
            },
            lib: {
                files: {
                    'dist/streamroot-wrapper.js': ['lib/streamroot-wrapper.js']
                },
                options: {
                    browserifyOptions: {
                        standalone: 'HlsjsWrapper',
                    }
                }
            },
            helper: {
                files: {
                    'dist/createWrappedHls.js': ['tools/createWrappedHls.js']
                }
            }
        },
        shell: {
            npmPublish: {
                command: 'npm publish dist/'
            }
        },
        check_changelog: {
            options: {
                version: '<%= pkg.version %>'
            }
        },
        update_release_log: {
            options: {
                version: '<%= pkg.version %>'
            }
        },
        bump: {
            options: {
                files: ['package.json', 'dist/package.json'],
                updateConfigs: ['pkg'], // Updates so that tasks running in the same process see the updated value
                commit: true,
                createTag: true,
                push: false,
                pushTo: 'upstream',
                commitFiles: [
                    'package.json', 'dist/package.json', 'releaseLog.md'
                ], // '-a' for all files
                commitMessage: 'Release <%= version %>',
                tagName: 'v<%= version %>',
                tagMessage: 'Tagging version <%= version %>',
                gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d' // options to use with '$ git describe'
            }
        }
    });

    //This task is used to make a preprod build and push it to S3, see structureProd for an explanation
    grunt.registerTask('release', [
        'pre_build',
        'check_changelog',
        'browserify:lib',
        'browserify:helper',
        'shell:npmPublish',
        'update_release_log',
        'bump',
        'post_build'
    ]);
};
