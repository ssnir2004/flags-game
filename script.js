console.log('Script JS loaded successfully!');

// נתונים של הדגלים (כולל קוד מדינה לשימוש בתמונות FlagCDN)
const flagsData = {
    europe: [
        { country: 'צרפת', code: 'fr' },
        { country: 'גרמניה', code: 'de' },
        { country: 'איטליה', code: 'it' },
        { country: 'ספרד', code: 'es' },
        { country: 'פולין', code: 'pl' },
        { country: 'הולנד', code: 'nl' },
        { country: 'בלגיה', code: 'be' },
        { country: 'יוון', code: 'gr' },
        { country: 'פורטוגל', code: 'pt' },
        { country: 'שוודיה', code: 'se' }
    ],
    africa: [
        { country: 'מצרים', code: 'eg' },
        { country: 'דרום אפריקה', code: 'za' },
        { country: 'ניגריה', code: 'ng' },
        { country: 'קניה', code: 'ke' },
        { country: 'אתיופיה', code: 'et' },
        { country: 'טוניסיה', code: 'tn' },
        { country: 'מרוקו', code: 'ma' },
        { country: 'זימבבואה', code: 'zw' },
        { country: 'אוגנדה', code: 'ug' },
        { country: 'גנה', code: 'gh' }
    ],
    asia: [
        { country: 'סין', code: 'cn' },
        { country: 'יפן', code: 'jp' },
        { country: 'הודו', code: 'in' },
        { country: 'דרום קוריאה', code: 'kr' },
        { country: 'תאילנד', code: 'th' },
        { country: 'וייטנאם', code: 'vn' },
        { country: 'מלזיה', code: 'my' },
        { country: 'אינדונזיה', code: 'id' },
        { country: 'סינגפור', code: 'sg' },
        { country: 'פיליפינים', code: 'ph' }
    ]
};

// משתנים גלובליים
let selectedRegions = [];
let currentQuestionIndex = 0;
let questions = [];
let score = 0;
let gameActive = false;
let timeLeft = 60;
let timerInterval = null;
let currentCorrectAnswer = null;

// אלמנטים
const startMenu = document.getElementById('startMenu');
const gameArea = document.getElementById('gameArea');
const endMenu = document.getElementById('endMenu');
const startBtn = document.getElementById('startBtn');
const restartBtn = document.getElementById('restartBtn');
const scoreDisplay = document.getElementById('score');
const timerDisplay = document.getElementById('timer');
const questionNumberDisplay = document.getElementById('questionNumber');
const totalQuestionsDisplay = document.getElementById('totalQuestions');
const flagImg = document.getElementById('flagImg');
const optionButtons = document.querySelectorAll('.option-btn');
const feedback = document.getElementById('feedback');

// התחלת משחק
startBtn.addEventListener('click', startGame);
restartBtn.addEventListener('click', () => {
    score = 0;
    currentQuestionIndex = 0;
    timeLeft = 60;
    feedback.innerHTML = '';
    startGame();
});

function startGame() {
    // בדיקה שלפחות אזור אחד נבחר
    const checkboxes = document.querySelectorAll('.region-buttons input[type="checkbox"]:checked');
    if (checkboxes.length === 0) {
        alert('בחר לפחות אזור אחד!');
        return;
    }

    console.log('Game started!');
    // איסוף אזורים שנבחרו
    selectedRegions = Array.from(checkboxes).map(cb => cb.value);
    console.log('Selected regions:', selectedRegions);

    // יצירת שאלות
    createQuestions();

    // הסתרת תפריט וגם הוצאת משחק
    startMenu.classList.add('hidden');
    endMenu.classList.add('hidden');
    gameArea.classList.remove('hidden');

    gameActive = true;
    totalQuestionsDisplay.textContent = questions.length;

    // התחלת טיימר
    startTimer();

    // הצגת השאלה הראשונה
    console.log('About to display first question');
    displayQuestion();
}

