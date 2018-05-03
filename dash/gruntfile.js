module.exports = function(grunt){

    grunt.initConfig({
        nggettext_extract: {
            pot: {
                files: {
                    //'po/template.pot': ['**/*.html', '**/*.ejs']
                    'po/template.pot': ['public/app/**/*.template.html', 'public/app/**/*.component.html']
                }
            }
        },
        nggettext_compile: {
            all: {
                files: {
                    //"private/angular/translations.js": ['po/*.po']
                    'public/app/config/translations.config.js': ['po/*.po']
                }
            }
        },
		jshint: {
            files: ['app/controllers/**/*.js', 'app/lib/**/*.js', 'app/models/**/*.js'],
            options: {
                jshintrc: 'jshintrc.json'
            }
        },
		less: {
			development: {
				options: {
					yuicompress: true
				},
				files: {
					"./public/css/app.css": "./less/app.less"
				}
			}
		},
		watch: {
			files: "./less/*.less",
			tasks: ["less"]
		}
    });

	grunt.loadNpmTasks('grunt-angular-gettext');
	//grunt.loadNpmTasks('grunt-contrib-less');
	//grunt.loadNpmTasks('grunt-contrib-watch');
	//grunt.loadNpmTasks('grunt-contrib-jshint');

	//grunt.registerTask('build', ['jshint', 'less']);
}
