import http from 'k6/http';
import { sleep, check } from 'k6';
import { Counter } from 'k6/metrics';

// Custom metrics
const failedRequests = new Counter('failed_requests');

// Test configuration
export const options = {
  stages: [
    { duration: '1m', target: 50 }, // Ramp up to 50 users over 1 minute
    { duration: '3m', target: 50 }, // Stay at 50 users for 3 minutes
    { duration: '1m', target: 0 }, // Ramp down to 0 users over 1 minute
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests should be below 500ms
    failed_requests: ['count<10'], // Less than 10 failed requests
  },
};

// Simulate user session
export default function () {
  // Base URL for the application
  const baseUrl = __ENV.BASE_URL || 'https://staging.realestate-app.com';

  // Set up headers
  const headers = {
    'Content-Type': 'application/json',
    'X-Test-Source': 'k6-load-test',
  };

  // Login request
  const loginRes = http.post(
    `${baseUrl}/api/auth/login`,
    JSON.stringify({
      email: 'test-client@example.com',
      password: 'testpassword123',
    }),
    { headers }
  );

  // Check if login was successful
  const loginSuccess = check(loginRes, {
    'login successful': (r) => r.status === 200 && r.json('token') !== undefined,
  });

  if (!loginSuccess) {
    failedRequests.add(1);
    return;
  }

  // Extract token from response
  const token = loginRes.json('token');
  headers['Authorization'] = `Bearer ${token}`;

  // Simulate user browsing projects
  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds

  const projectsRes = http.get(`${baseUrl}/api/projects`, { headers });

  // Check if projects request was successful
  check(projectsRes, {
    'projects request successful': (r) => r.status === 200,
    'projects data received': (r) => r.json('projects').length > 0,
  });

  // Select a random project
  const projects = projectsRes.json('projects');
  if (projects.length === 0) {
    failedRequests.add(1);
    return;
  }

  const randomProject = projects[Math.floor(Math.random() * projects.length)];

  // View project details
  sleep(Math.random() * 2 + 1); // Random sleep between 1-3 seconds

  const projectDetailsRes = http.get(`${baseUrl}/api/projects/${randomProject.id}`, { headers });

  // Check if project details request was successful
  check(projectDetailsRes, {
    'project details request successful': (r) => r.status === 200,
    'project details received': (r) => r.json('id') === randomProject.id,
  });

  // Simulate booking a visit (critical path)
  sleep(Math.random() * 2 + 2); // Random sleep between 2-4 seconds

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const bookVisitRes = http.post(
    `${baseUrl}/api/visits`,
    JSON.stringify({
      projectId: randomProject.id,
      visitDate: tomorrow.toISOString().split('T')[0],
      purpose: 'Interested in purchasing a plot',
    }),
    { headers }
  );

  // Check if booking request was successful
  check(bookVisitRes, {
    'booking request successful': (r) => r.status === 200 || r.status === 201,
    'booking confirmation received': (r) => r.json('success') === true,
  });

  // End session
  sleep(Math.random() * 3 + 1); // Random sleep between 1-4 seconds
}
