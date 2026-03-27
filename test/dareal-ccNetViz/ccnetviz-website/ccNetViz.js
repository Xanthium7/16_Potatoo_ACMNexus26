/**
 * Utility function for deep merging objects.
 * Used for merging default styles with user-provided options.
 * @param {object} target
 * @param {object} source
 * @returns {object}
 */
function deepMerge(target, source) {
    const output = { ...target };
    if (target && typeof target === 'object' && source && typeof source === 'object') {
        Object.keys(source).forEach(key => {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                if (!(key in target))
                    Object.assign(output, { [key]: source[key] });
                else
                    output[key] = deepMerge(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
        });
    }
    return output;
}

/**
 * Utility class to represent colors.
 * Exposed as ccNetViz.color.
 */
class Color {
    /**
     * Creates a Color instance.
     * @param {number} r - Red component (0-255).
     * @param {number} g - Green component (0-255).
     * @param {number} b - Blue component (0-255).
     * @param {number} [a=255] - Alpha component (0-255).
     */
    constructor(r, g, b, a = 255) {
        this.r = Math.max(0, Math.min(255, r));
        this.g = Math.max(0, Math.min(255, g));
        this.b = Math.max(0, Math.min(255, b));
        this.a = Math.max(0, Math.min(255, a));
    }

    /**
     * Creates a Color instance from an RGB string (e.g., 'rgb(R, G, B)').
     * @param {string} rgbString
     * @returns {Color}
     */
    static fromRGBString(rgbString) {
        const match = rgbString.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)/);
        if (match) {
            return new Color(parseInt(match[1]), parseInt(match[2]), parseInt(match[3]));
        }
        console.warn('ccNetViz.color: Invalid RGB string format, defaulting to black:', rgbString);
        return new Color(0, 0, 0);
    }

    /**
     * Converts the color to an RGBA string.
     * @returns {string}
     */
    toRGBAString() {
        return `rgba(${this.r}, ${this.g}, ${this.b}, ${this.a / 255})`;
    }
}

/**
 * Default styles for ccNetViz elements.
 */
const DEFAULT_STYLES = {
    background: {
        color: 'rgb(255, 255, 255)'
    },
    node: {
        minSize: 6,
        maxSize: 16,
        color: 'rgb(255, 255, 255)',
        texture: null,
        label: {
            backgroundColor: 'rgb(255,255,0)',
            borderColor: 'rgb(0,0,0)',
            color: 'rgb(120, 120, 120)',
            font: {
                size: 12, // Assuming a default size
                family: 'sans-serif',
                weight: 'normal',
                strokeText: false,
                alignment: 'left',
                type: null, // 'sdf' or null
                texture: null,
                metrics: null,
                outlineColor: null
            },
            hideSize: 0 // Assuming labels are always shown by default if not specified
        }
    },
    edge: {
        width: 1,
        color: 'rgb(204, 204, 204)',
        arrow: {
            minSize: 6,
            maxSize: 12,
            aspect: 1,
            texture: null,
            hideSize: 2
        },
        type: 'line', // 'line', 'dashed', 'dotted', 'chain-dotted'
        animateType: 'none', // 'basic', 'gradient', 'none'
        animateSpeed: 1, // Assuming a default speed
        animateEase: 'linear',
        animateColor: null
    }
};

/**
 * A placeholder for layout algorithms.
 * In a real implementation, this would involve complex graph layout calculations.
 * For this clean room implementation, it assigns random positions if none exist, 
 * or uses existing x,y coordinates if no specific layout is requested.
 * @param {Array<object>} nodes - The array of node objects.
 * @param {string} layout - The name of the layout algorithm.
 * @param {object} layoutOptions - Options for the layout algorithm.
 * @returns {Promise<void>} A promise that resolves when layout is complete.
 */
function _applyLayout(nodes, layout, layoutOptions) {
    return new Promise(resolve => {
        console.log(`ccNetViz: Applying layout "${layout || 'predefined'}" with options:`, layoutOptions);

        if (!nodes || nodes.length === 0) {
            resolve();
            return;
        }

        // Simple placeholder layout:
        // If no layout specified, use existing x,y. If no x,y, assign random.
        // If a layout is specified, assign random for now as actual algorithms are complex.
        const useRandom = layout || nodes.some(node => node.x === undefined || node.y === undefined);

        if (useRandom) {
            const minCoord = 0;
            const maxCoord = 1000; // Arbitrary coordinate range for graph elements

            nodes.forEach(node => {
                node.x = Math.random() * (maxCoord - minCoord) + minCoord;
                node.y = Math.random() * (maxCoord - minCoord) + minCoord;
            });
            console.log(`ccNetViz: Assigned random positions for ${nodes.length} nodes.`);
        } else {
            console.log(`ccNetViz: Using predefined positions for ${nodes.length} nodes.`);
        }

        // In a real scenario, this would involve complex calculations
        // and potentially a web worker for large graphs.
        setTimeout(resolve, 50); // Simulate async layout calculation
    });
}

