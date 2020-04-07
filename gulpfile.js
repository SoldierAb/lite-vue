const gulp = require("gulp");
const rollup = require("rollup");
const babel = require("rollup-plugin-babel");
const uglify = require("rollup-plugin-uglify").uglify;
const del = require('del');
const argv = require('yargs').argv;
const format = argv.format || 'umd';
const inject = require('gulp-inject');
const  bSync = require('browser-sync');
const output_path = "dist";

const injectAction = ()=>{
    const target = gulp.src("./public/index.html"),
    source = gulp.src([`./lib/vue.min.js`]);
    return target.pipe(
        inject(source,{relative: true}) 
    ).pipe(gulp.dest(output_path))
    .pipe(bSync.reload({
        stream: true
    }))
}

gulp.task("clean",function (){
    return del([output_path,`!${output_path}/index.html`], { read: false })
})

gulp.task("build", async function () {
    const bundle = await rollup.rollup({
        input: "./src/vue/index.js",
        plugins: [
            babel({
                exclude: "node_modules/**",
            }),
            uglify()
        ],
    })

    await bundle.write(
        {
            file: format==="umd"?`lib/vue.min.js`:"./lib/index.js",
            format,
            name: "Vue",
            sourcemap: true
        },
    ).then(()=>{
        injectAction();
    })
})


gulp.task('server', done => {
    bSync.init({
        server: {
            baseDir: [output_path,"./"]
        }
    })
    done()
})



gulp.task("watch",done=>{
    const watcher  = gulp.watch(["src/**/*.js","!node_modules","public/**/*"]);
    watcher.on("change", gulp.series('clean', 'build'))
    watcher.on("add", gulp.series('clean', 'build'))
    watcher.on("unlink", gulp.series('clean', 'build'))
    done();
});


gulp.task("default",gulp.series('clean', 'build','watch', 'server'))













