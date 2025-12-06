# **App Name**: eStores WorkHub Pay Portal

## Core Features:

- User Authentication: Securely authenticate users via Firebase upon login.
- Role-Based Redirection: Redirect users to their respective dashboards based on their role (Super Admin, Admin, Employee, College, Industry).
- Employee ID Generation: Automatically generate a unique Employee ID upon signup (e.g., ESG202512SK).
- Data Storage in MySQL and Firestore: Store user data (excluding passwords) in MySQL, and authentication data in Firestore for enhanced security.
- Attendance Tracking: Enable employees to mark their attendance (Present/Absent) daily, stored in MySQL.
- Task Management: Allow admins to assign tasks to employees, tracked via MySQL.
- Message Delivery: Reason about a list of the emails in order to determine whether there exists a short summary to extract as a tool, to facilitate employee access.

## Style Guidelines:

- Primary color: Yellow (#FFD700) for accents, titles, and buttons to highlight important UI elements.
- Background color: White (#FFFFFF) for the main background to create a clean, open feel.
- Text color: Black (#000000) for all text and borders, providing strong contrast and readability.
- Font: 'Inter', a sans-serif typeface, will be used for all text, to maintain legibility across the platform; an ideal choice due to its balanced and modern aesthetic.
- Use of flexbox and CSS grids for a responsive, clean, and modern layout.
- Subtle fade-in animations and button hover effects (slight yellow glow) to enhance user experience.
- Simple, clear icons to represent different functions and data points, adhering to the black/yellow/white color scheme.