/**
 * The main ccNetViz class for graph visualization.
 */
class ccNetViz {
    /**
     * Constructs a new graph renderer instance.
     * @param {HTMLCanvasElement} element - The HTML canvas element.
     * @param {object} [options={}] - Configuration options.
     */
    constructor(element, options = {}) {
        if (!(element instanceof HTMLCanvasElement)) {
            console.error('ccNetViz: Provided element is not a valid HTMLCanvasElement.');
            throw new Error('Invalid canvas element provided to ccNetViz constructor.');
        }

        this._canvas = element;
        this._gl = null; // Placeholder for WebGL context. A full WebGL implementation is beyond the scope of this clean room task.
        this._ctx2d = this._canvas.getContext('2d'); // Using 2D context for basic rendering simulation.

        if (!this._ctx2d) {
            console.error('ccNetViz: Could not get 2D rendering context. WebGL might also fail.');
            throw new Error('Failed to get 2D rendering context.');
        }

        this._nodes = [];
        this._edges = [];
        this._options = options;

        // Deep merge default styles with user-provided styles
        this._styles = deepMerge(DEFAULT_STYLES, options.styles || {});

        // Store callbacks
        this._callbacks = {
            onChangeViewport: options.onChangeViewport,
            onLoad: options.onLoad,
            getNodesCount: options.getNodesCount,
            getEdgesCount: options.getEdgesCount,
            onDrag: options.onDrag,
            onZoom: options.onZoom,
            onClick: options.onClick,
            onDblClick: options.onDblClick,
        };

        this._passiveEvts = options.passiveEvts === true;
        this._bidirectional = options.bidirectional || 'curves'; // 'curves' or 'overlap'

        this._viewport = { x: 0.5, y: 0.5, size: 0.5 }; // Normalized 0-1 range, default center and zoom

        this._isDragging = false;
        this._lastMousePos = { x: 0, y: 0 };

        // Bind event handlers to the instance
        this._boundHandleMouseDown = this._handleMouseDown.bind(this);
        this._boundHandleMouseMove = this._handleMouseMove.bind(this);
        this._boundHandleMouseUp = this._handleMouseUp.bind(this);
        this._boundHandleWheel = this._handleWheel.bind(this);
        this._boundHandleClick = this._handleClick.bind(this);
        this._boundHandleDblClick = this._handleDblClick.bind(this);

        this._addEventListeners();
        this.resize(); // Initial resize to match canvas dimensions
        this.resetView(); // Set initial viewport

        console.log('ccNetViz: Initialized with options:', this._options);
        console.log('ccNetViz: Merged styles:', this._styles);
    }

    /**
     * Adds event listeners to the canvas.
     * @private
     */
    _addEventListeners() {
        const eventOptions = { passive: this._passiveEvts };
        this._canvas.addEventListener('mousedown', this._boundHandleMouseDown, eventOptions);
        this._canvas.addEventListener('mousemove', this._boundHandleMouseMove, eventOptions);
        this._canvas.addEventListener('mouseup', this._boundHandleMouseUp, eventOptions);
        this._canvas.addEventListener('wheel', this._boundHandleWheel, eventOptions);
        this._canvas.addEventListener('click', this._boundHandleClick, eventOptions);
        this._canvas.addEventListener('dblclick', this._boundHandleDblClick, eventOptions);
    }

    /**
     * Removes event listeners from the canvas.
     * @private
     */
    _removeEventListeners() {
        this._canvas.removeEventListener('mousedown', this._boundHandleMouseDown);
        this._canvas.removeEventListener('mousemove', this._boundHandleMouseMove);
        this._canvas.removeEventListener('mouseup', this._boundHandleMouseUp);
        this._canvas.removeEventListener('wheel', this._boundHandleWheel);
        this._canvas.removeEventListener('click', this._boundHandleClick);
        this._canvas.removeEventListener('dblclick', this._boundHandleDblClick);
    }

