
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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

    doctor_id: Number,
    patient_id: Number
});

const User = mongoose.model('User', userSchema);

async function createUsers() {

    try {

        await mongoose.connect(
            'mongodb://127.0.0.1:27017/emergency_doctor'
        );

        console.log('MongoDB Connected');

        // Delete old demo users
        await User.deleteMany({
            username: {
                $in: ['doctor1', 'patient1', 'admin']
            }
        });

        const users = [

            {
                username: 'doctor1',
                password: await bcrypt.hash('doctor123', 10),
                role: 'doctor',
                doctor_id: 1
            },

            {
                username: 'patient1',
                password: await bcrypt.hash('patient123', 10),
                role: 'patient',
                patient_id: 1
            },

            {
                username: 'admin',
                password: await bcrypt.hash('admin123', 10),
                role: 'admin'
            }

        ];

        await User.insertMany(users);

        console.log('');
        console.log('✅ Users created successfully!');
        console.log('');
        console.log('Doctor  → doctor1 / doctor123');
        console.log('Patient → patient1 / patient123');
        console.log('Admin   → admin / admin123');
        console.log('');

        await mongoose.disconnect();

    } catch (error) {

        console.error('❌ Error:', error.message);

    }
}

createUsers();

