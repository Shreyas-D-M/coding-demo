module.exports = {
  scoreRound: (text) => {
    const words = text.split(/\s+/).length;
    const strength = Math.min(40, Math.floor(Math.log(words+1)*8));
    const relevance = Math.min(35, Math.floor(words/3));
    const engagement = Math.min(25, (words % 10) + 5);
    const total = strength + relevance + engagement;
    return { relevance, strength, engagement, total };
  }
};
