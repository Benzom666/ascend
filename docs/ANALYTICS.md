# 📊 Analytics & Metrics

Key metrics for monitoring Le Society platform.

## Business Metrics

### User Metrics
- Total registered users
- Active users (DAU/MAU)
- User growth rate
- Retention rate (7-day, 30-day)
- Churn rate

### Revenue Metrics
- Monthly Recurring Revenue (MRR)
- Average Revenue Per User (ARPU)
- Token purchase conversion rate
- Package distribution (small/medium/large)
- Customer Lifetime Value (CLV)

### Engagement Metrics
- Dates created per female user
- Messages sent per conversation
- Average session duration
- Feature usage rates
- Profile completion rate

## Technical Metrics

### Performance
- API response time (p50, p95, p99)
- Page load time
- Database query time
- Error rate
- Uptime percentage

### Infrastructure
- Server CPU usage
- Memory utilization
- Database connections
- Network bandwidth
- Storage usage

## How to Access

### Built-in Analytics
```bash
# User statistics
curl http://localhost:3001/api/v1/dashboard/total-users \
  -H "Authorization: Bearer <admin_token>"

# Date statistics
curl http://localhost:3001/api/v1/date/stats \
  -H "Authorization: Bearer <token>"
```

### External Tools
- **Google Analytics** - User behavior
- **Mixpanel** - Event tracking
- **MongoDB Charts** - Database metrics
- **Grafana** - System metrics

## Key Reports

### Daily Report
- New signups
- Active users
- Dates created
- Messages sent
- Revenue generated

### Weekly Report
- User growth trend
- Engagement metrics
- Top features used
- Payment conversions

### Monthly Report
- MRR and growth
- User retention cohorts
- Feature adoption
- Technical performance
