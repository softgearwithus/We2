const fs = require('fs');
const path = require('path');

console.log("Starting update script...");

try {
    const filePath = path.join(__dirname, 'seed-skillforge.ts');
    if (!fs.existsSync(filePath)) {
        throw new Error(`File not found: ${filePath}`);
    }

    let fileContent = fs.readFileSync(filePath, 'utf8');
    console.log(`Read file ${filePath}, size: ${fileContent.length}`);

    const modules = [
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

    let modifiedCount = 0;

    for (let i = 0; i < modules.length; i++) {
        const mod = modules[i];
        console.log(`Processing ${mod.id}...`);

        const startMarker = `topicId: '${mod.id}'`;
        const startIndex = fileContent.indexOf(startMarker);

        if (startIndex === -1) {
            console.error(`ERROR: Could not find start of ${mod.id}`);
            continue;
        }

        // Find Next Module or Section to bound the search
        let endIndex = -1;
        if (i < modules.length - 1) {
            const nextModId = modules[i + 1].id;
            endIndex = fileContent.indexOf(`topicId: '${nextModId}'`, startIndex);
        } else {
            const nextSectionId = 'programming-javascript-chapters';
            endIndex = fileContent.indexOf(`topicId: '${nextSectionId}'`, startIndex);
        }

        if (endIndex === -1) {
            console.error(`ERROR: Could not find end for ${mod.id}`);
            continue;
        }

        // Search Content within block
        const block = fileContent.substring(startIndex, endIndex);

        // Find "content: `"
        const contentMarker = "content: `";
        const contentStartInBlock = block.indexOf(contentMarker);

        if (contentStartInBlock === -1) {
            console.error(`ERROR: Could not find content field in block for ${mod.id}`);
            continue;
        }

        // Find closing backtick
        // format: content: `...` <newline> <spaces> },
        const contentEndInBlock = block.lastIndexOf('`');

        if (contentEndInBlock <= contentStartInBlock + contentMarker.length) {
            console.error(`ERROR: Could not find content end backtick in block for ${mod.id}`);
            continue;
        }

        // Replace
        // We replace title and content.
        // Regex for title
        const titleRegex = /title:\s*'[^']*',/;

        // Reconstruct block
        let newBlock = block.replace(titleRegex, `title: '${mod.title}',`);

        // Since we replaced title, indices might shift if length differs.
        // It's safer to reconstruct from parts.

        // Re-find content start/end in the potentially modified block?
        // Or just assume title replacement didn't mess up content logic.
        // Title is before content.

        // Let's do string concatenation for safety.
        // Find title start/end in original block
        const titleMatch = block.match(titleRegex);
        if (!titleMatch) {
            console.error(`ERROR: Could not find title in block for ${mod.id}`);
            continue;
        }

        const titleStart = titleMatch.index;
        const titleEnd = titleStart + titleMatch[0].length;

        const preTitle = block.substring(0, titleStart);
        const postTitlePreContent = block.substring(titleEnd, contentStartInBlock);

        // The content start marker is "content: `". We want to keep that.
        // But we want to replace everything AFTER the backtick until the closing backtick.

        const actualContentStart = contentStartInBlock + contentMarker.length;
        const postContent = block.substring(contentEndInBlock); // contents: ` and everything after

        // Wait, postContent should start AFTER the closing backtick.
        // contentEndInBlock is the index of the backtick.
        const contentSuffix = block.substring(contentEndInBlock + 1); // everything after `

        // Construct new block
        // preTitle + newTitle + postTitlePreContent + "content: `" + newContent + "`" + contentSuffix
        // Be careful: postTitlePreContent might contain "content: `"?
        // No, contentStartInBlock is the index of "content: `".
        // So block.substring(titleEnd, contentStartInBlock) includes everything BETWEEN title end and "content: `".

        const generatedBlock = preTitle +
            `title: '${mod.title}',` +
            block.substring(titleEnd, contentStartInBlock) +
            `content: \`` + mod.content + `\`` +
            contentSuffix;

        // Replace in global fileContent
        // We have to be careful about global indices.
        // We know startIndex and endIndex in original fileContent.
        // We replace fileContent substring.

        // BUT, since we are doing this in a loop, and fileContent changes, indices become invalid.
        // WE MUST UPDATE fileContent and RE-CALCULATE indices in next iteration.
        // Or simpler: We just proceed knowing that the next module is AFTER the current one.
        // But if we grow the file, the next module's index shifts.
        // So we MUST re-search in the fileContent.

        // Since we update fileContent immediately:
        fileContent = fileContent.substring(0, startIndex) + generatedBlock + fileContent.substring(endIndex);
        modifiedCount++;
        console.log(`Updated ${mod.id} successfully.`);
    }

    if (modifiedCount > 0) {
        fs.writeFileSync(filePath, fileContent, 'utf8');
        console.log(`SUCCESS: Updated ${modifiedCount} modules.`);
    } else {
        console.log("No modules updated.");
    }

} catch (err) {
    console.error("FATAL ERROR:");
    console.error(err);
    process.exit(1);
}