    /**
     * Handles mouse down events for dragging.
     * @param {MouseEvent} event
     * @private
     */
    _handleMouseDown(event) {
        this._isDragging = true;
        this._lastMousePos = { x: event.clientX, y: event.clientY };
        this._canvas.style.cursor = 'grabbing';
        if (!this._passiveEvts) {
            event.preventDefault();
        }
    }

    /**
     * Handles mouse move events for dragging.
     * @param {MouseEvent} event
     * @private
     */
    _handleMouseMove(event) {
        if (!this._isDragging) return;

        const dx = event.clientX - this._lastMousePos.x;
        const dy = event.clientY - this._lastMousePos.y;

        // Convert pixel delta to normalized viewport delta
        // Assuming graph coordinates are mapped to canvas dimensions based on viewport.size
        const viewportWidthInPixels = this._canvas.width / (window.devicePixelRatio || 1) * this._viewport.size;
        const viewportHeightInPixels = this._canvas.height / (window.devicePixelRatio || 1) * this._viewport.size;

        const normalizedDx = dx / viewportWidthInPixels;
        const normalizedDy = dy / viewportHeightInPixels;

        const newViewport = {
            x: this._viewport.x - normalizedDx,
            y: this._viewport.y - normalizedDy,
            size: this._viewport.size
        };

        // Call onDrag callback
        let preventDefault = false;
        if (this._callbacks.onDrag) {
            const result = this._callbacks.onDrag(newViewport);
            if (result === false) {
                preventDefault = true;
            }
        }

        if (!preventDefault) {
            this.setViewport(newViewport);
        }

        this._lastMousePos = { x: event.clientX, y: event.clientY };
        if (!this._passiveEvts) {
            event.preventDefault();
        }
    }

    /**
     * Handles mouse up events to stop dragging.
     * @private
     */
    _handleMouseUp() {
        this._isDragging = false;
        this._canvas.style.cursor = 'grab';
    }

    /**
     * Handles mouse wheel events for zooming.
     * @param {WheelEvent} event
     * @private
     */
    _handleWheel(event) {
        const scaleFactor = 1.1; // Zoom in/out factor
        const delta = event.deltaY > 0 ? 1 / scaleFactor : scaleFactor; // Zoom out vs. Zoom in

        const newSize = Math.max(0.01, Math.min(1.0, this._viewport.size * delta)); // Clamp size 0.01 to 1.0

        const newViewport = {
            x: this._viewport.x,
            y: this._viewport.y,
            size: newSize
        };

        // Call onZoom callback
        let preventDefault = false;
        if (this._callbacks.onZoom) {
            const result = this._callbacks.onZoom(newViewport);
            if (result === false) {
                preventDefault = true;
            }
        }

        if (!preventDefault) {
            this.setViewport(newViewport);
        }

        if (!this._passiveEvts) {
            event.preventDefault();
        }
    }

    /**
     * Handles click events.
     * @param {MouseEvent} event
     * @private
     */
    _handleClick(event) {
        if (this._callbacks.onClick) {
            this._callbacks.onClick(event);
        }
    }

    /**
     * Handles double-click events.
     * @param {MouseEvent} event
     * @private
     */
    _handleDblClick(event) {
        if (this._callbacks.onDblClick) {
            this._callbacks.onDblClick(event);
        }
    }

    /**
     * Applies styles to a given element (node or edge).
     * @param {object} element - The node or edge object.
     * @param {string} elementType - 'node' or 'edge'.
     * @returns {object} The merged style object for the element.
     * @private
     */
    _getAppliedStyle(element, elementType) {
        const defaultStyle = this._styles[elementType];
        let elementStyle = {};

        if (element.style && this._styles[element.style]) {
            // Custom style exists and is defined
            elementStyle = this._styles[element.style];
        }

        // Deep merge default, then custom
        let finalStyle = deepMerge(defaultStyle, elementStyle);

        // Handle specific inline overrides for nodes (as per set method spec)
        if (elementType === 'node') {
            if (element.color instanceof Color) {
                finalStyle.color = element.color.toRGBAString();
            } else if (typeof element.color === 'string') {
                // If node.color is an RGB string, parse it
                finalStyle.color = Color.fromRGBString(element.color).toRGBAString();
            }
        }
        // For edges, the spec does not mention an inline 'color' property, only via style.

        return finalStyle;
    }

