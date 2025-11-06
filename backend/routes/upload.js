const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const College = require('../models/College');
const User = require('../models/User');
const UpdateLog = require('../models/UpdateLog');
const { adminAuth } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
    storage: storage,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    },
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
            file.mimetype === 'application/vnd.ms-excel') {
            cb(null, true);
        } else {
            cb(new Error('Only Excel files are allowed'), false);
        }
    }
});

// Upload colleges from Excel
router.post('/colleges', adminAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({ message: 'Excel file is empty' });
        }

        // Expected columns
        const expectedColumns = [
            'College Code', 'College Name', 'District', 'Taluk',
            'Designation', 'Group', 'Branch', 'Sanctioned',
            'Working', 'Vacant', 'Deputation', 'Deputation to College Code', 'Remarks'
        ];

        // Validate columns
        const firstRow = data[0];
        const actualColumns = Object.keys(firstRow);
        const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
        
        if (missingColumns.length > 0) {
            return res.status(400).json({ 
                message: `Missing columns: ${missingColumns.join(', ')}` 
            });
        }

        const results = {
            total: data.length,
            successful: 0,
            errors: [],
            duplicates: 0
        };

        // Process each row
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            const rowNum = i + 2; // header is row 1
            try {
                // Basic required fields
                const required = ['College Code', 'College Name', 'District', 'Taluk', 'Designation', 'Group', 'Branch', 'Sanctioned'];
                const missing = required.filter(r => !row[r] && row[r] !== 0);
                if (missing.length) {
                    results.errors.push(`Row ${rowNum}: Missing required fields: ${missing.join(', ')}`);
                    continue;
                }

                // Parse numeric fields safely
                const sanctioned = Number.isFinite(Number(row['Sanctioned'])) ? parseInt(row['Sanctioned'], 10) : NaN;
                const working = row['Working'] !== undefined && row['Working'] !== '' ? parseInt(row['Working'], 10) : 0;
                const deputation = row['Deputation'] !== undefined && row['Deputation'] !== '' ? parseInt(row['Deputation'], 10) : 0;

                if (Number.isNaN(sanctioned) || sanctioned < 0) {
                    results.errors.push(`Row ${rowNum}: Invalid Sanctioned value`);
                    continue;
                }
                if (Number.isNaN(working) || working < 0) {
                    results.errors.push(`Row ${rowNum}: Invalid Working value`);
                    continue;
                }
                if (Number.isNaN(deputation) || deputation < 0) {
                    results.errors.push(`Row ${rowNum}: Invalid Deputation value`);
                    continue;
                }

                // Check if college already exists
                const existingCollege = await College.findOne({ 
                    collegeCode: String(row['College Code']).trim()
                });

                if (existingCollege) {
                    results.duplicates++;
                    results.errors.push(`Row ${rowNum}: College code ${row['College Code']} already exists`);
                    continue;
                }

                // Compute vacant server-side (ignore provided Vacant column to avoid inconsistencies)
                const computedVacant = Math.max(0, sanctioned - working - deputation);

                // Create new college
                const college = new College({
                    collegeCode: String(row['College Code']).trim(),
                    collegeName: String(row['College Name']).trim(),
                    district: String(row['District']).trim(),
                    taluk: String(row['Taluk']).trim(),
                    designation: String(row['Designation']).trim(),
                    group: String(row['Group']).trim(),
                    branch: String(row['Branch']).trim(),
                    sanctioned: sanctioned,
                    working: working,
                    vacant: computedVacant,
                    deputation: deputation,
                    deputationToCollegeCode: row['Deputation to College Code'] ? String(row['Deputation to College Code']).trim() : '',
                    remarks: row['Remarks'] ? String(row['Remarks']).trim() : '',
                    updatedBy: req.user._id
                });

                await college.save();
                results.successful++;

                // Log the bulk creation
                const updateLog = new UpdateLog({
                    user: req.user._id,
                    collegeCode: college.collegeCode,
                    fieldChanged: 'Bulk Upload',
                    oldValue: 'N/A',
                    newValue: 'College created via bulk upload',
                    ipAddress: req.ip
                });
                await updateLog.save();

            } catch (error) {
                results.errors.push(`Row ${rowNum}: ${error.message}`);
            }
        }

        res.json({
            message: `Bulk upload completed: ${results.successful} successful, ${results.duplicates} duplicates, ${results.errors.length} errors`,
            results
        });

    } catch (error) {
        console.error('Upload colleges error:', error);
        res.status(500).json({ message: 'Server error during upload' });
    }
});

// Upload users from Excel
router.post('/users', adminAuth, upload.single('file'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const workbook = XLSX.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return res.status(400).json({ message: 'Excel file is empty' });
        }

        // Expected columns
        const expectedColumns = ['Username', 'Password', 'College Code'];
        const firstRow = data[0];
        const actualColumns = Object.keys(firstRow);
        const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
        
        if (missingColumns.length > 0) {
            return res.status(400).json({ 
                message: `Missing columns: ${missingColumns.join(', ')}` 
            });
        }

        const results = {
            total: data.length,
            successful: 0,
            errors: [],
            duplicates: 0
        };

        // Process each row
        for (let i = 0; i < data.length; i++) {
            const row = data[i];
            try {
                // Check if user already exists
                const existingUser = await User.findOne({ 
                    username: row['Username'] 
                });

                if (existingUser) {
                    results.duplicates++;
                    results.errors.push(`Row ${i + 2}: Username ${row['Username']} already exists`);
                    continue;
                }

                // Validate college code if provided
                if (row['College Code']) {
                    const college = await College.findOne({ 
                        collegeCode: row['College Code'] 
                    });
                    if (!college) {
                        results.errors.push(`Row ${i + 2}: College code ${row['College Code']} not found`);
                        continue;
                    }
                }

                // Create new user
                const user = new User({
                    username: row['Username'],
                    password: row['Password'],
                    collegeCode: row['College Code'] || null,
                    role: row['College Code'] ? 'college' : 'admin'
                });

                await user.save();
                results.successful++;

            } catch (error) {
                results.errors.push(`Row ${i + 2}: ${error.message}`);
            }
        }

        res.json({
            message: `Bulk upload completed: ${results.successful} successful, ${results.duplicates} duplicates, ${results.errors.length} errors`,
            results
        });

    } catch (error) {
        console.error('Upload users error:', error);
        res.status(500).json({ message: 'Server error during upload' });
    }
});

// Download template for colleges
router.get('/template/colleges', adminAuth, async (req, res) => {
    try {
        // Create sample data for template
        const templateData = [{
            'College Code': 'COL001',
            'College Name': 'Sample College Name',
            'District': 'Sample District',
            'Taluk': 'Sample Taluk',
            'Designation': 'Sample Designation',
            'Group': 'Sample Group',
            'Branch': 'Sample Branch',
            'Sanctioned': 50,
            'Working': 45,
            'Vacant': 5,
            'Deputation': 2,
            'Deputation to College Code': 'COL002',
            'Remarks': 'Sample remarks'
        }];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Colleges Template');
        
        // Generate buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=colleges_template.xlsx');
        res.send(buffer);

    } catch (error) {
        console.error('Download template error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Download template for users
router.get('/template/users', adminAuth, async (req, res) => {
    try {
        // Create sample data for template
        const templateData = [{
            'Username': 'college_user1',
            'Password': 'password123',
            'College Code': 'COL001'
        }];

        const worksheet = XLSX.utils.json_to_sheet(templateData);
        const workbook = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Users Template');
        
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=users_template.xlsx');
        res.send(buffer);

    } catch (error) {
        console.error('Download template error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;