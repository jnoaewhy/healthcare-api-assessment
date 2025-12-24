// Healthcare API Assessment Solution
// Built by JaQuan Earls

const https = require('https');

const API_KEY = 'ak_d666b6b10f981bdc91b9078b40f7d73cc1e3f4e0cf2a243e';
const BASE_URL = 'assessment.ksensetech.com';

// Utility function to make HTTP requests with retry logic
async function makeRequest(path, method = 'GET', data = null, retries = 3) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: BASE_URL,
            path: path,
            method: method,
            headers: {
                'x-api-key': API_KEY,
                'Content-Type': 'application/json'
            }
        };

        const attempt = (retriesLeft) => {
            const req = https.request(options, (res) => {
                let body = '';

                res.on('data', (chunk) => {
                    body += chunk;
                });

                res.on('end', () => {
                    // Handle different status codes
                    if (res.statusCode === 200) {
                        try {
                            resolve(JSON.parse(body));
                        } catch (e) {
                            reject(new Error('Invalid JSON response'));
                        }
                    } else if (res.statusCode === 429) {
                        // Rate limited - wait and retry
                        if (retriesLeft > 0) {
                            console.log(`⚠️  Rate limited. Waiting 2s before retry... (${retriesLeft} retries left)`);
                            setTimeout(() => attempt(retriesLeft - 1), 2000);
                        } else {
                            reject(new Error('Rate limit exceeded, no retries left'));
                        }
                    } else if (res.statusCode >= 500 && res.statusCode < 600) {
                        // Server error - retry
                        if (retriesLeft > 0) {
                            console.log(`⚠️  Server error ${res.statusCode}. Retrying... (${retriesLeft} retries left)`);
                            setTimeout(() => attempt(retriesLeft - 1), 1000);
                        } else {
                            reject(new Error(`Server error ${res.statusCode}, no retries left`));
                        }
                    } else {
                        reject(new Error(`HTTP ${res.statusCode}: ${body}`));
                    }
                });
            });

            req.on('error', (e) => {
                if (retriesLeft > 0) {
                    console.log(`⚠️  Request error: ${e.message}. Retrying... (${retriesLeft} retries left)`);
                    setTimeout(() => attempt(retriesLeft - 1), 1000);
                } else {
                    reject(e);
                }
            });

            if (data) {
                req.write(JSON.stringify(data));
            }

            req.end();
        };

        attempt(retries);
    });
}

// Fetch all patients with pagination
async function fetchAllPatients() {
    console.log('📊 Fetching patient data...\n');
    
    const allPatients = [];
    let page = 1;
    let hasMore = true;

    while (hasMore) {
        try {
            console.log(`   Fetching page ${page}...`);
            const response = await makeRequest(`/api/patients?page=${page}&limit=10`);
            
            if (response.data && response.data.length > 0) {
                allPatients.push(...response.data);
                console.log(`   ✓ Got ${response.data.length} patients (Total: ${allPatients.length})`);
            }

            hasMore = response.pagination && response.pagination.hasNext;
            page++;

            // Rate limiting prevention - wait between requests
            if (hasMore) {
                await new Promise(resolve => setTimeout(resolve, 500));
            }
        } catch (error) {
            console.error(`   ✗ Error fetching page ${page}:`, error.message);
            throw error;
        }
    }

    console.log(`\n✅ Total patients fetched: ${allPatients.length}\n`);
    return allPatients;
}

// Parse blood pressure string (e.g., "120/80")
function parseBloodPressure(bp) {
    if (!bp || typeof bp !== 'string') {
        return { systolic: null, diastolic: null, valid: false };
    }

    const parts = bp.split('/');
    if (parts.length !== 2) {
        return { systolic: null, diastolic: null, valid: false };
    }

    const systolic = parseInt(parts[0]);
    const diastolic = parseInt(parts[1]);

    if (isNaN(systolic) || isNaN(diastolic)) {
        return { systolic: null, diastolic: null, valid: false };
    }

    return { systolic, diastolic, valid: true };
}

// Calculate blood pressure risk score
function calculateBPRisk(bp) {
    const parsed = parseBloodPressure(bp);
    
    if (!parsed.valid) {
        return { score: 0, invalid: true };
    }

    const { systolic, diastolic } = parsed;

    // Stage 2: Systolic ≥140 OR Diastolic ≥90
    if (systolic >= 140 || diastolic >= 90) {
        return { score: 4, invalid: false };
    }

    // Stage 1: Systolic 130-139 OR Diastolic 80-89
    if ((systolic >= 130 && systolic <= 139) || (diastolic >= 80 && diastolic <= 89)) {
        return { score: 3, invalid: false };
    }

    // Elevated: Systolic 120-129 AND Diastolic <80
    if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
        return { score: 2, invalid: false };
    }

    // Normal: Systolic <120 AND Diastolic <80
    if (systolic < 120 && diastolic < 80) {
        return { score: 1, invalid: false };
    }

    return { score: 0, invalid: true };
}

// Calculate temperature risk score
function calculateTempRisk(temp) {
    if (temp === null || temp === undefined || temp === '') {
        return { score: 0, invalid: true };
    }

    const tempNum = parseFloat(temp);
    
    if (isNaN(tempNum)) {
        return { score: 0, invalid: true };
    }

    // High Fever: ≥101.0°F
    if (tempNum >= 101.0) {
        return { score: 2, invalid: false };
    }

    // Low Fever: 99.6-100.9°F
    if (tempNum >= 99.6 && tempNum <= 100.9) {
        return { score: 1, invalid: false };
    }

    // Normal: ≤99.5°F
    if (tempNum <= 99.5) {
        return { score: 0, invalid: false };
    }

    return { score: 0, invalid: true };
}

