

import { Scene, Cube, Vector, newDifference, radians,rot, newIntersection, TransformedShape, Sphere, Cylinder } from "../src/viewport.js";


let eye = new Vector(6, 6, 2)
let center = new Vector(0, 0, 0)
let up = new Vector(0, 0, 1)


let scene = new Scene()
let shape = newDifference(
    newIntersection(
        new Sphere(new Vector(), 1),
        new Cube(new Vector(-.8, -.8, -.8), new Vector(.8, .8, .8))
    ),
    new Cylinder(.4, -2, 2),
    new TransformedShape(new Cylinder(.4, -2, 2), Rotate(new Vector(1, 0, 0), radians(90))),
    new TransformedShape(new Cylinder(.4, -2, 2), Rotate(new Vector(0, 1, 0), radians(90)))


)

// shape = newDifference(new Cube(new Vector(-.8, -.8, -.8), new Vector(.8, .8, .8)),
//  new TransformedShape(new Cylinder(.2, -1, 1), Rotate(new Vector(1, 0, 0), radians(90))))
// let m = Rotate(new Vector(0, 1, 0), radians(90))
// m= m.translate(new Vector(.2,.2,.2))

// // shape = new TransformedShape(shape, m)
// let shape1 = new Cube(new Vector(-.3, -.3, -.3), new Vector(.3, .3, .3))

// // let shape2 = new TransformedShape(new Cylinder(.2, -1, 1), Rotate(new Vector(0, 1, 0), radians(90)))
// let cube1 = new Cube(new Vector(-.3,-.3,-.3),new Vector(.3,.3,.3))
// cube1 = new TransformedShape(cube1,m)
// let shape2 = new TransformedShape(new Cylinder(.2, -1, 1), Rotate(new Vector(0, 1, 0), radians(90)))

// let cone = new Cone(.3,1)
// // shape = new TransformedShape(cone, m)

// let cyl = new Cube(new Vector(-.1, -.2, -.8), new Vector(.2, .3, .3))
// shape = newDifference(shape1,cyl)

scene.add(shape)
// scene.add(shape1)


let h = 750
let w = 750
let fovy = 20
let paths = scene.render(eye, center, up, w, h, fovy, 0.1, 100, 0.01)
// paths.pathsToSVG(paths,h,w)
// paths.pathsToSVG(paths,h,w)
const sketch = (sketch) => {


    let s = sketch
    sketch.setup = () => {
        sketch.createCanvas(w, h);
        let save = function () { paths.pathsToSVG(paths, h, w) }

        let saveButton = s.createButton("Save")
        saveButton.position(0, h)
        saveButton.mousePressed(save)

    };

    sketch.draw = () => {
        s.background(255);
        s.stroke(0)
        s.noFill()
        // let paths = scene.render(eye, center, up, w, h, fovy, 0.01, 1000, 0.1)
        console.log(paths)

        for (let path of paths.paths) {
            s.push()
            s.beginShape()
            s.translate(w / 2, h / 2)
            // s.rotate(s.PI/3)
            s.scale(1, -1)

            s.translate(-w / 2, -h / 2)

            // s.scale(1,-1)
            // s.rotate()
            for (let vert of path.verts) {
                s.vertex(vert.x, vert.y)

            }
            s.endShape()
            s.pop()
        }
        s.noLoop()
    };
    sketch.keyPressed = () => {
        if (sketch.key === "s") {
            s.saveGif("mySketch", 3);
        }
        if (sketch.key === "a") {
            s.save();
        }
    }
};

let myp5 = new p5(sketch, 'p5sketch');

function NormalizeArray(values, a, b) {
    let result = Array(values.length).fill(0)
    let lo = values[0]
    let hi = values[0]
    for (let x of values) {
        lo = Math.min(lo, x)
        hi = Math.max(hi, x)
    }
    for (let i = 0; i < values.length; i++) {
        let x = values[i]
        let p = (x - lo) / (hi - lo)
        result[i] = a + p * (b - a)
    }
    return result

}
function lowPass(values, alpha) {
    let result = Array(values.length).fill(0)
    let y = 0
    for (let i = 0; i < values.length; i++) {
        let x = values[i]
        y -= alpha * (y - x)
        result[i] = y
    }
    return result


}
function lowPassNoise(n, alpha, iterations) {
    let result = Array(n).fill(0)
    for (let i = 0; i < result.length; i++) {
        result[i] = Math.random()
    }
    for (let i = 0; i < iterations; i++) {
        result = lowPass(result, alpha)

    }
    result = NormalizeArray(result, -1, 1)
    return result



}