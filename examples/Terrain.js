
import { Worley, Perlin, Fractal } from "./assets/noise.js";
import { Rotate } from "../src/matrix.js";
import { Scene, Cube, Vector, Paths, constrain, Path, TerrainPlane, StripedCube, TransformedShape, Translate, radians, remap, Shard, OutlineSphere, Sphere, HSphere } from "../src/viewport.js";
let colors2 = ["#cfb14dd0", "#ff8800"]
let colors = ["#639fb1", "#54d100","#ff0000"]

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
let sun2 = new Sphere(new Vector(0,0,-10),30)
sun2.color= ()=>{return colors[ Math.ceil(Math.random()*colors.length-1)]}

let sun = new Sphere(new Vector(-380,50,10),30)
sun.paths= sun.paths1
sun.color= ()=>{return colors[ Math.ceil(Math.random()*colors.length-1)]}
scene.add(sun)
scene.add(sun2)

const fractalCallback = (x, y, z) => {
    return noise2.Euclidean(x, y, z, 120)[0];
}
const sketch = (sketch) => {


    let s = sketch
    sketch.setup = () => {
        sketch.createCanvas(w, h);
        let save = function () { paths.pathsToSVG(paths, w, h) }

        let saveButton = s.createButton("Save")
        saveButton.position(0, h)
        saveButton.mousePressed(save)
        let divs = 100
        const terrain = new TerrainPlane(
            new Vector(-250, -220, -80), up, 800, divs, divs,

            (x, y) => {

                x = x + w/ 7
                y = y + h / 7
                let scale = .33;
                let n1 =Fractal.noise(x/60,y/60,(y)/60,3,fractalCallback)
                // console.log(n1)
                // n1 = n1.reduce((a,b)=>{return a+b})/3
                let n2 = noise2.Manhattan(x/80,y/80,(y)/80)
                n2 = n2.reduce((a,b)=>{return a+b})/3
                // console.log(n2)
                n1 = easeInOutCubic(n1)
                // n2 - easeInOutCubic(n2)
                // n1 = remap(n1,0,1,-.5,1)
                let n =n1*80//n1* 120*s.noise((x) * scale , (y) * scale)*3 ;
                n = constrain(n, -30, 60)

                return n
            });
        terrain.color = function(p){return  colors[constrain(Math.ceil(noise.noise(p.verts[0].x*2,p.verts[0].y*2,noise.noise(p.verts[0].y,0,0)) * colors.length),0,colors.length-1)]}
        terrain.linesPerQuad=15
        scene.add(terrain)
        
        let background = new TerrainPlane(new Vector(-100,-100,0),new Vector(0,1,0),1000,20,20,(x,y)=>{return 1})
            background.linesPerQuad= 60
            background= new TransformedShape(background,Rotate(new Vector(0,1,0),radians(-90)).translate(new Vector(-500,-500,100)))
            background.shape.color = ()=>{return colors2[ Math.ceil(Math.random()*colors2.length-1)]}
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

// Acceleration until halfway, then deceleration
 function easeInOutCubic( t ) {
    return t < 0.5 ? 4 * t * t * t : ( t - 1 ) * ( 2 * t - 2 ) * ( 2 * t - 2 ) + 1;
}

// Accelerating from zero velocity
 function easeInQuart( t ) {
    return t * t * t * t;
}

// Decelerating to zero velocity
 function easeOutQuart( t ) {
    const t1 = t - 1;
    return 1 - t1 * t1 * t1 * t1;
}

function easeInOutBounce( t ) {

    if( t < 0.5 ) {

        return easeInBounce( t * 2 ) * 0.5;
        
    }

    return ( easeOutBounce( ( t * 2 ) - 1 ) * 0.5 ) + 0.5;

}

// Bounce to completion
 function easeOutBounce( t ) {

    const scaledTime = t / 1;

    if( scaledTime < ( 1 / 2.75 ) ) {

        return 7.5625 * scaledTime * scaledTime;

    } else if( scaledTime < ( 2 / 2.75 ) ) {

        const scaledTime2 = scaledTime - ( 1.5 / 2.75 );
        return ( 7.5625 * scaledTime2 * scaledTime2 ) + 0.75;

    } else if( scaledTime < ( 2.5 / 2.75 ) ) {

        const scaledTime2 = scaledTime - ( 2.25 / 2.75 );
        return ( 7.5625 * scaledTime2 * scaledTime2 ) + 0.9375;

    } else {

        const scaledTime2 = scaledTime - ( 2.625 / 2.75 );
        return ( 7.5625 * scaledTime2 * scaledTime2 ) + 0.984375;

    }

}

// Bounce increasing in velocity until completion
 function easeInBounce( t ) {
    return 1 - easeOutBounce( 1 - t );
}

// Increasing velocity until stop
 function easeInCirc( t ) {

    const scaledTime = t / 1;
    return -1 * ( Math.sqrt( 1 - scaledTime * t ) - 1 );

}

// Start fast, decreasing velocity until stop
 function easeOutCirc( t ) {

    const t1 = t - 1;
    return Math.sqrt( 1 - t1 * t1 );

}

// Fast increase in velocity, fast decrease in velocity
 function easeInOutCirc( t ) {

    const scaledTime = t * 2;
    const scaledTime1 = scaledTime - 2;

    if( scaledTime < 1 ) {
        return -0.5 * ( Math.sqrt( 1 - scaledTime * scaledTime ) - 1 );
    }

    return 0.5 * ( Math.sqrt( 1 - scaledTime1 * scaledTime1 ) + 1 );

}