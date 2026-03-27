// Mocking DOM elements for Node.js environment
class HTMLCanvasElement {
    constructor() {
        this.width = 800;
        this.height = 600;
        this.clientWidth = 800;
        this.clientHeight = 600;
        this.style = {};
    }
    getContext(type) {
        if (type === '2d') {
            return {
                fillRect: () => {},
                save: () => {},
                restore: () => {},
                translate: () => {},
                scale: () => {},
                rotate: () => {},
                beginPath: () => {},
                closePath: () => {},
                moveTo: () => {},
                lineTo: () => {},
                stroke: () => {},
                arc: () => {},
                fill: () => {},
                clearRect: () => {},
                measureText: () => ({ width: 10 }),
                fillText: () => {},
                strokeRect: () => {}
            };
        }
        return null;
    }
    addEventListener(event, callback) {}
    removeEventListener(event, callback) {}
}

global.window = {
    devicePixelRatio: 1
};
global.HTMLCanvasElement = HTMLCanvasElement;

const ccNetViz = require('./index.js');
const canvas = new HTMLCanvasElement();

console.log('Testing ccNetViz initialization...');
let graph;
try {
    graph = new ccNetViz(canvas, { styles: { background: { color: 'rgb(0,0,0)' } } });
    console.log('ccNetViz instance created successfully.');
} catch (error) {
    console.error('Failed to instantiate ccNetViz:', error);
    process.exit(1);
}

const nodes = [
    { label: "Node 1", color: "rgb(255, 0, 0)" },
    { label: "Node 2", color: "rgb(0, 255, 0)" }
];
const edges = [
    { source: nodes[0], target: nodes[1] }
];

console.log('Testing setting nodes and edges...');
graph.set(nodes, edges).then(() => {
    console.log('Graph rendering completed.');
    console.log(`Shown nodes: ${graph.cntShownNodes()}`);
    console.log(`Shown edges: ${graph.cntShownEdges()}`);

    console.log('Testing findArea method...');
    const found = graph.findArea(0, 0, 800, 600, graph.nodes, graph.edges);
    console.log(`Found nodes: ${found.nodes.length}`);
    console.log(`Found edges: ${found.edges.length}`);
    
    console.log('\nAll tests passed successfully!');
}).catch(err => {
    console.error('Test failed:', err);
});