    /**
     * Sets the graph data (nodes and edges) and applies a layout.
     * This operation is asynchronous.
     * @param {Array<object>} nodes - An array of node objects.
     * @param {Array<object>} edges - An array of edge objects.
     * @param {string} [layout] - The name of the layout algorithm.
     * @param {object} [layout_options] - Options for the layout algorithm.
     * @returns {Promise<void>} A Promise that resolves when data is set and layout is complete.
     */
    set(nodes, edges, layout, layout_options) {
        return new Promise(async (resolve, reject) => {
            if (!Array.isArray(nodes) || !Array.isArray(edges)) {
                console.error('ccNetViz.set: Nodes and edges must be arrays.');
                return reject(new Error('Invalid input: nodes and edges must be arrays.'));
            }

            this._nodes = nodes;
            this._edges = edges;

            // Validate edge references (basic check for existence in the nodes array)
            const nodeMap = new Map(nodes.map(node => [node, node])); // Map node objects to themselves for quick lookup
            for (const edge of edges) {
                if (!nodeMap.has(edge.source) || !nodeMap.has(edge.target)) {
                    console.warn('ccNetViz.set: Edge references a non-existent source or target node. Edge may not render correctly:', edge);
                    // In a robust implementation, invalid edges might be filtered out or marked.
                }
            }

            try {
                await _applyLayout(this._nodes, layout, layout_options);
                this.draw(); // Redraw after layout
                if (this._callbacks.onLoad) {
                    this._callbacks.onLoad();
                }
                resolve();
            } catch (error) {
                console.error('ccNetViz.set: Error during layout application:', error);
                reject(error);
            }
        });
    }

    /**
     * Identifies nodes or edges within a specified circular area.
     * @param {number} x - X-coordinate of the center of the search circle (canvas pixels).
     * @param {number} y - Y-coordinate of the center of the search circle (canvas pixels).
     * @param {number} radius - Radius of the search circle in pixels.
     * @param {Array<object>} nodesToSearch - The array of node objects to search within.
     * @param {Array<object>} edgesToSearch - The array of edge objects to search within.
     * @returns {object} An object containing arrays of found nodes and edges.
     */
    find(x, y, radius, nodesToSearch, edgesToSearch) {
        const foundNodes = [];
        const foundEdges = [];

        if (radius <= 0) {
            console.warn('ccNetViz.find: Radius must be positive. Returning empty results.');
            return { nodes: foundNodes, edges: foundEdges };
        }

        const dpr = window.devicePixelRatio || 1;
        const canvasWidth = this._canvas.width / dpr;
        const canvasHeight = this._canvas.height / dpr;

        // Node search
        for (const node of nodesToSearch) {
            const nodeStyle = this._getAppliedStyle(node, 'node');
            // Simplified: use average of min/max size as approximate hit area, adjusted for zoom.
            const nodeVisualSize = Math.max(nodeStyle.minSize, Math.min(nodeStyle.maxSize, nodeStyle.maxSize * this._viewport.size));
            const nodeRadius = nodeVisualSize / 2;

            // Map node's graph coordinates to current viewport's canvas coordinates
            // Assuming graph coordinates range from 0 to 1000 (as used in _applyLayout)
            const graphExtent = 1000;
            const visibleGraphWidth = graphExtent * this._viewport.size;
            const visibleGraphHeight = graphExtent * this._viewport.size;

            const graphViewLeft = this._viewport.x * graphExtent - visibleGraphWidth / 2;
            const graphViewTop = this._viewport.y * graphExtent - visibleGraphHeight / 2;

            const scaleX = canvasWidth / visibleGraphWidth;
            const scaleY = canvasHeight / visibleGraphHeight;

            const nodeCanvasX = (node.x - graphViewLeft) * scaleX;
            const nodeCanvasY = (node.y - graphViewTop) * scaleY;

            const dist = Math.sqrt(Math.pow(nodeCanvasX - x, 2) + Math.pow(nodeCanvasY - y, 2));
            if (dist <= radius + nodeRadius) { // Consider node's visual size
                foundNodes.push(node);
            }
        }

        // Edge search (simplified: check distance from point to line segment)
        for (const edge of edgesToSearch) {
            const sourceNode = edge.source;
            const targetNode = edge.target;

            if (!sourceNode || !targetNode || sourceNode.x === undefined || sourceNode.y === undefined || targetNode.x === undefined || targetNode.y === undefined) {
                continue; // Skip invalid edges
            }

            const edgeStyle = this._getAppliedStyle(edge, 'edge');
            const edgeWidth = edgeStyle.width;

            // Map source/target graph coordinates to canvas coordinates
            const graphExtent = 1000;
            const visibleGraphWidth = graphExtent * this._viewport.size;
            const visibleGraphHeight = graphExtent * this._viewport.size;

            const graphViewLeft = this._viewport.x * graphExtent - visibleGraphWidth / 2;
            const graphViewTop = this._viewport.y * graphExtent - visibleGraphHeight / 2;

            const scaleX = canvasWidth / visibleGraphWidth;
            const scaleY = canvasHeight / visibleGraphHeight;

            const sx = (sourceNode.x - graphViewLeft) * scaleX;
            const sy = (sourceNode.y - graphViewTop) * scaleY;
            const tx = (targetNode.x - graphViewLeft) * scaleX;
            const ty = (targetNode.y - graphViewTop) * scaleY;

            // Distance from point (x,y) to line segment (sx,sy)-(tx,ty)
            const lengthSq = Math.pow(tx - sx, 2) + Math.pow(ty - sy, 2);
            if (lengthSq === 0) { // Source and target are the same point
                const dist = Math.sqrt(Math.pow(x - sx, 2) + Math.pow(y - sy, 2));
                if (dist <= radius + edgeWidth / 2) {
                    foundEdges.push(edge);
                }
                continue;
            }

            const t = ((x - sx) * (tx - sx) + (y - sy) * (ty - sy)) / lengthSq;
            const projectionX = sx + t * (tx - sx);
            const projectionY = sy + t * (ty - sy);

            let closestX, closestY;
            if (t < 0) {
                closestX = sx;
                closestY = sy;
            } else if (t > 1) {
                closestX = tx;
                closestY = ty;
            } else {
                closestX = projectionX;
                closestY = projectionY;
            }

            const dist = Math.sqrt(Math.pow(x - closestX, 2) + Math.pow(y - closestY, 2));
            if (dist <= radius + edgeWidth / 2) { // Consider edge's visual width
                foundEdges.push(edge);
            }
        }

        return { nodes: foundNodes, edges: foundEdges };
    }

