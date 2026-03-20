// ===== Course Progress Dashboard Data & Logic =====

// Sample BAFN 302 Course Data
const courseData = {
  // Assignments and Exams
  assignments: [
    {
      id: 1,
      title: 'Time Value of Money Problem Set',
      type: 'Homework',
      chapter: 'Ch. 5',
      dueDate: new Date('2026-02-15'),
      completed: true,
      grade: 95,
      maxPoints: 100,
      weight: 0.05
    },
    {
      id: 2,
      title: 'Bond Pricing Assignment',
      type: 'Homework',
      chapter: 'Ch. 6',
      dueDate: new Date('2026-02-28'),
      completed: true,
      grade: 88,
      maxPoints: 100,
      weight: 0.05
    },
    {
      id: 3,
      title: 'Midterm Exam 1',
      type: 'Exam',
      chapter: 'Ch. 1-6',
      dueDate: new Date('2026-03-10'),
      completed: true,
      grade: 92,
      maxPoints: 100,
      weight: 0.20
    },
    {
      id: 4,
      title: 'Risk & Return Problem Set',
      type: 'Homework',
      chapter: 'Ch. 8',
      dueDate: new Date('2026-03-20'),
      completed: true,
      grade: 90,
      maxPoints: 100,
      weight: 0.05
    },
    {
      id: 5,
      title: 'Stock Valuation Assignment',
      type: 'Homework',
      chapter: 'Ch. 9',
      dueDate: new Date('2026-03-28'),
      completed: false,
      grade: null,
      maxPoints: 100,
      weight: 0.05
    },
    {
      id: 6,
      title: 'Capital Budgeting Case Study',
      type: 'Project',
      chapter: 'Ch. 10-11',
      dueDate: new Date('2026-04-10'),
      completed: false,
      grade: null,
      maxPoints: 100,
      weight: 0.10
    },
    {
      id: 7,
      title: 'Midterm Exam 2',
      type: 'Exam',
      chapter: 'Ch. 7-11',
      dueDate: new Date('2026-04-20'),
      completed: false,
      grade: null,
      maxPoints: 100,
      weight: 0.20
    },
    {
      id: 8,
      title: 'WACC & Capital Structure Assignment',
      type: 'Homework',
      chapter: 'Ch. 13',
      dueDate: new Date('2026-05-01'),
      completed: false,
      grade: null,
      maxPoints: 100,
      weight: 0.05
    },
    {
      id: 9,
      title: 'Final Project: Corporate Valuation',
      type: 'Project',
      chapter: 'Ch. 1-15',
      dueDate: new Date('2026-05-10'),
      completed: false,
      grade: null,
      maxPoints: 100,
      weight: 0.15
    },
    {
      id: 10,
      title: 'Final Exam',
      type: 'Exam',
      chapter: 'Comprehensive',
      dueDate: new Date('2026-05-18'),
      completed: false,
      grade: null,
      maxPoints: 100,
      weight: 0.25
    }
  ],

  // Course Topics/Chapters
  topics: [
    { chapter: 'Ch. 1-2', title: 'Introduction to Finance & Financial Statements', completed: true },
    { chapter: 'Ch. 3', title: 'Financial Statement Analysis', completed: true },
    { chapter: 'Ch. 4', title: 'Time Value of Money Basics', completed: true },
    { chapter: 'Ch. 5', title: 'Time Value of Money Applications', completed: true },
    { chapter: 'Ch. 6', title: 'Bond Valuation', completed: true },
    { chapter: 'Ch. 7', title: 'Bond Risk & Returns', completed: true },
    { chapter: 'Ch. 8', title: 'Risk & Return', completed: true },
    { chapter: 'Ch. 9', title: 'Stock Valuation', completed: false },
    { chapter: 'Ch. 10', title: 'Capital Budgeting: NPV & IRR', completed: false },
    { chapter: 'Ch. 11', title: 'Capital Budgeting: Cash Flows', completed: false },
    { chapter: 'Ch. 12', title: 'Cost of Capital', completed: false },
    { chapter: 'Ch. 13', title: 'Capital Structure', completed: false },
    { chapter: 'Ch. 14', title: 'Dividend Policy', completed: false },
    { chapter: 'Ch. 15', title: 'Working Capital Management', completed: false }
  ]
};

