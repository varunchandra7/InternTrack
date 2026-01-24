/**
 * AI-Powered Roadmap Generator using Google Gemini
 * Generates personalized learning roadmaps based on selected subjects and days
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Generate AI-powered roadmap
 * @param {Array} subjects - Array of subject codes (e.g., ['DSA', 'OS'])
 * @param {Number} totalDays - Total number of days for the roadmap
 * @param {String} skillLevel - User's skill level (beginner/intermediate/advanced)
 * @returns {Array} - Array of daily tasks
 */
async function generateAIRoadmap(subjects, totalDays, skillLevel = 'intermediate') {
  try {
    // Get the generative model (using gemini-2.0-flash-exp which is currently available)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Create subject mapping for full names
    const subjectNames = {
      'DSA': 'Data Structures & Algorithms',
      'OS': 'Operating Systems',
      'DBMS': 'Database Management Systems',
      'CN': 'Computer Networks',
      'SD': 'System Design'
    };

    // Build the prompt
    const prompt = `You are an expert educator creating a comprehensive ${totalDays}-day learning roadmap.

**Subjects to cover:** ${subjects.map(s => subjectNames[s]).join(', ')}
**Skill Level:** ${skillLevel}
**Duration:** ${totalDays} days

Create a day-by-day learning plan that:
1. Distributes topics evenly across ${totalDays} days
2. Progresses from basics to advanced concepts
3. Includes specific subtopics for each day
4. Suggests estimated time (2-4 hours per day)
5. Balances between different subjects

**IMPORTANT: Return ONLY valid JSON (no markdown, no code blocks, no explanations)**

Return a JSON array with exactly ${totalDays} objects in this format:
[
  {
    "day": 1,
    "subject": "DSA",
    "topic": "Arrays Fundamentals",
    "subtopics": ["Array declaration", "Array traversal", "Basic operations", "Two pointer technique"],
    "estimatedTime": "2-3 hours"
  }
]

Rules:
- Each object must have: day (number 1-${totalDays}), subject (one of: ${subjects.join(', ')}), topic (string), subtopics (array of 3-5 strings), estimatedTime (string)
- Cover all subjects proportionally
- Progress logically from fundamentals to advanced topics
- Return ONLY the JSON array, nothing else`;

    // Generate content
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();

    // Clean the response - remove markdown code blocks if present
    text = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

    // Parse the JSON response
    let dailyTasks;
    try {
      dailyTasks = JSON.parse(text);
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      throw new Error('AI generated invalid response format');
    }

    // Validate and format the response
    if (!Array.isArray(dailyTasks) || dailyTasks.length === 0) {
      throw new Error('AI did not generate a valid roadmap');
    }

    // Ensure we have exactly totalDays tasks
    dailyTasks = dailyTasks.slice(0, totalDays);
    
    // Add isCompleted field and validate structure
    const formattedTasks = dailyTasks.map((task, index) => ({
      day: task.day || (index + 1),
      subject: task.subject || subjects[index % subjects.length],
      topic: task.topic || 'Learning Task',
      subtopics: Array.isArray(task.subtopics) ? task.subtopics : [],
      estimatedTime: task.estimatedTime || '2-3 hours',
      isCompleted: false
    }));

    // If AI didn't generate enough tasks, fill remaining with fallback
    while (formattedTasks.length < totalDays) {
      const currentDay = formattedTasks.length + 1;
      const subjectIndex = (currentDay - 1) % subjects.length;
      
      formattedTasks.push({
        day: currentDay,
        subject: subjects[subjectIndex],
        topic: `${subjectNames[subjects[subjectIndex]]} - Practice & Review`,
        subtopics: ['Practice problems', 'Concept revision', 'Mock tests'],
        estimatedTime: '2-3 hours',
        isCompleted: false
      });
    }

    console.log(`✅ AI generated ${formattedTasks.length} tasks for ${subjects.join(', ')}`);
    return formattedTasks;

  } catch (error) {
    console.error('❌ AI Roadmap Generation Error:', error.message);
    
    // Fallback to basic generation if AI fails
    console.log('⚠️ Falling back to basic roadmap generation');
    return generateFallbackRoadmap(subjects, totalDays);
  }
}

