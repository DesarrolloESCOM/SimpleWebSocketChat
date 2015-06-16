module.exports = function (grunt) {
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    nodemon: {
      dev: {
        options: {
          file: 'bin/www',
          args: ['dev'],
          ignoredFiles: ['node_modules/**'],
          watchedExtensions: ['js'],
          delayTime: 1
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-nodemon');
  grunt.loadNpmTasks('grunt-shell');

  grunt.registerTask('init', ['nodemon']);
};
