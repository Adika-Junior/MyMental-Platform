# Project Features and Remaining Work

## Completed (highlights)
- Security: OWASP headers (CSP, HSTS, XFO, Referrer-Policy), throttles, audit logging
- Observability: JSON logs with request IDs; Sentry integration
- Data: DB backup/restore scripts; index audit; Redis caching for hot paths
- Search: Full-text search API (psychoeducation, conversations) with ranking
- Realtime & Chat: WebSocket chat, crisis detection, escalation, moderation & reporting
- Notifications: FCM device lifecycle; preferences endpoints; invalid-token auto-deactivate
- Accessibility: WCAG AA improvements (skip link, landmarks, focus states)
- Settings: Profile edit page; notification preferences UI

## Remaining (priority)
1) Service pages polish (content/UX)
   - Flesh out content for services (depression, anxiety, stress, etc.)
   - Consistent visuals, headings, and internal linking to chat/check-in

2) Production deployment
   - Domain + SSL (reverse proxy), env/secrets, Docker images
   - Static/media, migrations, health checks, zero-downtime rollout

3) Tests (E2E + load)
   - Web E2E (auth, chat happy path, questionnaire)
   - Mobile smoke tests; API load tests for chat endpoints

4) Monitoring and alerts
   - Dashboards for latency, error rate, uptime
   - Alerts for API failures, high 5xx rate, degraded queue

## Nice-to-haves
- Marketing/SEO polish (sitemap, robots, meta/schema)
- Data export/deletion self-service (privacy)
- Dark mode and high-contrast theme

## Notes
- See README for setup, environment, and run instructions.

