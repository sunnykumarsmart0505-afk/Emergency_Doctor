Emergency Doctor – Real-Time Healthcare & Emergency Response System
An end-to-end web platform designed to streamline emergency medical assistance. The system enables real-time SOS tracking, live WebRTC/PeerJS video consultations, dynamic prescription management, and role-based access control for Patients, Doctors, and Admins.

🚀 Key Features
👨‍⚕️ Doctor Portal
Live Video Consultations: PeerJS-powered real-time WebRTC audio/video call interface with ringback notifications, incoming call acceptance/rejection controls, and dynamic full-screen toggles.

Emergency Geolocation: Real-time patient location visualization using interactive Leaflet maps.

Prescription Engine: Built-in form to write, store, and display digital prescriptions directly to assigned patients.

Task Management: Real-time dynamic updates of active emergency assignments with status indicators.

👤 Patient Portal
One-Touch Video SOS: Immediate PeerJS video call triggering with live audio ringback tones until doctor acceptance.

Prescription Viewer: Instant loading and visual breakdown of issued diagnoses, medicine dosages, frequencies, and doctor notes.

Hotline Call Backup: One-click cellular/VOIP hotline option for immediate phone contact.

🛡️ Admin Dashboard
System Overview Analytics: Real-time counters tracking total active patients, registered doctors, and pending emergency SOS requests.

Doctor & Patient Registries: Live data tables tracking status, specializations, blood groups, and medical history/allergies.

SOS Dispatch Control: Centralized monitoring of active emergency sessions with latitude/longitude data points.

🛠️ Tech Stack
Frontend: HTML5, CSS3, Tailwind CSS, PeerJS (WebRTC), Leaflet.js (OpenStreetMap)

Backend: Node.js, Express.js

Database: MongoDB, Mongoose

Real-Time Communications: WebSockets / PeerJS Signaling Engine

📁 Project Structure
Plaintext
├── server.js               # Node.js/Express backend API & MongoDB configuration
├── login.html              # Unified login and registration page with role-based routing
├── admin-dashboard.html    # System administration and registry overview
├── patient-dashboard.html  # Patient UI for video calling, SOS, and prescription viewing
├── doctor.html             # Doctor portal for task handling, mapping, and video consulting
├── prescription.html       # Prescription generation form module
└── README.md               # Project documentation
⚙️ Installation & Setup
Prerequisites
Node.js (v14.x or higher)

MongoDB (Local instance running on mongodb://localhost:27017 or MongoDB Atlas URI)

Steps
Clone the repository:

Bash
git clone https://github.com/your-username/emergency-doctor.git
cd emergency-doctor
Install dependencies:

Bash
npm install
Configure Database Connection:
Ensure MongoDB is running locally or set your environment URI in server.js:

JavaScript
mongoose.connect('mongodb://localhost:27017/emergency_doctor');
Start the Server:

Bash
node server.js
The backend server will launch at http://localhost:3000.

Access the Application:
Open login.html in your web browser (or serve statically via Express/Live Server).

📄 Research Potential
This project provides a functional base for academic research publications in the following domains:

Telemedicine & Emergency Healthcare: Comparative performance metrics of PeerJS/WebRTC video calls in high-latency emergency scenarios.

Geospatial Information Systems (GIS): Real-time mapping optimization and dispatch latency analysis using Leaflet.js.

Software Architecture: Scalability evaluation of role-based WebRTC signaling architectures in emergency response frameworks.
