var gulp = require('gulp');
var uglify = require("gulp-uglify");
var scss = require("gulp-sass");
var minify = require("gulp-minify-css");
var rename = require("gulp-rename");
var rev = require("gulp-rev");
var revCollector = require('gulp-rev-collector');
var path = require('path');

gulp.task('deals',["newVerson"], function() {
 	console.info("deals build success");
})
gulp.task("publicjs",function(){
  return gulp.src('./deals/public/javascript/*.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/deals/public/javascript'));
})
gulp.task("publiccss",function(){

  gulp.src('./deals/public/css/iconfont/**/')
  .pipe(gulp.dest('build/deals/public/css/iconfont/'));
 return gulp.src('./deals/public/css/*.scss')
    .pipe(scss())
    .pipe(minify())
    .pipe(gulp.dest('build/deals/public/css'));
})
gulp.task("publicimage",function(){
  return gulp.src('./deals/public/images/**/')
    .pipe(gulp.dest('build/deals/public/images/'));
})
gulp.task("publicRev",["publicjs","publiccss","publicimage"],function(){
  return gulp.src(['build/deals/public/**/*.css', 'build/deals/public/**/*.js'])
    .pipe(rev())
    .pipe(gulp.dest('build/deals/public'))  // write rev'd assets to build dir 
    .pipe(rev.manifest())
    .pipe(gulp.dest('build/deals/public'))
})
gulp.task("publicVerson",["publicRev"],function(){

  return gulp.src(["build/deals/public/rev-manifest.json","./deals/**/*.jade"])
  .pipe(revCollector({replaceReved:true}))
  .pipe(gulp.dest('build/deals/'))

})
gulp.task("newjs",function(){
  return gulp.src('./deals/content/**/default.js')
    .pipe(uglify())
    .pipe(gulp.dest('build/deals/content/'));
})
gulp.task("newCss",function(){
  return gulp.src('./deals/content/**/*.scss')
    .pipe(scss())
    .pipe(minify())
    .pipe(gulp.dest('build/deals/content/'));
})
gulp.task("newImage",function(){
  return gulp.src('./deals/content/**/images/**')
    .pipe(gulp.dest('build/deals/content/'));
})
gulp.task("newRev",["publicVerson","newjs","newCss","newImage"],function(){
  return gulp.src(['build/deals/content/**/*.css', 'build/deals/content/**/*.js'])
    .pipe(rev())
    .pipe(gulp.dest('build/deals/content'))  // write rev'd assets to build dir 
    .pipe(rev.manifest())
    .pipe(gulp.dest('build/deals/content'))
})
gulp.task("newVerson",["newRev"],function(){
  gulp.src(["build/deals/content/rev-manifest.json","build/deals/content/**/*.jade"])
    .pipe(revCollector({replaceReved:true}))
    .pipe(gulp.dest('build/deals/content/'))
})
