import { BookOpen, Code, Layers, Briefcase, MessageSquare } from 'lucide-react';

export interface Topic {
    title: string;
    desc: string;
    resources: { name: string; url: string }[];
    content?: {
        introduction: string;
        keyConcepts: { label: string; text: string }[];
        codeExamples: { [key: string]: string }; // 'C++' | 'Java' | 'Python'
        proTip?: string;
    };
}

export interface RoadmapPhase {
    id: string;
    title: string;
    timeframe: string;
    idealTime: string;
    fastTrack: string;
    icon: any;
    color: string;
    desc: string;
    topics: Topic[];
}

export const roadmapData: RoadmapPhase[] = [
    {
        id: 'foundations',
        title: 'Phase 1: Foundations',
        timeframe: 'Beginner',
        idealTime: 'Year 1-2',
        fastTrack: '2 Weeks',
        icon: BookOpen,
        color: 'emerald',
        desc: 'Master the basics of programming and logic building.',
        topics: [
            {
                title: 'Introduction to Programming',
                desc: 'How computers think, High-level vs Low-level languages, Compilation.',
                resources: [],
                content: {
                    introduction: "Programming is the art of telling a computer what to do. Before diving into syntax, it's crucial to understand how code is converted into machine instructions.",
                    keyConcepts: [
                        { label: 'Compiler', text: 'Translates the entire code into machine language at once (e.g., C++, Java).' },
                        { label: 'Interpreter', text: 'Translates code line-by-line (e.g., Python, JS).' },
                        { label: 'Algorithm', text: 'A step-by-step procedure to solve a problem.' }
                    ],
                    codeExamples: {
                        'C++': `// Your first program\n#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Hello, Future Engineer!" << endl;\n    return 0;\n}`,
                        'Java': `// Your first program\npublic class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Future Engineer!");\n    }\n}`,
                        'Python': `# Your first program\nprint("Hello, Future Engineer!")`
                    },
                    proTip: "Focus on logic, not syntax. Syntax stays 90% same across C++ and Java."
                }
            },
            {
                title: 'Variables, Data Types & I/O',
                desc: 'Storing data, Primitive types (int, float, char), Input/Output operations.',
                resources: [],
                content: {
                    introduction: "Variables are containers for storing data values. In strongly typed languages like C++ and Java, you must declare the type of variable.",
                    keyConcepts: [
                        { label: 'int', text: 'Stores whole numbers (e.g., 10, -5).' },
                        { label: 'float/double', text: 'Stores decimal numbers (e.g., 3.14).' },
                        { label: 'char', text: 'Stores single characters (e.g., "A").' },
                        { label: 'string', text: 'Stores text (e.g., "Placement Mode").' }
                    ],
                    codeExamples: {
                        'C++': `#include <iostream>\nusing namespace std;\n\nint main() {\n    int age = 20;\n    double gpa = 8.5;\n    cout << "Age: " << age << ", GPA: " << gpa << endl;\n    return 0;\n}`,
                        'Java': `public class Main {\n    public static void main(String[] args) {\n        int age = 20;\n        double gpa = 8.5;\n        System.out.println("Age: " + age + ", GPA: " + gpa);\n    }\n}`,
                        'Python': `age = 20\ngpa = 8.5\nprint(f"Age: {age}, GPA: {gpa}")`
                    }
                }
            },
            {
                title: 'Control Flow (If/Else & Switch)',
                desc: 'Making decisions in code based on conditions.',
                resources: [],
                content: {
                    introduction: "Control flow statements allow your program to take different paths based on conditions (true/false).",
                    keyConcepts: [
                        { label: 'if statement', text: 'Executes code ONLY if condition is true.' },
                        { label: 'else', text: 'Executes if the condition is false.' },
                        { label: 'switch', text: 'Selects one of many code blocks to be executed.' }
                    ],
                    codeExamples: {
                        'C++': `int marks = 85;\nif (marks >= 80) {\n    cout << "Grade: A";\n} else {\n    cout << "Grade: B";\n}`,
                        'Java': `int marks = 85;\nif (marks >= 80) {\n    System.out.println("Grade: A");\n} else {\n    System.out.println("Grade: B");\n}`,
                        'Python': `marks = 85\nif marks >= 80:\n    print("Grade: A")\nelse:\n    print("Grade: B")`
                    }
                }
            },
            {
                title: 'Loops & Iterations',
                desc: 'For, While, Do-While loops. Repeating tasks efficiently.',
                resources: [],
                content: {
                    introduction: "Loops let you repeat a block of code multiple times. This is essential for traversing arrays or performing repetitive tasks.",
                    keyConcepts: [
                        { label: 'for loop', text: 'Use when you know the number of iterations.' },
                        { label: 'while loop', text: 'Use when you want to loop until a condition is false.' },
                        { label: 'do-while', text: 'Executes the block AT LEAST once.' }
                    ],
                    codeExamples: {
                        'C++': `// Print 1 to 5\nfor(int i=1; i<=5; i++) {\n    cout << i << " ";\n}`,
                        'Java': `// Print 1 to 5\nfor(int i=1; i<=5; i++) {\n    System.out.print(i + " ");\n}`,
                        'Python': `# Print 1 to 5\nfor i in range(1, 6):\n    print(i, end=" ")`
                    }
                }
            },
            {
                title: 'Pattern Printing (Logic Building)',
                desc: 'Master nested loops by printing stars structures. Crucial for interviews.',
                resources: [],
                content: {
                    introduction: "Pattern printing is the gym for your logic muscles. It forces you to understand how 'rows' (outer loop) and 'columns' (inner loop) interact.",
                    keyConcepts: [
                        { label: 'Outer Loop', text: 'Controls the number of rows.' },
                        { label: 'Inner Loop', text: 'Controls the content of each row (spaces/stars).' }
                    ],
                    codeExamples: {
                        'C++': `/*\nSquare Pattern:\n***\n***\n***\n*/\nfor(int i=0; i<3; i++) {\n    for(int j=0; j<3; j++) {\n        cout << "*";\n    }\n    cout << endl;\n}`,
                        'Java': `for(int i=0; i<3; i++) {\n    for(int j=0; j<3; j++) {\n        System.out.print("*");\n    }\n    System.out.println();\n}`,
                        'Python': `for i in range(3):\n    for j in range(3):\n        print("*", end="")\n    print()`
                    },
                    proTip: "Try to derive the mathematical relation between Row Number (i) and count of stars."
                }
            },
            {
                title: 'Functions & Scope',
                desc: 'Modular programming, Parameters, Return values.',
                resources: [],
                content: {
                    introduction: "Functions help break complex problems into smaller, manageable chunks. They promote code reusability.",
                    keyConcepts: [
                        { label: 'Declaration', text: 'Telling compiler about the function name and type.' },
                        { label: 'Definition', text: 'The actual body of the code.' },
                        { label: 'Scope', text: 'Where variables are visible (Local vs Global).' }
                    ],
                    codeExamples: {
                        'C++': `int add(int a, int b) {\n    return a + b;\n}\n\nint main() {\n    cout << add(5, 3); // Outputs 8\n}`,
                        'Java': `public static int add(int a, int b) {\n    return a + b;\n}\n\npublic static void main(String[] args) {\n    System.out.println(add(5, 3));\n}`,
                        'Python': `def add(a, b):\n    return a + b\n\nprint(add(5, 3))`
                    }
                }
            },
            {
                title: 'Basic Maths for Coding',
                desc: 'Count digits, Palindrome check, GCD/HCF, Armstrong numbers.',
                resources: [],
                content: {
                    introduction: "Mathematical logic is the backbone of efficient algorithms. Mastering these basics will help you solve complex problems later.",
                    keyConcepts: [
                        { label: 'Digit Extraction', text: 'Using modulo (%) and division (/) to extract digits from a number.' },
                        { label: 'GCD/HCF', text: 'Euclidean Algorithm for finding the greatest common divisor.' },
                        { label: 'Prime Check', text: 'Efficiently checking if a number is prime up to its square root.' }
                    ],
                    codeExamples: {
                        'C++': `int countDigits(int n) {\n    int count = 0;\n    while(n > 0) {\n        n /= 10;\n        count++;\n    }\n    return count;\n}`,
                        'Java': `public static int countDigits(int n) {\n    int count = 0;\n    while(n > 0) {\n        n /= 10;\n        count++;\n    }\n    return count;\n}`,
                        'Python': `def count_digits(n):\n    return len(str(n))`
                    }
                }
            },
            {
                title: 'Basic Recursion',
                desc: 'Understanding function calls, Base cases, and Stack memory.',
                resources: [],
                content: {
                    introduction: "Recursion is when a function calls itself. It's a powerful tool for solving problems that can be broken down into smaller sub-problems.",
                    keyConcepts: [
                        { label: 'Base Case', text: 'The condition where the recursion stops.' },
                        { label: 'Recursive Step', text: 'The part where the function calls itself with a smaller input.' },
                        { label: 'Stack Overflow', text: 'Error when recursion depth exceeds memory limits.' }
                    ],
                    codeExamples: {
                        'C++': `void printName(int i, int n) {\n    if(i > n) return;\n    cout << "Placement Mode" << endl;\n    printName(i + 1, n);\n}`,
                        'Java': `void printName(int i, int n) {\n    if(i > n) return;\n    System.out.println("Placement Mode");\n    printName(i + 1, n);\n}`,
                        'Python': `def print_name(i, n):\n    if i > n: return\n    print("Placement Mode")\n    print_name(i + 1, n)`
                    }
                }
            },
            {
                title: 'Hashing Basics',
                desc: 'Frequency counting, Map vs Unordered Map, Collision handling.',
                resources: [],
                content: {
                    introduction: "Hashing is a technique to store and retrieve data in O(1) time. It's widely used for counting frequencies and searching.",
                    keyConcepts: [
                        { label: 'Hash Map', text: 'Key-value pair storage.' },
                        { label: 'Collision', text: 'When two keys map to the same index.' },
                        { label: 'Time Complexity', text: 'Search and Insert are generally O(1).' }
                    ],
                    codeExamples: {
                        'C++': `unordered_map<int, int> mpp;\nfor(int i=0; i<n; i++) mpp[arr[i]]++;`,
                        'Java': `HashMap<Integer, Integer> map = new HashMap<>();\nfor(int i : arr) map.put(i, map.getOrDefault(i, 0) + 1);`,
                        'Python': `hash_map = {}\nfor x in arr: hash_map[x] = hash_map.get(x, 0) + 1`
                    }
                }
            }
        ]
    },
    {
        id: 'dsa',
        title: 'Phase 2: DSA Mastery',
        timeframe: 'Intermediate',
        idealTime: 'Year 3 (Sem 5)',
        fastTrack: '2 Months',
        icon: Code,
        color: 'brand-orange',
        desc: 'Deep dive into Data Structures and Algorithms.',
        topics: [
            { title: 'Sorting Techniques', desc: 'Selection, Bubble, Insertion, Merge, Quick Sort.', resources: [] },
            { title: 'Arrays (Basic -> Hard)', desc: 'From Kadane\'s to 2D Matrix rotations.', resources: [] },
            { title: 'Binary Search Mastery', desc: '1D, 2D arrays, and BS on Answer space.', resources: [] },
            { title: 'String Manipulation', desc: 'Pattern matching, Reverse words, Outermost parenthesis.', resources: [] },
            { title: 'Linked List Deep Dive', desc: 'Singly, Doubly, Medium/Hard LL problems.', resources: [] },
            { title: 'Advanced Recursion', desc: 'Subset sums, Palindrome partitioning, Power sets.', resources: [] },
            { title: 'Bit Manipulation', desc: 'XOR properties, Set/Unset bits, Power of 2.', resources: [] },
            { title: 'Stacks & Queues', desc: 'Monotonic stack, Postfix/Infix, Implementation.', resources: [] },
            { title: 'Sliding Window', desc: 'Constant window, Variable window, Two pointers.', resources: [] },
            { title: 'Heaps & Priority Queues', desc: 'Kth largest, Merge K sorted, Task scheduler.', resources: [] },
            { title: 'Greedy Algorithms', desc: 'N meetings, Fractional Knapsack, Jump Game.', resources: [] },
            { title: 'Binary Trees', desc: 'Traversals, View, Path, Lowest Common Ancestor.', resources: [] },
            { title: 'Binary Search Trees', desc: 'Floor/Ceil, Inorder Successor, Balanced BST.', resources: [] },
            { title: 'Graphs (BFS/DFS)', desc: 'Topo Sort, Dijkstra, Disjoint Set, Bridges/Articulation.', resources: [] },
            { title: 'Dynamic Programming', desc: 'Grid DP, Subsequences, Stocks, LIS, MCM.', resources: [] },
            { title: 'Tries (Prefix Trees)', desc: 'Insert, Search, Prefix count, Bitwise Trie.', resources: [] }
        ]
    },
    {
        id: 'dev',
        title: 'Phase 3: Development',
        timeframe: 'Advanced',
        idealTime: 'Year 3 (Sem 6)',
        fastTrack: '1 Month',
        icon: Layers,
        color: 'indigo',
        desc: 'Build real-world projects to showcase your skills.',
        topics: [
            { title: 'Frontend Basics', desc: 'HTML5, CSS3, JavaScript (ES6+).', resources: [] },
            { title: 'React.js / Next.js', desc: 'Components, State, Hooks, Routing.', resources: [] },
            { title: 'Backend Fundamentals', desc: 'Node.js, Express, REST APIs.', resources: [] },
            { title: 'Databases', desc: 'MongoDB (NoSQL) vs PostgreSQL (SQL).', resources: [] }
        ]
    },
    {
        id: 'core',
        title: 'Phase 4: CS Core',
        timeframe: 'Expert',
        idealTime: 'Year 4 (Sem 7)',
        fastTrack: '2 Weeks',
        icon: Briefcase,
        color: 'slate',
        desc: 'Essential CS subjects asked in technical interviews.',
        topics: [
            { title: 'Operating Systems', desc: 'Process Management, Deadlocks, Paging.', resources: [] },
            { title: 'DBMS', desc: 'ACID Properties, Normalization, SQL Queries.', resources: [] },
            { title: 'Computer Networks', desc: 'OSI Model, TCP/IP, HTTP/HTTPS.', resources: [] },
            { title: 'OOPS', desc: 'Polymorphism, Inheritance, Encapsulation.', resources: [] }
        ]
    },
    {
        id: 'interview',
        title: 'Phase 5: Interview Prep',
        timeframe: 'Final',
        idealTime: 'Year 4 (Sem 8)',
        fastTrack: 'Ongoing',
        icon: MessageSquare,
        color: 'slate',
        desc: 'Final polish: Resumes, Mocks, and HR rounds.',
        topics: [
            { title: 'Resume Building', desc: 'ATS Optimization, Project Descriptions.', resources: [] },
            { title: 'Mock Interviews', desc: 'Peer-to-peer and Expert mocks.', resources: [] },
            { title: 'Behavioral Round', desc: 'STAR Method, Weaknesses/Strengths.', resources: [] }
        ]
    }
];
