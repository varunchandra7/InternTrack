This section is crucial for ensuring that any AI you work with (including myself) remains consistent with your tech stack, naming conventions, and project architecture.

Based on our discussion about the **MERN-based Placement Tracker**, here is a comprehensive "Context & Guidelines" block you can add to your project documentation or use as a system prompt.

---

### **Project Context**

* **Project Name:** Placement Tracker (PT)
* **Goal:** A centralized dashboard for students to track recruitment events (Hackathons, Internships, Contests) via a calendar and access company-specific Previous Year Questions (PYQs).
* **Target Users:** Engineering Students (General Users) and Placement Coordinators (Admins).
* **Core Architecture:** MERN Stack (MongoDB, Express, React, Node.js).
* **Key Modules:** * **Event Calendar:** Interactive monthly view (FullCalendar.io).
* **PYQ Repository:** Searchable/filterable PDF database.
* **Admin Suite:** CRUD operations for events and file uploads.
* **User Profiles:** Bookmarking and application tracking.



---

### **Coding Guidelines for AI**

#### **1. Tech Stack Specifics**

* **Frontend:** Use functional React components with Hooks (useState, useEffect). Use **Tailwind CSS** for styling (utility-first approach).
* **Backend:** Use **Express.js** with **Mongoose** for MongoDB modeling. Ensure all routes are modularized using Express Router.
* **State Management:** Use React Context API for user authentication state; local state for UI-specific logic.
* **API Pattern:** Follow RESTful conventions. All responses should be in JSON format.

#### **2. Code Quality & Standards**

* **Naming Conventions:** * Frontend: PascalCase for components (`EventModal.jsx`), camelCase for variables/functions (`fetchEvents`).
* Backend: camelCase for routes and controllers.


* **Error Handling:** Implement `try-catch` blocks in both frontend (Axios calls) and backend (Async middleware). Always return meaningful HTTP status codes (e.g., 401 for Unauthorized, 404 for Not Found).
* **Security:** Assume the use of **JWT** for session management. Always include placeholders for middleware like `protect` and `adminOnly`.
* **Modularity:** Keep components small and reusable. Logic for API calls should be separated into a `services/` or `utils/` directory.

#### **3. UI/UX Priorities**

* **Responsiveness:** Code generated must be mobile-friendly (essential for students checking dates on the go).
* **Visual Feedback:** Use loading states (Spinners) and success/error notifications (Toasts) for every form submission.

#### **4. Documentation**

* Every function should have a brief comment explaining its purpose.
* For complex logic (like calendar date filtering), provide a brief explanation of the algorithm used.

---


