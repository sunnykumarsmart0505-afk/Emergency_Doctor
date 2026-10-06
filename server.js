const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ===============================
// MongoDB Connection
// ===============================
mongoose.connect('mongodb://127.0.0.1:27017/emergency_doctor')
    .then(() => {
        console.log('✅ MongoDB Connected');
    })
    .catch((err) => {
        console.error('❌ MongoDB Connection Error:', err.message);
    });


// ===============================
// Patient Schema
// ===============================
const patientSchema = new mongoose.Schema({
    patient_id: {
        type: Number,
        unique: true,
        required: true
    },
    name: {
        type: String,
        required: true
    },
    blood_group: {
        type: String
    },
    allergies: {
        type: String
    }
}, {
    timestamps: true
});

const Patient = mongoose.model('Patient', patientSchema);


// ===============================
// Emergency Session Schema
// ===============================
const emergencySessionSchema = new mongoose.Schema({
    session_id: {
        type: Number,
        unique: true,
        required: true
    },
    device_id: {
        type: String
    },
    patient_id: {
        type: Number,
        required: true
    },
    latitude: {
        type: Number
    },
    longitude: {
        type: Number
    },
    status: {
        type: String,
        default: 'PENDING'
    }
}, {
    timestamps: true
});

const EmergencySession = mongoose.model(
    'EmergencySession',
    emergencySessionSchema
);


// ===============================
// Doctor Assignment Schema
// ===============================
const doctorAssignmentSchema = new mongoose.Schema({
    session_id: {
        type: Number,
        required: true
    },
    doctor_id: {
        type: Number,
        required: true
    }
}, {
    timestamps: true
});

const DoctorAssignment = mongoose.model(
    'DoctorAssignment',
    doctorAssignmentSchema
);
// ===============================
// Prescription Schema
// ===============================
const prescriptionSchema = new mongoose.Schema({
    prescription_id: {
        type: Number,
        unique: true,
        required: true
    },

    patient_id: {
        type: Number,
        required: true
    },

    session_id: {
        type: Number,
        required: true
    },

    doctor_id: {
        type: Number,
        required: true
    },

    diagnosis: {
        type: String,
        required: true
    },

    medicines: [
        {
            medicine_name: {
                type: String,
                required: true
            },

            dosage: {
                type: String,
                required: true
            },

            frequency: {
                type: String,
                required: true
            },

            duration: {
                type: String,
                required: true
            },

            instructions: {
                type: String
            }
        }
    ],

    doctor_notes: {
        type: String
    }
}, {
    timestamps: true
});

const Prescription = mongoose.model(
    'Prescription',
    prescriptionSchema
);
// ===============================
// User Schema - Login
// ===============================
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        unique: true,
        required: true
    },

    password: {
        type: String,
        required: true
    },

    role: {
        type: String,
        enum: ['doctor', 'patient', 'admin'],
        required: true
    },

    doctor_id: {
        type: Number
    },

    patient_id: {
        type: Number
    }
}, {
    timestamps: true
});

const User = mongoose.model('User', userSchema);

// ===============================
// Login
// ===============================
app.post('/login', async (req, res) => {
    try {

        const { username, password, role } = req.body;

        if (!username || !password || !role) {
            return res.status(400).json({
                message: 'Username, password and role are required'
            });
        }

        const user = await User.findOne({
            username,
            role
        });

        if (!user) {
            return res.status(401).json({
                message: 'Invalid username, password or role'
            });
        }

        const passwordMatch = await bcrypt.compare(
            password,
            user.password
        );

        if (!passwordMatch) {
            return res.status(401).json({
                message: 'Invalid username, password or role'
            });
        }

        const token = jwt.sign(
            {
                userId: user._id,
                username: user.username,
                role: user.role
            },
            'emergency_doctor_secret',
            {
                expiresIn: '1d'
            }
        );

        res.json({
            message: 'Login successful',
            token,
            role: user.role,
            doctor_id: user.doctor_id || null,
            patient_id: user.patient_id || null
        });

    } catch (err) {

        console.error('Login Error:', err);

        res.status(500).json({
            message: 'Server error'
        });
    }
});

// ===============================
// 1. Root Check
// ===============================
app.get('/', (req, res) => {
    res.json({
        message: 'System Online',
        database: 'MongoDB'
    });
});


