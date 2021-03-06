import fs from 'fs';
import path from 'path';

import gulp from 'gulp';
import sass from 'gulp-sass';

// Load all gulp plugins automatically
// and attach them to the `plugins` object
import plugins from 'gulp-load-plugins';

import archiver from 'archiver';
import glob from 'glob';
import del from 'del';
import ssri from 'ssri';
import modernizr from 'modernizr';

import pkg from './package.json';
import modernizrConfig from './modernizr-config.json';

const dirs = pkg['h5bp-configs'].directories;

// ---------------------------------------------------------------------
// | Helper tasks                                                      |
// ---------------------------------------------------------------------

gulp.task('archive:create_archive_dir', (done) => {
  fs.mkdirSync(path.resolve(dirs.archive), '0755');
  done();
});

gulp.task('archive:zip', (done) => {
  const archiveName = path.resolve(dirs.archive, `${pkg.name}_v${pkg.version}.zip`);
  const zip = archiver('zip');
  const files = glob.sync('**/*.*', {
    'cwd': dirs.dist,
    'dot': true // include hidden files
  });
  const output = fs.createWriteStream(archiveName);

  zip.on('error', (error) => {
    done();
    throw error;
  });

  output.on('close', done);

  files.forEach((file) => {
    const filePath = path.resolve(dirs.dist, file);

    // `zip.bulk` does not maintain the file
    // permissions, so we need to add files individually
    zip.append(fs.createReadStream(filePath), {
      'name': file,
      'mode': fs.statSync(filePath).mode
    });
  });

  zip.pipe(output);
  zip.finalize();
  done();
});

gulp.task('clean', (done) => {
  del([
    dirs.archive,
    dirs.build
  ]).then(() => {
    done();
  });
});

gulp.task('release:to_dist', () =>
  gulp.src([
    // Copy all files
    `${dirs.build}/**/*`,
  ])
  .pipe(gulp.dest(dirs.dist))
);

gulp.task('copy:.htaccess', () =>
  gulp.src('node_modules/apache-server-configs/dist/.htaccess')
    .pipe(plugins().replace(/# ErrorDocument/g, 'ErrorDocument'))
    .pipe(gulp.dest(dirs.build))
);

gulp.task('copy:index.html', () => {
  const hash = ssri.fromData(
    fs.readFileSync('node_modules/jquery/dist/jquery.min.js'),
    { algorithms: ['sha256'] }
  );
  let version = pkg.devDependencies.jquery;
  let modernizrVersion = pkg.devDependencies.modernizr;
  let aosVersion = pkg.devDependencies.aos;

  return gulp.src(`${dirs.src}/index.html`)
    .pipe(plugins().replace(/{{JQUERY_VERSION}}/g, version))
    .pipe(plugins().replace(/{{MODERNIZR_VERSION}}/g, modernizrVersion))
    .pipe(plugins().replace(/{{JQUERY_SRI_HASH}}/g, hash.toString()))
    .pipe(gulp.dest(dirs.build));
});

gulp.task('copy:jquery', () =>
  gulp.src(['node_modules/jquery/dist/jquery.min.js'])
    .pipe(plugins().rename(`jquery-${pkg.devDependencies.jquery}.min.js`))
    .pipe(gulp.dest(`${dirs.build}/js/vendor`))
);

gulp.task('copy:license', () =>
  gulp.src('LICENSE.txt')
    .pipe(gulp.dest(dirs.build))
);

gulp.task('copy:main.css', () => {
  const banner = `/*! HTML5 Boilerplate v${pkg.version} | ${pkg.license} License | ${pkg.homepage} */\n\n`;

  return gulp.src('node_modules/main.css/dist/main.css')
    .pipe(plugins().header(banner))
    .pipe(plugins().autoprefixer({
      cascade: false
    }))
    .pipe(gulp.dest(`${dirs.build}/css`));
});

gulp.task('copy:misc', () =>
  gulp.src([
    // Copy all files
    `${dirs.src}/**/*`,

    // Exclude the following files
    // (other tasks will handle the copying of these files)
    `!${dirs.src}/scss*`,
    `!${dirs.src}/scss/*`,
    `!${dirs.src}/css/main.css`,
    `!${dirs.src}/index.html`
  ], {
    // Include hidden files by default
    dot: true
  }).pipe(gulp.dest(dirs.build))
);

gulp.task('copy:normalize', () =>
  gulp.src('node_modules/normalize.css/normalize.css')
    .pipe(gulp.dest(`${dirs.build}/css`))
);

gulp.task('modernizr', (done) => {
  modernizr.build(modernizrConfig, (code) => {
    fs.writeFile(`${dirs.build}/js/vendor/modernizr-${pkg.devDependencies.modernizr}.min.js`, code, done);
  });
});

gulp.task('copy:aos', () =>
  gulp.src('node_modules/aos/dist/aos.css')
    .pipe(gulp.dest(`${dirs.build}/css`)) 
  && gulp.src('node_modules/aos/dist/aos.js')
    .pipe(gulp.dest(`${dirs.build}/js/vendor`))
);

gulp.task('copy:bootstrap', () =>
  gulp.src('node_modules/bootstrap/dist/css/bootstrap.min.css')
    .pipe(gulp.dest(`${dirs.build}/css`)) 
  && gulp.src('node_modules/bootstrap/dist/js/bootstrap.min.js')
    .pipe(gulp.dest(`${dirs.build}/js/vendor`))
);

gulp.task('lint:js', () =>
  gulp.src([
    `${dirs.src}/js/*.js`,
    `${dirs.test}/*.js`,
    `!${dirs.src}/js/aos.js`,
  ]).pipe(plugins().jscs())
    .pipe(plugins().eslint())
    .pipe(plugins().eslint.failOnError())
);

// SASS Pre Processing
gulp.task('sass', () =>
  gulp.src(`${dirs.src}/scss/site.scss`)
    .pipe(sass()) // Using gulp-sass
    .pipe(gulp.dest(`${dirs.build}/css`))
);

// ---------------------------------------------------------------------
// | Main tasks                                                        |
// ---------------------------------------------------------------------
gulp.task(
  'copy',
  gulp.series(
    'copy:.htaccess',
    'copy:index.html',
    'copy:jquery',
    'copy:license',
    'copy:main.css',
    'copy:misc',
    'copy:normalize',
    'copy:aos',
    'copy:bootstrap'
  ) 
);

gulp.task(
  'build',
  gulp.series(
    gulp.parallel('clean', 'lint:js'),
    'sass',
    'copy',
    'modernizr',
  )
);

gulp.task(
  'release',
  gulp.series(
    'release:to_dist'
  )
);

gulp.task(
  'archive',
  gulp.series(
    'build',
    'archive:create_archive_dir',
    'archive:zip'
  )
);

gulp.task('watch', function() {
  gulp.watch('src', gulp.series(['build']));
});

gulp.task('default', gulp.series('build'));
