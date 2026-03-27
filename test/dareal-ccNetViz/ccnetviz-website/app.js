document.addEventListener('DOMContentLoaded', () => {
    // Make canvas fill the screen
    const canvas = document.getElementById('network-canvas');
    const resizeCanvas = () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', () => {
        resizeCanvas();
        if (graph) graph.resize();
    });
    resizeCanvas();

    // Data Generation
    const NODE_TYPES = ['Router', 'Switch', 'Server', 'Database', 'Firewall'];
    const COLORS = {
        'Router': 'rgb(218, 54, 51)',    // Danger red
        'Switch': 'rgb(210, 153, 34)',   // Warning yellow
        'Server': 'rgb(88, 166, 255)',   // Accent blue
        'Database': 'rgb(163, 113, 247)', // Purple
        'Firewall': 'rgb(35, 134, 54)'   // Success green
    };

    const nodes = [];
    const edges = [];
    
    // Create Core Routers
    for (let i = 0; i < 3; i++) {
        nodes.push({ id: `R${i}`, label: `${i+1}`, type: 'Router', color: COLORS['Router'], fullName: `Core-Router-0${i+1}` });
    }
    
    // Connect Core Routers in a triangle
    edges.push({ source: nodes[0], target: nodes[1] });
    edges.push({ source: nodes[1], target: nodes[2] });
    edges.push({ source: nodes[2], target: nodes[0] });

    // Add distribution layers and servers
    let nodeCounter = 3;
    const TOTAL_NODES = 150;
    
    while (nodeCounter < TOTAL_NODES) {
        // Pick a random core or existing distribution node to attach to
        const parentIdx = Math.floor(Math.random() * (nodes.length > 10 ? 10 : nodes.length));
        
        // Pick a random type but weight Servers heavily
        const rand = Math.random();
        let type;
        if (rand < 0.1) type = 'Switch';
        else if (rand < 0.2) type = 'Firewall';
        else if (rand < 0.4) type = 'Database';
        else type = 'Server';
        
        const newNode = {
            id: `N${nodeCounter}`,
            label: `${nodeCounter}`,
            type: type,
            color: COLORS[type],
            fullName: `${type}-0${Math.floor(Math.random() * 1000)}`
        };
        
        nodes.push(newNode);
        edges.push({ source: nodes[parentIdx], target: newNode });
        
        // Add random cross-connections to make it look like a web
        if (Math.random() > 0.8 && nodeCounter > 5) {
            const randomTarget = Math.floor(Math.random() * nodeCounter);
            if (randomTarget !== parentIdx) {
                edges.push({ source: newNode, target: nodes[randomTarget] });
            }
        }
        
        nodeCounter++;
    }

    // Options for ccNetViz
    const options = {
        styles: {
            background: { color: 'rgb(13, 17, 23)' }, // Matches --bg-color
            node: {
                minSize: 15,
                maxSize: 45,
                label: {
                    color: 'rgb(230, 237, 243)',
                    font: { family: 'Inter, sans-serif' }
                }
            },
            edge: {
                width: 1.5,
                color: 'rgb(48, 54, 61)',
                arrow: { minSize: 4, maxSize: 8 }
            }
        },
        onLoad: () => {
            document.getElementById('node-count').textContent = graph.nodes.length;
            document.getElementById('edge-count').textContent = graph.edges.length;
        },
        onClick: (e) => {
            // Very simple hit testing on click
            const rect = canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // Search radius
            const found = graph.find(x, y, 15, graph.nodes, []);
            
            if (found && found.nodes && found.nodes.length > 0) {
                const node = found.nodes[0];
                showNodeDetails(node);
            } else {
                hideNodeDetails();
            }
        }
    };

    // Initialize Network Map
    const graph = new window.ccNetViz(canvas, options);
    
    // Set data
    graph.set(nodes, edges, 'random').then(() => {
        console.log('Graph loaded');
    });

    // Interaction UI
    const detailsBox = document.getElementById('node-details');
    const dName = document.getElementById('detail-name');
    const dType = document.getElementById('detail-type');
    const dStatus = document.getElementById('detail-status');

    function showNodeDetails(node) {
        dName.textContent = node.fullName || node.label || node.id;
        dType.textContent = node.type;
        dType.style.color = node.color;
        
        // Randomize status just for effect
        const statuses = ['Operational', 'High Load', 'Warning'];
        const statusClasses = ['status-ok', 'status-warn', 'status-err'];
        const r = Math.random();
        let idx = 0;
        if (r > 0.8) idx = 1;
        if (r > 0.95) idx = 2;
        
        dStatus.textContent = statuses[idx];
        dStatus.className = statusClasses[idx];
        
        detailsBox.classList.remove('hidden');
    }

    function hideNodeDetails() {
        detailsBox.classList.add('hidden');
    }

    // Set up button controls
    document.getElementById('btn-zoom-in').addEventListener('click', () => {
        const vp = graph._viewport;
        graph.setViewport({ x: vp.x, y: vp.y, size: Math.max(0.01, vp.size / 1.5) });
    });
    
    document.getElementById('btn-zoom-out').addEventListener('click', () => {
        const vp = graph._viewport;
        graph.setViewport({ x: vp.x, y: vp.y, size: Math.min(1.0, vp.size * 1.5) });
    });
    
    document.getElementById('btn-reset').addEventListener('click', () => {
        graph.resetView();
    });
});
