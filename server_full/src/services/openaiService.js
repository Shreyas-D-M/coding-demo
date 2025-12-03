// Placeholder Gemini AI integration
module.exports = {
  getReply: async (text, meta = {}) => {
    if (!process.env.GEMINI_API_KEY) {
      const snippet = text.length > 120 ? text.slice(0,120)+'...' : text;
      return `(Mock AI) Counter-argument to: "${snippet}"`;
    }
    // TODO: Add Gemini API call here
    return "(Gemini AI response placeholder)";
  }
};
