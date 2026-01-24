/**
 * Roadmap Generator Service
 * Generates customized learning roadmaps based on selected subjects and days
 */

// Comprehensive topic database for each subject
const subjectTopics = {
  DSA: [
    { topic: 'Arrays & Strings', subtopics: ['Array basics', 'Two pointers', 'Sliding window', 'String manipulation', 'Pattern matching'] },
    { topic: 'Linked Lists', subtopics: ['Singly linked list', 'Doubly linked list', 'Circular linked list', 'Floyd\'s cycle detection', 'Merge and reverse operations'] },
    { topic: 'Stacks & Queues', subtopics: ['Stack implementation', 'Queue implementation', 'Monotonic stack', 'Deque', 'Priority queue basics'] },
    { topic: 'Recursion & Backtracking', subtopics: ['Recursion basics', 'Subset generation', 'Permutations', 'N-Queens', 'Sudoku solver'] },
    { topic: 'Trees - Basics', subtopics: ['Binary tree traversals', 'BST operations', 'Tree construction', 'Lowest common ancestor', 'Tree views'] },
    { topic: 'Trees - Advanced', subtopics: ['AVL trees', 'Segment trees', 'Fenwick tree', 'Trie data structure', 'N-ary trees'] },
    { topic: 'Graphs - Basics', subtopics: ['Graph representation', 'BFS traversal', 'DFS traversal', 'Connected components', 'Cycle detection'] },
    { topic: 'Graphs - Advanced', subtopics: ['Dijkstra\'s algorithm', 'Bellman-Ford', 'Floyd-Warshall', 'Kruskal\'s MST', 'Prim\'s MST'] },
    { topic: 'Dynamic Programming - Basics', subtopics: ['Fibonacci variations', 'Climbing stairs', '0/1 Knapsack', 'Coin change', 'Longest common subsequence'] },
    { topic: 'Dynamic Programming - Advanced', subtopics: ['Matrix chain multiplication', 'Edit distance', 'Longest increasing subsequence', 'Palindrome partitioning', 'DP on trees'] },
    { topic: 'Greedy Algorithms', subtopics: ['Activity selection', 'Fractional knapsack', 'Huffman coding', 'Job sequencing', 'Minimum platforms'] },
    { topic: 'Heaps & Priority Queues', subtopics: ['Min/Max heap', 'Heap sort', 'K-th largest element', 'Merge K sorted arrays', 'Median in stream'] },
    { topic: 'Hashing', subtopics: ['Hash map basics', 'Hash set', 'Two sum variations', 'Longest consecutive sequence', 'Subarray sum equals K'] },
    { topic: 'Sorting & Searching', subtopics: ['Quick sort', 'Merge sort', 'Binary search', 'Search in rotated array', 'Median of two sorted arrays'] },
    { topic: 'Bit Manipulation', subtopics: ['Bitwise operators', 'Single number problems', 'Power of two', 'Count set bits', 'XOR properties'] },
    { topic: 'Advanced Topics', subtopics: ['Union-Find (Disjoint Set)', 'Topological sort', 'Strongly connected components', 'Articulation points', 'Bridges in graph'] }
  ],
  
  OS: [
    { topic: 'Introduction to OS', subtopics: ['OS structure', 'System calls', 'OS services', 'Types of OS', 'Kernel modes'] },
    { topic: 'Process Management', subtopics: ['Process concept', 'Process states', 'Process control block', 'Context switching', 'Process creation'] },
    { topic: 'CPU Scheduling', subtopics: ['FCFS scheduling', 'SJF scheduling', 'Priority scheduling', 'Round robin', 'Multilevel queue'] },
    { topic: 'Process Synchronization', subtopics: ['Critical section problem', 'Peterson\'s solution', 'Semaphores', 'Mutex locks', 'Monitors'] },
    { topic: 'Deadlocks', subtopics: ['Deadlock conditions', 'Resource allocation graph', 'Deadlock prevention', 'Deadlock avoidance', 'Banker\'s algorithm'] },
    { topic: 'Memory Management', subtopics: ['Contiguous allocation', 'Paging', 'Segmentation', 'Virtual memory', 'Page replacement algorithms'] },
    { topic: 'File Systems', subtopics: ['File concept', 'Directory structure', 'File allocation methods', 'Free space management', 'Disk scheduling'] },
    { topic: 'I/O Systems', subtopics: ['I/O hardware', 'I/O software layers', 'Buffering', 'Spooling', 'Device drivers'] }
  ],
  
  DBMS: [
    { topic: 'Database Basics', subtopics: ['Database concepts', 'DBMS architecture', 'Data models', 'Schema vs instance', 'Database users'] },
    { topic: 'ER Model', subtopics: ['Entity sets', 'Relationships', 'Attributes', 'Keys', 'ER diagram notation'] },
    { topic: 'Relational Model', subtopics: ['Relational schema', 'Relational algebra', 'Tuple calculus', 'Domain calculus', 'Integrity constraints'] },
    { topic: 'SQL - Basics', subtopics: ['DDL commands', 'DML commands', 'SELECT queries', 'WHERE clause', 'Aggregate functions'] },
    { topic: 'SQL - Advanced', subtopics: ['Joins (INNER, OUTER, CROSS)', 'Subqueries', 'Views', 'Stored procedures', 'Triggers'] },
    { topic: 'Normalization', subtopics: ['Functional dependencies', '1NF, 2NF, 3NF', 'BCNF', 'Decomposition', 'Lossless join'] },
    { topic: 'Transactions', subtopics: ['ACID properties', 'Transaction states', 'Serializability', 'Concurrency control', 'Lock-based protocols'] },
    { topic: 'Indexing & Hashing', subtopics: ['Indexing basics', 'B-trees', 'B+ trees', 'Hashing techniques', 'Bitmap indexing'] },
    { topic: 'Query Optimization', subtopics: ['Query processing', 'Cost estimation', 'Join algorithms', 'Query plans', 'Optimization techniques'] }
  ],
  
  CN: [
    { topic: 'Network Basics', subtopics: ['Network types', 'Network topology', 'Network protocols', 'Switching techniques', 'Network devices'] },
    { topic: 'OSI Model', subtopics: ['Physical layer', 'Data link layer', 'Network layer', 'Transport layer', 'Application layer'] },
    { topic: 'TCP/IP Model', subtopics: ['TCP/IP layers', 'IPv4 addressing', 'IPv6 addressing', 'Subnetting', 'CIDR notation'] },
    { topic: 'Data Link Layer', subtopics: ['Framing', 'Error detection (CRC, Checksum)', 'Flow control', 'MAC protocols', 'Ethernet'] },
    { topic: 'Network Layer', subtopics: ['IP protocol', 'Routing algorithms', 'ICMP', 'ARP', 'NAT'] },
    { topic: 'Transport Layer', subtopics: ['TCP protocol', 'UDP protocol', 'Port numbers', 'Flow control', 'Congestion control'] },
    { topic: 'Application Layer', subtopics: ['HTTP/HTTPS', 'DNS', 'FTP', 'SMTP', 'DHCP'] },
    { topic: 'Network Security', subtopics: ['Cryptography basics', 'SSL/TLS', 'Firewalls', 'VPN', 'Authentication protocols'] }
  ],
  
  SD: [
    { topic: 'System Design Basics', subtopics: ['Scalability', 'Reliability', 'Availability', 'Performance metrics', 'Trade-offs'] },
    { topic: 'Networking Fundamentals', subtopics: ['HTTP/HTTPS', 'TCP vs UDP', 'DNS', 'Load balancers', 'CDN'] },
    { topic: 'Databases', subtopics: ['SQL vs NoSQL', 'Sharding', 'Replication', 'Partitioning', 'Database indexing'] },
    { topic: 'Caching', subtopics: ['Cache strategies', 'CDN caching', 'Application caching', 'Cache invalidation', 'Redis/Memcached'] },
    { topic: 'Microservices', subtopics: ['Monolith vs Microservices', 'Service discovery', 'API Gateway', 'Message queues', 'Event-driven architecture'] },
    { topic: 'Data Storage', subtopics: ['File storage', 'Block storage', 'Object storage', 'Data warehousing', 'Data lakes'] },
    { topic: 'Design Patterns', subtopics: ['Singleton', 'Factory', 'Observer', 'Strategy', 'Repository pattern'] },
    { topic: 'Real-world Systems', subtopics: ['URL shortener design', 'Rate limiter', 'Twitter/Instagram feed', 'Notification service', 'Chat application'] }
  ]
};

