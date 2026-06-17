
import { Worley, Perlin, Fractal } from "./assets/noise.js";
import { Rotate } from "../src/matrix.js";
import { Scene, Cube, Vector, Paths, constrain, Path, TerrainPlane, StripedCube, TransformedShape, Translate, radians, remap, Shard, OutlineSphere, Sphere, HSphere, Triangle, Mesh } from "../src/viewport.js";
import * as ease from './assets/easing.js'

let colors2 = ["#00d9ff","#ff8800","#a50000"]
let colors =  ["#00d9ff","#ff8800","#ff1e00"]

let noise =new Perlin(1777680000)
let center = new Vector(0, 0, 0)
let up = new Vector(0, 0, 1)
let eye = new Vector(120,0, 70)
let noise2 = new Worley(17776804460)

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
let sun2 = new Sphere(new Vector(0,0,-60),30)
sun2.color= ()=>{return colors[ Math.ceil(Math.random()*colors.length-1)]}

let sun = new HSphere(new Vector(-380,50,50),45,70)
// sun.paths= sun.paths1
sun.color= ()=>{return colors[ Math.ceil(Math.random()*colors.length-1)]}
scene.add(sun)
// scene.add(sun2)
const fractalCallback = (x, y, z) => {
    // return noise2.Euclidean(x, y, z, 150)[1];
    return noise2.Euclidean(x, y, z).reduce((a,b)=>{return a+b})/3
}
const sketch = (sketch) => {


    let s = sketch
    sketch.setup = () => {
        sketch.createCanvas(w, h);
        let save = function () { paths.pathsToSVG(paths, w, h) }

        let saveButton = s.createButton("Save")
        saveButton.position(0, h)
        saveButton.mousePressed(save)
        let divs = 160
        const terrain = new TerrainPlane(
            new Vector(-250, -250, -1), up, 600, divs, divs,

            (x, y) => {

                x = x + w/ 7
                y = y + h / 7
                let scale = .33;
                // let n1 =Fractal.noise(x/120,y/120,(y)/120,8,fractalCallback)
                let n1 =Fractal.noise(x/120,y/120,(y)/120,16,fractalCallback)
                // console.log(n1)
                // n1 = n1.reduce((a,b)=>{return a+b})/3
                let n2 = noise2.Manhattan(x/50,y/50,(y)/50)
                n2 = n2.reduce((a,b)=>{return a+b})/3
                scale = n2
                // console.log(n2)
                // n1 = (n1+n2)/2 

                // n1 = ease.easeInOutElastic(n1)
                // n2 = ease.easeInOutCubic(n2)
                n1 = remap(n1,0,1,-1,1)
                let n =n1*70//n1* 120*s.noise((x) * scale , (y) * scale)*3 ;
                n = constrain(n, -100, 60)

                return n
            });
        // terrain.setColor ( ()=>{return colors2[ Math.ceil(Math.random()*colors2.length-1)]})
        terrain.color = function(p){return  colors[constrain(Math.ceil(noise.noise(p.verts[0].x,p.verts[0].y,noise.noise(p.verts[0].y,0,0)) * colors.length),0,colors.length-1)]}
        terrain.linesPerQuad=7
        terrain.eye= eye
        // terrain.paths =()=>{return terrain.mesh.lineFill()}
        terrain.genMesh()
        terrain.paths =()=>{return new Paths(terrain.mesh.lineFill().paths.concat(terrain.horizontalLines().paths))}

        scene.add(terrain)
        
        let background = new TerrainPlane(new Vector(-20,-50,0),new Vector(0,1,0),1000,20,20,(x,y)=>{return s.noise((x) /500 , (y) /500)*10})
            background.linesPerQuad= 40
            background.eye = eye
            background= new TransformedShape(background,Rotate(new Vector(0,1,0),radians(-90)).translate(new Vector(-500,-500,220)))
            background.shape.setColor ( ()=>{return colors2[ Math.ceil(Math.random()*colors2.length-1)]})
            // console.log(background)
        scene.add(background)
        paths = scene.render(eye, center, up, w, h, fovy, 0.01, 2000, 0.1)
    };

    sketch.draw = () => {
        s.background(255);
        s.stroke(0)
        s.noFill()
        s.strokeWeight(.6)
        for (let path of paths.paths) {
            s.push()
            s.beginShape()
            s.translate(w / 2, h / 2)///im not sure why we really have to go back and forth here, but i think we do. 

            s.scale(1, -1)

            s.translate(-w / 2, -h / 2)
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