// Calculate course statistics
function calculateStats() {
  const totalAssignments = courseData.assignments.length;
  const completedAssignments = courseData.assignments.filter(a => a.completed).length;

  // Calculate weighted grade
  let earnedPoints = 0;
  let totalWeight = 0;

  courseData.assignments.forEach(assignment => {
    if (assignment.completed && assignment.grade !== null) {
      earnedPoints += (assignment.grade / assignment.maxPoints) * assignment.weight;
      totalWeight += assignment.weight;
    }
  });

  const currentGrade = totalWeight > 0 ? (earnedPoints / totalWeight) * 100 : 0;

  // Calculate completion percentage
  const completedTopics = courseData.topics.filter(t => t.completed).length;
  const topicCompletion = (completedTopics / courseData.topics.length) * 100;
  const assignmentCompletion = (completedAssignments / totalAssignments) * 100;
  const overallCompletion = (topicCompletion * 0.5 + assignmentCompletion * 0.5);

  // Find next deadline
  const now = new Date();
  const upcomingAssignments = courseData.assignments
    .filter(a => !a.completed && a.dueDate >= now)
    .sort((a, b) => a.dueDate - b.dueDate);

  const nextDeadline = upcomingAssignments.length > 0 ? upcomingAssignments[0] : null;

  return {
    totalAssignments,
    completedAssignments,
    currentGrade: currentGrade.toFixed(1),
    overallCompletion: overallCompletion.toFixed(0),
    nextDeadline,
    upcomingAssignments
  };
}