/**
 * Generate a roadmap based on selected subjects and total days
 * @param {Array} subjects - Array of subject codes (e.g., ['DSA', 'OS'])
 * @param {Number} totalDays - Total number of days for the roadmap
 * @returns {Array} - Array of daily tasks
 */
function generateRoadmap(subjects, totalDays) {
  const dailyTasks = [];
  
  // Calculate topics per subject based on number of subjects selected
  const topicsPerSubject = {};
  let totalTopics = 0;
  
  // Count total topics across selected subjects
  subjects.forEach(subject => {
    const topicCount = subjectTopics[subject].length;
    topicsPerSubject[subject] = topicCount;
    totalTopics += topicCount;
  });
  
  // Distribute days proportionally among subjects
  const daysPerSubject = {};
  subjects.forEach(subject => {
    const proportion = topicsPerSubject[subject] / totalTopics;
    daysPerSubject[subject] = Math.max(1, Math.round(totalDays * proportion));
  });
  
  // Adjust if total doesn't match (due to rounding)
  let allocatedDays = Object.values(daysPerSubject).reduce((a, b) => a + b, 0);
  if (allocatedDays < totalDays) {
    // Add remaining days to first subject
    daysPerSubject[subjects[0]] += (totalDays - allocatedDays);
  } else if (allocatedDays > totalDays) {
    // Remove excess days from largest allocation
    const maxSubject = Object.keys(daysPerSubject).reduce((a, b) => 
      daysPerSubject[a] > daysPerSubject[b] ? a : b
    );
    daysPerSubject[maxSubject] -= (allocatedDays - totalDays);
  }
  
  let currentDay = 1;
  
  // Generate tasks for each subject
  subjects.forEach(subject => {
    const topics = subjectTopics[subject];
    const days = daysPerSubject[subject];
    const topicsCount = topics.length;
    
    // Calculate days per topic
    const daysPerTopic = days / topicsCount;
    
    topics.forEach((topicData, index) => {
      const topicDays = Math.max(1, Math.round(daysPerTopic));
      
      for (let i = 0; i < topicDays; i++) {
        if (currentDay > totalDays) break;
        
        dailyTasks.push({
          day: currentDay,
          subject: subject,
          topic: topicData.topic,
          subtopics: topicData.subtopics,
          estimatedTime: getEstimatedTime(subject, topicData.topic),
          resources: getResources(subject, topicData.topic),
          isCompleted: false
        });
        
        currentDay++;
      }
    });
  });
  
  // If we still haven't filled all days, cycle through subjects again
  while (currentDay <= totalDays) {
    subjects.forEach(subject => {
      if (currentDay > totalDays) return;
      
      const topics = subjectTopics[subject];
      const randomTopic = topics[Math.floor(Math.random() * topics.length)];
      
      dailyTasks.push({
        day: currentDay,
        subject: subject,
        topic: `${randomTopic.topic} - Practice`,
        subtopics: ['Problem solving', 'Mock tests', 'Revision'],
        estimatedTime: '2-3 hours',
        resources: [],
        isCompleted: false
      });
      
      currentDay++;
    });
  }
  
  return dailyTasks.slice(0, totalDays); // Ensure exactly totalDays tasks
}

