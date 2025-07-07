const express = require('express');
const router = express.Router();

// Define a POST route handler for chatbot interactions
router.post('/', async (req, res) => {
  // Destructure relevant fields from the request body
  const { stage, message, brand, model, year } = req.body;

  // Initialize reply string to send back to the client
  let reply = "";

  // Normalize the message text for case-insensitive matching
  const msg = message?.trim().toLowerCase();

  // Determine reply based on current 'stage' of chatbot conversation
  switch (stage) {
    
    // Stage: General inquiries (business hours, info, etc.)
    case 'general':
      // Check if the message includes common phrases about operating hours
      if (
        msg.includes('how many hours') ||
        msg.includes('opening hours') ||
        msg.includes('what time') ||
        msg.includes('operating hours') ||
        msg.includes('when do you close') ||
        msg.includes('working hours')
      ) {
        // Provide business hours info
        reply = "We operate 9am–6pm, Monday to Saturday.";
      } else {
        // Generic fallback for unclear general queries
        reply = "Can you clarify your question about general info?";
      }
      break;

    // Stage: Part Finder - vehicle parts search based on brand/model/year
    case 'partFinder':
      // Check if vehicle info is complete
      if (brand && model && year) {
        // Acknowledge info and indicate search action
        reply = `Got it! Based on your vehicle (${brand} ${model}, ${year}), we'll search compatible parts. Please wait...`;
      } else {
        // Prompt user to provide full vehicle details
        reply = "Please provide your vehicle's brand, model, and year.";
      }
      break;

    // Stage: Request For Quote (RFQ) related inquiries
    case 'rfq':
      // Check if user is asking about quotes/requesting quotation
      if (
        msg.includes('quote') ||
        msg.includes('quotation') ||
        msg.includes('request')
      ) {
        // Direct user to how to request a quote
        reply = "To request a quote, please go to your cart and click the 'Request Quote' button.";
      } else {
        // Generic fallback for RFQ queries
        reply = "You can request a quote for items in your cart. Just let me know!";
      }
      break;

    // Stage: Reporting site issues (bugs, errors, problems)
    case 'siteIssue':
      // Check if user mentions common problem keywords
      if (
        msg.includes('error') ||
        msg.includes('not working') ||
        msg.includes('issue') ||
        msg.includes('bug') ||
        msg.includes('problem')
      ) {
        // Acknowledge and offer to notify support
        reply = "Sorry about that! Please describe the issue and we’ll notify our support team.";
      } else {
        // Prompt user to describe the issue
        reply = "If you're facing an issue, let me know what’s wrong.";
      }
      break;

    // Default case: initial greeting and instructions on usage
    default:
      reply = `👋 Hi! How can I help you today?\nYou can ask about:
- 🕐 General Info (e.g., "What are your opening hours?")
- 🔧 Part Finder (e.g., "I need parts for Honda Civic 2019")
- 📦 RFQ (e.g., "How do I get a quote?")
- 🛠️ Site Issue (e.g., "Login page not working")`;
  }

  // Send the reply as a JSON response
  res.json({ reply });
});

// Export the router so it can be mounted in the main Express app
module.exports = router;
