import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AiService {
    constructor(private configService: ConfigService) { }

    async generateContent(topicId: string, topicTitle: string): Promise<string> {
        const expertContent: Record<string, string> = {
            'introduction-to-programming': `# 🎯 Foundation: Introduction to Programming (Basic to Pro)

![Introduction Graphic](https://images.unsplash.com/photo-1517694712202-14dd9538aa97?auto=format&fit=crop&q=80&w=1200)

## 🔰 Basic: What is Programming?
Programming is the soul of modern technology. It is the process of creating a sequence of instructions to enable a computer to solve a specific problem.

### The Conversion Bridge
Computers natively speak **Binary** (0s and 1s). We communicate in **High-Level Languages**.
- **Compiler**: Scans the entire source file and translates it into an executable machine code file (e.g., C++, Java). Fast but less portable.
- **Interpreter**: Translates and executes code line-by-line (e.g., Python, Javascript). Slower but offers great flexibility.

## ⚙️ Intermediate: The System Lifecycle
When you execute code, it goes through a fascinating journey:
1. **Fetch**: The CPU gets instructions from RAM.
2. **Decode**: The instruction is converted into a micro-operation.
3. **Execute**: The CPU performs the math or logic.

## 🚀 Pro: Software Architecture & Memory
Elite engineers understand the underlying **Memory Layout**:
- **Code Segment**: Read-only memory for instructions.
- **Data Segment**: Global and static variables.
- **Heap**: Dynamic memory (Manual management).
- **Stack**: Automatic memory for function local variables.

---

# 💡 Key Takeaways
- **Logic over Syntax**: Learn to think algorithmically; syntax is just a tool.
- **Environment**: Your choice of language affects performance and battery life.

# ❓ Placement Interview Prep
**Q: Difference between Linker and Loader?**
*A: Linker combines object files into an executable; Loader loads the executable into RAM.*

**Q: What is a JIT Compiler?**
*A: Just-In-Time compilers (used in Java/V8) translate bytecode into machine code at runtime for high performance.*`,

            'variables,-data-types-&-i/o': `# 📦 Variables & Memory: Basic to Pro

![Variables Illustration](https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=1200)

## 🔰 Basic: Data Containers
Variables are named storage locations in memory. In strongly typed languages (C++, Java), you must define the **Type** and **Size**.

## ⚙️ Intermediate: Precision & Range
Understanding how many bits you use is the first step to optimization.
- **int**: 32 bits (Whole numbers)
- **float**: 32 bits (Decimal, low precision)
- **double**: 64 bits (High precision)
- **char**: 8 bits (Single characters)

## 🚀 Pro: Data Alignment & Unsigned Types
Professionals use specific types for specific needs:
1. **Unsigned Types**: Use for values that can't be negative (like Memory Addresses) to double the positive range.
2. **Memory Alignment**: Computers access memory in chunks (4 or 8 bytes). Efficient variable ordering can reduce padding and save cache space.

---

# 💡 Key Takeaways
- **Naming**: Use camelCase for variables (e.g., \`userAge\`).
- **Precision**: Never use \`float\` for financial data; use \`BigDecimal\` or \`long\` (cents).

# ❓ Placement Interview Prep
**Q: What is the difference between \`i++\` and \`++i\`?**
*A: \`i++\` returns the value then increments; \`++i\` increments then returns the value.*

**Q: What is Type Casting?**
*A: Converting one data type to another (e.g., converting a \`double\` to an \`int\`). Implicit is automatic; Explicit requires manual syntax.*`,

            'control-flow-(if/else-&-switch)': `# 🚦 Control Flow: Smarter Decisions

![Control Flow Graphic](https://images.unsplash.com/photo-1516116216624-53e697fedbea?auto=format&fit=crop&q=80&w=1200)

## 🔰 Basic: Branching Logic
Control flow allows your program to take different paths based on truths.
- **If/Else**: The standard choice for ranges and complex Boolean logic.
- **Switch**: A cleaner way to handle discrete constants (e.g., Menu Options).

## ⚙️ Intermediate: Boolean Mastery
- **Short-Circuit Evaluation**: In \`A && B\`, if A is false, B is never checked. This is crucial for avoiding null pointers (\`if (ptr != null && ptr->val > 0)\`).

## 🚀 Pro: Branch Prediction & Jump Tables
Engines optimize your decisions:
1. **Switch Optimization**: Compilers often turn Switch statements into **Jump Tables**, which offer \`O(1)\` performance compared to \`O(N)\` for If-Else ladders.
2. **Branch Prediction**: CPUs try to guess which way an \`if\` will go. Writing "predictable" code can significantly boost speed.

---

# 💡 Key Takeaways
- Use **Switch** for enum-like constants.
- **Nested Ifs**: Use "Guard Clauses" to flatten code and improve readability.

# ❓ Placement Interview Prep
**Q: Can we use ranges in a Switch statement?**
*A: Standard C++/Java Switch doesn't support ranges (marks 90-100). Use If-Else for that.*

**Q: What happens if you forget the \`break\` in a switch?**
*A: Fall-through occurs: the next case's code executes even if its condition isn't met.*`,

            'loops-&-iterations': `# 🔄 Loops: Performance Iteration

![Loop Visual](https://images.unsplash.com/photo-1504639725590-34d0984388bd?auto=format&fit=crop&q=80&w=1200)

## 🔰 Basic: Repetition
- **For Loop**: Use when iterations are known (e.g., counting 1 to 10).
- **While Loop**: Use when the end condition is dynamic (e.g., until user exits).
- **Do-While**: Guarantees the code runs at least once.

## ⚙️ Intermediate: Complexity & Nesting
Nesting loops (\`loop inside loop\`) is powerful but dangerous. A nested loop over 'N' items results in **Quadratic Complexity** (\`O(N^2)\`).

## 🚀 Pro: Cache Locality & Loop Unrolling
1. **Cache Friendliness**: Iterating through a 2D array row-by-row is much faster than column-by-column because data is stored sequentially in memory.
2. **Loop Unrolling**: Manual or compiler-led optimization that reduces loop overhead by processing multiple elements per iteration.

---

# 💡 Key Takeaways
- **Termination**: Always ensure your loop has a clear exit condition to avoid "Infinite Loops."
- **Break/Continue**: Use \`break\` to exit and \`continue\` to skip to the next iteration.

# ❓ Placement Interview Prep
**Q: What is a For-Each loop?**
*A: A simplified loop (available in Java/C++) that iterates through collections/arrays without using an index, preventing "Off-by-one" errors.*

**Q: Difference between While and Do-While?**
*A: While checks the condition **before** execution; Do-While checks it **after**.*`,

            'pattern-printing-(logic-building)': `# 🗺️ Pattern Printing: Logic Blueprints

![Pattern Logic Graphic](https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&q=80&w=1200)

## 🔰 Basic: Visual Thinking
Pattern printing is the training ground for your logical brain. It forces you to map vertical steps (Rows) to horizontal steps (Columns).

## ⚙️ Intermediate: The i-j Relationship
The core secret to patterns is finding the formula:
- **Square**: Column count = Constant.
- **Triangle**: Column count = Row number (\`j <= i\`).
- **Inverted**: Column count = Total - Row number.

## 🚀 Pro: Algorithm Foundations
Pattern logic is the direct precursor to:
1. **Matrix Manipulation**: Handling 2D data structures.
2. **Dynamic Programming**: Visualizing 2D state tables.
3. **Coordinate Systems**: Essential for Game Development and Graphic UI.

---

# 💡 Key Takeaways
- **Pen & Paper**: Always draw your row/column grid before writing code.
- master the **Outer Loop** (Rows) first, then focus on the **Inner Loop** (Content).

# ❓ Placement Interview Prep
**Q: Why don't we use recursion for simple patterns?**
*A: Recursion would add unnecessary stack overhead for a task that is naturally iterative.*

**Q: How to print a Diamond pattern?**
*A: Combine a standard pyramid and an inverted pyramid, carefully managing the space logic.*`,

            'functions-&-scope': `# 🛠️ Functions: Modular Engineering

![Functions Graphic](https://images.unsplash.com/photo-1551033406-611cf9a28f67?auto=format&fit=crop&q=80&w=1200)

## 🔰 Basic: Code Reusability
Functions are blocks of code that perform a specific task. They take **Input** (Parameters) and produce **Output** (Return Value).

## ⚙️ Intermediate: Scope & Lifetime
- **Local Scope**: Variables inside functions only exist while the function is running.
- **Global Scope**: Variables accessible everywhere (Use sparingly to avoid bugs).

## 🚀 Pro: The Call Stack & Memory
1. **Stack Memory**: Every time a function is called, a "Stack Frame" is created. If too many functions are called (e.g., depth-heavy recursion), you get a **Stack Overflow**.
2. **Pass by Reference**: Passing a "pointer" to data instead of copying it. This is highly efficient for large data like Arrays or Objects.

---

# 💡 Key Takeaways
- **DRY Principle**: Don't Repeat Yourself. If you write the same code twice, put it in a function.
- **Naming**: Functions should be verbs (e.g., \`calculateFinalScore\`).

# ❓ Placement Interview Prep
**Q: What is Function Overloading?**
*A: Defining multiple functions with the same name but different parameters (e.g., \`add(int, int)\` and \`add(double, double)\`).*

**Q: What is Recursion?**
*A: A function that calls itself. Must have a **Base Case** to prevent infinite execution.*`
        };

        if (expertContent[topicId]) {
            return expertContent[topicId];
        }

        return `# 🎯 Learning Guide: ${topicTitle} (Basic to Pro)

## 🔰 Basic Level
Welcome to ${topicTitle}! This topic focuses on...

## 🚀 Professional Insights
In a production environment, elite engineers handle this by...

# 💡 Key Takeaways
- Concept 1...
- Concept 2...

# ❓ Placement Interview Prep
**Q: Explain the core mechanism of ${topicTitle}.**
*A: ...*
`;
    }
}
