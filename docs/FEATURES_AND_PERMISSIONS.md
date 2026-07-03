# Ridgeline App — Features & Permissions by Role

**Status:** Brainstorm draft for refinement  
**Last updated:** May 2026

---

## Overview

Ridgeline is an internal operations platform for managing consulting projects, clients, proposals, assessments, deliverables, billing, and team collaboration. It includes a client-facing portal for select functions.

**Current structure:** Solo operations (Brian as Owner), scaling to add team as needed.

---

## Roles & Permissions Matrix

### Owner (Brian)

**Full visibility and strategic control.**

#### Clients
- [ ] View all clients (active, past, prospective)
- [1][ ] Add new clients
- [1][ ] Edit client details (name, contact, location, industry, relationship notes)
- [1][ ] Archive/deactivate clients
- [ ] View client communication history
- [ ] Assign clients to Admin team members

#### Projects
- [ ] View all projects (across all clients)
- [1][ ] Create new projects
- [1][ ] Edit project scope, timeline, status, deliverables
- [ ] Assign projects to team members
- [1][ ] View project timeline and milestones
- [1][ ] Close/archive projects
- [ ] View project profitability (revenue vs. time invested)

#### Proposals
- [1][ ] View all proposals (drafted, pending, approved, rejected)
- [1][ ] Create proposals (or review drafts from Admin)
- [1][ ] Edit pricing and scope
- [1][ ] Approve/finalize proposals before sending to client
- [1][ ] Send proposals to clients
- [1][ ] View proposal acceptance status and dates
- [1][ ] Archive old proposals

#### Assessments
- [1][ ] View all assessments (scheduled, in-progress, completed)
- [1][ ] Create assessment records
- [1][ ] View assessment documents and findings
- [1][ ] Mark assessments complete
- [1][ ] Link assessments to follow-up projects

#### Deliverables
- [ ] View all deliverables across all projects
- [1][ ] Review deliverable status and due dates
- [1][ ] Approve completed deliverables
- [1][ ] Mark deliverables as delivered to client

#### Time & Billing
- [ ] View all time logs (all team members, all projects)
- [1][ ] View billable vs. non-billable time
- [1][ ] Create and finalize invoices
- [1][ ] View revenue summary and project profitability
- [1][ ] Set billing rates (per project or per team member)
- [1][ ] View payment status and overdue invoices

#### Documents
- [ ] View all documents (assessments, proposals, deliverables, supporting files)
- [ ] Upload documents
- [ ] Organize documents by project/client
- [ ] Download or archive documents
- [ ] Version control (track document changes)

#### Communications
- [ ] View all client communication (email, messages, notes)
- [ ] Send direct messages to clients
- [ ] View Admin communication on your behalf
- [ ] Archive or flag important conversations

#### Scaffolder Integration
- [1][ ] Access scaffolder admin panel
- [1][ ] View scaffolder run history
- [1][ ] Trigger scaffolder script runs manually
- [1][ ] Monitor scaffolder outputs and logs

#### Team & Settings
- [ ] Invite and remove Admin users
- [ ] View team member activity and time logs
- [ ] Set platform permissions and access levels
- [ ] Configure billing and invoice settings
- [ ] View audit logs (who did what, when)

---

### Admin (Team Members)

**Operational execution and support. Access varies by assignment.**

#### Clients
- [ ] View assigned clients
- [ ] View full client details and communication history
- [ ] Edit client contact information (with Owner approval)
- [ ] Add notes and relationship updates
- [ ] Cannot delete or archive clients

#### Projects
- [ ] View assigned projects
- [ ] View and update project status and progress
- [ ] Update deliverable timelines and milestones
- [ ] Assign tasks within projects
- [ ] View project schedule and team assignments
- [ ] Cannot create or delete projects without Owner approval

#### Proposals
- [ ] View all proposals (for context)
- [ ] Draft new proposals (sent to Owner for approval)
- [ ] Suggest pricing and scope
- [ ] Track proposal status
- [ ] Cannot approve or send proposals to clients

#### Assessments
- [ ] View assigned assessments
- [ ] Schedule assessments and send calendar invites
- [ ] Document assessment findings (with templates)
- [ ] Upload assessment notes and research
- [ ] Mark assessments complete (for Owner review)