// Format date for display
function formatDate(date) {
  const options = { month: 'short', day: 'numeric', year: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Get days until deadline
function getDaysUntil(date) {
  const now = new Date();
  const diff = date - now;
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  return days;
}

// Get letter grade
function getLetterGrade(percent) {
  if (percent >= 93) return 'A';
  if (percent >= 90) return 'A-';
  if (percent >= 87) return 'B+';
  if (percent >= 83) return 'B';
  if (percent >= 80) return 'B-';
  if (percent >= 77) return 'C+';
  if (percent >= 73) return 'C';
  if (percent >= 70) return 'C-';
  if (percent >= 67) return 'D+';
  if (percent >= 63) return 'D';
  if (percent >= 60) return 'D-';
  return 'F';
}

// Render the dashboard
function renderDashboard() {
  const stats = calculateStats();

  // Update overview statistics
  document.getElementById('completion-percentage').textContent = `${stats.overallCompletion}%`;
  document.getElementById('current-grade').textContent = `${stats.currentGrade}% (${getLetterGrade(parseFloat(stats.currentGrade))})`;
  document.getElementById('assignments-completed').textContent = `${stats.completedAssignments}/${stats.totalAssignments}`;

  if (stats.nextDeadline) {
    const days = getDaysUntil(stats.nextDeadline.dueDate);
    const daysText = days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days} days`;
    document.getElementById('next-deadline').textContent = daysText;
  } else {
    document.getElementById('next-deadline').textContent = 'None';
  }

  // Update progress bar
  document.getElementById('progress-fill').style.width = `${stats.overallCompletion}%`;
  document.getElementById('progress-text').textContent = `${stats.overallCompletion}%`;

  // Render upcoming deadlines
  renderUpcomingDeadlines(stats.upcomingAssignments);

  // Render completed assignments
  renderCompletedAssignments();

  // Render grade breakdown
  renderGradeBreakdown();

  // Render topics progress
  renderTopicsProgress();
}

// Render upcoming deadlines
function renderUpcomingDeadlines(upcomingAssignments) {
  const container = document.getElementById('upcoming-deadlines');
  container.innerHTML = '';

  if (upcomingAssignments.length === 0) {
    container.innerHTML = '<div class="empty-state">No upcoming deadlines</div>';
    return;
  }

  upcomingAssignments.slice(0, 5).forEach(assignment => {
    const days = getDaysUntil(assignment.dueDate);
    const isUrgent = days <= 3;

    const item = document.createElement('div');
    item.className = `deadline-item ${isUrgent ? 'urgent' : ''}`;

    item.innerHTML = `
      <div class="deadline-icon ${assignment.type.toLowerCase()}">${getTypeIcon(assignment.type)}</div>
      <div class="deadline-content">
        <div class="deadline-title">${assignment.title}</div>
        <div class="deadline-meta">
          <span class="deadline-chapter">${assignment.chapter}</span>
          <span class="deadline-separator">•</span>
          <span class="deadline-type">${assignment.type}</span>
        </div>
      </div>
      <div class="deadline-date ${isUrgent ? 'urgent' : ''}">
        <div class="deadline-day">${days === 0 ? 'Today' : days === 1 ? 'Tomorrow' : `${days}d`}</div>
        <div class="deadline-full-date">${formatDate(assignment.dueDate)}</div>
      </div>
    `;

    container.appendChild(item);
  });
}

// Render completed assignments
function renderCompletedAssignments() {
  const container = document.getElementById('completed-assignments');
  container.innerHTML = '';

  const completed = courseData.assignments.filter(a => a.completed);

  if (completed.length === 0) {
    container.innerHTML = '<div class="empty-state">No completed assignments yet</div>';
    return;
  }

  // Show most recent 5
  completed.reverse().slice(0, 5).forEach(assignment => {
    const item = document.createElement('div');
    item.className = 'assignment-item';

    const gradePercent = (assignment.grade / assignment.maxPoints) * 100;
    const gradeClass = gradePercent >= 90 ? 'excellent' : gradePercent >= 80 ? 'good' : gradePercent >= 70 ? 'average' : 'poor';

    item.innerHTML = `
      <div class="assignment-icon ${assignment.type.toLowerCase()}">${getTypeIcon(assignment.type)}</div>
      <div class="assignment-content">
        <div class="assignment-title">${assignment.title}</div>
        <div class="assignment-meta">
          <span class="assignment-chapter">${assignment.chapter}</span>
          <span class="assignment-separator">•</span>
          <span class="assignment-date">${formatDate(assignment.dueDate)}</span>
        </div>
      </div>
      <div class="assignment-grade ${gradeClass}">
        <div class="grade-percent">${gradePercent.toFixed(0)}%</div>
        <div class="grade-points">${assignment.grade}/${assignment.maxPoints}</div>
      </div>
    `;

    container.appendChild(item);
  });
}

// Render grade breakdown
function renderGradeBreakdown() {
  const container = document.getElementById('grade-breakdown');
  container.innerHTML = '';

  // Group assignments by type
  const byType = {};
  courseData.assignments.forEach(assignment => {
    if (!byType[assignment.type]) {
      byType[assignment.type] = [];
    }
    byType[assignment.type].push(assignment);
  });

  Object.entries(byType).forEach(([type, assignments]) => {
    const completed = assignments.filter(a => a.completed);
    const totalWeight = assignments.reduce((sum, a) => sum + a.weight, 0) * 100;

    let earnedPoints = 0;
    let maxPoints = 0;

    completed.forEach(a => {
      earnedPoints += (a.grade / a.maxPoints) * a.weight;
      maxPoints += a.weight;
    });

    const average = maxPoints > 0 ? (earnedPoints / maxPoints) * 100 : 0;
    const progressPercent = (completed.length / assignments.length) * 100;

    const item = document.createElement('div');
    item.className = 'grade-category';

    item.innerHTML = `
      <div class="grade-category-header">
        <div class="grade-category-info">
          <div class="grade-category-icon">${getTypeIcon(type)}</div>
          <div class="grade-category-details">
            <div class="grade-category-name">${type}s</div>
            <div class="grade-category-meta">${completed.length}/${assignments.length} completed • ${totalWeight.toFixed(0)}% of grade</div>
          </div>
        </div>
        <div class="grade-category-score">
          ${maxPoints > 0 ? `<div class="grade-category-percent">${average.toFixed(1)}%</div>` : '<div class="grade-category-percent pending">--</div>'}
        </div>
      </div>
      <div class="grade-progress-bar">
        <div class="grade-progress-fill" style="width: ${progressPercent}%"></div>
      </div>
    `;

    container.appendChild(item);
  });
}

// Render topics progress
function renderTopicsProgress() {
  const container = document.getElementById('topics-progress');
  container.innerHTML = '';

  courseData.topics.forEach(topic => {
    const item = document.createElement('div');
    item.className = `topic-item ${topic.completed ? 'completed' : ''}`;

    item.innerHTML = `
      <div class="topic-status">
        <div class="topic-checkbox ${topic.completed ? 'checked' : ''}">
          ${topic.completed ? '✓' : ''}
        </div>
      </div>
      <div class="topic-content">
        <div class="topic-chapter">${topic.chapter}</div>
        <div class="topic-title">${topic.title}</div>
      </div>
    `;

    container.appendChild(item);
  });
}

// Get icon for assignment type
function getTypeIcon(type) {
  const icons = {
    'Homework': '📝',
    'Exam': '📋',
    'Project': '📊',
    'Quiz': '✏️'
  };
  return icons[type] || '📄';
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', () => {
  renderDashboard();

  // Animate progress bar on load
  setTimeout(() => {
    document.getElementById('progress-fill').style.transition = 'width 1.5s ease-out';
  }, 100);
});
