const gulp = require('gulp');
const scss = require('gulp-sass')(require('sass'));
const autoprefixer = require('gulp-autoprefixer');
const cssminify = require('gulp-csso');
const htmlminify = require('gulp-htmlclean');
const browserSync = require('browser-sync').create();
const clean = require('gulp-clean');
const fileSystem = require('fs');
const sourceMaps = require('gulp-sourcemaps');
const jsmin = require('gulp-uglify');
const changed = require('gulp-changed');
const rename = require('gulp-rename');


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// CLEAR DIST FOLDER
gulp.task('cleardist', function() {
   return gulp
      .src('./dist/*', { read: false, allowEmpty: true })
      .pipe(clean({ force: true }))
})

// TRANSFER FILES FROM SRC TO DIST
gulp.task('copyfiles', function() {
   return gulp
      .src(['./src/**', '!src/scss/**', '!src/fonts/**', '!src/images/**', '!src/prefabimg/**'], { buffer: false})
      .pipe(gulp.dest('./dist/'))
})

// TRANSFER FONTS AND IMAGES AND AUDIO/VIDEO FROM SRC TO DIST
gulp.task('copyfiles2', function(done) {
   fileSystem.cpSync('./src/images', './dist/images', { recursive: true });
   fileSystem.cpSync('./src/fonts', './dist/fonts', { recursive: true });
   if (fileSystem.existsSync('./src/audio')) fileSystem.cpSync('./src/audio', './dist/audio', { recursive: true });
   if (fileSystem.existsSync('./src/video')) fileSystem.cpSync('./src/video', './dist/video', { recursive: true });
   done();
});

// CREATE CSS FOLDER IN DIST
gulp.task('mkcssdir', function(done) {
   fileSystem.mkdirSync('./dist/css', { recursive: true });
   done();
})

// SCSS
gulp.task('scss', function() {
   return gulp
      .src('./src/scss/*.scss')
      .pipe(changed('./dist/css/'))
      .pipe(sourceMaps.init())
      .pipe(scss())
      .pipe(sourceMaps.write())
      .pipe(gulp.dest('./dist/css'))
      .pipe(browserSync.stream())
})

// UPDATE JS
gulp.task('updateJS', function() {
   gulp.src('./dist/js/*.js', {read: false}).pipe(clean({force: true}));
   gulp.src('./src/js/*.js', {buffer: false}).pipe(gulp.dest('./dist/js/')).pipe(browserSync.stream());
   return Promise.resolve();
})

// CLEAN IMAGES
gulp.task('cleanimages', function() {
   return gulp
      .src('./dist/images/', {read: false})
      .pipe(clean({force: true}))
})

// COPY IMAGES
gulp.task('copyimages', function(done) {
   fileSystem.cpSync('./src/images/', './dist/images/', { recursive: true });
   gulp.src('./dist/images/**').pipe(browserSync.stream());
   done();
})

// UPDATE IMAGES
gulp.task('updateIMAGES', gulp.series('cleanimages', 'copyimages'))

// UPDATE HTML
gulp.task('updateHTML', function() {
   gulp.src('./dist/*.html', {read: false}).pipe(clean({force: true}));
   gulp.src('./src/*.html', {buffer: false}).pipe(gulp.dest('./dist/')).pipe(browserSync.stream());
   return Promise.resolve();
})

// LIVE SERVER
gulp.task('server', function() {
   browserSync.init({ 
      server: { 
         baseDir: "dist/",
      }, 
      open: true,
      notify: false,
   });
   gulp.watch('./src/scss/*.scss', gulp.series('scss'));
   gulp.watch('./src/js/*.js', gulp.series('updateJS'));
   gulp.watch('./src/images/**', gulp.series('updateIMAGES'));
   gulp.watch('./src/*.html', gulp.series('updateHTML'));
})

// DEFAULT
gulp.task('default', gulp.series(
   'cleardist',
   'copyfiles',
   'copyfiles2',
   'mkcssdir',
   'scss',
   'server'
))


/////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


// AUTOPREFIX AND MINIFY AND RENAME CSS
gulp.task('cssmin', function() {
   return gulp
      .src('./dist/css/*.css')
      .pipe(clean({force: true}))
      .pipe(autoprefixer())
      .pipe(cssminify())
      .pipe(rename({ suffix: '.min' })) 
      .pipe(gulp.dest('./dist/css/'))
})

// MINIFY AND RENAME AND BABEL JS
gulp.task('jsmin', function() {
   return gulp
      .src('./dist/js/*.js')
      .pipe(clean({force: true}))
      .pipe(jsmin())
      .pipe(rename({ suffix: '.min' })) 
      .pipe(gulp.dest('./dist/js/'))
})

// MINIFY HTML
gulp.task('htmlmin', function() {
   return gulp
      .src('./dist/*.html')
      .pipe(clean({force: true}))
      .pipe(htmlminify())
      .pipe(gulp.dest('./dist/'))
})

// PRODUCTION
gulp.task('prod', gulp.series(
   gulp.parallel('cssmin', 'jsmin', 'htmlmin')
))