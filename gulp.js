var gulp = require('gulp'),
    read = require('fs').readFileSync,
  path = require('path'),
  clean = require('gulp-clean'),
  browserify = require('browserify'),
  watchify = require("watchify"),
  livereload = require('gulp-livereload'),
  source = require('vinyl-source-stream'),
  rename = require('gulp-rename'),
  less = require('gulp-less'),
  minifyCSS = require('gulp-minify-css'),
  uglify = require('gulp-uglify'),
  sequence = require('run-sequence'),
  replace = require('replacestream'),
  gutil = require('gulp-util'),
  colors = gutil.colors,
  report = require('gulp-sizereport'),
  _ = require('lodash'),
  maybe = require('maybe-js'),
  mocha = require('gulp-mocha'),

  env = process.env,
  host = 'https://' + (env.COMPUTERNAME + '.' + process.env.USERDNSDOMAIN).toLowerCase(),
  ssl = env.HOME + '/.neo/ssl/',
  pkg = require('./package.json'),
  production = env.NODE_ENV === "production",


  // Options
  bundleOpts = _.assign(watchify.args, {
    entries: pkg.entries,
    fullPaths:!production,
    debug: !production,
    extensions: '.jsx'
  }),

  livereloadOpts = {
      start: true,
      key: read(path.normalize(ssl + 'key.key')),
      cert: read(path.normalize(ssl + 'cert.pem'))
  }



  function handleError(task) {
    return function(err) {
      gutil.log(gutil.colors.red(err));
    };
  }

function identity(x) { return x}

function logElement(title, elements, chalk, chalkTitle) {

  gutil.log( maybe(chalkTitle).or(identity).value(title), '->');
  _.forEach(elements,  function(el, key) {

    if( _.isPlainObject(el)) {

      logElement( title + ":" + key, el, chalk, chalkTitle );
      return;
    }
    var result = isNaN(key) ? key+" : "+el : el;
    gutil.log( maybe(chalk).or(identity).value(result) );
  } );

}


gulp.task('clean', function() {

  return gulp.src('dist/*', { read:false })
    .pipe(clean());
});


var build = function(watch) {
  var bundler,
    rebundle;

  if(!watch) {
    gutil.log("Production build", production ? colors.green.bold("YES") : colors.red.bold("NO"))
    logElement("entries", pkg.entries, colors.green, colors.bgGreen);
    logElement("externals", pkg.external, colors.cyan, colors.bgCyan);
    logElement("neo", pkg.neo, colors.yellow, colors.bgYellow);
  }

  bundler = browserify(bundleOpts)
        .plugin(
          ['neo-browserify-exports', pkg.neo],
          ['neo-browserify-mold-sourcemap']
        )
        .external(pkg.external);

  watch && (bundler = watchify(bundler));

  rebundle = function() {
    var stream = bundler.bundle();
    stream.on('error', handleError('Browserify'));
    stream = stream
      .pipe(source(pkg.name+'.js'))
      .pipe(gulp.dest('dist'))
    watch && stream.pipe(livereload());
    return stream;
  };

  bundler.on('update', rebundle);
  bundler.on('log', gutil.log );
  return rebundle()

}


var bundleLess = function() {

  gutil.log(colors.green('less -> css'));
  return gulp.src('lib/less/**/*.less')
    .pipe(less({
      paths:[
        'node_modules/websdk-colours/dist'
      ]
    }))
    .pipe(rename(pkg.name+'.css'))
    .pipe(gulp.dest('dist'))

}

gulp.task('build', function() {
  return build();
});

gulp.task('watch', function() {
  gutil.log(colors.green("Using livereload config:"));
  gutil.log("Host:", colors.grey(host));
  gutil.log("SSL:", colors.grey(ssl));
  build(true);
  gulp.watch('lib/less/**/*.less', bundleLess );
  livereload.listen(livereloadOpts);
});

gulp.task('less', function() {

  return bundleLess();

})

gulp.task('cssmin', function() {

  return gulp.src('dist/'+pkg.name+'.css')
    .pipe(minifyCSS())
    .pipe(rename(pkg.name+'.min.css'))
    .pipe(gulp.dest('dist'))

})

gulp.task('uglify', function(){

    return gulp.src(pkg.main)
      .pipe(uglify({sourceMaps:!production}))
      .pipe(rename(pkg.name+'.min.js'))
      .pipe(gulp.dest('dist'))

});

gulp.task('test', function() {

    return gulp.src('./test/**/*.js', {read:false})
      .pipe(mocha({
        reporter: 'spec',
        compilers: {
          js: require("babelify/node_modules/babel-core/register")
        }
      }))

})

gulp.task('report', function() {

  return gulp.src("dist/*").
    pipe(report({
      gzip:true
    }))

})

gulp.task('dev', function() {

  sequence(['build','less'])
})

gulp.task('default', function() {

  sequence('clean', ['build', 'less'], ['cssmin', 'uglify'], 'report')

});

