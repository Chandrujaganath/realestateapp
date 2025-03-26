# Rollback Strategy

## Monitoring & Triggers

### Key Metrics to Monitor

- Error rate (>5% increase from baseline)
- Response time (>500ms for critical paths)
- Failed transactions (>1% of total)
- User-reported issues (>3 critical reports)

### Rollback Triggers

- Critical functionality not working (authentication, booking, approvals)
- Data corruption or loss
- Security vulnerability
- Severe performance degradation
- Multiple high-priority user-reported issues

## Rollback Procedures

### 1. Frontend Rollback

- Revert to previous deployment on Vercel
- Command: `vercel rollback --prod`
- Estimated time: 2-5 minutes
- Responsible: DevOps Lead

### 2. Cloud Functions Rollback

- Revert to previous deployment
- Command: `firebase functions:rollback`
- Estimated time: 5-10 minutes
- Responsible: Backend Lead

### 3. Firestore Schema Rollback

- If schema changes were made, restore from backup
- Use Firebase console or automated scripts
- Estimated time: 10-30 minutes depending on data size
- Responsible: Database Administrator

### 4. Configuration Rollback

- Revert environment variables in Vercel
- Revert Firebase Remote Config changes
- Estimated time: 5-10 minutes
- Responsible: DevOps Lead

## Communication Plan

### Internal Communication

1. Alert team via Slack #deployments channel
2. Initiate incident response call if necessary
3. Document issue in incident log
4. Assign responsibilities for rollback tasks

### External Communication

1. Update status page
2. Send notification to affected users
3. Provide estimated resolution time
4. Follow up with root cause and resolution

## Post-Rollback Actions

### Immediate Actions

- Verify system stability after rollback
- Confirm critical functionality is working
- Document the rollback in deployment log
- Notify stakeholders of status

### Follow-up Actions

- Conduct root cause analysis
- Fix issues in development environment
- Add tests to prevent recurrence
- Update deployment procedures if necessary
- Schedule new deployment with fixes

## Testing After Rollback

### Automated Tests

- Run full E2E test suite
- Verify all critical paths
- Check authentication flows
- Test role-based access

### Manual Verification

- Login with different user roles
- Verify booking process
- Check approval workflows
- Test notifications and real-time updates

## Recovery Time Objectives

- Frontend: <10 minutes
- Cloud Functions: <15 minutes
- Database: <30 minutes
- Full system: <60 minutes
