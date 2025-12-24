# Healthcare API Assessment Solution

**Built by JaQuan Earls**

Complete solution for the DemoMed Healthcare API assessment with retry logic, rate limiting, and proper risk scoring.

---

## 🚀 Overview

Node.js application that interfaces with a healthcare API to fetch patient data, calculate risk scores, and generate alert lists based on vital signs and demographic information. Implements robust error handling for real-world API conditions including rate limiting and intermittent failures.

---

## 🎯 Features

### Data Fetching
- Paginates through all patient records
- Handles rate limiting (429 errors)
- Retries on server errors (500/503)
- Implements delay between requests to prevent rate limiting

### Risk Scoring Algorithm

**Blood Pressure Risk:**
- Normal (<120/<80): 1 point
- Elevated (120-129/<80): 2 points
- Stage 1 (130-139/80-89): 3 points
- Stage 2 (≥140/≥90): 4 points
- Invalid data: 0 points

**Temperature Risk:**
- Normal (≤99.5°F): 0 points
- Low Fever (99.6-100.9°F): 1 point
- High Fever (≥101.0°F): 2 points
- Invalid data: 0 points

**Age Risk:**
- Under 40: 1 point
- 40-65: 1 point
- Over 65: 2 points
- Invalid data: 0 points

### Alert Lists Generated
1. **High-Risk Patients** - Total risk score ≥ 4
2. **Fever Patients** - Temperature ≥ 99.6°F
3. **Data Quality Issues** - Any invalid/missing data

---

## 💻 Usage

### Prerequisites
- Node.js (version 14+)

### Installation & Execution

```bash
# No installation required - uses Node.js built-in modules only

# Run the assessment
node healthcare-assessment.js
```

### Expected Output

```
🏥 Healthcare API Assessment

==================================================

📊 Fetching patient data...

   Fetching page 1...
   ✓ Got 10 patients (Total: 10)
   Fetching page 2...
   ✓ Got 10 patients (Total: 20)
   ...

✅ Total patients fetched: 50

🔍 Analyzing patient data...

   DEMO001: Risk=4 (BP=1, Temp=0, Age=1)
   DEMO002: Risk=5 (BP=4, Temp=0, Age=2)
   ...

📋 Analysis Complete:
   High-Risk Patients: 21
   Fever Patients: 9
   Data Quality Issues: 8

📤 Submitting assessment...

✅ SUBMISSION SUCCESSFUL!

📊 Results:
   Score: 92/100 (92%)
   Status: PASS
   Attempt: 1/3
   Remaining Attempts: 2

📈 Breakdown:
   High-Risk: 48/50 (20/20 correct)
   Fever: 19/25 (7/9 correct)
   Data Quality: 25/25 (8/8 correct)

💬 Feedback:
   ✅ Data quality issues: Perfect score (8/8)
   🔄 High-risk patients: 20/20 correct, but 1 incorrectly included
   🔄 Fever patients: 7/9 correct, but 2 missed

==================================================
✅ Assessment Complete!
```

---

## 🏗️ Architecture

### Risk Calculation Engine
- Modular scoring functions for each health metric (BP, temperature, age)
- Validates data integrity before scoring
- Handles edge cases and malformed data
- Returns both score and validity status

### API Client
- Promise-based HTTP requests using Node.js `https` module
- Automatic retry with configurable attempts (default: 3)
- Rate limit detection and 2-second backoff
- Pagination management with configurable page size

### Data Processing Pipeline
1. Fetch all patient records across multiple pages
2. Parse and validate each vital sign
3. Calculate individual and total risk scores
4. Categorize patients into alert lists
5. Submit results to assessment endpoint

---

## 🔧 Error Handling

### Rate Limiting (429)
- Automatic 2-second wait before retry
- Up to 3 retry attempts per request
- 500ms delay between pagination requests

### Server Errors (500/503)
- Automatic retry with 1-second delay
- Expected ~8% failure rate per API specification
- Graceful degradation with detailed error logging

### Data Validation
- Handles missing fields (null, undefined, empty strings)
- Validates numeric conversions
- Parses blood pressure format (systolic/diastolic)
- Assigns 0 points for invalid data (per specification)

---

## 📝 Technical Notes

- **Zero Dependencies**: Uses only Node.js built-in modules (`https`, `http`)
- **No Package Installation**: Ready to run with `node` command
- **Comprehensive Logging**: Console output for debugging and transparency
- **Specification Compliant**: Follows exact scoring rules from assessment documentation

---

## 📂 Project Structure

```
healthcare-api-assessment/
├── healthcare-assessment.js    # Main application
├── package.json               # Project metadata
└── README.md                  # Documentation
```

---

## 🔍 Key Implementation Details

### Blood Pressure Parsing
Handles various formats and edge cases:
- Standard format: "120/80"
- Missing values: "150/", "/90"
- Invalid strings: "INVALID", "N/A"
- Returns structured object with validation status

### Retry Logic
Implements exponential backoff strategy:
- Rate limits: 2-second wait
- Server errors: 1-second wait
- Network errors: 1-second wait
- Maximum 3 attempts per request

### Risk Score Calculation
Total risk = BP score + Temperature score + Age score
- Range: 0-8 points
- High risk threshold: ≥4 points
- Invalid data contributes 0 points but triggers data quality flag

---

**Built by JaQuan Earls**  
Healthcare API Assessment Solution - December 2025