// Calculate age risk score
function calculateAgeRisk(age) {
    if (age === null || age === undefined || age === '') {
        return { score: 0, invalid: true };
    }

    const ageNum = parseInt(age);
    
    if (isNaN(ageNum)) {
        return { score: 0, invalid: true };
    }

    // Over 65: >65 years
    if (ageNum > 65) {
        return { score: 2, invalid: false };
    }

    // 40-65: 40-65 years (inclusive)
    if (ageNum >= 40 && ageNum <= 65) {
        return { score: 1, invalid: false };
    }

    // Under 40: <40 years
    if (ageNum < 40) {
        return { score: 1, invalid: false };
    }

    return { score: 0, invalid: true };
}

// Analyze all patients and generate alert lists
function analyzePatients(patients) {
    console.log('🔍 Analyzing patient data...\n');

    const highRiskPatients = [];
    const feverPatients = [];
    const dataQualityIssues = [];

    patients.forEach((patient) => {
        const patientId = patient.patient_id;

        // Calculate risk scores
        const bpRisk = calculateBPRisk(patient.blood_pressure);
        const tempRisk = calculateTempRisk(patient.temperature);
        const ageRisk = calculateAgeRisk(patient.age);

        const totalRisk = bpRisk.score + tempRisk.score + ageRisk.score;

        // Check for data quality issues
        if (bpRisk.invalid || tempRisk.invalid || ageRisk.invalid) {
            dataQualityIssues.push(patientId);
        }

        // Check for high risk (≥4)
        if (totalRisk >= 4) {
            highRiskPatients.push(patientId);
        }

        // Check for fever (≥99.6°F)
        const temp = parseFloat(patient.temperature);
        if (!isNaN(temp) && temp >= 99.6) {
            feverPatients.push(patientId);
        }

        // Log patient analysis
        console.log(`   ${patientId}: Risk=${totalRisk} (BP=${bpRisk.score}, Temp=${tempRisk.score}, Age=${ageRisk.score})` +
            (bpRisk.invalid || tempRisk.invalid || ageRisk.invalid ? ' [DATA ISSUE]' : ''));
    });

    console.log('\n📋 Analysis Complete:');
    console.log(`   High-Risk Patients: ${highRiskPatients.length}`);
    console.log(`   Fever Patients: ${feverPatients.length}`);
    console.log(`   Data Quality Issues: ${dataQualityIssues.length}\n`);

    return {
        high_risk_patients: highRiskPatients,
        fever_patients: feverPatients,
        data_quality_issues: dataQualityIssues
    };
}

// Submit assessment results
async function submitAssessment(results) {
    console.log('📤 Submitting assessment...\n');

    try {
        const response = await makeRequest('/api/submit-assessment', 'POST', results);
        
        console.log('✅ SUBMISSION SUCCESSFUL!\n');
        console.log('📊 Results:');
        console.log(`   Score: ${response.results.score}/100 (${response.results.percentage}%)`);
        console.log(`   Status: ${response.results.status}`);
        console.log(`   Attempt: ${response.results.attempt_number}/3`);
        console.log(`   Remaining Attempts: ${response.results.remaining_attempts}\n`);

        if (response.results.breakdown) {
            console.log('📈 Breakdown:');
            const breakdown = response.results.breakdown;
            
            if (breakdown.high_risk) {
                console.log(`   High-Risk: ${breakdown.high_risk.score}/${breakdown.high_risk.max} (${breakdown.high_risk.matches}/${breakdown.high_risk.correct} correct)`);
            }
            if (breakdown.fever) {
                console.log(`   Fever: ${breakdown.fever.score}/${breakdown.fever.max} (${breakdown.fever.matches}/${breakdown.fever.correct} correct)`);
            }
            if (breakdown.data_quality) {
                console.log(`   Data Quality: ${breakdown.data_quality.score}/${breakdown.data_quality.max} (${breakdown.data_quality.matches}/${breakdown.data_quality.correct} correct)`);
            }
        }

        if (response.results.feedback) {
            console.log('\n💬 Feedback:');
            if (response.results.feedback.strengths) {
                response.results.feedback.strengths.forEach(s => console.log(`   ${s}`));
            }
            if (response.results.feedback.issues) {
                response.results.feedback.issues.forEach(i => console.log(`   ${i}`));
            }
        }

        return response;
    } catch (error) {
        console.error('❌ Submission failed:', error.message);
        throw error;
    }
}

// Main execution
async function main() {
    console.log('🏥 Healthcare API Assessment\n');
    console.log('=' .repeat(50) + '\n');

    try {
        // Step 1: Fetch all patients
        const patients = await fetchAllPatients();

        // Step 2: Analyze patients
        const results = analyzePatients(patients);

        // Step 3: Submit results
        await submitAssessment(results);

        console.log('\n' + '='.repeat(50));
        console.log('✅ Assessment Complete!\n');

    } catch (error) {
        console.error('\n❌ Error:', error.message);
        process.exit(1);
    }
}

// Run the assessment
main();
