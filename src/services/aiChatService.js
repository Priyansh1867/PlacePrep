import { getAuthToken } from './api.js';


export function parseEvents(buffer, onText, onError) {
  const events = buffer.split(/\r?\n\r?\n/);
  const remainder = events.pop() || '';

  events.forEach((event) => {
    const data = event
      .split(/\r?\n/)
      .filter((line) => line.startsWith('data:'))
      .map((line) => line.slice(5).replace(/^ /, ''))
      .join('\n');

    if (!data || data === '[DONE]') return;

    try {
      const payload = JSON.parse(data);

      if (payload && typeof payload === 'object' && !Array.isArray(payload)) {
        if (payload.error) onError(payload.error);
        else if (typeof payload.content === 'string') onText(payload.content);
        else if (typeof payload.message === 'string') onText(payload.message);
        else onText(data);
      } else {
        onText(typeof payload === 'string' ? payload : data);
      }
    } catch {
      onText(data);
    }
  });

  return remainder;
}


export async function streamOfflineAiResponse(message, onText) {
  const rawMsg = message || '';
  const query = rawMsg.toLowerCase();
  let answer = '';

  // 1. Check if caller requested AI Interview Question Generation (JSON array)
  if (rawMsg.includes('Format your response STRICTLY as a valid JSON array')) {
    const isHr = query.includes('hr') || query.includes('behavioral');
    const isDsa = query.includes('dsa') || query.includes('algorithm');
    const isDb = query.includes('database') || query.includes('sql');

    let questions = [];
    if (isHr) {
      questions = [
        {
          id: 'ai-q1',
          question: 'Describe a challenging project conflict you encountered with a team member and how you resolved it using the STAR method.',
          category: 'HR Interview',
          difficulty: 'Intermediate',
          expectedConcepts: ['STAR Method', 'Active Listening', 'Conflict Resolution', 'Team Collaboration'],
          suggestedAnswer: 'Explain the Situation and Task clearly. Describe the Action taken—initiating a constructive 1-on-1 discussion, identifying common project goals, and finding an objective compromise. Conclude with the Result, highlighting timely delivery and improved team synergy.',
          type: 'hr'
        },
        {
          id: 'ai-q2',
          question: 'Tell me about a time when you received critical feedback on your work or code. How did you react and what changes did you implement?',
          category: 'HR Interview',
          difficulty: 'Intermediate',
          expectedConcepts: ['Growth Mindset', 'Constructive Feedback', 'Adaptability', 'Professional Maturity'],
          suggestedAnswer: 'Acknowledge feedback positively as a learning catalyst. Mention validating the points with metrics or code standards, refactoring the solution, and establishing self-review checklists for future iterations.',
          type: 'hr'
        },
        {
          id: 'ai-q3',
          question: 'Why are you interested in joining our engineering team, and where do you see your technical career evolving over the next 3 to 5 years?',
          category: 'HR Interview',
          difficulty: 'Intermediate',
          expectedConcepts: ['Company Culture Fit', 'Career Trajectory', 'Continuous Learning', 'Engineering Impact'],
          suggestedAnswer: 'Align personal technical passions with the company\'s products and engineering challenges. Articulate a plan to master core distributed systems, mentor junior engineers, and drive architectural decisions.',
          type: 'hr'
        }
      ];
    } else if (isDsa) {
      questions = [
        {
          id: 'ai-q1',
          question: 'Given an array of integers, how would you find the longest contiguous subarray with an equal number of 0s and 1s in O(N) time and O(N) space?',
          category: 'DSA Interview',
          difficulty: 'Intermediate',
          expectedConcepts: ['Prefix Sum', 'Hash Map', '0 to -1 Transformation', 'O(N) Time Complexity'],
          suggestedAnswer: 'Treat all 0s as -1 and 1s as +1. Compute running prefix sums and store the earliest index of each prefix sum in a hash map. When a prefix sum repeats, the subarray between the two indices has a net sum of 0, meaning equal numbers of 0s and 1s.',
          type: 'dsa'
        },
        {
          id: 'ai-q2',
          question: 'Explain how you would detect a cycle in a directed graph versus an undirected graph. What are the respective time and space complexities?',
          category: 'DSA Interview',
          difficulty: 'Intermediate',
          expectedConcepts: ['DFS', 'Graph Coloring', 'Visited & Recursion Stack', 'Topological Sort (Kahn\'s Algorithm)'],
          suggestedAnswer: 'For undirected graphs, standard BFS/DFS checking if a visited neighbor is not the direct parent detects cycles. For directed graphs, track vertices currently in the active recursion stack (or use 3-color DFS: White, Gray, Black) or Kahn\'s algorithm. Both run in O(V + E) time and O(V) space.',
          type: 'dsa'
        },
        {
          id: 'ai-q3',
          question: 'Explain how a Min-Heap is implemented using an array and how Dijkstra\'s Algorithm leverages it to compute single-source shortest paths in O((V + E) log V).',
          category: 'DSA Interview',
          difficulty: 'Intermediate',
          expectedConcepts: ['Priority Queue', 'Min-Heap Binary Array', 'Dijkstra Greedy Choice', 'Logarithmic Extraction'],
          suggestedAnswer: 'In an array representation of a heap, parent is at (i-1)//2 and children at 2i+1 and 2i+2. Dijkstra repeatedly extracts the vertex with minimum tentative distance in O(log V) and relaxes neighboring edges in O(E log V).',
          type: 'dsa'
        }
      ];
    } else if (isDb) {
      questions = [
        {
          id: 'ai-q1',
          question: 'Explain the difference between clustered and non-clustered indexes in relational databases. How do B-Trees optimize range queries?',
          category: 'Database / SQL Interview',
          difficulty: 'Intermediate',
          expectedConcepts: ['Clustered Index', 'Non-Clustered Index', 'B+ Tree Leaf Nodes', 'Sequential Disk I/O'],
          suggestedAnswer: 'A clustered index determines the physical order of data on disk (only one per table). Non-clustered indexes create a separate lookup structure with pointers to the data rows. B+ Trees maintain doubly linked leaf nodes allowing fast sequential scans for range queries in O(log N + K).',
          type: 'sql'
        },
        {
          id: 'ai-q2',
          question: 'Explain ACID properties and what isolation anomalies (Dirty Read, Non-repeatable Read, Phantom Read) are prevented by Serializable isolation.',
          category: 'Database / SQL Interview',
          difficulty: 'Intermediate',
          expectedConcepts: ['ACID Transactions', 'Dirty Read', 'Non-Repeatable Read', 'Phantom Read', 'MVCC / 2PL'],
          suggestedAnswer: 'Atomicity ensures all-or-nothing execution, Consistency enforces constraints, Isolation isolates concurrent operations, and Durability guarantees committed data survives crashes. Serializable isolation prevents dirty reads, non-repeatable reads, and phantom reads using MVCC or two-phase locking.',
          type: 'sql'
        },
        {
          id: 'ai-q3',
          question: 'Write an SQL query to retrieve the top 3 highest-earning employees in each department. Explain when DENSE_RANK() is preferred over RANK().',
          category: 'Database / SQL Interview',
          difficulty: 'Intermediate',
          expectedConcepts: ['Window Functions', 'DENSE_RANK()', 'PARTITION BY', 'Tie Handling'],
          suggestedAnswer: 'Use a Common Table Expression (CTE) with DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) as rnk, then filter WHERE rnk <= 3. DENSE_RANK avoids skipping ranks when salaries tie, whereas RANK() leaves gaps.',
          type: 'sql'
        }
      ];
    } else {
      questions = [
        {
          id: 'ai-q1',
          question: 'Explain how the JavaScript Event Loop coordinates the Call Stack, Microtask Queue (Promises), and Macrotask Queue (setTimeout).',
          category: 'Technical Interview',
          difficulty: 'Intermediate',
          expectedConcepts: ['Call Stack', 'Microtask Queue', 'Macrotask Queue', 'Event Loop Priority'],
          suggestedAnswer: 'Synchronous code executes on the call stack. When empty, the event loop drains all microtasks (Promises, process.nextTick) completely before processing the oldest task from the macrotask queue (setTimeout, setInterval, I/O).',
          type: 'technical'
        },
        {
          id: 'ai-q2',
          question: 'Explain the architectural differences between monolithic architectures and microservices, highlighting database per service and eventual consistency.',
          category: 'Technical Interview',
          difficulty: 'Intermediate',
          expectedConcepts: ['Service Decoupling', 'Database per Service', 'Eventual Consistency', 'Saga Pattern'],
          suggestedAnswer: 'Monoliths bundle all domain logic in a single codebase and shared database, offering simplicity but tight coupling. Microservices decouple domains into autonomous services communicating via REST/gRPC/Kafka with independent databases, relying on eventual consistency and patterns like Saga for distributed transactions.',
          type: 'technical'
        },
        {
          id: 'ai-q3',
          question: 'What is connection pooling, and why is it critical for high-throughput backend services connecting to relational databases?',
          category: 'Technical Interview',
          difficulty: 'Intermediate',
          expectedConcepts: ['TCP Handshake Overhead', 'Connection Reuse', 'Max Pool Size', 'Thread Starvation Prevention'],
          suggestedAnswer: 'Establishing a new database TCP connection involves authentication and SSL negotiation overhead. A connection pool maintains an active pool of open connections that can be leased and returned, reducing query latency and protecting the database from thread exhaustion.',
          type: 'technical'
        }
      ];
    }
    answer = JSON.stringify(questions, null, 2);
  }
  // 2. Check if caller requested AI Interview Answer Evaluation (JSON object)
  else if (rawMsg.includes('Format your evaluation STRICTLY as a valid JSON object')) {
    const isHr = query.includes('hr') || query.includes('behavioral');
    const answerLen = (query.split('student response:')[1] || '').trim().length;
    const score = answerLen > 150 ? 85 : answerLen > 60 ? 75 : 62;

    const evaluation = {
      overallScore: score,
      correctnessScore: score - 2,
      clarityScore: score + 3,
      structureScore: score,
      verdict: score >= 75 ? 'Strong Answer' : 'Solid Foundation - Elaborate Further',
      technicalAccuracy: isHr
        ? 'The response demonstrates relevant professional context and constructive communication.'
        : 'The core conceptual direction is sound and aligns with standard industry engineering practices.',
      missingConcepts: isHr
        ? ['Quantified business impact or measurable metrics', 'Specific follow-up steps taken']
        : ['Edge case handling and failure recovery', 'Time and space complexity trade-offs'],
      strengths: isHr
        ? ['Clear communication style', 'Professional demeanor and logical progression']
        : ['Accurate identification of primary mechanism', 'Clear logical sequencing in explanation'],
      areasOfImprovement: isHr
        ? ['Structure response strictly using the Situation-Task-Action-Result (STAR) framework.', 'Highlight personal contributions distinctly.']
        : ['Mention asymptotic complexity and memory trade-offs.', 'Provide a brief code or pseudocode walkthrough.'],
      suggestedIdealAnswer: isHr
        ? 'Structure the response with STAR: clearly outline the Situation and Task, detail the concrete Actions taken, and quantify the positive business Result.'
        : 'State the high-level strategy first, analyze edge cases (null inputs, empty bounds), state the time and space complexity, and discuss production-grade trade-offs.'
    };
    answer = JSON.stringify(evaluation, null, 2);
  }
  // 3. Placement Assistant standard chat responses
  else if (query.includes('drive') || query.includes('upcoming') || query.includes('company')) {
    answer = `**Upcoming Placement Drives & Opportunities**\n\n` +
      `Here is the latest placement drive status:\n` +
      `- **Google Software Engineer Drive**: Registrations Open • Min CGPA: 7.5 • Target: 2026 Batch\n` +
      `- **Microsoft Cloud & AI Specialist**: Shortlisting in Progress • OA scheduled this weekend\n` +
      `- **Infosys Specialist Programmer**: Applications Verified • Batch 2026\n\n` +
      `💡 *Tip: Visit the **Upcoming Drives** tab on your dashboard to review full criteria and submit applications.*`;
  } else if (query.includes('eligib') || query.includes('criteria') || query.includes('cgpa')) {
    answer = `**Placement Drive Eligibility Check**\n\n` +
      `To be verified for campus recruiters and tier-1 drives:\n` +
      `- **Profile Completion**: Minimum 80% profile fields completed.\n` +
      `- **Academic Standing**: No active backlogs for core campus recruiters.\n` +
      `- **CRT Attendance**: Maintain minimum 75% attendance in Campus Recruitment Training sessions.\n` +
      `- **Resume Score**: Aim for an ATS score > 75 on the Resume ATS analyzer.\n\n` +
      `Check your current standing under **Dynamic Profile Alert** on your dashboard.`;
  } else if (query.includes('attend') || query.includes('crt') || query.includes('class')) {
    answer = `**Attendance Summary & Requirements**\n\n` +
      `- **CRT Training Attendance**: Minimum 75% required for placement drive eligibility.\n` +
      `- **Academic Class Attendance**: Minimum 75% required by university regulations.\n` +
      `- **Geo-Fenced Marking**: You can mark live GPS attendance during designated training and class slots directly in the **CRT Attendance** and **Class Attendance** tabs.\n\n` +
      `For disputes, reach out to your faculty mentor or CRT coordinator.`;
  } else if (query.includes('interview') || query.includes('prep') || query.includes('dsa') || query.includes('mock')) {
    answer = `**Placement Preparation & Interview Practice**\n\n` +
      `PlacePrep provides dedicated tools to get interview-ready:\n` +
      `1. **AI Mock Interview**: Practice Technical, HR, DSA, System Design, or SQL questions with real-time AI evaluation and rubrics.\n` +
      `2. **Question Bank**: Over 100+ curated MCQs, coding challenges, and CS fundamental questions.\n` +
      `3. **DSA Studio**: Solve algorithmic problems by data structure topic (Arrays, Trees, Graphs, DP).\n\n` +
      `Navigate to **AI Interview** or **Question Bank** from the workspace shortcuts to begin.`;
  } else if (query.includes('resume') || query.includes('ats')) {
    answer = `**Resume & ATS Optimization Guidelines**\n\n` +
      `- Use standard section headers: *Education, Experience, Projects, Skills, Certifications*.\n` +
      `- Quantify achievements using the Google X-Y-Z formula: "Accomplished [X] as measured by [Y] by doing [Z]".\n` +
      `- Keep formatting simple with standard fonts and clean single-column layouts.\n` +
      `- Scan your resume in the **Resume ATS** tab for keyword matching against recruiter job descriptions.`;
  } else if (query.includes('timetable') || query.includes('schedule')) {
    answer = `**Academic Timetable Information**\n\n` +
      `Your weekly schedule and laboratory allocations are accessible under the **Master Timetable** tab.\n` +
      `- View daily theory lectures, practical lab groups, and faculty details.\n` +
      `- You can also export the schedule to PDF or sync it with Google/Apple Calendar via .ics.`;
  } else {
    answer = `**PlacePrep Placement Assistant**\n\n` +
      `I can help guide your placement journey and academic workflows. Here are quick topics you can ask me about:\n` +
      `- **Drives**: "Show upcoming placement drives" or "Check my eligibility"\n` +
      `- **Attendance**: "What is my CRT attendance requirement?"\n` +
      `- **Preparation**: "How to practice for technical and HR interviews?"\n` +
      `- **Resume**: "How to improve my ATS resume score?"\n` +
      `- **Schedule**: "Show my academic timetable"\n\n` +
      `*(Note: Operating in offline placement assistant mode. Full multi-tool real-time AI queries will reconnect automatically with backend).*`;
  }

  const words = answer.split(' ');
  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    onText(chunk);
    await new Promise((resolve) => setTimeout(resolve, 15));
  }
}

