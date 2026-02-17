const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'seed-skillforge.ts');
let content = fs.readFileSync(filePath, 'utf8');

const pythonModules = [
    {
        id: 'programming-python-module-0',
        title: 'Module 0: Python Internals',
        content: `# 🐍 Module 0: Python Internals

## 1. What actually is Python?
When you download "Python", you are usually downloading **CPython**, the reference implementation written in C.

### The Execution Pipeline
1. **Source Code (.py)**: Your readable text.
2. **Compiler**: Converts source to **Bytecode (.pyc)**.
3. **PVM (Python Virtual Machine)**: Interprets bytecode and executes it on the CPU.

\`\`\`text
[Code.py] -> [Compiler] -> [Bytecode] -> [PVM] -> [CPU]
\`\`\`

## 2. Memory Management
Python handles memory for you, but understanding it distinguishes pros from beginners.

### The Private Heap
- Python objects live in a **private heap**.
- **PyMalloc**: Python's specialized allocator for small objects (faster than C's \`malloc\`).

### Reference Counting
Every object has a counter.
- \`a = []\` (Ref count: 1)
- \`b = a\` (Ref count: 2)
- \`del a\` (Ref count: 1)
- \`del b\` (Ref count: 0 -> **Garbage Collected**)

### Garbage Collection (GC)
Reference counting fails with **Cyclic References** (A points to B, B points to A).
- Python's GC has a **Cyclic Garbage Collector** that runs periodically to find and clean these isolated cycles.

## 3. Everything is an Object
In Python, functions, integers, and classes are first-class objects.
\`\`\`python
def hello(): pass
print(type(hello)) // <class 'function'>
\`\`\`

## 4. The Global Interpreter Lock (GIL)
CPython has a mutex that prevents multiple native threads from executing Python bytecodes at once.
- **Impact**: CPU-bound multi-threading is not truly parallel in Python.
- **Solution**: Use \`multiprocessing\` for CPU tasks, \`threading\` for I/O tasks.
`
    },
    {
        id: 'programming-python-module-1',
        title: 'Module 1: Data Structures',
        content: `# 🏗️ Module 1: Data Structures Deep Dive

## 1. Lists: The Dynamic Array
Python lists are **Dynamic Arrays** (pointers to objects).
- **Append**: O(1) amortized (doubles capacity when full).
- **Insert/Delete**: O(N) (shifts elements).

## 2. Dictionaries & Sets (Hash Tables)
The backbone of Python.
- **Implementation**: Open Addressing with Pseudo-Random Probing.
- **Complexity**: O(1) average case for Search/Insert/Delete.

### Hash Collisions
When two keys hash to the same slot. Python solves this by probing for the next empty slot in a deterministic sequence.

### Dict Ordering
Since Python 3.7, dictionaries **preserve insertion order**.

\`\`\`python
# Set theory operations
a = {1, 2, 3}
b = {3, 4, 5}

print(a | b) # Union: {1, 2, 3, 4, 5}
print(a & b) # Intersection: {3}
print(a - b) # Difference: {1, 2}
print(a ^ b) # Symmetric Diff: {1, 2, 4, 5}
\`\`\`

## 3. Tuples vs Lists
Tuples are **immutable** and structurally simpler (less memory overhead).
- **Rule of Thumb**: Use Tuples for heterogeneous data (records), Lists for homogeneous data.

## 4. Collections Module
Standard library power-ups.
- \`Counter\`: Bag data structure.
- \`defaultdict\`: Never see a KeyError again.
- \`deque\`: Double-ended queue (O(1) append/pop at both ends).

\`\`\`python
from collections import Counter
c = Counter("mississippi")
print(c.most_common(2)) # [('i', 4), ('s', 4)]
\`\`\`
`
    },
    {
        id: 'programming-python-module-2',
        title: 'Module 2: Advanced Control Flow',
        content: `# ⚙️ Module 2: Advanced Control Flow

## 1. Iterators & Iterables
- **Iterable**: An object with an \`__iter__()\` method (e.g., list).
- **Iterator**: An object with \`__next__()\` method.

\`\`\`python
# Building a custom iterator
class CountDown:
    def __init__(self, start):
        self.num = start
    
    def __iter__(self):
        return self
    
    def __next__(self):
        if self.num <= 0:
            raise StopIteration
        val = self.num
        self.num -= 1
        return val
\`\`\`

## 2. Generators (The \`yield\` keyword)
Generators simplify creating iterators. They pause execution and save state.
- **Benefit**: Lazy evaluation. Can iterate over infinite streams without crashing memory.

\`\`\`python
def infinite_sequence():
    num = 0
    while True:
        yield num
        num += 1
\`\`\`

## 3. Context Managers (\`with\` statement)
Automated resource management (Setup & Teardown).
- **Protocol**: \`__enter__\` and \`__exit__\`.

\`\`\`python
class Timer:
    def __enter__(self):
        import time
        self.start = time.time()
        return self
    
    def __exit__(self, *args):
        import time
        print(f"Elapsed: {time.time() - self.start}s")

with Timer():
    # Code to time
    sum(range(1000000))
\`\`\`
`
    },
    {
        id: 'programming-python-module-3',
        title: 'Module 3: Functional Python',
        content: `# 🔧 Module 3: Functional Python

## 1. Lambda Functions
Anonymous, single-expression functions.
\`\`\`python
add = lambda x, y: x + y
print(add(2, 3))
\`\`\`

## 2. Map, Filter, Reduce
- \`map(func, iter)\`: Apply func to all items.
- \`filter(func, iter)\`: Keep items where func returns True.
- \`reduce(func, iter)\`: Accumulate result (from \`functools\`).

\`\`\`python
from functools import reduce
nums = [1, 2, 3, 4]
product = reduce(lambda x, y: x * y, nums) # 24
\`\`\`

## 3. Closures
A function that remembers values from its enclosing scope even after the scope has finished executing.

\`\`\`python
def multiplier(n):
    def multiply(x):
        return x * n
    return multiply

times3 = multiplier(3)
print(times3(10)) # 30
\`\`\`

## 4. Decorators
Wrappers that modify function behavior using closures.
- Syntax sugar \`@my_decorator\`.

\`\`\`python
def debug(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__} with {args}")
        return func(*args, **kwargs)
    return wrapper

@debug
def greet(name):
    print(f"Hello {name}")
\`\`\`
`
    },
    {
        id: 'programming-python-module-4',
        title: 'Module 4: OOP Mastery',
        content: `# 🏗️ Module 4: OOP Mastery

## 1. Magic Methods (Dunder Methods)
Customize class behavior for built-in operators.
- \`__init__\`, \`__str__\`, \`__repr__\`
- \`__add__\`, \`__eq__\`, \`__len__\`
- \`__getitem__\`, \`__setitem__\` (make objects behave like lists/dicts)

## 2. Inheritance & MRO
Method Resolution Order (MRO) determines the class search path for methods.
- Python uses **C3 Linearization**.
- View it with \`ClassName.mro()\`.

## 3. Class vs Static Methods
- \`@classmethod\`: Takes \`cls\` as first arg. Can access class state. Factory methods.
- \`@staticmethod\`: No implicit first arg. Just a function inside a class namespace.

## 4. Properties (\`@property\`)
Getters and Setters the Pythonic way.
\`\`\`python
class Circle:
    def __init__(self, radius):
        self._radius = radius

    @property
    def radius(self):
        return self._radius

    @radius.setter
    def radius(self, value):
        if value < 0: raise ValueError
        self._radius = value
\`\`\`

## 5. Slots
Use \`__slots__\` to prevent creation of \`__dict__\` for instances, saving memory for millions of objects.
`
    },
    {
        id: 'programming-python-module-5',
        title: 'Module 5: File I/O & Serialization',
        content: `# 💾 Module 5: File I/O & Serialization

## 1. The \`pathlib\` Module
Stop using strings for file paths. Use \`pathlib.Path\`.
- OS agnostic (handles \`/\` vs \`\\\`).
- Object-oriented filesystem.

\`\`\`python
from pathlib import Path
p = Path('.') / 'data' / 'log.txt'
if not p.exists():
    p.touch()
\`\`\`

## 2. JSON Serialization
Standard format for web data.
\`\`\`python
import json
data = {"name": "Alice", "skills": ["Python", "C++"]}
json_str = json.dumps(data) # Serialize
obj = json.loads(json_str)  # Deserialize
\`\`\`

## 3. Pickle
Python-specific binary serialization.
- **Warning**: Never unpickle untrusted data (RCE vulnerability!).
- Preserves custom class instances.

## 4. Buffering
File I/O is buffered by default to minimize syscalls. 
- Use \`flush()\` to force write to disk.
`
    },
    {
        id: 'programming-python-module-6',
        title: 'Module 6: Concurrency',
        content: `# ⚡ Module 6: Concurrency

## 1. Threading vs Multiprocessing
- **Threading**: Shared memory. Good for I/O bound tasks (Network, Disk). Limited by GIL.
- **Multiprocessing**: Separate memory (processes). Good for CPU bound tasks. Bypasses GIL.

## 2. The \`threading\` Module
\`\`\`python
import threading

def worker():
    print("Working...")

t = threading.Thread(target=worker)
t.start()
t.join() # Wait for completion
\`\`\`

## 3. AsyncIO (Producer-Consumer)
Single-threaded concurrent code using coroutines.
- **async/await** syntax.
- **Event Loop**: Manages execution.

\`\`\`python
import asyncio

async def main():
    print('Hello')
    await asyncio.sleep(1)
    print('World')

# asyncio.run(main())
\`\`\`
`
    },
    {
        id: 'programming-python-module-7',
        title: 'Module 7: Modern Python',
        content: `# 🚀 Module 7: Modern Python

## 1. Type Hinting (PEP 484)
Python is dynamic, but hints help editors and linters (mypy).
\`\`\`python
def greet(name: str) -> str:
    return f"Hello {name}"
\`\`\`

## 2. Dataclasses (Python 3.7+)
Boilerplate-free classes. Auto-generates \`__init__\`, \`__repr__\`, \`__eq__\`.

\`\`\`python
from dataclasses import dataclass

@dataclass
class Point:
    x: int
    y: int

p = Point(10, 20)
print(p) # Point(x=10, y=20)
\`\`\`

## 3. The Walrus Operator (\`:=\`)
Assignment expressions.
\`\`\`python
if (n := len(data)) > 10:
    print(f"Data is too long: {n}")
\`\`\`

## 4. Virtual Environments & Packaging
- Always use a venv: \`python -m venv venv\`.
- **Modern Tools**: \`poetry\` or \`uv\` for dependency management.
`
    }
];

