
import { Worley, Perlin, Fractal } from "./assets/noise.js";
import { Rotate } from "../src/matrix.js";
import { Scene, Cube, Vector, Paths, constrain, Path, TerrainPlane, StripedCube, TransformedShape, Translate, radians, remap, Shard } from "../src/viewport.js";
let colors = ["#f200fa", "#ffd900","#00c3ff"]
let colors2 = ["#faab00", "#9900ff"]

let noise =new Perlin(Date.now())
let center = new Vector(0, 0, 0)
let up = new Vector(0, 0, 1)
let eye = new Vector(120,0, 150)
let noise2 = new Worley(Date.now())

let scene = new Scene()


let paths
let w = 800

let h = 1100
let fovy = 80
console.log(scene)
// scene.ortho(true)
let TAU = Math.PI*2
for(let j = 0; j<3;j++){
    let radius = remap(j,0,3,20,3)
    let offset= Math.random()*3.14
for (let i = offset; i < TAU+offset; i += TAU / 6) {
    let x = radius * Math.cos(i);
    let y = radius * Math.sin(i);
    let c = remap(i, 0, TAU, 3,6)

     let building = new StripedCube(new Vector(-c, -c, -c), new Vector(c, c, 10), 5, 5, 0, 0, 0, 1)
    // building = new Cube(new Vector(-c,-c,-c),new Vector(c,c,c*20))
    // paths.pathsToSVG(paths,h,w)
     let shard = new Shard(c,c,c,c*(Math.random()*3))


    let matrix = Translate(new Vector(x, y+70, 10))
    matrix = matrix.rotate(new Vector(0, 0, 1), radians(20*i))
    building = new TransformedShape(building, matrix)
    // scene.add(building)
}}




const sketch = (sketch) => {


    let s = sketch
    sketch.setup = () => {
        sketch.createCanvas(w, h);
        let save = function () { paths.pathsToSVG(paths, w, h) }

        let saveButton = s.createButton("Save")
        saveButton.position(0, h)
        saveButton.mousePressed(save)
        let divs = 80
        const terrain = new TerrainPlane(
            new Vector(-250, -220, -25), up, 600, divs, divs,

            (x, y) => {

                x = x + w/ 10
                y = y + h / 10
                let scale = .033;
                let n1 =Fractal.noise(x/1000,y/1000,x,1,noise.noise)
                scale = (scale * n1)
                let n = 120*s.noise((x) * scale , (y) * scale) ;
                n = constrain(n, 3, 75)

                return n
            });
        terrain.color = function(p){return  colors[constrain(Math.ceil(noise.noise(p.verts[0].x*2,p.verts[0].y*2,noise.noise(p.verts[0].y,0,0)) * colors.length),0,colors.length-1)]}
        terrain.linesPerQuad=25
        scene.add(terrain)
        
        let background = new TerrainPlane(new Vector(-100,-100,0),new Vector(0,1,0),1000,20,20,(x,y)=>{return 1})
            background.linesPerQuad= 120
            background= new TransformedShape(background,Rotate(new Vector(0,1,0),radians(-90)).translate(new Vector(-500,-500,100)))
            background.shape.color = ()=>{return colors2[ Math.ceil(Math.random()*colors2.length-1)]}
            console.log(background)
        scene.add(background)
        paths = scene.render(eye, center, up, w, h, fovy, 0.01, 2000, 0.1)
    };

    sketch.draw = () => {
        s.background(255);
        s.stroke(0)
        s.noFill()
        s.strokeWeight(.4)
        for (let path of paths.paths) {
            s.push()
            s.beginShape()
            s.translate(w / 2, h / 2)///im not sure why we really have to go back and forth here, but i think we do. 

            s.scale(1, -1)

            s.translate(-w / 2, -h / 2)
            console.log(path) 
            let color =path.color
            if(typeof path.color === "function"){
            // console.log(this)
            color = path.color(path)

        }       
            s.stroke(color)
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


// Path.prototype.toSVG = function (color, path = this) {

//     let coords = ''
//     for (let v of this.verts) {

//         coords += `${v.x},${v.y} `
//     }
//     const points = coords

//     return `<polyline stroke="${color}" fill="none" points="${points}" />`;
// }
// Paths.prototype.pathsToSVG = function (paths = this.paths, width, height) {
//     const lines = [];

//     // Open the SVG tag
//     lines.push(`<svg width="${width}" height="${height}" version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg">`);
//     // Add the coordinate system transformation (flips Y-axis to be bottom-up)
//     lines.push(`  <g transform="translate(0,${height}) scale(1,-1)">`);
//     // console.log(paths.paths)
//     // Iterate through each individual path

//     for (const path of paths.paths) {
//         // We reuse the toSVG function from the previous step
//     let col = colors[constrain(Math.ceil(noise.noise(path.verts[0].x*2,path.verts[0].y*2,noise.noise(path.verts[0].y,0,0)) * colors.length),0,colors.length-1)]
        
//         lines.push(`${path.toSVG(col)}`);
//     }

//     // Close tags
//     lines.push("</g>");
//     lines.push("</svg>");

//     this.saveSVGToFile(lines.join("\n"))
// }