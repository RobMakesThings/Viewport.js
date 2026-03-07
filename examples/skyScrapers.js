import { Scene, Vector, TransformedShape, Translate, StripedCube, Cylinder } from "../src/viewport.js";

let eye = new Vector(100, 0, 20)
let center = new Vector(0, 0, -3)
let up = new Vector(0, 0, 1)


let scene = new Scene()
let n = 40
for (let x = -n*30; x < n*3; x += 20) {
    for (let y = -n*3; y < n; y+=3) {
        let p = Math.random() * .18 + .8+.2
        let dx = Math.random() * .2 - .25
        let dy = Math.random() * .2 - .25

        let fx = x + dx * 5
        let fy = y + dy * 6
        let fz = Math.random() * 2 * Math.abs(y)/2+3
        // let cube = new Cube(new Vector(fx - p, fy - p, 0), new Vector(fx + p, fy + p, fz))
        let cube = new StripedCube(new Vector(fx - p, fy - p, 0), new Vector(fx + p, fy + p, fz), 5, 5, 0, .2, .2, .5)

        // let cube = new Sphere(center, fz * 3)
        if((y<2&&y>-2 )||y%4==0){
            continue
        }
        if (Math.random() > .4) {
            scene.add(cube)

        }
        else {
            cube = new Cylinder(p  , 0,fz)
            cube = new TransformedShape(cube, Translate(new Vector(fx, fy, 0)))
            scene.add(cube)

        }

    }
}


// scene.add(cube2)


let h = 1200
let w = 900 
let fovy = 60
let paths = scene.render(eye, center, up, w, h, fovy, 0.01, 100, 0.05)

console.log(scene)
// let paths = scene.render(eye, center, up, w, h, fovy, 0.01, 1000,0.01)

// paths.pathsToSVG(paths,h,w)
const sketch = (sketch) => {


    let s = sketch
    sketch.setup = () => {
        sketch.createCanvas(w, h);
         let save = function (){paths.pathsToSVG(paths,w,h)}

        let saveButton = s.createButton("Save")
        saveButton.position(0,h)
        saveButton.mousePressed( save)

    };

    sketch.draw = () => {
        s.background(255);
        s.stroke(0)
        s.noFill()
        let sinMov = Math.sin(((s.frameCount % 50) / 50) * 6.28)

      
        console.log(paths)

        for (let path of paths.paths) {
            s.push()
            s.beginShape()
            s.translate(w / 2, h / 2)
            s.scale(1, -1)

            s.translate(-w / 2, -h / 2)

        
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
