# [Project Name] - Testing Plan

## Application Overview

**[Project Name]** is a [brief description of the application] at `[base URL]`. It allows [target users] to [core user actions].

---

## Application Features

### 1. [Feature Name]
- Fetches data from `[METHOD] [endpoint]` on [trigger, e.g. page load]
- Displays each item with: [field 1], [field 2], [field 3]
- [Controls / interactions available to the user]

### 2. [Feature Name]
- **User actions**: [action 1]; [action 2]; [action 3]
- **UI state changes**: [what updates in the UI as a result]
- **Validation**: [required conditions before action is allowed]
- **On success**: [what happens after a successful action]

### 3. [Feature Name] *(UI only)*
- **Appearance**: [what the user sees, e.g. element, color, position]
- **Trigger**: [what causes the UI change, e.g. button click, page load]
- **Expected UI state**: [what should be visible / hidden / changed after trigger]

*(Add more sections as needed)*

---

## API Endpoints 

| Method | Endpoint         | Description              |
|--------|------------------|--------------------------|
| GET    | `/api/[path]`    | [Description]            |
| POST   | `/api/[path]`    | [Description]            |
| GET    | `/api/[path]/:id`| [Description]            |
| PUT    | `/api/[path]/:id`| [Description]            |

---

## API Documentation

Interactive API documentation is available via Swagger UI:

| File | Purpose |
|------|---------|
| `swagger.json` | OpenAPI specification — schemas, endpoints, request/response examples |
| `swagger-ui.html` | Self-contained Swagger UI viewer |

**To open the docs:**
1. Double-click `swagger-ui.html`, or run:
   ```powershell
   Start-Process swagger-ui.html
   ```
2. To use **Try it out**, start the app first (`[base URL]`).

---

## Naming Convention

- Use sequential test case IDs (e.g., TC-01, TC-02, TC-03).
- Each `.spec.ts` file has its own numbering, starting from TC-01.

### Naming template
See [File Plan](./file_plan_TEMPLATE.md) for the full structure.

---

## Test Plan

### TC-01: [Test Case Title]
- **Scenario**: [What is being tested]
- **Steps**: [How to reproduce / what actions to take]
- **Expected**: [Expected outcome]

---

### TC-02: [Test Case Title]
- **Scenario**: [What is being tested]
- **Steps**: [How to reproduce / what actions to take]
- **Expected**: [Expected outcome]

---

### TC-03: [Test Case Title]
- **Scenario**: [What is being tested]
- **Steps**:
  1. [Step 1]
  2. [Step 2]
  3. [Step 3]
- **Expected**: [Expected outcome]

---

*(Add more test cases following the same pattern)*

---

## Test Priorities

| Priority | Test Cases |
|----------|------------|
| Critical | TC-XX, TC-XX |
| High     | TC-XX, TC-XX |
| Medium   | TC-XX, TC-XX |
| Low      | TC-XX, TC-XX |

---

## File Plan

```
tests/
├── api/
│   ├── [resource].spec.ts       # TC-XX: [description]
│   └── [resource].spec.ts       # TC-XX: [description]
├── [feature].spec.ts            # TC-XX: [description]
│                                # TC-XX: [description]
├── [feature].spec.ts            # TC-XX: [description]
└── page-objects/
    ├── [Feature]Page.ts
    └── [Feature]Page.ts
```
### Page-object model template
See [File Plan](./file_plan_TEMPLATE.md) for the full structure.

### Fixture template
See [File Plan](./file_plan_TEMPLATE.md) for the full structure.

**Structure explained:**

- **`api/` line** — any test file inside the `api/` folder tests the backend directly (HTTP requests), not the UI. You replace `[resource]` with what you're testing, like `orders` or `menu`.
- **`[feature].spec.ts` line** — the `.spec.ts` files outside `api/` are browser tests. One file = one feature area. If you see multiple `# TC-XX` comments attached to the same file, it means that file contains more than one test case.
- **`pages/` line** — the `pages/` folder holds Page Object classes, one per page or feature. Instead of writing raw selectors in every test, you put them in these classes. `[Feature]Page.ts` becomes something like `LoginPage.ts`.
- **`TC-XX` line** — `TC-XX` is just a placeholder for a numbered test case ID like `TC-01`. The `[description]` next to it is a one-line summary of what that test checks.

**Notes:**
- `api/` specs use Playwright's `request` fixture directly, no browser needed.
- Spec files map 1:1 to feature areas, allowing targeted runs (e.g. `npx playwright test [feature]`).
