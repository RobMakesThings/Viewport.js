

import { Scene, Cube, Vector, Paths, constrain, Path, TerrainPlane, StripedCube, TransformedShape, Translate, radians, remap } from "../src/viewport.js";
let colors = ["#d21ed8", "#f00000", "#ff5e00"]


let center = new Vector(0, 0, 0)
let up = new Vector(0, 0, 1)
let eye = new Vector(10, 0, 100)


let scene = new Scene()


let paths
let w = 800

let h = 1100
let fovy = 80
console.log(scene)
// scene.ortho(true)
let TAU = Math.PI*2
for(let j = 0; j<3;j++){
    let radius = remap(j,0,3,40,3)
    let offset= Math.random()*3.14
for (let i = offset; i < TAU+offset; i += TAU / 6) {
    let x = radius * Math.cos(i);
    let y = radius * Math.sin(i);
    let c = remap(i, 0, TAU, .5,1.5)

     let building = new StripedCube(new Vector(-c, -c, -c), new Vector(c, c, 10), 5, 5, 0, 0, 0, 1)
    // building = new Cube(new Vector(-c,-c,-c),new Vector(c,c,c*20))
    // paths.pathsToSVG(paths,h,w)



    let matrix = Translate(new Vector(y, x), 10)
    matrix = matrix.rotate(new Vector(0, 0, 1), radians(20*i))
    building = new TransformedShape(building, matrix)
    scene.add(building)
}}




const sketch = (sketch) => {


    let s = sketch
    sketch.setup = () => {
        sketch.createCanvas(w, h);
        let save = function () { paths.pathsToSVG(paths, w, h) }

        let saveButton = s.createButton("Save")
        saveButton.position(0, h)
        saveButton.mousePressed(save)

        const terrain = new TerrainPlane(
            new Vector(-20, -40, 0), up, 150, 120, 120,

            (x, y) => {
                x = x + w * 3
                y = y + h * 3
                const scale = .1;
                let n = s.noise((x) * scale +
                    .8, (y) * scale) * 12.8;
                n = constrain(n, .2, 8.2)
                return n
            });

        scene.add(terrain)
        paths = scene.render(eye, center, up, w, h, fovy, 0.01, 1000, 0.01)
    };

    sketch.draw = () => {
        s.background(255);
        s.stroke(0)
        s.noFill()
        for (let path of paths.paths) {
            s.push()
            s.beginShape()
            s.translate(w / 2, h / 2)///im not sure why we really have to go back and forth here, but i think we do. 

            s.scale(1, -1)

            s.translate(-w / 2, -h / 2)
                ;

            for (let vert of path.verts) {

                s.vertex(vert.x, vert.y)

            }
            s.endShape()
            s.pop()
        }
        s.noLoop()
    };
};

let myp5 = new p5(sketch, 'p5sketch');


Path.prototype.toSVG = function (color, path = this) {

    let coords = ''
    for (let v of this.verts) {

        coords += `${v.x},${v.y} `
    }
    const points = coords
    // console.log(coffffflor)
    return `<polyline stroke="${color}" fill="none" points="${points}" />`;
}
Paths.prototype.pathsToSVG = function (paths = this.paths, width, height) {
    const lines = [];

    // Open the SVG tag
    lines.push(`<svg width="${width}" height="${height}" version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg">`);
    // Add the coordinate system transformation (flips Y-axis to be bottom-up)
    lines.push(`  <g transform="translate(0,${height}) scale(1,-1)">`);
    // console.log(paths.paths)
    // Iterate through each individual path

    for (const path of paths.paths) {
        // We reuse the toSVG function from the previous step
        let col = colors[Math.floor(Math.random() * colors.length)]


        // console.log(path)
        lines.push(`${path.toSVG(col)}`);
    }

    // Close tags
    lines.push("</g>");
    lines.push("</svg>");

    this.saveSVGToFile(lines.join("\n"))
}