// ===============================
// 2. Register Patient
// ===============================
app.post('/register-patient', async (req, res) => {
    try {
        const { name, blood_group, allergies } = req.body;

        if (!name) {
            return res.status(400).json({
                error: 'Patient name is required'
            });
        }

        const lastPatient = await Patient
            .findOne()
            .sort({ patient_id: -1 });

        const patient_id = lastPatient
            ? lastPatient.patient_id + 1
            : 1;

        const patient = new Patient({
            patient_id,
            name,
            blood_group,
            allergies
        });

        const savedPatient = await patient.save();

        res.status(201).json(savedPatient);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});


// ===============================
// 3. SOS Trigger
// ===============================
app.post('/trigger-sos', async (req, res) => {
    try {
        const {
            device_id,
            patient_id,
            latitude,
            longitude
        } = req.body;

        if (!patient_id) {
            return res.status(400).json({
                error: 'patient_id is required'
            });
        }

        // Check patient exists
        const patient = await Patient.findOne({
            patient_id: Number(patient_id)
        });

        if (!patient) {
            return res.status(404).json({
                error: 'Patient not found'
            });
        }

        const lastSession = await EmergencySession
            .findOne()
            .sort({ session_id: -1 });

        const session_id = lastSession
            ? lastSession.session_id + 1
            : 1;

        const session = new EmergencySession({
            session_id,
            device_id,
            patient_id: Number(patient_id),
            latitude,
            longitude,
            status: 'PENDING'
        });

        await session.save();

        res.status(201).json({
            session_id: session.session_id,
            message: 'SOS triggered successfully'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});


// ===============================
// 4. Get Pending SOS List
// ===============================
app.get('/pending-sos', async (req, res) => {
    try {

        const sessions = await EmergencySession.find({
            status: 'PENDING'
        }).sort({ createdAt: -1 });

        res.json(sessions);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});


// ===============================
// 5. Assign Doctor
// ===============================
app.post('/assign-doctor', async (req, res) => {
    try {

        const {
            session_id,
            doctor_id
        } = req.body;

        const session = await EmergencySession.findOne({
            session_id: Number(session_id)
        });

        if (!session) {
            return res.status(404).json({
                error: 'Emergency session not found'
            });
        }

        // Create doctor assignment
        const assignment = new DoctorAssignment({
            session_id: Number(session_id),
            doctor_id: Number(doctor_id)
        });

        await assignment.save();

        // Update emergency status
        session.status = 'ASSIGNED';
        await session.save();

        res.json({
            message: 'Doctor Assigned',
            session_id: Number(session_id),
            doctor_id: Number(doctor_id)
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});


// ===============================
// 6. Get Assigned SOS for Doctor
// ===============================
app.get('/assigned-sos/:doctor_id', async (req, res) => {
    try {

        const doctor_id = Number(req.params.doctor_id);

        const assignments = await DoctorAssignment.find({
            doctor_id
        });

        const results = [];

        for (const assignment of assignments) {

            const session = await EmergencySession.findOne({
                session_id: assignment.session_id,
                status: 'ASSIGNED'
            });

            if (!session) {
                continue;
            }

            const patient = await Patient.findOne({
                patient_id: session.patient_id
            });

            results.push({
                session_id: session.session_id,
                device_id: session.device_id,
                patient_id: session.patient_id,
                latitude: session.latitude,
                longitude: session.longitude,
                status: session.status,
                name: patient ? patient.name : null,
                blood_group: patient ? patient.blood_group : null,
                allergies: patient ? patient.allergies : null
            });
        }

        res.json(results);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});


// ===============================
// 7. Update Status
// ===============================
app.put('/update-status/:session_id', async (req, res) => {
    try {

        const { status } = req.body;

        const session_id = Number(req.params.session_id);

        const session = await EmergencySession.findOneAndUpdate(
            { session_id },
            { status },
            { new: true }
        );

        if (!session) {
            return res.status(404).json({
                error: 'Emergency session not found'
            });
        }

        res.json({
            message: `Session ${session_id} updated to ${status}`,
            session
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});


// ===============================
// 8. Get All Patients
// ===============================
app.get('/patients', async (req, res) => {
    try {

        const patients = await Patient
            .find()
            .sort({ patient_id: 1 });

        res.json(patients);

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});


// ===============================
// 9. Delete SOS
// ===============================
app.delete('/delete-sos/:session_id', async (req, res) => {
    try {

        const session_id = Number(req.params.session_id);

        const deletedSession =
            await EmergencySession.findOneAndDelete({
                session_id
            });

        if (!deletedSession) {
            return res.status(404).json({
                error: 'Emergency session not found'
            });
        }

        // Also remove doctor assignment
        await DoctorAssignment.deleteMany({
            session_id
        });

        res.json({
            message: 'Deleted successfully'
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({
            error: err.message
        });
    }
});
// ===============================
// 10. Create Prescription
// ===============================
app.post('/create-prescription', async (req, res) => {
    try {

        const {
            patient_id,
            session_id,
            doctor_id,
            diagnosis,
            medicines,
            doctor_notes
        } = req.body;

        // Validate required fields
        if (
            !patient_id ||
            !session_id ||
            !doctor_id ||
            !diagnosis ||
            !medicines ||
            medicines.length === 0
        ) {
            return res.status(400).json({
                error: 'Required prescription information is missing'
            });
        }

        // Check patient
        const patient = await Patient.findOne({
            patient_id: Number(patient_id)
        });

        if (!patient) {
            return res.status(404).json({
                error: 'Patient not found'
            });
        }

        // Check emergency session
        const session = await EmergencySession.findOne({
            session_id: Number(session_id)
        });

        if (!session) {
            return res.status(404).json({
                error: 'Emergency session not found'
            });
        }

        // Generate prescription ID
        const lastPrescription = await Prescription
            .findOne()
            .sort({ prescription_id: -1 });

        const prescription_id = lastPrescription
            ? lastPrescription.prescription_id + 1
            : 1;

        // Create prescription
        const prescription = new Prescription({
            prescription_id,
            patient_id: Number(patient_id),
            session_id: Number(session_id),
            doctor_id: Number(doctor_id),
            diagnosis,
            medicines,
            doctor_notes
        });

        const savedPrescription = await prescription.save();

        res.status(201).json({
            message: 'Prescription created successfully',
            prescription: savedPrescription
        });

    } catch (err) {

        console.error('Prescription Error:', err);

        res.status(500).json({
            error: err.message
        });
    }
});
// ===============================
// 11. Get Patient Prescriptions
// ===============================
app.get('/prescriptions/:patient_id', async (req, res) => {
    try {

        const patient_id = Number(req.params.patient_id);

        const prescriptions = await Prescription
            .find({ patient_id })
            .sort({ createdAt: -1 });

        res.json(prescriptions);

    } catch (err) {

        console.error('Get Prescription Error:', err);

        res.status(500).json({
            error: err.message
        });
    }
});

// ===============================
// Start Server
// ===============================
app.listen(3000, () => {
    console.log('🚀 Server is running on http://localhost:3000');
});