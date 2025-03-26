const {
  calculateAccuracy,
  checkFailureConditions,
  initializeDOMElements,
} = require("./main");

describe("Typing Test", () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="timer">0s</div>
      <div id="speed">0 WPS</div>
      <div id="errors">0</div>
      <div id="quote">Test text</div>
      <textarea id="input"></textarea>
    `;
    initializeDOMElements();
  });

  test("Timer starts when user begins typing", () => {
    const input = document.getElementById("input");
    const timer = document.getElementById("timer");
    input.value = "T";
    input.dispatchEvent(new Event("input"));
    expect(timer.textContent).not.toBe("0s");
  });

  test("Calculates WPS correctly", () => {
    const input = document.getElementById("input");
    input.value = "Test text";
    input.dispatchEvent(new Event("input"));
    const speed = document.getElementById("speed");
    expect(speed.textContent).toMatch(/\d+ WPS/);
  });

  test("Detects typing errors accurately", () => {
    const input = document.getElementById("input");
    const quote = document.getElementById("quote");
    quote.textContent = "Test";
    input.value = "Tert";
    input.dispatchEvent(new Event("input"));
    const errors = document.getElementById("errors");
    expect(errors.textContent).toBe("1");
  });
});

describe("Typing Test Functions", () => {
  test("calculateAccuracy should return correct percentage", () => {
    expect(calculateAccuracy(90, 100)).toBe(90);
    expect(calculateAccuracy(50, 100)).toBe(50);
    expect(calculateAccuracy(0, 100)).toBe(0);

    // Test with complete input
    expect(calculateAccuracy("test", "test")).toBe(100);
    expect(calculateAccuracy("tast", "test")).toBe(75);

    // Test with partial input
    expect(calculateAccuracy("te", "test")).toBe(50);

    // Test with empty input
    expect(calculateAccuracy("", "test")).toBe(0);
    expect(calculateAccuracy(null, "test")).toBe(0);
  });

  test("checkFailureConditions should detect low WPM", () => {
    const result = checkFailureConditions(10, 5, 60);
    expect(result.failed).toBe(true);
    expect(result.reason).toContain("typing speed is too low");
  });

  test("checkFailureConditions should detect high error rate", () => {
    const result = checkFailureConditions(40, 20, 60);
    expect(result.failed).toBe(true);
    expect(result.reason).toContain("too many errors");
  });
});
