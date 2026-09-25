# TeamTrack

TeamTrack is a lightweight team record dashboard designed to maintain a clear and simple record of team members and their current work.

The main goal is to know **who is working, what their role is, which department they belong to, when they started, and which project they are currently working on**.

Detailed personal and professional information will not be duplicated in TeamTrack. Each member's complete profile can be accessed through their HaproID profile.

---

## Project Purpose

TeamTrack is created to maintain a simple and organized record of team members.

It provides a quick overview of:

* Team members
* Profile photo
* Full name
* Role
* Department
* Current project
* Start date
* Work status
* HaproID profile

The dashboard is intended to provide quick information without storing unnecessary duplicate profile data.

---

## Dashboard

The main dashboard will contain:

* Search bar
* Member statistics
* Team member list
* Current project information
* Active / Inactive status
* HaproID profile links

### Member List

| #  | Photo | Name | Role | Department | Current Project | Start Date | Status |
| -- | ----- | ---- | ---- | ---------- | --------------- | ---------- | ------ |
| 01 | Photo | Domy | —    | —          | —               | —          | Active |

---

## Member Profile

TeamTrack will not duplicate complete member information.

When a member's name or HaproID is selected, the user can open their HaproID profile.

The HaproID profile can contain detailed information such as:

* Personal information
* Professional information
* Skills
* Experience
* Projects
* Certificates
* Social profiles
* Contact information
* Other profile details

This keeps TeamTrack focused only on team/work records.

---

## Data Structure

The initial version will use JSON for storing team member records.

```json
{
  "id": "Pro-Domy-01",
  "photo": "assets/team/domy.webp",
  "name": "Domy",
  "role": "",
  "department": "",
  "currentProject": "",
  "startDate": "",
  "status": "Active",
  "haproId": "https://haproid.netlify.app/Pro-Domy-01"
}
```
