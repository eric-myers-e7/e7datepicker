module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    uglify: {
       options: {
          preserveComments: 'some',
          report: 'min',
		  sourceMap: true
       },
       dist: {
          files: {
             'dist/ng-datepicker.min.js': ['src/ng-datepicker.js'],
             'dist/template.min.js': ['src/template.js']
          }
       }
     }
  });

  grunt.loadNpmTasks('grunt-contrib-uglify');

  grunt.registerTask('prep', ['uglify']);
};
