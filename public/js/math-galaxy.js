// Math Galaxy Interactive JavaScript

class MathGalaxy {
    constructor() {
        this.currentProblem = null;
        this.correctCount = 0;
        this.streakCount = 0;
        this.timeRemaining = 150; // 2:30 in seconds
        this.challengeActive = false;
        this.timerInterval = null;
        
        this.problems = {
            addition: [],
            subtraction: [],
            multiplication: [],
            division: []
        };
        
        this.tools = {
            calculator: { buttons: [], display: '0', operation: null, firstNumber: null },
            numberLine: { range: [-10, 10], position: 0 },
            timesTable: { currentTable: 2 }
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.setupAnimations();
        this.setupMascot();
        this.generateProblems();
        this.loadProgress();
        this.displayCurrentProblem();
    }
    
    setupEventListeners() {
        // Challenge system
        const submitBtn = document.getElementById('submitAnswer');
        const skipBtn = document.getElementById('skipProblem');
        const answerInput = document.querySelector('.answer-input');
        
        if (submitBtn) {
            submitBtn.addEventListener('click', () => this.submitAnswer());
        }
        
        if (skipBtn) {
            skipBtn.addEventListener('click', () => this.skipProblem());
        }
        
        if (answerInput) {
            answerInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.submitAnswer();
                }
            });
            
