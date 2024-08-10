const express = require("express");
const { chromium } = require("playwright");

const app = express();
const port = process.env.PORT || 3000; // Use environment variable or default to 3000

async function performActionWithPage(page) {
  // Replace this with your actual actions on the page
  await page.goto("https://ams3.prachakij.com/adminAMS"); // Assuming login is handled elsewhere

  // Example action: Click a button
  await page.click("#someButton");

  // Example action: Get the title of the page
  const title = await page.title();
  console.log("Page title:", title);
}

app.post("/api/action", async (req, res) => {
  try {
    const browser = await chromium.launch({ headless: false }); // Adjust headless option as needed
    const page = await browser.newPage();

    await performActionWithPage(page);

    await browser.close(); // Ensure browser closure

    res.json({ message: "Action completed successfully" });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ message: "An error occurred" });
  }
});

app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});
