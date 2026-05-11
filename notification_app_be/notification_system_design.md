# Campus Notifications Microservice — System Design

## Stage 1: REST API Design

### 1.1 GET All Notifications

```
GET /api/notifications
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Response (200):**
```json
{
  "success": true,
  "notifications": [
    {
      "id": "abc-123",
      "type": "Placement",
      "message": "Google Inc. hiring for SDE roles",
      "studentId": 1042,
      "isRead": false,
      "createdAt": "2026-05-11T10:30:00Z"
    }
  ]
}
```

### 1.2 GET Unread Notifications

```
GET /api/notifications/unread?studentId=1042
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "unreadCount": 5,
  "notifications": [
    {
      "id": "abc-123",
      "type": "Placement",
      "message": "Google Inc. hiring for SDE roles",
      "isRead": false,
      "createdAt": "2026-05-11T10:30:00Z"
    }
  ]
}
```

### 1.3 POST Create Notification

```
POST /api/notifications
```

**Headers:**
```
Authorization: Bearer <token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "type": "Placement",
  "message": "Amazon hiring for intern roles",
  "studentId": 1042
}
```

**Response (201):**
```json
{
  "success": true,
  "notification": {
    "id": "def-456",
    "type": "Placement",
    "message": "Amazon hiring for intern roles",
    "studentId": 1042,
    "isRead": false,
    "createdAt": "2026-05-11T11:00:00Z"
  }
}
```

### 1.4 PATCH Mark as Read

```
PATCH /api/notifications/:id/read
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification marked as read"
}
```

### 1.5 DELETE Notification

```
DELETE /api/notifications/:id
```

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "success": true,
  "message": "Notification deleted"
}
```

### 1.6 Real-time Strategy — Server-Sent Events (SSE)

For real-time delivery, SSE is a practical choice over WebSockets for a notifications system because notifications are unidirectional (server to client).

```
GET /api/notifications/stream
```

**How it works:**
- Client opens a persistent HTTP connection
- Server pushes new notifications as they arrive
- Client receives events automatically without polling

**SSE Event Format:**
```
event: notification
data: {"id":"xyz-789","type":"Result","message":"Mid-sem results published"}
```

**Why SSE over WebSocket:**
- Simpler to implement for one-way data flow
- Built-in reconnection
- Works over standard HTTP
- Lower overhead than WebSocket for this use case

---

## Stage 2: Database Schema & Design

### 2.1 Why PostgreSQL

PostgreSQL is preferred for a campus notification system because:

- Strong ACID compliance ensures notification delivery is consistent
- Supports complex queries with JOINs for filtering by student, type, and read status
- Built-in support for indexing, which is critical at scale
- JSONB support allows flexible metadata storage for different notification types
- Mature ecosystem with production-grade tooling

### 2.2 Notification Table Schema

```sql
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    student_id INTEGER NOT NULL,
    type VARCHAR(50) NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### 2.3 Indexing Strategy

```sql
CREATE INDEX idx_student_unread ON notifications (student_id, is_read)
WHERE is_read = false;

CREATE INDEX idx_student_created ON notifications (student_id, created_at DESC);