    /**
     * Identifies nodes or edges within a specified rectangular area on the canvas.
     * @param {number} x1 - X-coordinate of the top-left corner of the search rectangle (canvas pixels).
     * @param {number} y1 - Y-coordinate of the top-left corner of the search rectangle (canvas pixels).
     * @param {number} x2 - X-coordinate of the bottom-right corner of the search rectangle (canvas pixels).
     * @param {number} y2 - Y-coordinate of the bottom-right corner of the search rectangle (canvas pixels).
     * @param {Array<object>} nodesToSearch - The array of node objects to search within.
     * @param {Array<object>} edgesToSearch - The array of edge objects to search within.
     * @returns {object} An object containing arrays of found nodes and edges.
     */
    findArea(x1, y1, x2, y2, nodesToSearch, edgesToSearch) {
        const foundNodes = [];
        const foundEdges = [];

        const minX = Math.min(x1, x2);
        const maxX = Math.max(x1, x2);
        const minY = Math.min(y1, y2);
        const maxY = Math.max(y1, y2);

        const dpr = window.devicePixelRatio || 1;
        const canvasWidth = this._canvas.width / dpr;
        const canvasHeight = this._canvas.height / dpr;

        // Node search
        for (const node of nodesToSearch) {
            const nodeStyle = this._getAppliedStyle(node, 'node');
            const nodeVisualSize = Math.max(nodeStyle.minSize, Math.min(nodeStyle.maxSize, nodeStyle.maxSize * this._viewport.size));
            const nodeRadius = nodeVisualSize / 2;

            // Map node's graph coordinates to current viewport's canvas coordinates
            const graphExtent = 1000;
            const visibleGraphWidth = graphExtent * this._viewport.size;
            const visibleGraphHeight = graphExtent * this._viewport.size;

            const graphViewLeft = this._viewport.x * graphExtent - visibleGraphWidth / 2;
            const graphViewTop = this._viewport.y * graphExtent - visibleGraphHeight / 2;

            const scaleX = canvasWidth / visibleGraphWidth;
            const scaleY = canvasHeight / visibleGraphHeight;

            const nodeCanvasX = (node.x - graphViewLeft) * scaleX;
            const nodeCanvasY = (node.y - graphViewTop) * scaleY;

            // Check if node's bounding box (center +/- radius) overlaps with the rectangle
            if (nodeCanvasX + nodeRadius >= minX && nodeCanvasX - nodeRadius <= maxX &&
                nodeCanvasY + nodeRadius >= minY && nodeCanvasY - nodeRadius <= maxY) {
                foundNodes.push(node);
            }
        }

        // Edge search (simplified: check if line segment intersects rectangle)
        // This is a complex geometric problem. For a clean room, we'll use a simpler check:
        // If either endpoint is in the rectangle, or if the line segment crosses any of the 4 rectangle lines.
        for (const edge of edgesToSearch) {
            const sourceNode = edge.source;
            const targetNode = edge.target;

            if (!sourceNode || !targetNode || sourceNode.x === undefined || sourceNode.y === undefined || targetNode.x === undefined || targetNode.y === undefined) {
                continue; // Skip invalid edges
            }

            // Map source/target graph coordinates to canvas coordinates
            const graphExtent = 1000;
            const visibleGraphWidth = graphExtent * this._viewport.size;
            const visibleGraphHeight = graphExtent * this._viewport.size;

            const graphViewLeft = this._viewport.x * graphExtent - visibleGraphWidth / 2;
            const graphViewTop = this._viewport.y * graphExtent - visibleGraphHeight / 2;

            const scaleX = canvasWidth / visibleGraphWidth;
            const scaleY = canvasHeight / visibleGraphHeight;

            const sx = (sourceNode.x - graphViewLeft) * scaleX;
            const sy = (sourceNode.y - graphViewTop) * scaleY;
            const tx = (targetNode.x - graphViewLeft) * scaleX;
            const ty = (targetNode.y - graphViewTop) * scaleY;

            // Check if either endpoint is inside the rectangle
            const isSourceInside = (sx >= minX && sx <= maxX && sy >= minY && sy <= maxY);
            const isTargetInside = (tx >= minX && tx <= maxX && ty >= minY && ty <= maxY);

            if (isSourceInside || isTargetInside) {
                foundEdges.push(edge);
                continue;
            }

            // Simplified line-rectangle intersection check (not fully robust, but covers basic cases)
            // Check for intersection with each of the four rectangle sides.
            // This is a placeholder for a more robust algorithm.
            const lineIntersectsRect = (
                (lineSegmentIntersects(sx, sy, tx, ty, minX, minY, minX, maxY)) || // Left side
                (lineSegmentIntersects(sx, sy, tx, ty, maxX, minY, maxX, maxY)) || // Right side
                (lineSegmentIntersects(sx, sy, tx, ty, minX, minY, maxX, minY)) || // Top side
                (lineSegmentIntersects(sx, sy, tx, ty, minX, maxY, maxX, maxY))    // Bottom side
            );

            if (lineIntersectsRect) {
                 foundEdges.push(edge);
            }
        }

        return { nodes: foundNodes, edges: foundEdges };
    }

