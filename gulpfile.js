const gulp = require("gulp");
const ghPages = require("gulp-gh-pages");
const babel = require('gulp-babel');

gulp.task("copy", () => gulp.src("src/**/*").pipe(gulp.dest("dist")));

gulp.task("compile:js", ["copy"],
        () => gulp.src('dist/main.js')
        .pipe(babel({
            presets: ["es2015"],
        }))
        .pipe(gulp.dest("dist"))
);

gulp.task("build", ["copy", "compile:js"]);

gulp.task("deploy", ["build"], () => {
    return gulp.src("./dist/**/*").pipe(ghPages());
});
