import assert from 'assert';
import { processChat } from './services/chatbot.js';

function runTests() {
  console.log("🏃 Running Chatbot Unit Tests...\n");

  let passed = 0;
  let total = 0;

  function test(name, fn) {
    total++;
    try {
      fn();
      console.log(`✅ PASS: ${name}`);
      passed++;
    } catch (e) {
      console.error(`❌ FAIL: ${name}`);
      console.error(`   Expected:`, e.expected);
      console.error(`   Actual:`, e.actual);
    }
  }

  // Feature: Find nearest
  test("Intent Detection: Nearest Location", () => {
    const res = processChat("Where is the nearest cafeteria?");
    assert.ok(res.text.toLowerCase().includes("cafeteria"), "Response should mention cafeteria");
    assert.strictEqual(res.actions[0].type, 'highlight');
  });

  // Feature: General information search
  test("Intent Detection: General Info", () => {
    const res = processChat("Tell me about Turing Block");
    assert.ok(res.text.includes("Turing Block"), "Response should mention Turing Block");
    assert.strictEqual(res.actions[0].type, 'zoom');
  });

  // Feature: Accessibility routing
  test("Intent Detection: Accessible Routing", () => {
    const res = processChat("accessible route from Turing Block to Edison Block");
    assert.ok(res.text.includes("Accessible"), "Response should mention accessible route");
    assert.strictEqual(res.actions[0].type, 'route');
    assert.ok(res.actions[0].waypoints.length > 0, "Waypoints should exist");
  });

  // Feature: Distance calculation
  test("Intent Detection: Spatial/Distance", () => {
    const res = processChat("how far is Teresa Girls Hostel from Edison Block");
    assert.ok(res.text.includes("distance"), "Response should mention distance");
    assert.ok(res.text.includes("Teresa Girls Hostel"), "Should mention Teresa Girls Hostel");
    assert.ok(res.text.includes("Edison"), "Should mention Edison");
  });

  console.log(`\n🎉 Test Summary: ${passed}/${total} passed.`);
  if (passed !== total) process.exit(1);
}

runTests();