    /**
     * Helper function to check if two line segments intersect.
     * @private
     */
    _orientation(p, q, r) {
        const val = (q.y - p.y) * (r.x - q.x) - (q.x - p.x) * (r.y - q.y);
        if (val === 0) return 0; // Collinear
        return (val > 0) ? 1 : 2; // Clockwise or Counterclockwise
    }

    /**
     * Helper function to check if point q lies on segment pr.
     * @private
     */
    _onSegment(p, q, r) {
        return (q.x <= Math.max(p.x, r.x) && q.x >= Math.min(p.x, r.x) &&
                q.y <= Math.max(p.y, r.y) && q.y >= Math.min(p.y, r.y));
    }

    /**
     * Checks if two line segments (p1, q1) and (p2, q2) intersect.
     * @private
     */
    _lineSegmentIntersects(p1x, p1y, q1x, q1y, p2x, p2y, q2x, q2y) {
        const p1 = {x: p1x, y: p1y};
        const q1 = {x: q1x, y: q1y};
        const p2 = {x: p2x, y: p2y};
        const q2 = {x: q2x, y: q2y};

        const o1 = this._orientation(p1, q1, p2);
        const o2 = this._orientation(p1, q1, q2);
        const o3 = this._orientation(p2, q2, p1);
        const o4 = this._orientation(p2, q2, q1);

        // General case
        if (o1 !== 0 && o2 !== 0 && o3 !== 0 && o4 !== 0 && o1 !== o2 && o3 !== o4) {
            return true;
        }

        // Special Cases (collinear and overlapping)
        if (o1 === 0 && this._onSegment(p1, p2, q1)) return true;
        if (o2 === 0 && this._onSegment(p1, q2, q1)) return true;
        if (o3 === 0 && this._onSegment(p2, p1, q2)) return true;
        if (o4 === 0 && this._onSegment(p2, q1, q2)) return true;

        return false;
    }