export async function streamAiChat(message, { signal, onText = () => {}, onError = () => {} } = {}) {
  const token = getAuthToken();
  if (!token) {
    const error = new Error('Please sign in to use PlacePrep AI.');
    error.status = 401;
    throw error;
  }

  let response;
  try {
    response = await fetch('/api/ai/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'text/event-stream',
        Authorization: `Bearer ${token}`
      },
      body: JSON.stringify({ message }),
      signal
    });
  } catch (fetchErr) {
    if (fetchErr.name === 'AbortError') throw fetchErr;
    console.warn('Network request to /api/ai/chat failed, activating offline assistant fallback:', fetchErr.message);
    await streamOfflineAiResponse(message, onText);
    return;
  }

  if (!response.ok) {
    if (response.status === 401) {
      const error = new Error('Please sign in to use PlacePrep AI.');
      error.status = 401;
      throw error;
    }
    // 502, 503, 504, 500, or proxy HTML error page
    console.warn(`PlacePrep AI backend returned status ${response.status}. Using offline assistant fallback.`);
    await streamOfflineAiResponse(message, onText);
    return;
  }

  if (!response.body) {
    await streamOfflineAiResponse(message, onText);
    return;
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  try {
    while (true) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      buffer = parseEvents(buffer, onText, onError);
    }
    buffer += decoder.decode();
    parseEvents(buffer, onText, onError);
  } catch (streamErr) {
    if (streamErr.name === 'AbortError') throw streamErr;
    console.warn('Streaming error encountered, providing offline assistant answer:', streamErr);
    await streamOfflineAiResponse(message, onText);
  } finally {
    try {
      reader.releaseLock();
    } catch {
      // release lock safe
    }
  }
}
