var fork = require('child_process').fork;
var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var ngmin = require('gulp-ngmin');
var replace = require('gulp-replace');
var less = require('gulp-less');
var rename = require('gulp-rename');
var plumber = require('gulp-plumber');
var buster = require('gulp-buster');
var exclude = require('gulp-ignore').exclude;
var CacheBuster = require('gulp-cachebust');
var cachebust = new CacheBuster();

var html = [
    'public/html/*.html',
    'public/html/**/*.html'    
]

var templates = [
    'public/handlebars/*.handlebars',
    'public/handlebars/**/*.handlebars'
]

var images = [
    'public/images/*.png',
    'public/images/**/*.png',
    'public/images/*.jpg',
    'public/images/**/*.jpg',    
]

var fonts = [
    'bower_components/font-awesome/fonts/*',
    'bower_components/footable/css/fonts/footable.*'
]

var scripts = [
    'public/js/main.js'
];

var scriptLibs = [
    'bower_components/lodash/dist/lodash.js',
    'bower_components/jquery/dist/jquery.js',
    'bower_components/footable/js/footable.js',
    'bower_components/footable/js/footable.sort.js',
    'bower_components/footable/js/footable.paginate.js',
    'bower_components/footable/js/footable.filter.js',
    'bower_components/bootstrap/dist/js/bootstrap.js'
];

var styles = [
    'public/less/*.less'
];

var styleLibs = [
    'bower_components/font-awesome/css/font-awesome.css',
    'bower_components/bootstrap/dist/css/bootstrap.css',
    'bower_components/footable/css/footable.core.css'
];

gulp.task('fonts', function() {
    return gulp.src(fonts)
        .pipe(plumber())
        .pipe(gulp.dest('public/dist/fonts'));
});

gulp.task('scripts', function() {
    return gulp.src(scripts)
        .pipe(plumber())
        .pipe(ngmin())
        .pipe(concat('repocop.js'))
        .pipe(uglify({outSourceMap: true}))  
        .pipe(cachebust.resources())        
        .pipe(gulp.dest('public/dist/js'));
});

gulp.task('scriptLibs', function() {
    return gulp.src(scriptLibs)
        .pipe(plumber())
        .pipe(ngmin())
        .pipe(concat('repocop-libs.js'))
        .pipe(uglify({outSourceMap: true}))
        .pipe(cachebust.resources())        
        .pipe(gulp.dest('public/dist/js'));
});

gulp.task('styles', function() {
    return gulp.src(styles)
        .pipe(plumber())
        .pipe(less())
        .pipe(concat('repocop.css'))
        .pipe(cachebust.resources())                
        .pipe(gulp.dest('public/dist/css'));
});

gulp.task('styleLibs', function() {
    return gulp.src(styleLibs)
        .pipe(plumber())
        .pipe(less())
        .pipe(concat('repocop-libs.css'))
        .pipe(replace(/fonts\/footable/g, '../fonts/footable'))        
        .pipe(cachebust.resources())                   
        .pipe(gulp.dest('public/dist/css'));
});

gulp.task('images', function() {
    return gulp.src(images)
        .pipe(cachebust.resources())                           
        .pipe(gulp.dest('public/dist/images'));
});

gulp.task('html', function() {
    return gulp.src(html)
        .pipe(cachebust.references())                           
        .pipe(gulp.dest('public/dist/html'));
});

gulp.task('templates', function() {
    return gulp.src(templates)
        .pipe(cachebust.references())                           
        .pipe(gulp.dest('public/dist/handlebars'));
});

gulp.task('resources', ['fonts', 'scripts', 'scriptLibs', 'styles', 'styleLibs', 'images']);

gulp.task('default', ['server'], function() {
    gulp.watch(scripts, ['scripts', 'html', 'templates']);
    gulp.watch(scriptLibs, ['scriptLibs', 'html', 'templates']);    
    gulp.watch(styles, ['styles', 'html', 'templates']);
    gulp.watch(styleLibs, ['styleLibs', 'html', 'templates']);
    gulp.watch(fonts, ['fonts']);
    gulp.watch(images, ['images', 'html', 'templates']);
    gulp.watch(html, ['html']);    
    gulp.watch(templates, ['templates']);     
});

gulp.task('server', ['build'], function(callback) {
    fork('server.js');
    callback();
});

gulp.task('build', ['resources', 'html', 'templates']);