            answerInput.addEventListener('input', (e) => {
                // Only allow numbers
                e.target.value = e.target.value.replace(/[^0-9]/g, '');
            });
        }
        
        // Lesson node interactions
        const lessonNodes = document.querySelectorAll('.lesson-node');
        lessonNodes.forEach(node => {
            node.addEventListener('click', (e) => this.handleLessonClick(e));
        });
        
        // Game cards
        const gameCards = document.querySelectorAll('.game-card');
        gameCards.forEach(card => {
            const btn = card.querySelector('.btn-game');
            if (btn && !btn.classList.contains('locked')) {
                btn.addEventListener('click', (e) => this.startGame(e));
            }
        });
        
        // Tool cards
        const toolCards = document.querySelectorAll('.tool-card');
        toolCards.forEach(card => {
            const btn = card.querySelector('.btn-tool');
            if (btn) {
                btn.addEventListener('click', (e) => this.openTool(e));
            }
        });
        
        // Achievement badges
        const badges = document.querySelectorAll('.achievement-badge');
        badges.forEach(badge => {
            badge.addEventListener('click', (e) => this.showBadgeDetails(e));
        });
        
        // Mascot interaction
        const mascot = document.querySelector('.math-character');
        if (mascot) {
            mascot.addEventListener('click', () => this.interactWithMascot());
        }
        
        // Smooth scrolling
        this.setupSmoothScrolling();
    }
    
    generateProblems() {
        // Generate addition problems
        for (let i = 0; i < 50; i++) {
            const a = Math.floor(Math.random() * 50) + 1;
            const b = Math.floor(Math.random() * 50) + 1;
            this.problems.addition.push({
                question: `${a} + ${b}`,
                answer: a + b,
                numbers: [a, b],
                operator: '+'
            });
        }
        
        // Generate subtraction problems
        for (let i = 0; i < 50; i++) {
            const a = Math.floor(Math.random() * 50) + 20;
            const b = Math.floor(Math.random() * (a - 1)) + 1;
            this.problems.subtraction.push({
                question: `${a} - ${b}`,
                answer: a - b,
                numbers: [a, b],
                operator: '-'
            });
        }
        
        // Generate multiplication problems
        for (let i = 0; i < 50; i++) {
            const a = Math.floor(Math.random() * 12) + 1;
            const b = Math.floor(Math.random() * 12) + 1;
            this.problems.multiplication.push({
                question: `${a} × ${b}`,
                answer: a * b,
                numbers: [a, b],
                operator: '×'
            });
        }
    }
    
    displayCurrentProblem() {
        const problemsArray = this.problems.addition;
        this.currentProblem = problemsArray[Math.floor(Math.random() * problemsArray.length)];
        
        const numberElements = document.querySelectorAll('.problem-equation .number');
        const operatorElement = document.querySelector('.problem-equation .operator');
        const answerInput = document.querySelector('.answer-input');
        
        if (numberElements.length >= 2 && operatorElement) {
            numberElements[0].textContent = this.currentProblem.numbers[0];
            numberElements[1].textContent = this.currentProblem.numbers[1];
            operatorElement.textContent = this.currentProblem.operator;
        }
        
        if (answerInput) {
            answerInput.value = '';
            answerInput.focus();
        }
    }
    
    submitAnswer() {
        const answerInput = document.querySelector('.answer-input');
        if (!answerInput || !answerInput.value) return;
        
        const userAnswer = parseInt(answerInput.value);
        const isCorrect = userAnswer === this.currentProblem.answer;
        
        if (isCorrect) {
            this.correctCount++;
            this.streakCount++;
            this.addXP(10);
            this.showAnswerFeedback(true);
            this.playSound('correct');
        } else {
            this.streakCount = 0;
            this.showAnswerFeedback(false, this.currentProblem.answer);
            this.playSound('incorrect');
            this.addXP(2); // Participation points
        }
        
        this.updateChallengeStats();
        
        setTimeout(() => {
            this.displayCurrentProblem();
            this.clearAnswerFeedback();
        }, 2000);
    }
    
    skipProblem() {
        this.displayCurrentProblem();
        this.streakCount = 0;
        this.addXP(1);
    }
    
    showAnswerFeedback(isCorrect, correctAnswer = null) {
        const problemDisplay = document.querySelector('.problem-display');
        
        const feedback = document.createElement('div');
        feedback.className = 'answer-feedback-math';
        feedback.innerHTML = `
            <div class="feedback-content-math">
                <div class="feedback-icon">${isCorrect ? '🎉' : '🤔'}</div>
                <h4>${isCorrect ? 'Correct!' : 'Not quite!'}</h4>
                ${!isCorrect ? `<p>The answer is ${correctAnswer}</p>` : '<p>Great job!</p>'}
            </div>
        `;
        
        feedback.style.cssText = `
            background: ${isCorrect ? 'var(--pastel-green)' : 'var(--pastel-orange)'};
            border: 2px solid ${isCorrect ? 'var(--primary-green)' : 'var(--primary-orange)'};
            border-radius: 15px;
            padding: 15px;
            margin: 15px 0;
            text-align: center;
            animation: slideInUp 0.5s ease-out;
        `;
        
        problemDisplay.parentNode.insertBefore(feedback, problemDisplay.nextSibling);
    }
    
    clearAnswerFeedback() {
        const feedback = document.querySelector('.answer-feedback-math');
        if (feedback) {
            feedback.remove();
        }
    }
    
    updateChallengeStats() {
        const correctElement = document.getElementById('correctCount');
        const streakElement = document.getElementById('streakCount');
        
        if (correctElement) {
            correctElement.textContent = this.correctCount;
        }
        
        if (streakElement) {
            streakElement.textContent = this.streakCount;
        }
    }
    
    handleLessonClick(event) {
        const node = event.currentTarget;
        const lessonId = node.dataset.lesson;
        const nodeType = node.classList.contains('completed') ? 'completed' : 
                        node.classList.contains('current') ? 'current' :
                        node.classList.contains('available') ? 'available' : 'locked';
        
        if (nodeType === 'locked') {
            this.showNotification('🔒 This lesson is locked. Complete previous lessons to unlock!', 'info');
            return;
        }
        
        if (nodeType === 'available' || nodeType === 'current') {
            this.startLesson(lessonId);
        } else if (nodeType === 'completed') {
            this.showLessonReview(lessonId);
        }
        
        this.playSound('click');
    }
    
    startLesson(lessonId) {
        const lessons = {
            '2': {
                title: 'Addition Adventures',
                description: 'Join our math heroes on exciting addition quests! Learn to add numbers through fun stories and interactive challenges.',
                preview: 'You\'ll help characters solve addition problems, play number games, and discover the magic of combining numbers!'
            },
            '3': {
                title: 'Subtraction Safari',
                description: 'Explore the wild world of subtraction with our safari guides! Learn to subtract through animal adventures.',
                preview: 'Count animals, solve subtraction mysteries, and help safari guides track their discoveries!'
            },
            '4': {
                title: 'Multiplication Mission',
                description: 'Embark on a space mission where multiplication saves the day! Learn times tables through cosmic adventures.',
                preview: 'Help astronauts calculate supplies, solve rocket problems, and explore multiplication patterns!'
            }
        };
        
        const lesson = lessons[lessonId];
        if (lesson) {
            this.createModal(`➕ ${lesson.title}`, `
                <div class="lesson-preview">
                    <p>${lesson.description}</p>
                    <div class="preview-content">
                        <p>${lesson.preview}</p>
                        <div class="lesson-rewards">
                            <h4>You'll earn:</h4>
                            <ul>
                                <li>⭐ 40-50 XP points</li>
                                <li>🏆 Math achievement badge</li>
                                <li>⭐ 20 math stars</li>
                            </ul>
                        </div>
                    </div>
                    <div class="lesson-actions">
                        <button class="btn btn-primary btn-large">Start Lesson</button>
                        <button class="btn btn-secondary">Save for Later</button>
                    </div>
                </div>
            `);
        }
    }
    
    startGame(event) {
        const card = event.target.closest('.game-card');
        const gameType = card.classList[1]; // Get the second class name
        
        this.launchGame(gameType);
        this.playSound('click');
    }
    
    launchGame(type) {
        const games = {
            'number-hunt': {
                title: 'Number Hunt Game 🔍',
                content: `
                    <div class="game-simulator">
                        <h3>Find the Hidden Numbers!</h3>
                        <div class="game-visual">
                            <div class="hunt-area" id="huntArea">
                                <div class="target-number">Find: <span id="targetNumber">12</span></div>
                                <div class="number-grid">
                                    <!-- Numbers will be generated here -->
                                </div>
                            </div>
                        </div>
                        <div class="game-stats">
                            <div class="stat">Score: <span id="huntScore">0</span></div>
                            <div class="stat">Time: <span id="huntTime">60</span>s</div>
                        </div>
                        <div class="game-controls">
                            <button class="btn btn-primary" onclick="mathGalaxy.startNumberHunt()">Start Hunt!</button>
                            <button class="btn btn-secondary" onclick="mathGalaxy.resetNumberHunt()">Reset</button>
                        </div>
                    </div>
                `
            },
            'shape-builder': {
                title: 'Shape Builder Game 📐',
                content: `
                    <div class="game-simulator">
                        <h3>Build Amazing Shapes!</h3>
                        <div class="shape-canvas" id="shapeCanvas">
                            <div class="shape-palette">
                                <div class="shape-tool" data-shape="triangle">△</div>
                                <div class="shape-tool" data-shape="square">□</div>
                                <div class="shape-tool" data-shape="circle">○</div>
                                <div class="shape-tool" data-shape="rectangle">▬</div>
                            </div>
                            <div class="build-area" id="buildArea">
                                <p>Drag shapes here to build!</p>
                            </div>
                        </div>
                        <div class="game-explanation">
                            <h4>Learn About Shapes:</h4>
                            <p>Each shape has special properties! Triangles have 3 sides, squares have 4 equal sides, circles are perfectly round!</p>
                        </div>
                    </div>
                `
            },
            'pattern-master': {
                title: 'Pattern Master Game 🎨',
                content: `
                    <div class="game-simulator">
                        <h3>Complete the Pattern!</h3>
                        <div class="pattern-game">
                            <div class="pattern-sequence" id="patternSequence">
                                <div class="pattern-item">2</div>
                                <div class="pattern-item">4</div>
                                <div class="pattern-item">6</div>
                                <div class="pattern-item">8</div>
                                <div class="pattern-item missing">?</div>
                            </div>
                            <div class="pattern-options">
                                <button class="pattern-option" onclick="mathGalaxy.selectPattern(10)">10</button>
                                <button class="pattern-option" onclick="mathGalaxy.selectPattern(12)">12</button>
                                <button class="pattern-option" onclick="mathGalaxy.selectPattern(9)">9</button>
                            </div>
                        </div>
                        <div class="pattern-explanation">
                            <h4>Pattern Rule:</h4>
                            <p>This pattern adds 2 each time! Can you find the next number?</p>
                        </div>
                    </div>
                `
            }
        };
        
        const game = games[type];
        if (game) {
            this.createModal(game.title, game.content);
        }
    }
    
    // Game Functions
    startNumberHunt() {
        const numberGrid = document.querySelector('.number-grid');
        if (!numberGrid) return;
        
        const targetNum = Math.floor(Math.random() * 20) + 1;
        document.getElementById('targetNumber').textContent = targetNum;
        
        // Clear previous numbers
        numberGrid.innerHTML = '';
        
        // Generate random numbers including the target
        const numbers = [targetNum];
        for (let i = 0; i < 15; i++) {
            numbers.push(Math.floor(Math.random() * 20) + 1);
        }
        
        // Shuffle array
        numbers.sort(() => Math.random() - 0.5);
        
        // Create number buttons
        numbers.forEach(num => {
            const btn = document.createElement('button');
            btn.textContent = num;
            btn.className = 'number-btn';
            btn.onclick = () => this.selectNumber(num, targetNum);
            numberGrid.appendChild(btn);
        });
        
        this.showNotification('Find all instances of the target number! 🔍', 'info');
    }
    
    selectNumber(selected, target) {
        if (selected === target) {
            this.addXP(5);
            this.showNotification('🎉 Correct! +5 XP', 'success');
            event.target.style.background = 'var(--primary-green)';
            event.target.disabled = true;
        } else {
            this.showNotification('🤔 Try again!', 'warning');
            event.target.style.background = '#f44336';
            setTimeout(() => {
                event.target.style.background = '';
            }, 1000);
        }
    }
    
    selectPattern(answer) {
        if (answer === 10) {
            this.addXP(15);
            this.showNotification('🎉 Perfect! The pattern continues: +2 each time! +15 XP', 'success');
            document.querySelector('.missing').textContent = answer;
            document.querySelector('.missing').classList.remove('missing');
            document.querySelector('.missing').style.background = 'var(--primary-green)';
        } else {
            this.showNotification('🤔 Not quite right. Think about what rule the pattern follows!', 'info');
        }
    }
    
    openTool(event) {
        const card = event.target.closest('.tool-card');
        const toolType = card.classList[1]; // Get the second class name
        
        this.launchTool(toolType);
        this.playSound('click');
    }
    
    launchTool(type) {
        const tools = {
            calculator: {
                title: 'Fun Math Calculator 🧮',
                content: `
                    <div class="calculator-tool">
                        <div class="calc-display" id="calcDisplay">0</div>
                        <div class="calc-buttons">
                            <button class="calc-btn calc-clear" onclick="mathGalaxy.calcClear()">C</button>
                            <button class="calc-btn" onclick="mathGalaxy.calcInput('/')">/</button>
                            <button class="calc-btn" onclick="mathGalaxy.calcInput('*')">×</button>
                            <button class="calc-btn calc-delete" onclick="mathGalaxy.calcDelete()">←</button>
                            
                            <button class="calc-btn" onclick="mathGalaxy.calcInput('7')">7</button>
                            <button class="calc-btn" onclick="mathGalaxy.calcInput('8')">8</button>
                            <button class="calc-btn" onclick="mathGalaxy.calcInput('9')">9</button>
                            <button class="calc-btn" onclick="mathGalaxy.calcInput('-')">-</button>
                            
                            <button class="calc-btn" onclick="mathGalaxy.calcInput('4')">4</button>
                            <button class="calc-btn" onclick="mathGalaxy.calcInput('5')">5</button>
                            <button class="calc-btn" onclick="mathGalaxy.calcInput('6')">6</button>
                            <button class="calc-btn" onclick="mathGalaxy.calcInput('+')">+</button>
                            
                            <button class="calc-btn" onclick="mathGalaxy.calcInput('1')">1</button>
                            <button class="calc-btn" onclick="mathGalaxy.calcInput('2')">2</button>
                            <button class="calc-btn" onclick="mathGalaxy.calcInput('3')">3</button>
                            <button class="calc-btn calc-equals" onclick="mathGalaxy.calcEquals()" rowspan="2">=</button>
                            
                            <button class="calc-btn calc-zero" onclick="mathGalaxy.calcInput('0')">0</button>
                            <button class="calc-btn" onclick="mathGalaxy.calcInput('.')">.</button>
                        </div>
                    </div>
                `
            },
            'number-line': {
                title: 'Interactive Number Line 📏',
                content: `
                    <div class="number-line-tool">
                        <h3>Explore Numbers on the Line!</h3>
                        <div class="number-line-container">
                            <div class="number-line" id="numberLine">
                                <!-- Numbers will be generated here -->
                            </div>
                            <div class="number-controls">
                                <button class="btn btn-secondary" onclick="mathGalaxy.moveNumberLine(-1)">← Move Left</button>
                                <button class="btn btn-secondary" onclick="mathGalaxy.moveNumberLine(1)">Move Right →</button>
                            </div>
                        </div>
                        <div class="number-info">
                            <p>Click on numbers to learn about them!</p>
                            <div id="numberInfo">Click a number to see more information</div>
                        </div>
                    </div>
                `
            },
            'times-table': {
                title: 'Times Tables Practice ✖️',
                content: `
                    <div class="times-table-tool">
                        <h3>Practice Your Times Tables!</h3>
                        <div class="table-selector">
                            <label>Choose a table: </label>
                            <select id="tableSelect" onchange="mathGalaxy.showTimesTable(this.value)">
                                <option value="2">2 times table</option>
                                <option value="3">3 times table</option>
                                <option value="4">4 times table</option>
                                <option value="5">5 times table</option>
                                <option value="10">10 times table</option>
                            </select>
                        </div>
                        <div class="times-table-display" id="timesTableDisplay">
                            <!-- Table will be generated here -->
                        </div>
                        <div class="table-practice">
                            <h4>Quick Practice:</h4>
                            <div class="practice-problem" id="practiceProblem">2 × 3 = ?</div>
                            <input type="number" id="practiceAnswer" placeholder="Your answer">
                            <button class="btn btn-primary" onclick="mathGalaxy.checkTableAnswer()">Check</button>
                        </div>
                    </div>
                `
            }
        };
        
        const tool = tools[type];
        if (tool) {
            this.createModal(tool.title, tool.content);
            
            // Initialize tool-specific features
            if (type === 'calculator') {
                this.initCalculator();
            } else if (type === 'number-line') {
                this.initNumberLine();
            } else if (type === 'times-table') {
                this.showTimesTable(2);
            }
        }
    }
    
    // Calculator Functions
    initCalculator() {
        this.tools.calculator.display = '0';
        this.updateCalcDisplay();
    }
    
    calcInput(value) {
        if (this.tools.calculator.display === '0') {
            this.tools.calculator.display = value;
        } else {
            this.tools.calculator.display += value;
        }
        this.updateCalcDisplay();
        this.playSound('click');
    }
    
    calcClear() {
        this.tools.calculator.display = '0';
        this.updateCalcDisplay();
        this.playSound('click');
    }
    
    calcDelete() {
        if (this.tools.calculator.display.length > 1) {
            this.tools.calculator.display = this.tools.calculator.display.slice(0, -1);
        } else {
            this.tools.calculator.display = '0';
        }
        this.updateCalcDisplay();
        this.playSound('click');
    }
    
    calcEquals() {
        try {
            const expression = this.tools.calculator.display.replace(/×/g, '*');
            const result = eval(expression);
            this.tools.calculator.display = result.toString();
            this.updateCalcDisplay();
            this.addXP(2);
            this.playSound('correct');
        } catch (error) {
            this.tools.calculator.display = 'Error';
            this.updateCalcDisplay();
        }
    }
    
    updateCalcDisplay() {
        const display = document.getElementById('calcDisplay');
        if (display) {
            display.textContent = this.tools.calculator.display;
        }
    }
    
    // Number Line Functions
    initNumberLine() {
        this.generateNumberLine();
    }
    
    generateNumberLine() {
        const container = document.getElementById('numberLine');
        if (!container) return;
        
        container.innerHTML = '';
        
        for (let i = -5; i <= 15; i++) {
            const numberDiv = document.createElement('div');
            numberDiv.className = 'number-point';
            numberDiv.textContent = i;
            numberDiv.onclick = () => this.showNumberInfo(i);
            container.appendChild(numberDiv);
        }
    }
    
    showNumberInfo(number) {
        const info = document.getElementById('numberInfo');
        if (info) {
            let infoText = `Number ${number}: `;
            
            if (number === 0) {
                infoText += 'This is zero - the starting point!';
            } else if (number > 0) {
                infoText += `This is ${number} steps to the right of zero.`;
            } else {
                infoText += `This is ${Math.abs(number)} steps to the left of zero.`;
            }
            
            if (number % 2 === 0) {
                infoText += ' It\\'s an even number!';
            } else {
                infoText += ' It\\'s an odd number!';
            }
            
            info.textContent = infoText;
            this.addXP(1);
        }
    }
    
    // Times Table Functions
    showTimesTable(table) {
        const display = document.getElementById('timesTableDisplay');
        if (!display) return;
        
        display.innerHTML = '';
        
        for (let i = 1; i <= 10; i++) {
            const row = document.createElement('div');
            row.className = 'table-row';
            row.innerHTML = `${table} × ${i} = ${table * i}`;
            display.appendChild(row);
        }
        
        this.generateTablePractice(table);
    }
    
    generateTablePractice(table) {
        const problem = document.getElementById('practiceProblem');
        const answer = document.getElementById('practiceAnswer');
        
        if (problem && answer) {
            const multiplier = Math.floor(Math.random() * 10) + 1;
            problem.textContent = `${table} × ${multiplier} = ?`;
            problem.dataset.answer = table * multiplier;
            answer.value = '';
        }
    }
    
    checkTableAnswer() {
        const problem = document.getElementById('practiceProblem');
        const answer = document.getElementById('practiceAnswer');
        
        if (problem && answer) {
            const userAnswer = parseInt(answer.value);
            const correctAnswer = parseInt(problem.dataset.answer);
            
            if (userAnswer === correctAnswer) {
                this.showNotification('🎉 Correct! Great job! +10 XP', 'success');
                this.addXP(10);
                // Generate new problem
                const table = document.getElementById('tableSelect').value;
                this.generateTablePractice(table);
            } else {
                this.showNotification('🤔 Try again! Think about the times table.', 'info');
            }
        }
    }
    
    // Badge and Achievement Functions
    showBadgeDetails(event) {
        const badge = event.currentTarget;
        const badgeName = badge.querySelector('h4').textContent;
        const badgeDescription = badge.querySelector('p').textContent;
        const isEarned = badge.classList.contains('earned');
        const isLocked = badge.classList.contains('locked');
        const isMystery = badge.classList.contains('mystery');
        
        let content = `
            <div class="badge-details">
                <div class="badge-display">
                    <div class="large-badge-icon">${badge.querySelector('.badge-icon').textContent}</div>
                    <h3>${badgeName}</h3>
                    <p>${badgeDescription}</p>
                </div>
        `;
        
        if (isEarned) {
            const dateEarned = badge.querySelector('.badge-date').textContent;
            content += `
                <div class="badge-status earned">
                    <h4>🎉 Congratulations!</h4>
                    <p>You earned this badge!</p>
                    <small>${dateEarned}</small>
                </div>
            `;
        } else if (isLocked) {
            const requirement = badge.querySelector('.badge-requirement').textContent;
            content += `
                <div class="badge-status locked">
                    <h4>🔒 Locked</h4>
                    <p>Requirement: ${requirement}</p>
                </div>
            `;
        } else if (isMystery) {
            content += `
                <div class="badge-status mystery">
                    <h4>❓ Mystery Badge</h4>
                    <p>Keep exploring Math Galaxy to discover this special badge!</p>
                    <p><em>Hint: Try using all three math tools in one session!</em></p>
                </div>
            `;
        }
        
        content += '</div>';
        
        this.createModal('Badge Details', content);
        this.playSound('click');
    }
    
    // Mascot System
    setupMascot() {
        const mascotMessages = [
            "Great work on addition! Ready to explore subtraction next? ➖",
            "Math is everywhere! Let's solve some fun puzzles together! 🧮",
            "Did you know that zero was invented in India? Amazing! 🔢",
            "Ready for a math challenge? Numbers are your friends! ➕",
            "You're becoming a real mathematician! Keep practicing! 🌟"
        ];
        
        let currentMessage = 0;
        
        setInterval(() => {
            this.updateMascotMessage(mascotMessages[currentMessage]);
            currentMessage = (currentMessage + 1) % mascotMessages.length;
        }, 8000);
    }
    
    updateMascotMessage(message) {
        const mascotText = document.querySelector('.mascot-text');
        if (mascotText) {
            mascotText.style.opacity = '0';
            setTimeout(() => {
                mascotText.textContent = message;
                mascotText.style.opacity = '1';
            }, 300);
        }
    }
    
    interactWithMascot() {
        const responses = [
            "Hi there, future mathematician! What math adventure shall we try today? 🧮",
            "Math fact: The word 'mathematics' comes from the Greek word 'mathema' meaning learning! 📚",
            "You're doing fantastic! Math helps us understand the world around us! 🌍",
            "Ready to solve some puzzles? I love your mathematical thinking! ✨",
            "Great work exploring Math Galaxy! Numbers are everywhere! 🔢"
        ];
        
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        this.updateMascotMessage(randomResponse);
        this.addXP(2);
        this.playSound('click');
    }
    
    // Utility Functions
    setupAnimations() {
        // Animate progress ring
        const progressRing = document.querySelector('.progress-ring-circle');
        if (progressRing) {
            const circumference = 2 * Math.PI * 36; // radius = 36
            const progress = 40; // 40% complete
            const offset = circumference - (progress / 100) * circumference;
            
            progressRing.style.strokeDasharray = circumference;
            progressRing.style.strokeDashoffset = offset;
        }
        
        this.setupScrollAnimations();
    }
    
    setupScrollAnimations() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animation = 'slideInUp 0.6s ease-out forwards';
                }
            });
        }, { threshold: 0.1 });
        
        document.querySelectorAll('.lesson-node, .game-card, .tool-card, .achievement-badge').forEach(el => {
            observer.observe(el);
        });
    }
    
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const targetId = this.getAttribute('href').substring(1);
                const targetElement = document.getElementById(targetId);
                
                if (targetElement) {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    addXP(amount) {
        if (window.terraGame) {
            window.terraGame.addXP(amount);
        } else {
            this.showNotification(`+${amount} XP earned! ⭐`, 'success');
        }
    }
    
    playSound(type) {
        console.log(`Playing ${type} sound`);
    }
    
    createModal(title, content) {
        const modal = document.createElement('div');
        modal.className = 'modal-overlay math-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2>${title}</h2>
                    <button class="close-modal">×</button>
                </div>
                <div class="modal-body">
                    ${content}
                </div>
            </div>
        `;
        
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 2000;
            animation: fadeIn 0.3s ease-out;
        `;
        
        const modalContent = modal.querySelector('.modal-content');
        modalContent.style.cssText = `
            background: white;
            border-radius: 20px;
            max-width: 700px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 8px 40px rgba(0,0,0,0.2);
            animation: slideInUp 0.3s ease-out;
        `;
        
        const header = modal.querySelector('.modal-header');
        header.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 20px 30px;
            border-bottom: 2px solid var(--primary-purple);
            background: linear-gradient(135deg, var(--pastel-purple), white);
        `;
        
        const body = modal.querySelector('.modal-body');
        body.style.padding = '20px 30px';
        
        document.body.appendChild(modal);
        
        // Close functionality
        const closeBtn = modal.querySelector('.close-modal');
        const closeModal = () => {
            modal.style.animation = 'fadeOut 0.3s ease-out forwards';
            setTimeout(() => modal.remove(), 300);
        };
        
        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });
        
        closeBtn.style.cssText = `
            background: none;
            border: none;
            font-size: 24px;
            cursor: pointer;
            color: #666;
            padding: 5px 10px;
            border-radius: 50%;
            transition: background 0.3s ease;
        `;
        
        return modal;
    }
    
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `math-notification ${type}`;
        notification.textContent = message;
        
        const colors = {
            info: 'var(--primary-purple)',
            success: 'var(--primary-green)',
            warning: 'var(--primary-orange)',
            error: '#f44336'
        };
        
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
            background: white;
            color: ${colors[type]};
            padding: 15px 20px;
            border-radius: 15px;
            border-left: 4px solid ${colors[type]};
            box-shadow: 0 4px 20px rgba(0,0,0,0.1);
            z-index: 1500;
            max-width: 300px;
            font-weight: 600;
            animation: slideInRight 0.5s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.5s ease-out forwards';
            setTimeout(() => notification.remove(), 500);
        }, 3000);
    }
    
    loadProgress() {
        const savedProgress = localStorage.getItem('mathGalaxyProgress');
        if (savedProgress) {
            const progress = JSON.parse(savedProgress);
            console.log('Loaded Math Galaxy progress:', progress);
        }
    }
    
    saveProgress() {
        const progress = {
            currentLesson: 2,
            completedLessons: [1],
            gamesPlayed: ['number-hunt'],
            badges: ['number-master', 'addition-expert'],
            totalStars: 180,
            challengesCompleted: 3
        };
        
        localStorage.setItem('mathGalaxyProgress', JSON.stringify(progress));
    }
}

// Additional CSS for Math Galaxy features
const mathStyle = document.createElement('style');
mathStyle.textContent = `
    .calculator-tool {
        text-align: center;
        padding: 20px;
        max-width: 400px;
        margin: 0 auto;
    }
    
    .calc-display {
        background: #f0f0f0;
        border: 2px solid var(--primary-purple);
        border-radius: 10px;
        padding: 20px;
        font-size: 2rem;
        font-weight: bold;
        text-align: right;
        margin-bottom: 20px;
        min-height: 60px;
        display: flex;
        align-items: center;
        justify-content: flex-end;
    }
    
    .calc-buttons {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
    }
    
    .calc-btn {
        padding: 20px;
        border: none;
        border-radius: 10px;
        font-size: 1.2rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
        background: linear-gradient(135deg, var(--pastel-purple), white);
        border: 2px solid var(--primary-purple);
        color: var(--primary-purple);
    }
    
    .calc-btn:hover {
        transform: scale(1.05);
        background: var(--primary-purple);
        color: white;
    }
    
    .calc-btn.calc-equals {
        grid-row: span 2;
        background: linear-gradient(135deg, var(--primary-green), var(--primary-blue));
        color: white;
    }
    
    .calc-btn.calc-zero {
        grid-column: span 2;
    }
    
    .number-line-tool {
        text-align: center;
        padding: 20px;
    }
    
    .number-line-container {
        background: var(--pastel-purple);
        padding: 30px;
        border-radius: 15px;
        margin: 20px 0;
    }
    
    .number-line {
        display: flex;
        justify-content: center;
        gap: 15px;
        flex-wrap: wrap;
        margin-bottom: 20px;
    }
    
    .number-point {
        width: 40px;
        height: 40px;
        background: white;
        border: 2px solid var(--primary-purple);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        font-weight: bold;
        transition: all 0.3s ease;
    }
    
    .number-point:hover {
        background: var(--primary-purple);
        color: white;
        transform: scale(1.1);
    }
    
    .number-info {
        background: white;
        padding: 20px;
        border-radius: 15px;
        border: 2px solid var(--primary-purple);
    }
    
    .times-table-tool {
        text-align: center;
        padding: 20px;
    }
    
    .table-selector {
        margin: 20px 0;
    }
    
    .table-selector select {
        padding: 10px;
        border: 2px solid var(--primary-purple);
        border-radius: 10px;
        font-size: 1rem;
        margin-left: 10px;
    }
    
    .times-table-display {
        background: var(--pastel-purple);
        padding: 20px;
        border-radius: 15px;
        margin: 20px 0;
        max-height: 300px;
        overflow-y: auto;
    }
    
    .table-row {
        padding: 10px;
        background: white;
        margin: 5px;
        border-radius: 8px;
        font-weight: bold;
        font-size: 1.1rem;
        color: var(--primary-purple);
    }
    
    .table-practice {
        background: white;
        padding: 20px;
        border-radius: 15px;
        border: 2px solid var(--primary-purple);
    }
    
    .practice-problem {
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--primary-purple);
        margin: 15px 0;
    }
    
    .game-simulator {
        text-align: center;
        padding: 20px;
    }
    
    .hunt-area {
        background: var(--pastel-blue);
        padding: 20px;
        border-radius: 15px;
        margin: 20px 0;
    }
    
    .target-number {
        font-size: 1.5rem;
        font-weight: bold;
        margin-bottom: 20px;
        color: var(--primary-blue);
    }
    
    .number-grid {
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        gap: 10px;
        max-width: 300px;
        margin: 0 auto;
    }
    
    .number-btn {
        padding: 15px;
        border: 2px solid var(--primary-blue);
        border-radius: 10px;
        background: white;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .number-btn:hover {
        background: var(--primary-blue);
        color: white;
    }
    
    .shape-canvas {
        background: #f8f9ff;
        padding: 20px;
        border-radius: 15px;
        margin: 20px 0;
    }
    
    .shape-palette {
        display: flex;
        justify-content: center;
        gap: 20px;
        margin-bottom: 20px;
    }
    
    .shape-tool {
        width: 60px;
        height: 60px;
        background: white;
        border: 2px solid var(--primary-purple);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 2rem;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .shape-tool:hover {
        background: var(--primary-purple);
        color: white;
        transform: scale(1.1);
    }
    
    .build-area {
        min-height: 200px;
        background: white;
        border: 2px dashed var(--primary-purple);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--text-secondary);
    }
    
    .pattern-game {
        background: var(--pastel-green);
        padding: 30px;
        border-radius: 15px;
        margin: 20px 0;
    }
    
    .pattern-sequence {
        display: flex;
        justify-content: center;
        gap: 15px;
        margin-bottom: 30px;
    }
    
    .pattern-item {
        width: 60px;
        height: 60px;
        background: white;
        border: 3px solid var(--primary-green);
        border-radius: 10px;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 1.5rem;
        font-weight: bold;
        color: var(--primary-green);
    }
    
    .pattern-item.missing {
        border-color: var(--primary-orange);
        color: var(--primary-orange);
        background: var(--pastel-orange);
    }
    
    .pattern-options {
        display: flex;
        justify-content: center;
        gap: 15px;
    }
    
    .pattern-option {
        padding: 15px 25px;
        border: 2px solid var(--primary-green);
        border-radius: 10px;
        background: white;
        font-size: 1.2rem;
        font-weight: bold;
        cursor: pointer;
        transition: all 0.3s ease;
    }
    
    .pattern-option:hover {
        background: var(--primary-green);
        color: white;
    }
`;

document.head.appendChild(mathStyle);

// Initialize Math Galaxy when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    if (document.body.classList.contains('math-body')) {
        window.mathGalaxy = new MathGalaxy();
        console.log('Math Galaxy initialized');
    }
});