#### Deliverables
- [ ] View assigned deliverables
- [ ] Update deliverable status and progress
- [ ] Upload and version deliverable files
- [ ] Request Owner approval before delivery to client
- [ ] Cannot mark deliverables as "delivered to client"

#### Time & Billing
- [ ] Log time on assigned projects
- [ ] View billable rates for their work
- [ ] View personal time logs and invoice history
- [ ] Cannot create invoices or view other team members' billing
- [ ] Cannot adjust rates or pricing

#### Documents
- [ ] View documents for assigned projects
- [ ] Upload supporting documents and files
- [ ] Organize documents (within their projects)
- [ ] Cannot delete documents

#### Communications
- [ ] Send messages to assigned clients (on Owner's behalf)
- [ ] View communication history for assigned projects
- [ ] Add notes and follow-ups
- [ ] Cannot access client communication for unassigned projects

#### Scaffolder Integration
- [ ] View scaffolder in admin screen
- [ ] Run scaffolder script for new projects (instead of CLI)
- [ ] View scaffolder run history and outputs
- [ ] Cannot modify scaffolder logic or settings

#### Team & Settings
- [ ] View own profile and settings
- [ ] Cannot invite users or change permissions
- [ ] Cannot view audit logs

---

### Client (Project Partners)

**Project visibility and participation. Confined to Client Portal.**

#### Projects
- [1][ ] View assigned projects
- [1][ ] View project timeline, milestones, and deliverables
- [1][ ] View project status updates
- [1][ ] Cannot edit project details

#### Assessments
- [1][ ] View assessment documents (if shared)
- [1][ ] View assessment summary and findings
- [1][ ] Cannot edit or delete assessments

#### Deliverables
- [1][ ] View deliverables (when marked "delivered to client")
- [1][ ] Download deliverable files
- [1][ ] View due dates and status
- [1][ ] Cannot edit deliverables

#### Communications
- [ ] Receive messages from Owner/Admin
- [1][ ] Submit files and feedback through portal
- [ ] View message history for their project
- [ ] Cannot send unsolicited messages (respond to Owner/Admin only)

#### Billing
- [1][ ] View invoices
- [1][ ] View invoice due dates and payment status
- [1][ ] Cannot edit invoices or see detailed time logs
- [1][ ] Cannot see billing rates or other clients' invoices

#### Documents
- [1][ ] Download shared documents (assessments, proposals, deliverables)
- [1][ ] Cannot upload or delete documents
- [1][ ] Cannot access documents not marked as shared

---

### Logged-in User (Team Members / Contractors)

**Same as Admin role. Added for clarity that all internal team are logged-in users.**

See Admin section above.

---

## Feature Scope Summary

### What the App Tracks
- **Clients:** Contact info, industry, location, relationship history, assigned team
- **Projects:** Scope, timeline, milestones, deliverables, assigned team, status
- **Proposals:** Scope, pricing, revisions, approval status, delivery date, acceptance
- **Assessments:** Schedule, findings, recommendations, linked to follow-up work
- **Deliverables:** Type, due date, status, linked files, client approval
- **Time & Billing:** Hours logged, billable rates, invoices, payment status, revenue tracking
- **Documents:** Assessments, proposals, deliverables, supporting files, versions
- **Communications:** Client messages, notes, follow-ups, history per project
- **Scaffolder Integration:** Run history, outputs, admin trigger interface

### Internal vs. Client-Facing
- **Internal:** Owner dashboard, Admin operations, full visibility into billing, time, profitability
- **Client Portal:** Project status, deliverables, assessments (when shared), invoices, file uploads/feedback

---

## Notes for Refinement

1. **Admin granularity:** Should Admin permissions be role-based (e.g., "Project Manager" vs. "Proposal Specialist") or simply assigned per client/project?

2. **Client portal features:** Beyond viewing, should clients be able to schedule assessments, request changes, or submit multiple feedback rounds?

3. **Time tracking:** Manual entry (Admin logs hours), automatic (integration with calendar/billing tool), or both?

4. **Automation:** Should invoices auto-generate on project completion? Should deliverables auto-notify clients when shared?

5. **Scaffolder integration:** Should the admin screen allow parameters (e.g., folder structure type, naming convention) or just "run the standard scaffolder"?

6. **Audit/compliance:** How deep should the audit trail be? (Owner only, or accessible to all team members?)

---

*Ready for your input. What's missing, what's overkill, and what needs clarification?*
