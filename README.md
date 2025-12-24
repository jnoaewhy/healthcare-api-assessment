# Healthcare API Assessment Solution

**Built by JaQuan Earls**

Complete solution for the DemoMed Healthcare API assessment with retry logic, rate limiting, and proper risk scoring.

---

## 🚀 How to Run

### Prerequisites
- Node.js installed (any version 14+)

### Steps

1. **Save the files:**
   - `healthcare-assessment.js` - Main script
   - `package.json` - Package configuration

2. **Open terminal in the folder**

3. **Run the script:**
   ```bash
   node healthcare-assessment.js
   ```

That's it! The script will:
- ✅ Fetch all patient data (with retry logic)
- ✅ Calculate risk scores
- ✅ Identify all alert lists
- ✅ Submit results automatically
- ✅ Show your score and feedback

---

## 📊 What It Does

### Data Fetching
- Paginates through all patient records
- Handles rate limiting (429 errors)
- Retries on server errors (500/503)
- Waits between requests to avoid rate limits

### Risk Scoring

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

## 🎯 Expected Output

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

## 🔧 Troubleshooting

**If you get rate limit errors:**
- The script automatically retries
- Waits 2 seconds between retry attempts
- Has 500ms delay between page requests

**If you get server errors:**
- The script retries up to 3 times per request
- This is expected behavior (~8% failure rate)

**If submission fails:**
- Check your API key is correct
- Ensure you have attempts remaining (max 3)
- Check your internet connection

---

## 📝 Notes

- The script uses only Node.js built-in modules (no npm install needed)
- All error handling is built-in
- Automatic retry logic for reliability
- Rate limiting prevention included
- Detailed logging for debugging

---

## ✅ Submission

After running successfully:
1. Copy your score from the output
2. Create a GitHub repo with this code
3. Submit the repo URL to complete the assessment

---

**Good luck!** 🚀