    /**
     * Renders the current graph data onto the canvas.
     * This is a placeholder for WebGL rendering using a 2D canvas context for simulation.
     */
    draw() {
        if (!this._ctx2d) {
            console.warn('ccNetViz.draw: No 2D rendering context available.');
            return;
        }

        const dpr = window.devicePixelRatio || 1;
        const canvasWidth = this._canvas.width / dpr;
        const canvasHeight = this._canvas.height / dpr;
        const ctx = this._ctx2d;

        // Clear canvas with background color
        const backgroundColor = Color.fromRGBString(this._styles.background.color).toRGBAString();
        ctx.fillStyle = backgroundColor;
        ctx.fillRect(0, 0, canvasWidth, canvasHeight);

        // Calculate transformation based on viewport
        // The viewport (x, y, size) is normalized (0-1). x, y represent the center of the visible graph area in graph coordinates.
        // size represents the fraction of the total graph extent visible.
        // Let's assume graph coordinates range from 0 to 1000 for simplicity of mapping (as used in _applyLayout).
        const graphExtent = 1000; 

        // Visible graph width/height in graph coordinates
        const visibleGraphWidth = graphExtent * this._viewport.size;
        const visibleGraphHeight = graphExtent * this._viewport.size; // Assuming square viewport for simplicity

        // Graph coordinates of the top-left corner of the visible area
        const graphViewLeft = this._viewport.x * graphExtent - visibleGraphWidth / 2;
        const graphViewTop = this._viewport.y * graphExtent - visibleGraphHeight / 2;

        // Scale factor from graph coordinates to canvas pixels
        const scaleX = canvasWidth / visibleGraphWidth;
        const scaleY = canvasHeight / visibleGraphHeight;

        ctx.save();
        // Apply transformations: translate to bring graph origin to canvas top-left, then scale.
        ctx.translate(-graphViewLeft * scaleX, -graphViewTop * scaleY);
        ctx.scale(scaleX, scaleY);

        // --- WebGL rendering would happen here in a full implementation --- 
        // For this clean room, we simulate with 2D canvas.

        // Draw edges
        for (const edge of this._edges) {
            const sourceNode = edge.source;
            const targetNode = edge.target;

            if (!sourceNode || !targetNode || sourceNode.x === undefined || sourceNode.y === undefined || targetNode.x === undefined || targetNode.y === undefined) {
                continue; // Skip invalid edges
            }

            const edgeStyle = this._getAppliedStyle(edge, 'edge');
            ctx.beginPath();
            ctx.moveTo(sourceNode.x, sourceNode.y);
            ctx.lineTo(targetNode.x, targetNode.y);
            ctx.strokeStyle = Color.fromRGBString(edgeStyle.color).toRGBAString();
            ctx.lineWidth = edgeStyle.width / scaleX; // Adjust line width for zoom
            ctx.stroke();

            // Simulate arrow (simple triangle)
            if (edgeStyle.arrow && edgeStyle.arrow.hideSize < edgeStyle.arrow.minSize * this._viewport.size) { // Simplified visibility check
                const arrowSize = edgeStyle.arrow.minSize / scaleX; // Adjust arrow size for zoom
                const angle = Math.atan2(targetNode.y - sourceNode.y, targetNode.x - sourceNode.x);
                ctx.save();
                ctx.translate(targetNode.x, targetNode.y);
                ctx.rotate(angle);
                ctx.fillStyle = ctx.strokeStyle;
                ctx.beginPath();
                ctx.moveTo(0, 0);
                ctx.lineTo(-arrowSize, -arrowSize / 2);
                ctx.lineTo(-arrowSize, arrowSize / 2);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
            }
        }

        // Draw nodes
        for (const node of this._nodes) {
            const nodeStyle = this._getAppliedStyle(node, 'node');
            // Node size should be adjusted for zoom, but also clamped by min/maxSize
            const nodeSize = Math.max(nodeStyle.minSize, Math.min(nodeStyle.maxSize, nodeStyle.maxSize * this._viewport.size)) / scaleX; 

            ctx.beginPath();
            ctx.arc(node.x, node.y, nodeSize / 2, 0, 2 * Math.PI);
            ctx.fillStyle = Color.fromRGBString(nodeStyle.color).toRGBAString();
            ctx.fill();
            ctx.strokeStyle = 'black'; // Default border for nodes
            ctx.lineWidth = 1 / scaleX; // Adjust border width for zoom
            ctx.stroke();

            // Draw label inside node
            if (node.label && nodeStyle.label && nodeStyle.label.hideSize < nodeSize) {
                const labelStyle = nodeStyle.label;
                const fontStyle = labelStyle.font;

                // Make text scale with the node size but have a cap
                const fontSize = Math.min(fontStyle.size / scaleX, nodeSize * 0.6);
                ctx.font = `600 ${fontSize}px ${fontStyle.family}`; 
                
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';

                ctx.fillStyle = Color.fromRGBString(labelStyle.color).toRGBAString();
                ctx.fillText(node.label, node.x, node.y);
            }
        }

        ctx.restore();
        // console.log('ccNetViz: Graph drawn.');
    }

