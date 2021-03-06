module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    ngAnnotate: {
       options: {
           singlequotes: true
       },
        app: {
            files: {
              'src/ng-datepicker.ann.js': ['src/ng-datepicker.js'],
              'src/template.ann.js': ['src/template.js']
            }
        }
    },
    uglify: {
       options: {
		      sourceMap: false,
          negate_iife:false
       },
       dist: {
          files: {
             'dist/ng-datepicker.min.js': ['src/ng-datepicker.ann.js'],
             'dist/template.min.js': ['src/template.ann.js']
          }
       }
     }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-ng-annotate');

  grunt.registerTask('prep', ['ngAnnotate', 'uglify']);
};
