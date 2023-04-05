const { src, dest, watch, parallel, series } = require('gulp');

const scss = require('gulp-sass')(require('sass'));
const concat = require('gulp-concat');
const browserSync = require('browser-sync').create();
const uglify = require('gulp-uglify-es').default;
const autoprefixer = require('gulp-autoprefixer');
const imagemin = require('gulp-imagemin');
const del = require('del');
const htmlmin = require('gulp-htmlmin');
const ttf2woff = require('gulp-ttf2woff');
const ttf2woff2 = require('gulp-ttf2woff2');
const fileInclude = require('gulp-file-include');
const zip = require('gulp-zip');
const webp = require('gulp-webp');
const svgSprite = require('gulp-svg-sprite');
const cheerio = require('gulp-cheerio');
const svgmin = require('gulp-svgmin');
const replace = require('gulp-replace');
const avif = require('gulp-avif');
const favicons = require('gulp-favicons');
const newer = require('gulp-newer');

function cleanDist() {
  return del('dist');
}

function htmlInclude() {
  return src('src/module/*.html')
    .pipe(
      fileInclude({
        prefix: '@',
        basepath: '@file',
      })
    )
    .pipe(dest('app/'));
}

function woff() {
  return src('src/fonts/**/*.ttf').pipe(ttf2woff()).pipe(dest('app/fonts/'));
}
function woff2() {
  return src('src/fonts/**/*.ttf').pipe(ttf2woff2()).pipe(dest('app/fonts/'));
}

function avifImages() {
  return src('src/images/**/*.{png,jpg,jpeg}')
    .pipe(newer('app/images/'))
    .pipe(avif())
    .pipe(dest('app/images/'))
    .pipe(browserSync.stream());
}

function webpImages() {
  return src('src/images/**/*.{png,jpg,jpeg}')
    .pipe(newer('app/images/'))
    .pipe(webp())
    .pipe(dest('app/images/'))
    .pipe(browserSync.stream());
}

function svgSprites() {
  return src('src/images/icons/*.svg')
    .pipe(
      svgmin({
        js2svg: {
          pretty: true,
        },
      })
    )
    .pipe(
      cheerio({
        run: function ($) {
          $('[fill]').removeAttr('fill');
          $('[stroke]').removeAttr('stroke');
          $('[style]').removeAttr('style');
        },
        parserOptions: {
          xmlMode: true,
        },
      })
    )
    .pipe(replace('&gt;', '>'))
    .pipe(
      svgSprite({
        mode: {
          stack: {
            sprite: '../sprite.svg',
          },
        },
      })
    )
    .pipe(dest('app/images/sprite/'))
    .pipe(browserSync.stream());
}

function favIcon() {
  return src('src/favicons/*.{png,jpg,jpeg}')
    .pipe(
      favicons({
        appName: 'My App',
        appShortName: 'App',
        appDescription: 'This is my application',
        developerName: 'Hayden Bleasel',
        developerURL: 'http://haydenbleasel.com/',
        background: '#020307',
        path: 'favicons/',
        url: 'http://haydenbleasel.com/',
        display: 'standalone',
        orientation: 'portrait',
        scope: '/',
        start_url: '/?homescreen=1',
        version: 1.0,
        logging: false,
        html: 'index.html',
        pipeHTML: true,
        replace: true,
      })
    )
    .pipe(dest('app/favicons/'));
}

function images() {
  return src('src/images/**/*{.png,jpg,jpeg,svg}')
    .pipe(newer('app/images/'))
    .pipe(
      imagemin([
        imagemin.gifsicle({ interlaced: true }),
        imagemin.mozjpeg({ quality: 90, progressive: true }),
        imagemin.optipng({ optimizationLevel: 2 }),
        imagemin.svgo({
          plugins: [{ removeViewBox: true }, { cleanupIDs: false }],
        }),
      ])
    )

    .pipe(dest('app/images/'));
}

function scripts() {
  return src(['src/js/main.js'])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js'))
    .pipe(browserSync.stream());
}

function styles() {
  return src('src/scss/main.scss')
    .pipe(scss({ outputStyle: 'compressed' }))
    .pipe(concat('main.min.css'))
    .pipe(
      autoprefixer({
        overrideBrowserlist: ['last 10 version'],
        grid: true,
      })
    )
    .pipe(dest('app/css'))
    .pipe(browserSync.stream());
}

function htmlMinify() {
  return src('app/*.html')
    .pipe(
      htmlmin({
        collapseWhitespace: true,
      })
    )
    .pipe(dest('app/'));
}

function build() {
  return src(
    [
      'app/css/main.min.css',
      'app/fonts/**/*',
      'app/js/main.min.js',
      'app/*.html',
      'app/images/**/*',
      'app/favicons/**/*',
    ],
    { base: 'app' }
  ).pipe(dest('dist'));
}

function zipFiles() {
  return src('dist/**/*').pipe(zip('dist.zip')).pipe(dest('dist-zip'));
}

function browsersync() {
  browserSync.init({
    server: {
      baseDir: 'app/',
    },
  });
}

function watching() {
  watch(['src/scss/**/*.scss'], styles);
  watch(['src/js/**.js', '!app/js/main.min.js'], scripts);
  watch(['src/**/*.html']).on('all', browserSync.reload);

  watch(['src/module/**/*.html'], htmlInclude);

  watch(['src/images/'], avifImages);
  watch(['src/images/'], webpImages);
  watch(['src/images/'], images);
  watch(['src/images/icons/*.svg'], svgSprites);
}

exports.styles = styles;
exports.watching = watching;
exports.browsersync = browsersync;
exports.scripts = scripts;
exports.images = images;
exports.cleanDist = cleanDist;
exports.htmlMinify = htmlMinify;
exports.htmlInclude = htmlInclude;
exports.webpImages = webpImages;
exports.svgSprites = svgSprites;
exports.avifImages = avifImages;
exports.woff = woff;
exports.woff2 = woff2;

exports.build = series(cleanDist, build);

exports.default = series(
  htmlInclude,
  htmlMinify,
  scripts,
  styles,
  images,
  svgSprites,
  avifImages,
  webpImages,
  favIcon,
  woff,
  woff2,
  parallel(browsersync, watching)
);

exports.zipFiles = zipFiles;