/**
 * Fallback roadmap generator (used if AI fails)
 */
function generateFallbackRoadmap(subjects, totalDays) {
  const basicTopics = {
    'DSA': [
      { topic: 'Arrays Fundamentals', subtopics: ['Array declaration and initialization', 'Array traversal techniques', 'Insertion and deletion', 'Two pointer technique', 'Sliding window basics'], time: '2-3 hours' },
      { topic: 'Array Problems', subtopics: ['Maximum subarray sum', 'Array rotation', 'Finding duplicates', 'Merge sorted arrays', 'Common element finding'], time: '3-4 hours' },
      { topic: 'Strings Basics', subtopics: ['String manipulation', 'Pattern matching', 'Palindrome checking', 'Anagrams', 'String compression'], time: '2-3 hours' },
      { topic: 'Linked Lists Introduction', subtopics: ['Singly linked list implementation', 'Insertion and deletion', 'Traversal techniques', 'Reversing a linked list', 'Detecting cycles'], time: '3-4 hours' },
      { topic: 'Linked List Problems', subtopics: ['Middle of linked list', 'Merge two sorted lists', 'Remove nth node', 'Intersection point', 'Clone with random pointer'], time: '3-4 hours' },
      { topic: 'Stacks', subtopics: ['Stack implementation', 'Push and pop operations', 'Balanced parentheses', 'Next greater element', 'Stock span problem'], time: '2-3 hours' },
      { topic: 'Queues', subtopics: ['Queue implementation', 'Circular queue', 'Deque', 'Priority queue basics', 'Queue using stacks'], time: '2-3 hours' },
      { topic: 'Recursion Basics', subtopics: ['Understanding recursion', 'Base case and recursive case', 'Fibonacci series', 'Factorial', 'Tower of Hanoi'], time: '2-3 hours' },
      { topic: 'Backtracking', subtopics: ['N-Queens problem', 'Sudoku solver', 'Permutations', 'Combinations', 'Subset generation'], time: '3-4 hours' },
      { topic: 'Binary Trees', subtopics: ['Tree traversals (Inorder, Preorder, Postorder)', 'Level order traversal', 'Height of tree', 'Diameter of tree', 'Symmetric tree'], time: '3-4 hours' },
      { topic: 'Binary Search Trees', subtopics: ['BST properties', 'Insertion and deletion', 'Search operation', 'Validate BST', 'Lowest common ancestor'], time: '2-3 hours' },
      { topic: 'Tree Problems', subtopics: ['Path sum problems', 'Serialize and deserialize', 'Construct tree from traversals', 'Binary tree to DLL', 'Vertical order traversal'], time: '3-4 hours' },
      { topic: 'Heaps', subtopics: ['Min heap and max heap', 'Heap operations', 'Heapify', 'Heap sort', 'Kth largest element'], time: '2-3 hours' },
      { topic: 'Hashing', subtopics: ['Hash table implementation', 'Collision handling', 'Two sum problem', 'Group anagrams', 'Longest consecutive sequence'], time: '2-3 hours' },
      { topic: 'Graphs Introduction', subtopics: ['Graph representation', 'Adjacency matrix and list', 'BFS traversal', 'DFS traversal', 'Connected components'], time: '3-4 hours' },
      { topic: 'Graph Algorithms', subtopics: ['Shortest path (Dijkstra)', 'Minimum spanning tree', 'Topological sort', 'Cycle detection', 'Bridges and articulation points'], time: '3-4 hours' },
      { topic: 'Dynamic Programming Basics', subtopics: ['Memoization vs tabulation', '0/1 Knapsack', 'Longest common subsequence', 'Coin change problem', 'Edit distance'], time: '3-4 hours' },
      { topic: 'DP on Arrays', subtopics: ['Maximum subarray sum', 'House robber', 'Jump game', 'Longest increasing subsequence', 'Matrix chain multiplication'], time: '3-4 hours' },
      { topic: 'Sorting Algorithms', subtopics: ['Bubble sort', 'Selection sort', 'Insertion sort', 'Merge sort', 'Quick sort'], time: '2-3 hours' },
      { topic: 'Searching Algorithms', subtopics: ['Linear search', 'Binary search', 'Search in rotated array', 'Find peak element', 'Search in 2D matrix'], time: '2-3 hours' },
      { topic: 'Bit Manipulation', subtopics: ['Bitwise operators', 'Count set bits', 'Power of two', 'Single number', 'Subset generation using bits'], time: '2-3 hours' },
      { topic: 'Greedy Algorithms', subtopics: ['Activity selection', 'Fractional knapsack', 'Job scheduling', 'Minimum platforms', 'Huffman coding'], time: '2-3 hours' },
      { topic: 'Advanced Trees', subtopics: ['AVL trees', 'Red-Black trees', 'Segment trees', 'Fenwick tree', 'Trie implementation'], time: '3-4 hours' },
      { topic: 'Advanced Graphs', subtopics: ['Floyd-Warshall', 'Bellman-Ford', 'Kruskal algorithm', 'Prim algorithm', 'Disjoint set union'], time: '3-4 hours' },
      { topic: 'String Algorithms', subtopics: ['KMP algorithm', 'Rabin-Karp', 'Z algorithm', 'Suffix arrays', 'Longest palindromic substring'], time: '3-4 hours' },
      { topic: 'Practice & Mock Tests', subtopics: ['Mixed problem solving', 'Timed practice', 'Interview questions', 'Code optimization', 'Revision'], time: '2-3 hours' }
    ],
    'OS': [
      { topic: 'Operating System Basics', subtopics: ['What is an OS', 'Types of OS', 'OS functions', 'System calls', 'OS structure'], time: '2-3 hours' },
      { topic: 'Process Management', subtopics: ['Process concept', 'Process states', 'Process control block', 'Context switching', 'Process creation'], time: '2-3 hours' },
      { topic: 'CPU Scheduling', subtopics: ['Scheduling criteria', 'FCFS scheduling', 'SJF scheduling', 'Round robin', 'Priority scheduling'], time: '2-3 hours' },
      { topic: 'Process Synchronization', subtopics: ['Critical section problem', 'Mutex locks', 'Semaphores', 'Monitors', 'Classical problems'], time: '3-4 hours' },
      { topic: 'Deadlocks', subtopics: ['Deadlock characterization', 'Deadlock prevention', 'Deadlock avoidance', 'Deadlock detection', 'Recovery from deadlock'], time: '2-3 hours' },
      { topic: 'Memory Management', subtopics: ['Logical vs physical address', 'Swapping', 'Contiguous allocation', 'Paging', 'Segmentation'], time: '3-4 hours' },
      { topic: 'Virtual Memory', subtopics: ['Demand paging', 'Page replacement algorithms', 'Thrashing', 'Working set model', 'Memory-mapped files'], time: '2-3 hours' },
      { topic: 'File Systems', subtopics: ['File concept', 'Access methods', 'Directory structure', 'File allocation methods', 'Free space management'], time: '2-3 hours' },
      { topic: 'I/O Systems', subtopics: ['I/O hardware', 'Polling vs interrupts', 'DMA', 'Disk scheduling', 'RAID'], time: '2-3 hours' },
      { topic: 'OS Review & Practice', subtopics: ['Interview questions', 'Concept revision', 'Practical scenarios', 'Mock tests', 'Problem solving'], time: '2-3 hours' }
    ],
    'DBMS': [
      { topic: 'Database Introduction', subtopics: ['Database concepts', 'DBMS vs file system', 'Database architecture', 'Data models', 'Database users'], time: '2-3 hours' },
      { topic: 'ER Model', subtopics: ['Entity and attributes', 'Relationships', 'ER diagrams', 'Cardinality', 'Participation constraints'], time: '2-3 hours' },
      { topic: 'Relational Model', subtopics: ['Relations and tuples', 'Keys (Primary, Foreign, Candidate)', 'Relational algebra', 'Domain constraints', 'Integrity constraints'], time: '2-3 hours' },
      { topic: 'SQL Basics', subtopics: ['DDL commands', 'DML commands', 'SELECT queries', 'WHERE clause', 'Aggregate functions'], time: '3-4 hours' },
      { topic: 'SQL Joins', subtopics: ['Inner join', 'Left join', 'Right join', 'Full outer join', 'Self join'], time: '2-3 hours' },
      { topic: 'Advanced SQL', subtopics: ['Subqueries', 'Views', 'Stored procedures', 'Triggers', 'Cursors'], time: '3-4 hours' },
      { topic: 'Normalization', subtopics: ['1NF, 2NF, 3NF', 'BCNF', 'Functional dependencies', 'Lossless decomposition', 'Denormalization'], time: '2-3 hours' },
      { topic: 'Transactions', subtopics: ['ACID properties', 'Transaction states', 'Commit and rollback', 'Concurrency control', 'Serializability'], time: '2-3 hours' },
      { topic: 'Concurrency Control', subtopics: ['Lock-based protocols', 'Two-phase locking', 'Timestamp ordering', 'Deadlock handling', 'Isolation levels'], time: '2-3 hours' },
      { topic: 'Indexing', subtopics: ['Index types', 'B-tree indexing', 'B+ tree indexing', 'Hash indexing', 'Bitmap indexing'], time: '2-3 hours' },
      { topic: 'Query Optimization', subtopics: ['Query processing', 'Query optimization techniques', 'Cost-based optimization', 'Execution plans', 'Query tuning'], time: '2-3 hours' },
      { topic: 'Database Design', subtopics: ['Schema design', 'Design patterns', 'Performance considerations', 'Scalability', 'Best practices'], time: '2-3 hours' },
      { topic: 'NoSQL Databases', subtopics: ['NoSQL vs SQL', 'Document stores', 'Key-value stores', 'Column-family stores', 'Graph databases'], time: '2-3 hours' },
      { topic: 'DBMS Review & Practice', subtopics: ['Interview questions', 'SQL practice', 'Concept revision', 'Mock tests', 'Real-world scenarios'], time: '2-3 hours' }
    ],
    'CN': [
      { topic: 'Computer Networks Basics', subtopics: ['Network definition', 'Network types (LAN, WAN, MAN)', 'Network topologies', 'Network protocols', 'Client-server model'], time: '2-3 hours' },
      { topic: 'OSI Model', subtopics: ['Seven layers of OSI', 'Physical layer', 'Data link layer', 'Network layer', 'Transport layer'], time: '2-3 hours' },
      { topic: 'TCP/IP Model', subtopics: ['TCP/IP layers', 'Comparison with OSI', 'IP addressing', 'Subnetting', 'CIDR'], time: '2-3 hours' },
      { topic: 'Data Link Layer', subtopics: ['Framing', 'Error detection', 'Error correction', 'Flow control', 'MAC protocols'], time: '2-3 hours' },
      { topic: 'Network Layer', subtopics: ['Routing algorithms', 'IP protocol', 'IPv4 vs IPv6', 'ICMP', 'ARP'], time: '2-3 hours' },
      { topic: 'Transport Layer', subtopics: ['TCP protocol', 'UDP protocol', 'Port numbers', 'Flow control', 'Congestion control'], time: '3-4 hours' },
      { topic: 'Application Layer', subtopics: ['HTTP/HTTPS', 'DNS', 'FTP', 'SMTP', 'Socket programming'], time: '2-3 hours' },
      { topic: 'Network Security', subtopics: ['Cryptography basics', 'SSL/TLS', 'Firewalls', 'VPN', 'Network attacks'], time: '2-3 hours' },
      { topic: 'Wireless Networks', subtopics: ['WiFi standards', 'Mobile networks', 'Bluetooth', 'Network protocols', 'Challenges'], time: '2-3 hours' },
      { topic: 'CN Review & Practice', subtopics: ['Interview questions', 'Protocol analysis', 'Network troubleshooting', 'Mock tests', 'Real scenarios'], time: '2-3 hours' }
    ],
    'SD': [
      { topic: 'System Design Fundamentals', subtopics: ['System design process', 'Requirements gathering', 'Capacity estimation', 'High-level design', 'Detailed design'], time: '2-3 hours' },
      { topic: 'Scalability Concepts', subtopics: ['Horizontal vs vertical scaling', 'Stateless architecture', 'Database partitioning', 'Replication', 'Consistency patterns'], time: '3-4 hours' },
      { topic: 'Load Balancing', subtopics: ['Load balancer types', 'Load balancing algorithms', 'Health checks', 'Session persistence', 'Global load balancing'], time: '2-3 hours' },
      { topic: 'Caching Strategies', subtopics: ['Cache types', 'Cache eviction policies', 'CDN', 'Redis/Memcached', 'Cache invalidation'], time: '2-3 hours' },
      { topic: 'Database Design', subtopics: ['SQL vs NoSQL', 'Database sharding', 'Master-slave replication', 'Multi-master replication', 'CAP theorem'], time: '3-4 hours' },
      { topic: 'Microservices', subtopics: ['Microservices architecture', 'Service discovery', 'API gateway', 'Inter-service communication', 'Event-driven architecture'], time: '3-4 hours' },
      { topic: 'Message Queues', subtopics: ['Queue vs topic', 'Kafka', 'RabbitMQ', 'Message ordering', 'At-least-once vs exactly-once'], time: '2-3 hours' },
      { topic: 'API Design', subtopics: ['RESTful APIs', 'GraphQL', 'API versioning', 'Rate limiting', 'Authentication/Authorization'], time: '2-3 hours' },
      { topic: 'System Design Practice', subtopics: ['Design URL shortener', 'Design Twitter', 'Design Instagram', 'Design Uber', 'Design WhatsApp'], time: '3-4 hours' },
      { topic: 'Advanced Topics', subtopics: ['Distributed systems', 'Consensus algorithms', 'Monitoring and logging', 'Disaster recovery', 'Performance optimization'], time: '3-4 hours' }
    ]
  };

  const tasks = [];
  let dayCounter = 1;

  // Calculate how to distribute days among subjects
  const daysPerSubject = Math.floor(totalDays / subjects.length);
  const extraDays = totalDays % subjects.length;
  
  subjects.forEach((subject, subjectIndex) => {
    const allTopics = basicTopics[subject] || [];
    const allocatedDays = daysPerSubject + (subjectIndex < extraDays ? 1 : 0);
    
    if (allocatedDays >= allTopics.length) {
      // We have more days than topics - use all topics
      allTopics.forEach((topicObj, idx) => {
        if (dayCounter <= totalDays) {
          tasks.push({
            day: dayCounter++,
            subject: subject,
            topic: topicObj.topic,
            subtopics: topicObj.subtopics,
            estimatedTime: topicObj.time,
            isCompleted: false
          });
        }
      });
    } else {
      // We have fewer days than topics - select evenly distributed topics
      const step = allTopics.length / allocatedDays;
      for (let i = 0; i < allocatedDays && dayCounter <= totalDays; i++) {
        const topicIndex = Math.floor(i * step);
        const topicObj = allTopics[topicIndex];
        tasks.push({
          day: dayCounter++,
          subject: subject,
          topic: topicObj.topic,
          subtopics: topicObj.subtopics,
          estimatedTime: topicObj.time,
          isCompleted: false
        });
      }
    }
  });

  // Fill any remaining days with revision
  while (dayCounter <= totalDays) {
    const subject = subjects[(dayCounter - 1) % subjects.length];
    tasks.push({
      day: dayCounter++,
      subject: subject,
      topic: 'Revision & Practice',
      subtopics: ['Review previous topics', 'Solve practice problems', 'Mock interviews', 'Concept consolidation', 'Doubt clearing'],
      estimatedTime: '2-3 hours',
      isCompleted: false
    });
  }

  console.log(`✅ Generated ${tasks.length} fallback tasks for ${subjects.join(', ')}`);
  return tasks;
}

module.exports = { generateAIRoadmap };