// Algorithm:
// Identify all modules with topicId: '...'
// Replace the entire object block with a clean JSON.stringify block
const markers = ["content:", "theory:", "desc:"];

// Split the file into three parts: preamble, content array, postamble
const preambleEnd = content.indexOf('const contents = [') + 'const contents = ['.length;
const postambleStart = content.lastIndexOf('];');

const preamble = content.substring(0, preambleEnd);
const mid = content.substring(preambleEnd, postambleStart);
const postamble = content.substring(postambleStart);

// Split mid into objects. Since objects are defined as { ... }, we can try to split by some pattern
// But safer: find all topicId: starts
const idRegex = /topicId:\s*'([^']+)'/g;
const modulePositions = [];
let match;
while ((match = idRegex.exec(mid)) !== null) {
    // Find the opening brace before this topicId
    const openingBrace = mid.lastIndexOf('{', match.index);
    modulePositions.push({ id: match[1], start: openingBrace });
}

let newMid = "\n";

for (let i = 0; i < modulePositions.length; i++) {
    const current = modulePositions[i];
    const next = modulePositions[i + 1];
    const end = next ? next.start : mid.lastIndexOf('}') + 1;

    let block = mid.substring(current.start, end);

    const pyMod = pythonModules.find(p => p.id === current.id);
    if (pyMod) {
        block = `{
                topicId: '${pyMod.id}',
                title: '${pyMod.title}',
                content: JSON.stringify(${JSON.stringify(pyMod.content)})
            }`;
    } else {
        // Just normalize other blocks
        markers.forEach(marker => {
            const mIdx = block.indexOf(marker);
            if (mIdx === -1) return;

            const valueRest = block.substring(mIdx + marker.length);
            // Search for start of string (`, ", or JSON.stringify)
            const templateStart = valueRest.indexOf('`');
            const quoteStart = valueRest.indexOf('"');
            const jsonStart = valueRest.indexOf('JSON.stringify(');

            let valStart = -1;
            let type = "";
            if (templateStart !== -1 && (jsonStart === -1 || templateStart < jsonStart) && (quoteStart === -1 || templateStart < quoteStart)) {
                valStart = templateStart;
                type = "template";
            } else if (jsonStart !== -1 && (quoteStart === -1 || jsonStart < quoteStart)) {
                valStart = jsonStart;
                type = "json";
            } else if (quoteStart !== -1) {
                valStart = quoteStart;
                type = "quote";
            }

            if (valStart === -1) return;

            let valEnd = -1;
            if (type === "template") valEnd = valueRest.lastIndexOf('`');
            else if (type === "json") valEnd = valueRest.lastIndexOf(')');
            else if (type === "quote") valEnd = valueRest.lastIndexOf('"');

            if (valEnd === -1) return;

            const raw = valueRest.substring(valStart + 1, valEnd);
            if (type === "json") return; // already normalized

            const prefix = block.substring(0, mIdx + marker.length + valStart);
            const suffix = block.substring(mIdx + marker.length + valEnd + 1);
            block = prefix + "JSON.stringify(" + JSON.stringify(raw) + ")" + suffix;
        });
    }

    newMid += "            " + block.trim();
    if (i < modulePositions.length - 1) newMid += ",\n";
    else newMid += "\n        ";
}

fs.writeFileSync(filePath, preamble + newMid + postamble, 'utf8');
console.log("Perfect reconstruction completed.");