    /**
     * Adjusts the graph's rendering to match the current size of its associated canvas element.
     */
    resize() {
        const dpr = window.devicePixelRatio || 1;
        this._canvas.width = this._canvas.clientWidth * dpr;
        this._canvas.height = this._canvas.clientHeight * dpr;
        this._ctx2d.scale(dpr, dpr); // Scale 2D context for high-DPI displays

        // In a WebGL context, this would involve updating the viewport and projection matrix.
        // For 2D, we just ensure the canvas drawing surface matches the display size.
        this.draw();
        console.log(`ccNetViz: Canvas resized to ${this._canvas.clientWidth}x${this._canvas.clientHeight} (DPR: ${dpr}).`);
    }

    /**
     * Resets the graph's zoom level and panning position to their initial default states.
     */
    resetView() {
        this.setViewport({ x: 0.5, y: 0.5, size: 0.5 }); // Default center and zoom
        console.log('ccNetViz: Viewport reset.');
    }

    /**
     * Manually sets the graph's viewport (zoom and pan) to a specified state.
     * @param {object} viewport - An object defining the desired viewport state.
     */
    setViewport(viewport) {
        const oldViewport = { ...this._viewport };
        this._viewport.x = typeof viewport.x === 'number' ? Math.max(0, Math.min(1, viewport.x)) : this._viewport.x;
        this._viewport.y = typeof viewport.y === 'number' ? Math.max(0, Math.min(1, viewport.y)) : this._viewport.y;
        this._viewport.size = typeof viewport.size === 'number' ? Math.max(0.01, Math.min(1, viewport.size)) : this._viewport.size; // Clamp size to 0.01-1

        if (this._callbacks.onChangeViewport && (
            oldViewport.x !== this._viewport.x ||
            oldViewport.y !== this._viewport.y ||
            oldViewport.size !== this._viewport.size
        )) {
            this._callbacks.onChangeViewport({ ...this._viewport });
        }
        this.draw();
        // console.log('ccNetViz: Viewport set to:', this._viewport);
    }

    /**
     * Retrieves the current count of nodes that are visible or loaded in the graph.
     * @returns {number} The number of currently shown nodes.
     */
    cntShownNodes() {
        if (this._callbacks.getNodesCount) {
            return this._callbacks.getNodesCount();
        }
        return this._nodes.length; // For this implementation, all loaded nodes are "shown"
    }

    /**
     * Retrieves the current count of edges that are visible or loaded in the graph.
     * @returns {number} The number of currently shown edges.
     */
    cntShownEdges() {
        if (this._callbacks.getEdgesCount) {
            return this._callbacks.getEdgesCount();
        }
        return this._edges.length; // For this implementation, all loaded edges are "shown"
    }

    /**
     * Clears the graph data and removes any internal event listeners from the DOM,
     * effectively disposing of the graph instance.
     */
    remove() {
        this._nodes = [];
        this._edges = [];
        this._removeEventListeners();
        this._ctx2d.clearRect(0, 0, this._canvas.width, this._canvas.height); // Clear canvas
        console.log('ccNetViz: Instance removed and resources cleared.');
    }

    /**
     * Read-only property providing access to the current array of node data objects.
     * Returns a shallow copy to prevent direct modification outside the 'set' method.
     * @type {Array<object>}
     */
    get nodes() {
        return [...this._nodes]; 
    }

    /**
     * Read-only property providing access to the current array of edge data objects.
     * Returns a shallow copy to prevent direct modification outside the 'set' method.
     * @type {Array<object>}
     */
    get edges() {
        return [...this._edges];
    }
}

// Expose the Color utility class as a static property of ccNetViz
ccNetViz.color = Color;

module.exports = ccNetViz;
