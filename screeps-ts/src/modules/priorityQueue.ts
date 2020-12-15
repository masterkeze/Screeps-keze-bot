const heapTop = 0;
const getParent = i => ((i + 1) >>> 1) - 1;
const left = i => (i << 1) + 1;
const right = i => (i + 1) << 1;

export class PriorityQueue {
    _heap:any[];
    _comparator:(a:any, b:any)=>boolean;
    public constructor(comparator = (a, b) => a > b, heap = []) {
        this._heap = heap;
        this._comparator = comparator;
    }
    public size() {
        return this._heap.length;
    }
    public isEmpty() {
        return this.size() == 0;
    }
    public peek() {
        return this._heap[heapTop];
    }
    public push(...values:any[]) {
        values.forEach(value => {
            this._heap.push(value);
            this._siftUp();
        });
        return this.size();
    }
    public pop() {
        const poppedValue = this.peek();
        const bottom = this.size() - 1;
        if (bottom > heapTop) {
            this._swap(heapTop, bottom);
        }
        this._heap.pop();
        this._siftDown();
        return poppedValue;
    }
    public replace(value) {
        const replacedValue = this.peek();
        this._heap[heapTop] = value;
        this._siftDown();
        return replacedValue;
    }
    _greater(i:number, j:number) {
        return this._comparator(this._heap[i], this._heap[j]);
    }
    _swap(i:number, j:number) {
        [this._heap[i], this._heap[j]] = [this._heap[j], this._heap[i]];
    }
    _siftUp() {
        let node = this.size() - 1;
        while (node > heapTop && this._greater(node, getParent(node))) {
            this._swap(node, getParent(node));
            node = getParent(node);
        }
    }
    _siftDown() {
        let node = heapTop;
        while (
            (left(node) < this.size() && this._greater(left(node), node)) ||
            (right(node) < this.size() && this._greater(right(node), node))
        ) {
            let maxChild = (right(node) < this.size() && this._greater(right(node), left(node))) ? right(node) : left(node);
            this._swap(node, maxChild);
            node = maxChild;
        }
    }
}