CREATE INDEX idx_type ON notifications (type);
```

- **Partial index** on `is_read = false` reduces index size since most notifications will eventually be read
- **Composite index** on `(student_id, created_at DESC)` speeds up the most common query pattern
- **Type index** helps when filtering by notification category

### 2.4 Scaling Concerns

- As the student base grows, the notifications table can get very large
- Consider **table partitioning** by `created_at` (monthly partitions)
- Archive old notifications (>6 months) to a separate table
- Use **connection pooling** (PgBouncer) to handle concurrent reads

### 2.5 SQL vs NoSQL Comparison

| Criteria | PostgreSQL (SQL) | MongoDB (NoSQL) |
|----------|-----------------|-----------------|
| Schema consistency | Strong, enforced | Flexible, schema-less |
| Query complexity | Excellent for JOINs and filters | Limited JOIN support |
| Indexing | Mature, partial indexes | Good, but less flexible |
| Transactions | Full ACID | Limited multi-doc transactions |
| Scalability | Vertical + read replicas | Horizontal sharding |
| Best for | Structured notification data | Rapidly changing schemas |

**Verdict:** PostgreSQL is better for this use case because notification data has a fixed structure, and we need consistent reads and complex filtering.

---

## Stage 3: Query Optimization

### 3.1 Analyzing the Query

```sql
SELECT * FROM notifications
WHERE studentID = 1042 AND IsRead = false
ORDER BY createdAt DESC;
```

### 3.2 Why This Query Becomes Slow at Scale

- **Full table scan**: Without proper indexes, PostgreSQL scans every row to find matching records
- **Large result sets**: A student might have thousands of notifications over time
- **Sorting overhead**: `ORDER BY createdAt DESC` requires sorting in memory if there is no index covering the sort order
- At 1M+ rows, this query can take seconds instead of milliseconds

### 3.3 Why SELECT * is Inefficient

- Fetches all columns including potentially large `message` text fields
- Wastes network bandwidth sending data the client may not need
- Prevents the database from using a covering index (index-only scan)
- Always select only the columns you actually need

### 3.4 Proper Composite Indexing

```sql
CREATE INDEX idx_student_unread_recent
ON notifications (student_id, is_read, created_at DESC);
```

This composite index covers all three conditions in the query:
1. Filters by `student_id` first (most selective)
2. Filters by `is_read`
3. Returns results already sorted by `created_at DESC`

The database can satisfy the entire query from the index without touching the table.

### 3.5 Why Indexing Every Column is Bad

- Each index takes up disk space proportional to the table size
- Every INSERT/UPDATE must also update all indexes, slowing down writes
- The query planner may get confused with too many index options
- Only index columns that appear in WHERE, JOIN, or ORDER BY clauses

### 3.6 Optimized Query

```sql
SELECT id, type, message, created_at
FROM notifications
WHERE student_id = 1042 AND is_read = false
ORDER BY created_at DESC
LIMIT 20;
```

Improvements:
- Select only needed columns
- Added `LIMIT 20` for pagination
- With the composite index above, this query uses an index-only scan

### 3.7 Placement Notifications — Last 7 Days

```sql
SELECT id, message, created_at
FROM notifications
WHERE student_id = 1042
  AND type = 'Placement'
  AND created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC
LIMIT 10;
```

Supporting index:
```sql
CREATE INDEX idx_placement_recent
ON notifications (student_id, type, created_at DESC)
WHERE type = 'Placement';
```

---

## Stage 4: Scalability & Performance

### 4.1 DB Overload Problem

When thousands of students poll for notifications simultaneously:
- Connection pool gets exhausted
- Same unread notifications are queried repeatedly
- Database CPU spikes during peak hours (result announcements, placement drives)

### 4.2 Caching with Redis

```
Key:    notifications:unread:{studentId}
Value:  JSON array of unread notifications
TTL:    60 seconds
```

- Check Redis first before hitting PostgreSQL
- Invalidate cache when a new notification is created or marked as read
- Reduces DB load by 80-90% for repeated reads
- Use Redis Pub/Sub for cache invalidation across multiple server instances

### 4.3 Pagination

Always paginate notification responses:

```
GET /api/notifications?page=1&limit=20
```

- Use cursor-based pagination for real-time data (avoids offset issues with new inserts)
- Cursor = `created_at` timestamp of last notification on current page
- Reduces memory usage and response time

### 4.4 WebSocket/SSE vs Polling

| Approach | Pros | Cons |
|----------|------|------|
| Polling (every 30s) | Simple to implement | Wastes bandwidth, delayed updates |
| Long Polling | More efficient than polling | Still opens/closes connections |
| SSE | Persistent connection, auto-reconnect | One-directional only |
| WebSocket | Full-duplex, low latency | More complex to implement and scale |

**Recommendation:** Use SSE for notifications (one-way server-to-client), with a Redis Pub/Sub backend for multi-server setups.

### 4.5 Scalability Improvements

1. **Read replicas**: Route notification reads to replicas
2. **CDN for static content**: Offload static notification assets
3. **Rate limiting**: Prevent excessive API calls per student
4. **Batch processing**: Group notification creation for bulk events (e.g., results)
5. **Horizontal scaling**: Stateless Express servers behind a load balancer

---

## Stage 5: Asynchronous Processing & Reliability

### 5.1 Problem with Sequential notify_all

```
function notify_all(students, notification) {
    for (student of students) {
        save_to_db(student, notification)
        send_email(student, notification)
    }
}
```

Issues:
- If `send_email` fails for one student, the loop stops and remaining students never get notified
- Slow execution — sending 10,000 emails sequentially takes minutes
- A single email API timeout blocks everything
- No retry mechanism for failed emails
- DB and email are tightly coupled

### 5.2 Email API Failures

- External email APIs (SendGrid, SES) have rate limits and temporary failures
- Network timeouts are common at scale
- Without retries, failed emails are silently lost
- Need to track which emails succeeded and which failed

### 5.3 Retry Handling

Implement exponential backoff:
- 1st retry: 1 second delay
- 2nd retry: 4 seconds delay
- 3rd retry: 16 seconds delay
- Max 3 retries before moving to dead-letter queue

### 5.4 Should DB Save and Email Be Transactional?

No. They should be separate concerns:
- Save to DB should always succeed independently
- Email sending is a "best effort" operation
- If email fails, the notification still exists in the DB
- User can still see it in-app even if email never arrives
- This is **eventual consistency** — the notification is guaranteed in DB, email delivery happens eventually

### 5.5 Improved Architecture

```
                    ┌─────────────┐
                    │  API Server  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │   Save to   │
                    │   Database  │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │  Push to    │
                    │  Job Queue  │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
        ┌─────▼────┐ ┌────▼─────┐ ┌────▼─────┐
        │ Worker 1  │ │ Worker 2  │ │ Worker 3  │
        └─────┬────┘ └────┬─────┘ └────┬─────┘
              │            │            │
              └────────────┼────────────┘
                           │
                    ┌──────▼──────┐
                    │ Dead Letter │
                    │   Queue     │
                    └─────────────┘
```

### 5.6 Improved Pseudocode

```javascript
async function notify_all(students, notification) {
    // Step 1: Save all notifications to DB in batch
    await db.batchInsert('notifications', students.map(s => ({
        studentId: s.id,
        message: notification.message,
        type: notification.type
    })));

    // Step 2: Push email jobs to queue
    for (const student of students) {
        await queue.add('send-email', {
            to: student.email,
            subject: notification.type,
            body: notification.message,
            studentId: student.id
        }, {
            attempts: 3,
            backoff: { type: 'exponential', delay: 1000 }
        });
    }
}

// Worker process
queue.process('send-email', async (job) => {
    const { to, subject, body } = job.data;

    try {
        await emailService.send({ to, subject, body });
        console.log(`Email sent to ${to}`);
    } catch (error) {
        console.error(`Email failed for ${to}: ${error.message}`);
        throw error; // triggers retry
    }
});

// Dead letter handler
queue.on('failed', (job, err) => {
    if (job.attemptsMade >= job.opts.attempts) {
        deadLetterQueue.add('failed-email', {
            ...job.data,
            error: err.message,
            failedAt: new Date()
        });
    }
});
```

Key improvements:
- DB save and email sending are decoupled
- Multiple workers process emails in parallel
- Failed emails are retried with exponential backoff
- Permanently failed emails go to a dead-letter queue for manual review
- System handles 10,000+ notifications without blocking the API server
