import ArrayRectangle from "./ArrayRectangle.js";

// GLOBAL VARS

// Number of rectangles to draw
const NUM_RECTANGLES = 50;
let DELAY = 200;
let isSorting = false;
let timerId1, timerId2;

/**
 * The actions we want to perform on the canvas visualisation
 */
const ACTIONS = {
  SORT: "SORT",
  COMPARE: "COMPARE",
  SWAP: "SWAP",
  SORTALL: "SORTALL",
};

/**
 * Map of the action types and the corresponding actions to perform
 */
const actionsMap = {
  // Mark a rectangle as sorted
  [ACTIONS.SORT]: (action, arr) => {
    arr[action.data].sorted();
    return sleep(0);
  },

  // Swap two rectangles and color the bigger one in a green color and the smaller one in a magenta color
  [ACTIONS.SWAP]: (action, arr) => {
    const [i, j] = action.data;
    // Switch values
    let tmpBar = arr[i];
    arr[i] = arr[j];
    arr[j] = tmpBar;
    // Switch positions
    let tmpPos = arr[i].pos;
    arr[i].pos = arr[j].pos;
    arr[j].pos = tmpPos;
    // Color the two bars
    arr[i].setColor("DarkMagenta");
    arr[j].setColor("CadetBlue");
    return sleep(DELAY);
  },
  // Highlight the currently compared rectangles with a purple color
  [ACTIONS.COMPARE]: (action, arr) => {
    const [i, j] = action.data;
    arr[i].setColor("MediumPurple");
    arr[j].setColor("MediumPurple");
    return sleep(DELAY);
  },
  [ACTIONS.SORTALL]: (action, arr) => {
    arr.forEach((r) => r.sorted());
  },
};

// HTML STUFF

// Setup the canvas
const canvas = document.querySelector("canvas");
const ctx = canvas.getContext("2d");
canvas.width = canvas.offsetWidth;
canvas.height = canvas.offsetHeight;

// Canvas controls
const animSpeedSlider = document.querySelector("input.animation-slider");
const startBtn = document.querySelector(".start-btn");

// SORTING ALGORITHM

/**
 * Bubble sort the array
 * @param {*} array
 * @param {*} onAction
 * @returns
 */
async function bubbleSort(array, onAction) {
  let l = 0;
  let isSorted;

  do {
    isSorted = true;
    for (let j = 0; j < array.length - 1; j++) {
      // Compare action
      await onAction({ type: ACTIONS.COMPARE, data: [j, j + 1] });
      // Check if we need to swap
      if (array[j].getValue() > array[j + 1].getValue()) {
        // Swap action
        await onAction({ type: ACTIONS.SWAP, data: [j, j + 1] });
        isSorted = false;
      }
    }
    await onAction({ type: ACTIONS.SORT, data: array.length - l - 1 });
    l += 1;
  } while (l != array.length - 1 && !isSorted);

  // We are done sorting here
  isSorting = false;
  startBtn.disabled = isSorting;
  array.forEach((r, i) => {
    onAction({ type: ACTIONS.SORTALL });
  });

  return array;
}

// HELPERS

/**
 * Generate a rondom shuffled array with values in the range bottom to top (included)
 * @param {*} bottom
 * @param {*} top
 * @returns
 */
const shuffledArrayInRange = (bottom = 1, top = NUM_RECTANGLES) => {
  const arr = [];
  for (let i = bottom; i <= top; i++) arr.push(i);
  return arr.sort((a, b) => (Math.random() > 0.5 ? 1 : -1));
};

/**
 * Helper func to sleep for an amount of time
 * @param {*} ms
 * @returns
 */
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// Observe the canvas for resizing
const observer = new ResizeObserver((entries) => {
  entries.forEach((entry) => {
    entry.target.width = entry.target.offsetWidth;
    entry.target.height = entry.target.offsetHeight;
    drawAll();
  });
});
observer.observe(canvas);

// Generate the rectangle objects
const theRectangles = shuffledArrayInRange().map((v, i) => {
  return new ArrayRectangle(i, v, i, 0, 0, v, canvas);
});

/**
 * Draw everything on the canvas
 */
function drawAll() {
  theRectangles.forEach((r) => {
    let padding = NUM_RECTANGLES * 2 - 2;
    r.x = r.pos * ((canvas.width - padding) / NUM_RECTANGLES) + r.pos * 2;
    r.width = (canvas.width - padding) / NUM_RECTANGLES;
    r.height = (r.val / NUM_RECTANGLES) * canvas.height;
    r.draw();
  });
}

/** Change the animation speed  */
function changeAnimationSpeed(val) {
  if (val >= 50) {
    DELAY = 200 - 300 * Math.abs(0.5 - val / 100);
  } else {
    DELAY = 200 + 300 * Math.abs(0.5 - val / 100);
  }
}

// START

// Initial paint of the canvas
drawAll();

// EVENTLISTENERS

// Control the animation speed
animSpeedSlider.addEventListener("input", function (e) {
  const val = Number(e.target.value);
  changeAnimationSpeed(val);
});

startBtn.addEventListener("click", async function (e) {
  isSorting = !isSorting;
  e.target.disabled = isSorting;

  // Start the whole thing
  bubbleSort(theRectangles, async (action) => {
    // Perform our action
    await actionsMap[action.type](action, theRectangles);
    // Clear the canvas
    canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
    // Redraw
    drawAll();
    theRectangles.forEach((m) => m.resetColor());
  });
});

// Everything is loaded
addEventListener("DOMContentLoaded", (event) => {
  changeAnimationSpeed(Number(animSpeedSlider.value));
});
