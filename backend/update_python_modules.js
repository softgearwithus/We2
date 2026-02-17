const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'seed-skillforge.ts');
let fileContent = fs.readFileSync(filePath, 'utf8');

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

function escapeRegExp(string) {
    return string.replace(/[.*+?^$\{()|[\]\\]/g, '\\$&');
}

let modified = false;

for (let i = 0; i < modules.length; i++) {
    const mod = modules[i];
    const nextModId = (i < modules.length - 1) ? modules[i + 1].id : 'programming-javascript-chapters';
    // Fallback for end of Python section if next module is JS section key or something else.
    // Actually the next section is JS curriculum.

    // Find Start of current module
    const startMarker = `topicId: '${mod.id}'`;
    const startIndex = fileContent.indexOf(startMarker);
    if (startIndex === -1) {
        console.error(`Could not find start of ${mod.id}`);
        continue;
    }

    // Find End of current module content
    // The content is followed by a closing brace } and then comma, 
    // OR we can look for the next module's start.

    // Search for the next module's ID
    let endIndex = -1;
    if (i < modules.length - 1) {
        endIndex = fileContent.indexOf(`topicId: '${nextModId}'`, startIndex);
    } else {
        // For the last module, look for the JS section start or just the end of the array inside the seeder
        // The structure is ... }, \n { topicId: ...
        // We can search for the start of the Javascript section: 
        // topicId: 'programming-javascript-chapters'
        const nextSectionId = 'programming-javascript-chapters';
        endIndex = fileContent.indexOf(`topicId: '${nextSectionId}'`, startIndex);
    }

    if (endIndex === -1) {
        console.error(`Could not find end for ${mod.id}`);
        continue;
    }

    // Now, within [startIndex, endIndex], we need to replace the title and content.
    // We will extract the substring, perform replacement, and put it back.
    const moduleBlock = fileContent.substring(startIndex, endIndex);

    // Regex to match title
    // title: 'Old Title',
    const titleRegex = /title:\s*'[^']*',/;
    let newModuleBlock = moduleBlock.replace(titleRegex, `title: '${mod.title}',`);

    // Regex to match content
    // content: `...`
    // Since content includes newlines and backticks, we need to be careful.
    // We can assume content starts with "content: `" and ends with "`" before the closing brace.
    // But regex matching over multiple lines with backticks is tricky.
    // Let's find the content boundaries manually inside the block.

    const contentStartMarker = "content: `";
    const contentStartIndex = newModuleBlock.indexOf(contentStartMarker);
    if (contentStartIndex === -1) {
        console.error(`Could not find content start in block for ${mod.id}`);
        continue;
    }

    // Find the LAST backtick in the block (before the expected comma/brace)
    // The block ends right before the next topicId, so it usually ends with }, {
    // We trimmed it to endIndex.
    // Actually, let's look for the backtick relative to contentStart.
    // It should be the last backtick in the string? No, code blocks have backticks.
    // The content string is wrapped in backticks.
    // So we need to match the outer backticks.

    // Logic: content starts at contentStartIndex + contentStartMarker.length
    // We scan forward. Javascript template literals are not greedy?
    // Actually, in the file, the content string ends with ` (backtick) followed mostly by whitespace / newlines and then },

    // We can look backwards from the end of the block for the first backtick.
    const contentEndIndex = newModuleBlock.lastIndexOf('`');

    if (contentEndIndex <= contentStartIndex + contentStartMarker.length) {
        console.error(`Could not find content end in block for ${mod.id}`);
        continue;
    }

    // Construct new block
    const preContent = newModuleBlock.substring(0, contentStartIndex);
    const postContent = newModuleBlock.substring(contentEndIndex + 1);

    // The new content needs to be properly escaped if we were writing JSON, but here we are writing raw string into file.
    // We just paste the content string.
    // Ensure the content string in `modules` array above is formatted correctly for template literal.

    const finalBlock = preContent + "content: `" + mod.content + "`" + postContent;

    // Global replacement in fileContent
    // Since we computed indices based on original fileContent, we must build a new fileContent or track offsets.
    // The easiest is to split the fileContent into 3 parts: pre-block, block, post-block.
    // But since we are iterating, offsets shift.
    // Better to do: read current file content -> replace -> update file content variable.
    // But searching for startIndex again is safe if the IDs are unique and ordered.

    // Refresh indices based on current fileContent state?
    // No, if we modify fileContent, indices shift.
    // Let's restart the search for the specific ID in the modified content.

    const currentStartIndex = fileContent.indexOf(startMarker);
    // finding end index again
    let currentEndIndex = -1;
    if (i < modules.length - 1) {
        currentEndIndex = fileContent.indexOf(`topicId: '${nextModId}'`, currentStartIndex);
    } else {
        const nextSectionId = 'programming-javascript-chapters';
        currentEndIndex = fileContent.indexOf(`topicId: '${nextSectionId}'`, currentStartIndex);
    }

    if (currentStartIndex !== -1 && currentEndIndex !== -1) {
        fileContent = fileContent.substring(0, currentStartIndex) + finalBlock + fileContent.substring(currentEndIndex);
        modified = true;
        console.log(`Updated ${mod.id}`);
    } else {
        console.error(`Could not re-locate ${mod.id} during update phase`);
    }
}

if (modified) {
    fs.writeFileSync(filePath, fileContent, 'utf8');
    console.log("All modules updated.");
} else {
    console.log("No changes made.");
}
