/**
 * Quotes Data - Daily inspirational quotes
 */
export const quotes = [
  "The future belongs to those who believe in the beauty of their dreams. - Eleanor Roosevelt",
  "Success is not final, failure is not fatal: it is the courage to continue that counts. - Winston Churchill",
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Life is what happens to you while you're busy making other plans. - John Lennon",
  "The future belongs to those who prepare for it today. - Malcolm X",
  "It is during our darkest moments that we must focus to see the light. - Aristotle",
  "The only impossible journey is the one you never begin. - Tony Robbins",
  "In the middle of difficulty lies opportunity. - Albert Einstein",
  "Success is walking from failure to failure with no loss of enthusiasm. - Winston Churchill",
  "The way to get started is to quit talking and begin doing. - Walt Disney",
  "Your time is limited, don't waste it living someone else's life. - Steve Jobs",
  "If life were predictable it would cease to be life, and be without flavor. - Eleanor Roosevelt",
  "Life is really simple, but we insist on making it complicated. - Confucius",
  "The purpose of our lives is to be happy. - Dalai Lama",
  "You only live once, but if you do it right, once is enough. - Mae West",
  "Many of life's failures are people who did not realize how close they were to success when they gave up. - Thomas A. Edison",
  "If you want to live a happy life, tie it to a goal, not to people or things. - Albert Einstein",
  "Never let the fear of striking out keep you from playing the game. - Babe Ruth",
  "Money and success don't change people; they merely amplify what is already there. - Will Smith",
  "Your limitation—it's only your imagination.",
  "Push yourself, because no one else is going to do it for you.",
  "Great things never come from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream bigger. Do bigger.",
  "Don't stop when you're tired. Stop when you're done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
  "Little things make big days.",
  "It's going to be hard, but hard does not mean impossible.",
  "Don't wait for opportunity. Create it.",
  "Sometimes we're tested not to show our weaknesses, but to discover our strengths.",
  "The key to success is to focus on goals, not obstacles.",
  "Dream it. Believe it. Build it.",
  "What lies behind us and what lies before us are tiny matters compared to what lies within us. - Ralph Waldo Emerson",
  "Believe you can and you're halfway there. - Theodore Roosevelt",
  "The only person you are destined to become is the person you decide to be. - Ralph Waldo Emerson",
  "I've learned that people will forget what you said, people will forget what you did, but people will never forget how you made them feel. - Maya Angelou",
  "Whether you think you can or you think you can't, you're right. - Henry Ford",
  "Perfection is not attainable, but if we chase perfection we can catch excellence. - Vince Lombardi",
  "Life is 10% what happens to you and 90% how you react to it. - Charles R. Swindoll",
  "If you look at what you have in life, you'll always have more. - Oprah Winfrey",
  "If you set your goals ridiculously high and it's a failure, you will fail above everyone else's success. - James Cameron",
  "Two things are infinite: the universe and human stupidity; and I'm not sure about the universe. - Albert Einstein",
];

/**
 * Get a random quote
 * @returns {string} Random quote
 */
export function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

/**
 * Get quote for specific date (deterministic)
 * @param {Date} date - Date to get quote for
 * @returns {string} Quote for the date
 */
export function getQuoteForDate(date = new Date()) {
  const dayOfYear = Math.floor(
    (date - new Date(date.getFullYear(), 0, 0)) / 86400000
  );
  return quotes[dayOfYear % quotes.length];
}

/**
 * Get daily quote (changes once per day)
 * @returns {string} Daily quote
 */
export function getDailyQuote() {
  return getQuoteForDate(new Date());
}
