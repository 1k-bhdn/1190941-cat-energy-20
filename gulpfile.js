const gulp = require("gulp");
const plumber = require("gulp-plumber");
const sourcemap = require("gulp-sourcemaps");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const csso = require("gulp-csso");
const rename = require("gulp-rename");
const imagemin = require("gulp-imagemin");
const webp = require("gulp-webp");
const svgstore = require("gulp-svgstore");
const del = require("del");
const sync = require("browser-sync").create();

// Refresh html

const deleteCurrentHtml = () => {
  return del("build/*.html")
}

exports.deleteCurrentHtml = deleteCurrentHtml;

const createHtml = () => {
  return gulp.src("source/*.html")
  .pipe(gulp.dest("build"));
}

exports.createHtml = createHtml;

// Styles

const optimizeStyles = () => {
  return gulp.src("source/sass/style.scss")
    .pipe(plumber())
    .pipe(sourcemap.init())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer()
    ]))
    .pipe(csso())
    .pipe(rename("styles.min.css"))
    .pipe(sourcemap.write("."))
    .pipe(gulp.dest("build/css"))
    .pipe(sync.stream());
}

exports.optimizeStyles = optimizeStyles;

// Images

const images = () => {
  return gulp.src("source/img/**/*.{jpg,png,svg}")
    .pipe(imagemin([
      imagemin.optipng({optimizationLevel: 3}),
      imagemin.mozjpeg({progressive: true}),
      imagemin.svgo()
    ]))
}

exports.images = images;

// Images__WebP

const WebP = () => {
  return gulp.src("source/img/**/*.{jpg,png}")
    .pipe(webp({quality: 90}))
    .pipe(gulp.dest("source/img"))
}

exports.WebP = WebP;

// Images__svg-store

const createSvgLibrary = () => {
  return gulp.src("source/img/**/icon-*.svg")
    .pipe(svgstore())
    .pipe(rename("library.svg"))
    .pipe(gulp.dest("build/img"))
}

exports.createSvgLibrary = createSvgLibrary;

// Create new build

const createBuild = () => {
  return gulp.src([
    "source/fonts/**/*.{woff,woff2}",
    "source/img/**",
    "source/js/**",
    "source/*.html",
    "source/*.ico"
  ], {
    base: "source"
    })
  .pipe(gulp.dest("build"));
};

exports.createBuild = createBuild;

// Delete current build

const deleteCurrentBuild = () => {
  return del("build");
};

exports.deleteCurrentBuild = deleteCurrentBuild;

// Run build

const build = gulp.series(
  deleteCurrentBuild, createBuild, optimizeStyles, createSvgLibrary
);

exports.build = build;

// Server

const server = (done) => {
  sync.init({
    server: {
      baseDir: "build"
    },
    cors: true,
    notify: false,
    ui: false,
  });
  done();
}

exports.server = server;

// Watcher

const watcher = () => {
  gulp.watch("source/sass/**/*.scss", gulp.series("optimizeStyles"));
  gulp.watch("source/*.html", gulp.series(deleteCurrentHtml, createHtml)).on("change", sync.reload);
}

const start = gulp.series(
  build, server, watcher
);

exports.start = start;
