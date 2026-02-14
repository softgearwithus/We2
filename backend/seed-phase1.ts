import { DataSource } from 'typeorm';
import { CourseContent } from './src/course-content/entities/course-content.entity';

const AppDataSource = new DataSource({
    type: 'sqlite',
    database: 'database.sqlite',
    entities: [CourseContent],
    synchronize: true,
});

async function seed() {
    try {
        await AppDataSource.initialize();
        console.log("Database connected for Phase 1 Seeding.");

        const repo = AppDataSource.getRepository(CourseContent);

        const phase1Contents = [
            {
                topicId: 'introduction-to-programming',
                title: 'Mastering the Art of Programming',
                content: `# 🎯 Learning Objectives
- Define what programming actually is.
- Understand the difference between High-level and Low-level languages.
- Grasp the role of Compilers and Interpreters.

# 📖 Detailed Explanation
Programming is the bridge between human thought and computer execution. It's not just about typing code; it's about solving problems using logic.

### How Computers Think
At the lowest level, computers only understand **Binary** (0s and 1s). Since humans can't easily write binary, we use programming languages.

### The Conversion Process
1. **Source Code**: What you write (C++, Java, Python).
2. **Compiler/Interpreter**: The translator.
3. **Machine Code**: What the CPU executes.

# 💡 Key Takeaways
- **Syntax vs Logic**: Syntax is just the grammar; Logic is the soul of the program.
- **Portability**: High-level languages can run on different operating systems with minimal changes.

# ❓ Interview Preparation
**Q1: What is the main difference between a Compiler and an Interpreter?**
*A1: A Compiler translates the entire program at once, creating an executable file. An Interpreter translates and executes code line-by-line.*

**Q2: Why do we need High-Level Languages?**
*A2: To increase developer productivity and make code more readable and maintainable compared to assembly or machine code.*`
            },
            {
                topicId: 'variables,-data-types-&-i/o',
                title: 'Variables, Data Types & Input/Output',
                content: `# 🎯 Learning Objectives
- Learn how to declare and initialize variables.
- Understand Primitive vs Non-Primitive data types.
- Master standard Input/Output operations.

# 📖 Detailed Explanation
Variables are named storage locations in memory. Think of them as labeled boxes that hold specific types of items.

### Data Types in Detail
- **Primitive**: \`int\`, \`float\`, \`char\`, \`bool\`. These are the simplest forms of data.
- **Non-Primitive**: \`String\`, \`Array\`, \`Object\`. These are complex types built from primitives.

### Standard I/O
- **Input**: Taking data from the user (e.g., \`cin\` in C++, \`Scanner\` in Java).
- **Output**: Displaying results (e.g., \`cout\` in C++, \`System.out.println\` in Java).

# 💡 Key Takeaways
- Always use meaningful variable names (\`userAge\` instead of \`a\`).
- Choose the smallest data type that fits your data to save memory.

# ❓ Interview Preparation
**Q1: What is the difference between 'float' and 'double'?**
*A1: 'double' has more precision (15-17 decimal digits) compared to 'float' (6-7 decimal digits) and takes twice the memory.*

**Q2: Is 'String' a primitive data type?**
*A2: No, in most languages like Java and C++, String is a reference or non-primitive type.*`
            },
            {
                topicId: 'control-flow-(if/else-&-switch)',
                title: 'Making Decisions: Control Flow',
                content: `# 🎯 Learning Objectives
- Use conditional statements to make decisions.
- Compare If-Else ladders with Switch-Case.
- Learn about Boolean logic and operators.

# 📖 Detailed Explanation
Control flow is what makes a program "smart." It allows the program to react differently to different inputs.

### The Decision Trio
1. **If-Else**: The most common way to branch logic.
2. **Else-If**: Used when you have multiple related conditions.
3. **Switch**: More efficient and readable for specific discrete values.

### Logical Operators
- \`&&\` (AND): Both conditions must be true.
- \`||\` (OR): At least one condition must be true.
- \`!\` (NOT): Reverses the condition.

# 💡 Key Takeaways
- Use **If-Else** for ranges or complex conditions.
- Use **Switch** when comparing a single variable against many constant values.

# ❓ Interview Preparation
**Q1: Can we use a Switch statement for range checks (e.g., marks > 90)?**
*A1: No, Switch expects specific constant values. If-Else is better for ranges.*

**Q2: What is 'short-circuit' evaluation in logical operators?**
*A2: In '&&', if the first part is false, the second part isn't even checked. In '||', if the first part is true, the second part isn't checked.*`
            },
            {
                topicId: 'loops-&-iterations',
                title: 'Repetitive Tasks: Loops & Iterations',
                content: `# 🎯 Learning Objectives
- Understand the 3 parts of a loop: Init, Condition, Increment.
- Differentiate between For, While, and Do-While loops.
- Learn how to avoid infinite loops.

# 📖 Detailed Explanation
Loops allow us to execute a block of code multiple times without rewriting it.

### Types of Loops
- **For Loop**: Best for a known number of iterations (e.g., repeating 10 times).
- **While Loop**: Best when looping depends on a dynamic condition (e.g., until the file ends).
- **Do-While**: Executes at least once before checking the condition.

### Controlling Loops
- **Break**: Immediately exits the loop.
- **Continue**: Skips the current iteration and goes to the next one.

# 💡 Key Takeaways
- Always ensure your loop condition will eventually become false.
- **For-Each** loops (in Java/Python) are safer and cleaner for iterating through collections.

# ❓ Interview Preparation
**Q1: When would you use a While loop over a For loop?**
*A1: When the number of iterations is not known beforehand and depends on a logical condition.*

**Q2: What happens if the condition in a Do-While loop is false at the start?**
*A2: The code inside the loop will still execute exactly once before termination.*`
            },
            {
                topicId: 'pattern-printing-(logic-building)',
                title: 'Logic Building with Pattern Printing',
                content: `# 🎯 Learning Objectives
- Master Nested Loops correctly.
- Learn to visualize Row vs Column dependencies.
- Build the foundation for 2D Array manipulation.

# 📖 Detailed Explanation
Pattern printing is where most beginners struggle because it requires high visualization. 

### The Formula for Patterns
Most patterns can be solved by answering two questions:
1. **The Outer Loop**: How many rows do I need to print?
2. **The Inner Loop**: In row number 'i', how many stars/spaces/numbers do I print?

### Common Patterns
- **Square**: Inner loop constant.
- **Triangle**: Inner loop depends on 'i'.
- **Inverted Triangle**: Inner loop depends on 'TotalRows - i'.

# 💡 Key Takeaways
- Draw the pattern on paper and write the row and column indices.
- Once you see the mathematical relationship, writing the code is easy.

# ❓ Interview Preparation
**Q1: Why is pattern printing important for placements?**
*A1: It tests your ability to translate logical visualization into nested loops—a core skill for DSA topics like Matrix and Graphs.*

**Q2: How many nested loops are typically needed for a 2D pattern?**
*A2: Usually two: one for rows and one for columns.*`
            },
            {
                topicId: 'functions-&-scope',
                title: 'Modular Code: Functions & Scope',
                content: `# 🎯 Learning Objectives
- Break down problems into reusable functions.
- Understand Parameter Passing (Value vs Reference).
- Grasp Variable Scope (Local vs Global).

# 📖 Detailed Explanation
Functions are the building blocks of clean code. They follow the **DRY** principle: Don't Repeat Yourself.

### Anatomy of a Function
- **Return Type**: What the function gives back (\`int\`, \`void\`, \`string\`).
- **Name**: CamelCase is standard (\`calculateSum\`).
- **Parameters**: Inputs needed for the task.

### Scope & Lifetime
- **Local Scope**: Variables declared inside a function; they die when the function ends.
- **Global Scope**: Variables declared outside; accessible everywhere.

# 💡 Key Takeaways
- A function should ideally do only **one thing** and do it well.
- Passing by reference saves memory for large objects (like arrays).

# ❓ Interview Preparation
**Q1: What is Recursion?**
*A1: It's a special type of function that calls itself to solve a smaller version of the problem.*

**Q2: What is the benefit of using modular functions?**
*A2: Improved readability, easier debugging, and high code reusability.*`
            }
        ];

        for (const item of phase1Contents) {
            const existing = await repo.findOne({ where: { topicId: item.topicId } });
            if (existing) {
                existing.title = item.title;
                existing.content = item.content;
                await repo.save(existing);
                console.log(`Updated: ${item.topicId}`);
            } else {
                const content = repo.create(item);
                await repo.save(content);
                console.log(`Created: ${item.topicId}`);
            }
        }

        console.log("Phase 1 Content Seeding Completed Successfully!");

    } catch (error) {
        console.error("Error seeding Phase 1 content:", error);
    } finally {
        await AppDataSource.destroy();
    }
}

seed();
