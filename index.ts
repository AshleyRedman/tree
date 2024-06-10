type Graph = Map<number, Node>;

interface INode {
    // Globally unique ID of a node
    id: number;
    // Any string
    title: string;
    // Any string
    description: string | null;
    // The parent node
    parent: Node | null;
    // The sibilings of this node
    siblings: Graph | null;
    // Add a new node(s) as children for of this node
    // add(nodes: Node[]): Node[];
    // Find a child of this node, 1 level deep
    find(id: number): Node | null;
    // Get all children nodes, 1 level deep
    list(): Graph | null;

    deep: {
        // Find ANY node within this nodes tree
        find(id: number): Node | null;
        // List ALL nodes within this nodes tree
        list(): Graph | null;
    };
}

class Node implements INode {
    static counter = 1;

    id: number;
    title: string;
    description: string | null;
    parent: Node | null;
    siblings: Graph | null;
    #children: Graph | null;

    constructor(title: string, parent?: Node) {
        this.id = Node.counter++;
        this.title = title;
        this.description = null;

        this.#children = null;

        if (parent) {
            this.parent = parent;
            parent.add([this]);
            this.siblings = new Map(parent.#children);
            this.siblings.delete(this.id);
        } else {
            this.parent = null;
            this.siblings = null;
        }
    }

    private add(nodes: Node[]) {
        for (const node of nodes) {
            if (!this.#children?.has(node.id)) {
                const newNode = new Node(node.title); // Create a new node without passing 'this' as parent
                newNode.parent = this; // Assign the current node as the parent
                if (!this.#children) {
                    this.#children = new Map<number, Node>();
                }
                this.#children.set(newNode.id, newNode);
            }
        }
        return nodes;
    }

    find(id: number) {
        if (!this.#children) return null;
        return this.#children.get(id) || null;
    }

    list() {
        return this.#children;
    }

    deep = {
        find: (id: number): Node | null => {
            // Start searching from this node
            let foundNode = this.find(id);
            if (foundNode) return foundNode;

            // Recursively search children of this node
            for (const child of this.getChildren()) {
                foundNode = child.deep.find(id);
                if (foundNode) return foundNode;
            }

            return null; // Return null if node is not found
        },
        list: (): Graph | null => {
            // Initialize the result map
            const result: Graph = new Map();

            // Add children of this node to the result map
            for (const child of this.getChildren()) {
                result.set(child.id, child);
            }

            // Recursively add children of children to the result map
            for (const child of this.getChildren()) {
                const grandchildren = child.deep.list();
                if (grandchildren) {
                    for (const grandchild of grandchildren.values()) {
                        result.set(grandchild.id, grandchild);
                    }
                }
            }

            return result.size > 0 ? result : null; // Return null if no children found
        },
    };

    private getChildren(): Node[] {
        return this.#children ? Array.from(this.#children.values()) : [];
    }
}

const a = new Node("Top level node");
const b = new Node("B: second level node", a);
const c = new Node("C: second level node", a);
const d = new Node("D: third level node", c);
