import { Vector } from "./vector.js"
import { Box } from "./box.js"
import { Matrix } from "./matrix.js"
import { clipFilter } from "./filter.js"

/**
 *  a path consists of at least two vectors creating a line
 */
export class Path {//
    constructor(verts=[],color="#000000") {
        this.type = "path"
        this.verts = verts
        this.color= color
   


    }
    boundingBox() {
        let box = new Box(this.verts[0], this.verts[1])
        for (let vert in this.verts) {
            box = box.extend(new Box(vert, vert))
        }
    }
    transform(matrix) {
        let p = this
        let result = []
        for (let v of p.verts) {
            v = matrix.mulPosition(v)

            result.push(v)


        }
        return new Path(result,this.color)
    }
    chop(step) {
        let result = []
        let p = this.verts


        if (this.type == Paths) { this.chop() }
        for (let i = 0; i < this.verts.length - 1; i++) {

            let a = p[i]
            let b = p[i + 1]

            let v = b.sub(a)
            let l = v.length()
            if (i == 0) {
                result.push(a)
            }
            let d = step
            for (; d < l; d += step) {
                result.push(a.add(v.mulScalar(d / l)))
            }
            result.push(b)

        }
        return new Path(result,this.color)

    }
    filter(matrix, eye, step) {
        let result = []
        let path = []
        let p = this.verts
        for (let v of p) {

            let clipV = clipFilter(matrix, eye, step, v)
            let ok = clipV.hit
            // ok = true // show hidden lines

            if (ok) {
                path.push(clipV.w)
            }
            else {
                if (path.length > 1) {
                    result.push(new Path(path,this.color))
                }
                path = []
            }

        }
        if (path.length > 1) {
            result.push(new Path(path,this.color))


        }


        return new Paths(result)

        // else {return false}

    }
    simplify(threshold) {
        let p = this.verts
        if (p.length < 3) {
            return p
        }
        let a = p[0]
        let b = p[p.length - 1]
        let index = -1
        let distance = 0.0
        // console.log(a,b)

        for (let i = 1; i < p.length - 1; i++) {
        // console.log(a,b,p[i])

            let d = p[i].segmentDistance(a, b)
            if (d > distance) {
                index = i
                distance = d
            }
        }

        if (distance > threshold) {
            // console.log(a,b,p,index)

            let r1 = new Path(p.slice(0, index + 1)).simplify(threshold)
            
            let r2 = new Path(p.slice(index)).simplify(threshold)
            // have to convert back to array to use slice.
            if(r1 instanceof Path){
                r1 = r1.verts
            }
            if(r2 instanceof Path){
                r2 = r2.verts
            }
            return new Path(r1.slice(0, r1.length - 1).concat(r2),this.color)
        }
        else {
            return new Path([a, b],this.color)
        }

    }
    toSVG(color = this.color) {
        if(typeof color === "function"){
            // console.log(this)
            color = color(this)

        }
        // console.log(color)
        let coords = ''
        for (let v of this.verts) {

            coords += `${v.x},${v.y} `
        }
       
        const points = coords

        return `<polyline stroke="${color}" fill="none" points="${points}" />`;
    }
}

/**
 * Paths are a collections of multiple{@link Path} objects
 */
export class Paths {
    constructor(paths = []) {
        this.paths = paths
        this.type = "paths"

    }

    boundingBox() {
        let box = this.paths[0].boundingBox()
        for (let path of this.paths) {
            box = box.extend(path.boundingBox())
        }
        return box
    }
    transform(matrix) {
        let result = []
        for (let path of this.paths) {
           
            result.push(path.transform(matrix))
        }

        return new Paths(result)

    }
    chop(step) {
        let result = []
        for (let path of this.paths) {


            result.push(path.chop(step))
        }
        return new Paths(result)
    }
    filter(matrix, eye, step) {
        let result = []
        for (let path of this.paths) {
            path = path.filter(matrix, eye, step)
            
                result.push(...path.paths)



          
        }
      
        return new Paths(result)

    }
    simplify(threshold) {
        let result = []
        for (let path of this.paths) {
            path = path.simplify(threshold)
            if (!(path instanceof Path)){/// not really a good reason we have to do this that ive found, works sometimes without it but not others
                path = new Path(path)
            }
            result.push(path)/// might need to unpack values here? idk we'll see. <<< i did indeed need to unpack the values
        }
        return new Paths(result)
    }
    /**
     * 
     * @param {Paths} paths 
     * @param {Number} width of SVG File 
     * @param {Number} height of SVG File 
     */
    pathsToSVG(paths = this.paths, width, height) {
        const lines = [];

        // Open the SVG tag
        lines.push(`<svg width="${width}" height="${height}" version="1.1" baseProfile="full" xmlns="http://www.w3.org/2000/svg">`);

        // Add the coordinate system transformation (flips Y-axis to be bottom-up)
        lines.push(`  <g transform="translate(0,${height}) scale(1,-1)">`);
        // Iterate through each individual path
        for (const path of paths.paths) {
            // We reuse the toSVG function from the previous step
            if (!(path instanceof Path)) {
                console.log(path)

                path.pathsToSVG()
            }
            // console.log(path)
            lines.push(`${path.toSVG()}`);
        }

        // Close tags
        lines.push("</g>");
        lines.push("</svg>");

        this.saveSVGToFile(lines.join("\n"))
    }
    saveSVGToFile(svgString, fileName = "output.svg") {
        // 1. Create a Blob from the SVG string
        const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });

        // 2. Create an anchor element
        const link = document.createElement("a");

        // 3. Create a URL for the blob and set it as the download target
        link.href = URL.createObjectURL(blob);
        link.download = fileName;

        // 4. Trigger the download
        document.body.appendChild(link);
        link.click();

        // 5. Cleanup
        document.body.removeChild(link);
        URL.revokeObjectURL(link.href);
    }

}