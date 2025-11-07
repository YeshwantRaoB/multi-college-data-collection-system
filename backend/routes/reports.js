const express = require('express');
const XLSX = require('xlsx');
let jsPDF;
try {
    jsPDF = require('jspdf').jsPDF;
    require('jspdf-autotable');
} catch (error) {
    console.warn('jsPDF not loaded, PDF export will be unavailable');
}
const College = require('../models/College');
const { adminAuth, auth } = require('../middleware/auth');
const router = express.Router();

// Get colleges data with filters (for both API and export)
const getFilteredColleges = async (filters, user) => {
    let query = {};
    
    // College users can only access their own college
    if (user.role === 'college') {
        query.collegeCode = user.collegeCode;
    } else {
        // Admin can filter by various criteria
        if (filters.district) query.district = filters.district;
        if (filters.taluk) query.taluk = filters.taluk;
        if (filters.designation) query.designation = filters.designation;
        if (filters.group) query.group = filters.group;
        if (filters.branch) query.branch = filters.branch;
        if (filters.collegeCode) query.collegeCode = filters.collegeCode;
    }
    
    return await College.find(query).sort({ collegeName: 1 });
};

// Get report data with filters
router.get('/data', auth, async (req, res) => {
    try {
        const filters = req.query;
        const colleges = await getFilteredColleges(filters, req.user);
        
        // Calculate summary statistics
        const summary = {
            totalColleges: colleges.length,
            totalSanctioned: colleges.reduce((sum, college) => sum + college.sanctioned, 0),
            totalWorking: colleges.reduce((sum, college) => sum + college.working, 0),
            totalVacant: colleges.reduce((sum, college) => sum + college.vacant, 0),
            totalDeputation: colleges.reduce((sum, college) => sum + college.deputation, 0),
            byDistrict: {},
            byDesignation: {}
        };
        
        colleges.forEach(college => {
            // Group by district
            if (!summary.byDistrict[college.district]) {
                summary.byDistrict[college.district] = {
                    colleges: 0,
                    sanctioned: 0,
                    working: 0,
                    vacant: 0,
                    deputation: 0
                };
            }
            summary.byDistrict[college.district].colleges++;
            summary.byDistrict[college.district].sanctioned += college.sanctioned;
            summary.byDistrict[college.district].working += college.working;
            summary.byDistrict[college.district].vacant += college.vacant;
            summary.byDistrict[college.district].deputation += college.deputation;
            
            // Group by designation
            if (!summary.byDesignation[college.designation]) {
                summary.byDesignation[college.designation] = {
                    colleges: 0,
                    sanctioned: 0,
                    working: 0,
                    vacant: 0,
                    deputation: 0
                };
            }
            summary.byDesignation[college.designation].colleges++;
            summary.byDesignation[college.designation].sanctioned += college.sanctioned;
            summary.byDesignation[college.designation].working += college.working;
            summary.byDesignation[college.designation].vacant += college.vacant;
            summary.byDesignation[college.designation].deputation += college.deputation;
        });
        
        res.json({
            colleges,
            summary,
            filters,
            generatedAt: new Date().toISOString()
        });
    } catch (error) {
        console.error('Get report data error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Export to Excel
router.get('/export/excel', auth, async (req, res) => {
    try {
        const filters = req.query;
        const colleges = await getFilteredColleges(filters, req.user);
        
        // Prepare data for Excel
        const excelData = colleges.map(college => ({
            'College Code': college.collegeCode,
            'College Name': college.collegeName,
            'District': college.district,
            'Taluk': college.taluk,
            'Designation': college.designation,
            'Group': college.group,
            'Branch': college.branch,
            'Sanctioned': college.sanctioned,
            'Working': college.working,
            'Vacant': college.vacant,
            'Deputation': college.deputation,
            'Deputation to College Code': college.deputationToCollegeCode,
            'Remarks': college.remarks,
            'Last Updated': college.lastUpdated
        }));
        
        // Create workbook
        const workbook = XLSX.utils.book_new();
        const worksheet = XLSX.utils.json_to_sheet(excelData);
        
        // Add worksheet to workbook
        XLSX.utils.book_append_sheet(workbook, worksheet, 'Colleges Report');
        
        // Add summary sheet
        const summaryData = [
            ['Report Summary', ''],
            ['Total Colleges', colleges.length],
            ['Total Sanctioned', colleges.reduce((sum, c) => sum + c.sanctioned, 0)],
            ['Total Working', colleges.reduce((sum, c) => sum + c.working, 0)],
            ['Total Vacant', colleges.reduce((sum, c) => sum + c.vacant, 0)],
            ['Total Deputation', colleges.reduce((sum, c) => sum + c.deputation, 0)],
            ['', ''],
            ['Generated At', new Date().toLocaleString()],
            ['Generated By', req.user.username]
        ];
        
        const summarySheet = XLSX.utils.aoa_to_sheet(summaryData);
        XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');
        
        // Generate buffer
        const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        
        // Set headers and send
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=colleges_report_${Date.now()}.xlsx`);
        res.send(buffer);
        
    } catch (error) {
        console.error('Export Excel error:', error);
        res.status(500).json({ message: 'Server error during export' });
    }
});

// Export to PDF
router.get('/export/pdf', auth, async (req, res) => {
    try {
        // Check if jsPDF is available
        if (!jsPDF) {
            return res.status(500).json({ message: 'PDF generation is currently unavailable' });
        }

        const filters = req.query;
        const colleges = await getFilteredColleges(filters, req.user);
        
        // Create PDF document
        const doc = new jsPDF();
        
        // Add title
        doc.setFontSize(16);
        doc.text('Colleges Data Report', 14, 15);
        
        // Add generation info
        doc.setFontSize(10);
        doc.text(`Generated by: ${req.user.username}`, 14, 25);
        doc.text(`Generated at: ${new Date().toLocaleString()}`, 14, 30);
        doc.text(`Total colleges: ${colleges.length}`, 14, 35);
        
        // Prepare table data
        const tableData = colleges.map(college => [
            college.collegeCode,
            college.collegeName,
            college.district,
            college.taluk,
            college.designation,
            college.sanctioned.toString(),
            college.working.toString(),
            college.vacant.toString(),
            college.deputation.toString(),
            college.deputationToCollegeCode || ''
        ]);
        
        // Add table
        doc.autoTable({
            startY: 40,
            head: [['Code', 'Name', 'District', 'Taluk', 'Designation', 'Sanctioned', 'Working', 'Vacant', 'Deputation', 'Deputation To']],
            body: tableData,
            styles: { fontSize: 8 },
            headStyles: { fillColor: [41, 128, 185] }
        });
        
        // Add summary page if there are multiple pages
        if (doc.internal.getNumberOfPages() > 1) {
            doc.addPage();
            doc.setFontSize(14);
            doc.text('Summary', 14, 15);
            
            // Calculate totals
            const totals = {
                sanctioned: colleges.reduce((sum, c) => sum + c.sanctioned, 0),
                working: colleges.reduce((sum, c) => sum + c.working, 0),
                vacant: colleges.reduce((sum, c) => sum + c.vacant, 0),
                deputation: colleges.reduce((sum, c) => sum + c.deputation, 0)
            };
            
            const summaryData = [
                ['Metric', 'Total'],
                ['Sanctioned Positions', totals.sanctioned],
                ['Working Positions', totals.working],
                ['Vacant Positions', totals.vacant],
                ['Deputation Positions', totals.deputation]
            ];
            
            doc.autoTable({
                startY: 25,
                head: [['Metric', 'Total']],
                body: summaryData,
                styles: { fontSize: 10 }
            });
        }
        
        // Generate PDF buffer
        const pdfBuffer = Buffer.from(doc.output('arraybuffer'));
        
        // Set headers and send
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=colleges_report_${Date.now()}.pdf`);
        res.send(pdfBuffer);
        
    } catch (error) {
        console.error('Export PDF error:', error);
        res.status(500).json({ message: 'Server error during export' });
    }
});

// Get available filter options
router.get('/filters', auth, async (req, res) => {
    try {
        let query = {};
        if (req.user.role === 'college') {
            query.collegeCode = req.user.collegeCode;
        }
        
        const colleges = await College.find(query);
        
        const filters = {
            districts: [...new Set(colleges.map(c => c.district))].filter(Boolean).sort(),
            taluks: [...new Set(colleges.map(c => c.taluk))].filter(Boolean).sort(),
            designations: [...new Set(colleges.map(c => c.designation))].filter(Boolean).sort(),
            groups: [...new Set(colleges.map(c => c.group))].filter(Boolean).sort(),
            branches: [...new Set(colleges.map(c => c.branch))].filter(Boolean).sort(),
            collegeCodes: [...new Set(colleges.map(c => c.collegeCode))].filter(Boolean).sort()
        };
        
        res.json(filters);
    } catch (error) {
        console.error('Get filters error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;