const puppeteer = require('puppeteer');

(async () => {
    console.log('Launching browser...');
    const browser = await puppeteer.launch({ headless: false }); // Launch non-headless browser
    console.log('Browser launched.');
    
    const page = await browser.newPage(); // Create a new page
    console.log('New page created.');
    
    const urls = ['https://www.ambitionbox.com/reviews/invincix-solutions-reviews'];
    
    for (let url of urls) {
        console.log(`Navigating to ${url}...`);
        await page.goto(url, { waitUntil: 'networkidle2' });
        console.log('Navigation complete.');

        // Wait for reviews section to load
        await page.waitForSelector('.ab_comp_review_card'); // Ensure correct selector

        // Extract review details
        const reviews = await page.$$eval('.ab_comp_review_card', elements =>
            elements.map(el => ({
                 rating: el.querySelector('.rating_text')?.innerText.trim() || 'N/A',
                 likes: el.querySelector('h3.input-fields.sub-heading:nth-of-type(1) + p.body-medium.overflow-wrap')?.innerText.trim() || 'N/A',
                 dislikes: el.querySelector('h3.input-fields.sub-heading:nth-of-type(2) + p.body-medium.overflow-wrap')?.innerText.trim() || 'N/A'
            }))
        );

        console.log('Extracted Reviews:', reviews);
    }
    
    await browser.close(); // Close the browser
    console.log('Browser closed.');
})();
