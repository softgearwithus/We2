# College Platform – Frontend Workflow

## 🎯 Platform Goal
Provide colleges a premium dashboard to monitor student readiness, performance analytics, placement preparation progress, and institutional growth insights.

---

# 👤 User Hierarchy

## 1. Super Admin (Company Level)
- Controls college onboarding
- Assigns credential visibility filters
- Enables year-wise access
- Controls module access
- Monitors college analytics

---

## 2. College Admin / Executive Director
- Full college analytics visibility
- Access all years
- Institutional performance comparison
- Placement readiness overview

---

## 3. HOD (Department Level)
- Department student analytics
- Year filtering (1st / 2nd / 3rd / 4th year)
- Skill gap monitoring
- Department placement performance

---

# 🔐 Login Flow

1. College signs partnership agreement
2. Super Admin creates:
   - College ID
   - Role-Based Credentials
   - Year-Based Visibility Permissions
3. College User logs in
4. Dashboard loads based on credential role

---

# 🎓 Year-Based Filtering Workflow

Credential contains:
college_id
department
role
year_access


Frontend applies:
- Student visibility filter
- Performance report filter
- Leaderboard filter
- Placement readiness filter

---

# 📊 Dashboard Interaction Flow

Login → Dashboard → Analytics Selection → Filter Year → Student Insights → Export Reports

---

# 📈 Institutional Analytics Workflow

College Login →
View Overall College Performance →
Select Department →
Select Academic Year →
View Student Metrics →
Generate Report →
Download / Share

---

# 📌 Core Workflow Summary

Super Admin Controls Access  
College Admin Monitors Institution  
HOD Tracks Department Growth  
Students Are Filtered Based on Year Credential