function createQuestions() {
    // איסוף כל הדגלים מהאזורים שנבחרו
    let allFlags = [];
    selectedRegions.forEach(region => {
        allFlags = allFlags.concat(flagsData[region]);
    });

    console.log('All flags available:', allFlags.length);
    // ערבוב הדגלים
    allFlags = shuffleArray(allFlags);

    // בחירת 10 שאלות (או פחות אם יש פחות דגלים)
    questions = allFlags.slice(0, Math.min(10, allFlags.length)).map(item => ({
        correctCountry: item.country,
        code: item.code,
        options: generateOptions(item, allFlags)
    }));
    console.log('Questions created:', questions.length);
}

function generateOptions(correctItem, allFlags) {
    const options = [correctItem.country];

    // בחירת 3 מדינות אחרות
    const otherCountries = allFlags.filter(f => f.country !== correctItem.country);
    const randomOthers = shuffleArray(otherCountries).slice(0, 3);
    options.push(...randomOthers.map(f => f.country));

    // ערבוב האפשרויות
    return shuffleArray(options);
}

function displayQuestion() {
    if (currentQuestionIndex >= questions.length || timeLeft <= 0) {
        endGame();
        return;
    }

    const question = questions[currentQuestionIndex];
    currentCorrectAnswer = question.correctCountry;

    // הצגת דגל מתמונה ב-FlagCDN (fallback לשם המדינה אם אין קוד)
    console.log('Displaying question:', question.correctCountry, 'code:', question.code);
    if (question.code) {
        const imgUrl = `https://flagcdn.com/w320/${question.code}.png`;
        flagImg.innerHTML = `<img src="${imgUrl}" alt="דגל ${question.correctCountry}" class="flag-img">`;
    } else {
        flagImg.innerHTML = `<div class="flag-fallback">${question.correctCountry}</div>`;
    }

    // הצגת אפשרויות
    question.options.forEach((option, index) => {
        optionButtons[index].textContent = option;
        optionButtons[index].className = 'option-btn';
        optionButtons[index].disabled = false;
        optionButtons[index].onclick = () => selectAnswer(option);
    });

    // עדכון מספר השאלה
    questionNumberDisplay.textContent = currentQuestionIndex + 1;
    feedback.innerHTML = '';
}

function selectAnswer(selectedCountry) {
    if (!gameActive) return;

    // מציאת הכפתור שנלחץ
    const selectedButton = Array.from(optionButtons).find(btn => btn.textContent === selectedCountry);

    // ניטרול כל הכפתורים
    optionButtons.forEach(btn => btn.disabled = true);

    if (selectedCountry === currentCorrectAnswer) {
        selectedButton.classList.add('correct');
        feedback.innerHTML = '✓ נכון!';
        feedback.classList.add('correct');
        feedback.classList.remove('incorrect');
        score += 10;
        scoreDisplay.textContent = score;
    } else {
        selectedButton.classList.add('incorrect');
        feedback.innerHTML = '✗ לא נכון!';
        feedback.classList.add('incorrect');
        feedback.classList.remove('correct');

        // הצגת התשובה הנכונה
        const correctButton = Array.from(optionButtons).find(btn => btn.textContent === currentCorrectAnswer);
        if (correctButton) {
            correctButton.classList.add('correct');
        }
    }

    // עבור לשאלה הבאה אחרי 2 שניות
    setTimeout(() => {
        currentQuestionIndex++;
        displayQuestion();
    }, 2000);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        timerDisplay.textContent = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            endGame();
        }
    }, 1000);
}

function endGame() {
    gameActive = false;
    clearInterval(timerInterval);

    const percentage = Math.round((score / (questions.length * 10)) * 100);

    document.getElementById('finalScore').textContent = score;
    document.getElementById('percentage').textContent = percentage + '%';

    gameArea.classList.add('hidden');
    endMenu.classList.remove('hidden');
}

// פונקציות עזר
function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}
