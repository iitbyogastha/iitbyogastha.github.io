const fs = require('fs');
async function test() {
  for (let i = 1; i <= 4; i++) {
    const text = fs.readFileSync(`./Yoga_Quiz_Set_${i}.txt`, 'utf-8');
    const lines = text.split('\n').map(l => l.trim()).filter(l => l);
    const parsedQuestions = [];
    const parsedAnswers = {};
    let currentQuestion = null;
    let options = [];
    for (let line of lines) {
      if (line.match(/^\d+\.\s/)) {
        if (currentQuestion) {
          parsedQuestions.push({ id: `q${parsedQuestions.length + 1}`, prompt: currentQuestion, options: options });
          options = [];
        }
        currentQuestion = line.replace(/^\d+\.\s*/, '');
      } else if (line.match(/^[A-D]\)\s/)) {
        options.push(line.replace(/^[A-D]\)\s*/, ''));
      } else if (line.startsWith('Answer:')) {
        const ansMatch = line.match(/Answer:\s*([A-D])\)/);
        if (ansMatch) {
          parsedAnswers[`q${parsedQuestions.length + 1}`] = ansMatch[1].charCodeAt(0) - 65;
        }
      }
    }
    if (currentQuestion) {
      parsedQuestions.push({ id: `q${parsedQuestions.length + 1}`, prompt: currentQuestion, options: options });
    }
    console.log(`Set ${i}: ${parsedQuestions.length} questions`);
    if (parsedQuestions.length !== 10) console.log("FAILED to parse 10 questions!");
  }
}
test();
