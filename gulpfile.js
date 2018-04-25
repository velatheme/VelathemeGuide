var $ = require('gulp-load-plugins')(),
  gulp = require('gulp'),
  plumber = require('gulp-plumber'),
  runSequence = require('run-sequence'),
  browserSync = require('browser-sync').create(),
  del = require('del'),
  fs = require('fs'),
  pug = require('pug'),
  sass = require('gulp-sass'),
  changed = require('gulp-changed'),
  watch = require('gulp-watch');

var app = 'app/',
  dest = 'public/';
// fonts
var fonts = {
  in: [
    app + 'fonts/*.*'
  ],
  out: dest + 'assets/fonts/'
};
// js
var js = {
  in: [
    app + 'js/*.*'
  ],
  out: dest + 'js/'
};
//scss
var scss = {
  sassOpts: {
    outputStyle: 'nested',
        precision: 8,
        errLogToConsole: true,
        includePaths: [
          './node_modules/'
        ]
  }
};
//=
//========== OPTIONS ==========//
//=
var options = {
  del: [
    'public'
  ],
  browserSync: {
    server: {
      baseDir: dest,
      index: 'index.html'
    }
  },
  htmlPrettify: {
    'indent_size': 2,
    'unformatted': ['pre', 'code'],
    'indent_with_tabs': false,
    'preserve_newlines': true,
    'brace_style': 'expand',
    'end_with_newline': true
  },
  include: {
    hardFail: true,
    includePaths: [
      __dirname + '/',
      __dirname + '/node_modules',
      __dirname + '/app/js'
    ]
  },
  pug: {
    pug: pug,
    pretty: '\t'
  }
}
//=
//========== GULP TASH ==========//
//=
gulp.task('browser-sync', function() {
  return browserSync.init(options.browserSync);
});

// Get fonts
gulp.task('fonts', function () {
  return gulp
    .src(fonts.in)
    .pipe(gulp.dest(fonts.out));
});

// Cleanup
gulp.task('cleanup', function (cb) {
  return del(options.del, cb);
});

// [Build] sass
gulp.task('sass', function (cb) {
  return gulp
    .src([
      app + 'sass/*.scss',
      app + 'sass/**/*.scss'
    ])
    .pipe(sass(scss.sassOpts))
});

// [Build] CSS
gulp.task('compile-styles',['fonts'], function (cb) {
  return gulp
    .src([
      app + 'sass/*.scss',
      '!'+ app +'sass/_*.scss'
    ])
    .pipe($.sourcemaps.init())
    .pipe(
      $.sass(scss.sassOpts)
      .on('error', sass.logError)
    )
    .pipe($.autoprefixer({
      browsers: ['last 3 versions']
    }))
    .pipe($.sourcemaps.write('./', {
      includeContent: false,
      sourceRoot: app + 'sass'
    }))
    .pipe(gulp.dest(dest + 'assets/css'))
    .pipe(browserSync.stream());
});

// [Build] JS
gulp.task('compile-js', function() {
  return gulp
    .src(['*.js', '!_*.js'], {cwd: 'app/js'})
    .pipe($.include(options.include))
    .pipe(gulp.dest(dest + 'assets/js'));
});

// [Build] Image upload
gulp.task('compile-images', function() {
  return gulp
    .src(app + 'uploads/*.*')
    .pipe(gulp.dest(dest + 'images'));
});

// [Build] Image css
gulp.task('compile-css-images', function() {
  return gulp
    .src(app + 'images/*.*')
    .pipe(gulp.dest(dest + 'assets/css/images'));
});

// [Build] HTML
gulp.task('compile-html', function (cb) {
  return gulp
    .src(['*.html', '!_*.html'], {cwd: 'app'})
    .pipe($.prettify(options.htmlPrettify))
    .pipe(gulp.dest(dest));
});

// [Build] HTML Pug
gulp.task('compile-pug', function (cb) {
  var jsonData = JSON.parse(fs.readFileSync(app + 'data/data.json'));
  options.pug.locals = jsonData;
  return gulp
    .src(['*.pug', '!_*.pug'], {cwd: 'app'})
    .pipe(plumber(function(error){
      console.log('Error with Jade/Pug! -> ', error.message);
      this.emit('end');
    }))
    .pipe(changed(dest, {extension: '.html'}))
    .pipe($.pugInheritance({
      basedir: 'app',
      skip: ['node_modules']
    }))
    .pipe($.pug(options.pug))
    .on('error', function (error) {
      console.error('Error with Jade/Pug! -> ' + error);
      this.emit('end');
    })
    .pipe($.prettify(options.htmlPrettify))
    .pipe(plumber.stop())
    .pipe(gulp.dest(dest));
});

// [Build Command] gulp default | gulp
gulp.task('default', function (cb) {
  console.log('Copyright © 2018 Velatheme. Developed by duchv');
  console.log('Command: gulp | gulp watch | gulp build | gulp start');
});

// [Build Command] gulp watch
gulp.task('watch', function (cb) {
  watch(app + 'sass/**/*.scss', function () {
    gulp.start('compile-styles');
  });
  watch(app + 'uploads/**/*', function () {
    gulp.start('compile-images');
  });
  watch(app + 'images/**/*', function () {
    gulp.start('compile-css-images');
  });
  watch(
    [
      app + '*.html',
      app + '**/*.html'
    ], function () {
      return runSequence('compile-html', browserSync.reload);
    }
  );
  watch(
    [
      app + '*.pug',
      app + '**/*.pug'
    ], function () {
      return runSequence('compile-pug', browserSync.reload);
    }
  );
  watch(app + '**/*.js', function () {
    return runSequence('compile-js', browserSync.reload);
  });
});

// [Build Command] gulp build
gulp.task('build', function (cb) {
  return runSequence(
    'cleanup',
    'compile-images',
    'compile-css-images',
    'compile-styles',
    'compile-js',
    'compile-pug',
    'compile-html',
    cb
  );
});

gulp.task('start', function (cb) {
  return runSequence(
    'build',
    [
      'browser-sync',
      'watch'
    ],
    cb
  )
});
