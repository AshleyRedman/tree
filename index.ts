type Graph = Map<number, Node>;

interface INode {
    id: number;
    title: string;
    description: string | null;
    parent: Node | null;
    siblings: Graph | null;
    add(nodes: Node[]): Node[];
    find(id: number): Node | null;
    list(): Graph | null;
    deep: {
        find(id: number): Node | null;
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
    #children: Graph | null = null;

    constructor(title: string, parent?: Node) {
        this.id = Node.counter++;
        this.title = title;
        this.description = null;
        this.#children = null;
        this.siblings = null;

        if (parent) {
            this.parent = parent;
            parent.add([this]);
        } else {
            this.parent = null;
        }
    }

    add(nodes: Node[]) {
        if (!this.#children) {
            this.#children = new Map<number, Node>();
        }
        for (const node of nodes) {
            if (!this.#children.has(node.id)) {
                this.#children.set(node.id, node);
                node.parent = this;
            } else {
                throw new Error("Node exists");
            }
        }
        return nodes;
    }

    find(id: number) {
        return this.#children?.get(id) || null;
    }

    list() {
        return this.#children;
    }

    deep = {
        find: (id: number): Node | null => {
            let foundNode = this.find(id);
            if (foundNode) return foundNode;

            for (const child of this.getChildren()) {
                foundNode = child.deep.find(id);
                if (foundNode) return foundNode;
            }

            return null;
        },
        list: (): Graph | null => {
            const result: Graph = new Map();
            this.collectNodes(result);
            return result.size > 0 ? result : null;
        },
    };

    private collectNodes(result: Graph) {
        if (!this.#children) return;

        for (const [i, child] of this.#children) {
            result.set(i, child);
            child.collectNodes(result);
        }
    }

    private getChildren(): Node[] {
        return this.#children ? Array.from(this.#children.values()) : [];
    }
}

const a = new Node("Top level node"); // 1
const b = new Node("B: second level node", a); // 2
const c = new Node("C: second level node", a); // 3
const d = new Node("D: third level node", c); // 4
const e = new Node("E: third level node", c); // 5
const f = new Node("F: third level node", c); // 6
const g = new Node("G: third level node", c); // 7
const h = new Node("H: third level node", c); // 8
const i = new Node("I: third level node", b); // 9

console.log(a.list()?.size); // Expect 3 (a, b, i)
console.log(a.deep.list()?.size); // Expect 8 (a, b, c, d, e, f, g, h, i)
console.log(a.deep.find(6)); // Expect null
console.log(a.deep.find(6)); // Expect F
