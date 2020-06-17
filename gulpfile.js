"use strict";

// Load plugins
const browsersync = require("browser-sync").create();
const del = require("del");
const gulp = require("gulp");
const merge = require("merge-stream");
const sass = require('gulp-sass');

const postcss = require("gulp-postcss"),
    autoprefixer = require("autoprefixer"),
    cssnano = require("cssnano"),
    sourcemaps = require("gulp-sourcemaps");



// BrowserSync
function browserSync(done) {
  browsersync.init({
    server: {
      baseDir: "./"
    },
    port: 3000
  });
  done();
}

// BrowserSync reload
function browserSyncReload(done) {
  browsersync.reload();
  done();
}

// Clean vendor
function clean() {
  return del(["./vendor/"]);
}

// Bring third party dependencies from node_modules into vendor directory
function modules() {
  // Bootstrap
  var bootstrap = gulp.src('./node_modules/bootstrap/dist/**/*')
    .pipe(gulp.dest('./vendor/bootstrap'));

  var webfonts = gulp.src('./node_modules/@fortawesome/fontawesome-free/webfonts/*')
    .pipe(gulp.dest('./webfonts'));
  // jQuery
  var jquery = gulp.src([
      './node_modules/jquery/dist/*',
      '!./node_modules/jquery/dist/core.js'
    ])
    .pipe(gulp.dest('./vendor/jquery'));
  // jQuery Easing
  var jqueryEasing = gulp.src('./node_modules/jquery.easing/*.js')
    .pipe(gulp.dest('./vendor/jquery-easing'));
  return merge(bootstrap, jquery, jqueryEasing, webfonts);
}

function compileSass(){
  return gulp.src(['./node_modules/bootstrap/scss/bootstrap.scss', './scss/*.scss'])
    .pipe(sourcemaps.init())
    .pipe(sass())
    .pipe(postcss([autoprefixer(), cssnano()]))
    .pipe(sourcemaps.write())
    .pipe(gulp.dest('./css'))
    .pipe(browsersync.stream());
};

// Watch files
function watchFiles() {
  gulp.watch("./scss/*.scss",compileSass);
  gulp.watch("./**/*.html", browserSyncReload);
}


// Define complex tasks
const vendor = gulp.series(clean, modules);
const build = gulp.series(vendor, compileSass);
const watch = gulp.series(build, gulp.parallel(watchFiles, browserSync));
// Export tasks
exports.clean = clean;
exports.vendor = vendor;
exports.compileSass = compileSass;
exports.build = build;
exports.watch = watch;
exports.default = build;