/**
 * Get estimated time for a topic based on difficulty
 */
function getEstimatedTime(subject, topic) {
  const advancedKeywords = ['Advanced', 'Dynamic Programming', 'Graphs', 'Optimization', 'Design'];
  const isAdvanced = advancedKeywords.some(keyword => topic.includes(keyword));
  
  return isAdvanced ? '3-4 hours' : '2-3 hours';
}

/**
 * Get recommended resources for a topic
 */
function getResources(subject, topic) {
  const resourceMap = {
    DSA: [
      { title: 'GeeksforGeeks', link: 'https://www.geeksforgeeks.org' },
      { title: 'LeetCode', link: 'https://leetcode.com' },
      { title: 'YouTube - Abdul Bari', link: 'https://www.youtube.com/@abdul_bari' }
    ],
    OS: [
      { title: 'GeeksforGeeks OS', link: 'https://www.geeksforgeeks.org/operating-systems' },
      { title: 'YouTube - Gate Smashers', link: 'https://www.youtube.com/@GateSmashers' }
    ],
    DBMS: [
      { title: 'GeeksforGeeks DBMS', link: 'https://www.geeksforgeeks.org/dbms' },
      { title: 'YouTube - Gate Smashers', link: 'https://www.youtube.com/@GateSmashers' }
    ],
    CN: [
      { title: 'GeeksforGeeks CN', link: 'https://www.geeksforgeeks.org/computer-network-tutorials' },
      { title: 'YouTube - Gate Smashers', link: 'https://www.youtube.com/@GateSmashers' }
    ],
    SD: [
      { title: 'System Design Primer', link: 'https://github.com/donnemartin/system-design-primer' },
      { title: 'YouTube - Gaurav Sen', link: 'https://www.youtube.com/@gkcs' }
    ]
  };
  
  return resourceMap[subject] || [];
}

module.exports = { generateRoadmap };
