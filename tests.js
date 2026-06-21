/**
 * Simple Unit Testing Suite for EcoSync
 * Runs automatically in the browser console.
 */
console.log("%c Running EcoSync Test Suite...", "color: #3b82f6; font-weight: bold; font-size: 14px;");

function assertEqual(expected, actual, testName) {
    if (expected === actual) {
        console.log(`%c[PASS] ${testName}`, "color: #10b981");
    } else {
        console.error(`[FAIL] ${testName} | Expected ${expected}, got ${actual}`);
    }
}

// Ensure functions exist
if (typeof window.calculateFootprint === 'function') {
    // Test 1: High footprint
    window.userProfile.transport = 'car_gas'; // 4.6
    window.userProfile.diet = 'meat_heavy'; // 3.3
    window.userProfile.energy = 'grid_standard'; // 5.0
    window.calculateFootprint();
    assertEqual(12.9, window.userProfile.footprint.total, "calculateFootprint() - High Emissions Profile");

    // Test 2: Low footprint
    window.userProfile.transport = 'bike_walk'; // 0.0
    window.userProfile.diet = 'vegan'; // 1.5
    window.userProfile.energy = 'renewable'; // 0.5
    window.calculateFootprint();
    assertEqual(2.0, window.userProfile.footprint.total, "calculateFootprint() - Low Emissions Profile");

    // Test 3: Mixed footprint
    window.userProfile.transport = 'public'; // 1.0
    window.userProfile.diet = 'vegetarian'; // 1.7
    window.userProfile.energy = 'mixed'; // 3.5
    window.calculateFootprint();
    assertEqual(6.2, window.userProfile.footprint.total, "calculateFootprint() - Mixed Emissions Profile");
} else {
    console.error("[FAIL] window.calculateFootprint is not defined.");
}
