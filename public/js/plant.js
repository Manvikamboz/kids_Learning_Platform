// Wait for the DOM to be fully loaded before running the script
document.addEventListener('DOMContentLoaded', () => {

    // --- CONFIGURATION ---
    const config = {
        totalStages: 5,
        rewards: { standard: 10, bonus: 15, xp: 10 },
        dialogue: {
            intro: "Hi, Explorer! A tiny seed needs our help to grow big and strong. Are you ready for The Amazing Seed Adventure?",
            1: "Every big plant starts as a sleepy seed! To wake it up, it needs three special things. Drag what it needs onto the seed!",
            2: "Look! Our seed is sprouting! This is called germination. Which way does the plant grow first?",
            3: "Wow! Our little seedling is growing into a big plant. Can you show me where the parts are?",
            4: "Time to pollinate! Click the 'Get Pollen' button to send the bee to the pink flower.",
            stage1Complete: "Great job! The seed is waking up!",
            stage2Correct: "That's right! Roots grow down first to get water and hold the plant steady.",
            stage3Complete: "Perfect! You know all the parts of a plant!",
            stage4PollenGet: "You got the pollen! Now take it to the yellow flower to complete the job.",
            stage4Complete: "Amazing! You helped pollinate the flower. Now it can make seeds!",
            5: "Hooray, we made new seeds! Now, how will they travel to a new home to grow?",
            stage5Complete: { wind: "Whoosh! The wind carries the light seeds far away!", animal: "Yum! An animal eats the fruit and carries the seed to a new place!", pop: "Pop! The plant flings its own seeds out to find a new spot to grow!" },
            stage1Wrong: "Oh no! A seed can't grow with that.",
            stage2Wrong: "Oops, roots need to grow down first to get water!",
            stage3Wrong: "That label doesn't seem to fit there.",
        }
    };

    // --- GAME STATE ---
    const gameState = { currentStage: 1, coins: 0, xp: 0, stage1CorrectDrops: 0, stage3CorrectLabels: 0 };

    // --- DOM ELEMENT REFERENCES ---
    const DOMElements = {
        hud: { xpBar: document.getElementById('xp-bar'), coinCounter: document.getElementById('coin-counter') },
        intro: { section: document.getElementById('intro-section'), startBtn: document.getElementById('start-btn') },
        mission: { section: document.getElementById('mission-section'), mapStages: document.querySelectorAll('.map-stage'), stageContainer: document.getElementById('stage-container') },
        mascot: { speech: document.getElementById('mascot-speech') },
        modals: { completion: document.getElementById('completion-modal'), gameOver: document.getElementById('game-over-modal'), gameOverMessage: document.getElementById('game-over-message') },
        buttons: { restartWin: document.getElementById('restart-btn-win'), restartLose: document.getElementById('restart-btn-lose') },
        sounds: { ding: document.getElementById('sound-ding'), boing: document.getElementById('sound-boing'), tada: document.getElementById('sound-tada') }
    };

    // --- CORE GAME LOGIC ---

    function init() {
        DOMElements.intro.startBtn.addEventListener('click', startGame);
        DOMElements.buttons.restartWin.addEventListener('click', () => window.location.reload());
        DOMElements.buttons.restartLose.addEventListener('click', () => window.location.reload());
    }

    function startGame() {
        DOMElements.intro.section.classList.add('hidden');
        DOMElements.mission.section.classList.remove('hidden');
        renderStage(gameState.currentStage);
    }

    function updateHUD() {
        DOMElements.hud.coinCounter.textContent = `⭐ ${gameState.coins}`;
        const xpPercentage = (gameState.xp / (config.totalStages * config.rewards.xp)) * 100;
        DOMElements.hud.xpBar.style.width = `${xpPercentage}%`;
    }

    function mascotSays(text) {
        DOMElements.mascot.speech.textContent = text;
    }

    function gameOver(message) {
        DOMElements.sounds.boing.play();
        DOMElements.modals.gameOverMessage.textContent = message;
        DOMElements.modals.gameOver.classList.remove('hidden');
    }

    function advanceToNextStage() {
        const rewardAmount = (gameState.currentStage >= 4) ? config.rewards.bonus : config.rewards.standard;
        gameState.coins += rewardAmount;
        gameState.xp += config.rewards.xp;
        updateHUD();
        const currentMapIcon = document.getElementById(`map-${gameState.currentStage}`);
        currentMapIcon.classList.remove('unlocked');
        currentMapIcon.classList.add('completed');
        gameState.currentStage++;
        if (gameState.currentStage > config.totalStages) {
            setTimeout(showCompletionModal, 1000);
        } else {
            document.getElementById(`map-${gameState.currentStage}`).classList.add('unlocked');
            setTimeout(() => renderStage(gameState.currentStage), 1500);
        }
    }

    function showCompletionModal() {
        DOMElements.sounds.tada.play();
        DOMElements.modals.completion.classList.remove('hidden');
    }

    function renderStage(stageId) {
        mascotSays(config.dialogue[stageId]);
        const stageRenderers = { 1: renderStage1, 2: renderStage2, 3: renderStage3, 4: renderStage4, 5: renderStage5 };
        if (stageRenderers[stageId]) stageRenderers[stageId]();
    }

    // --- STAGE RENDERERS AND HANDLERS ---

    function renderStage1() {
        DOMElements.mission.stageContainer.innerHTML = `<h2>Stage 1: The Sleepy Seed</h2><p>Drag what the seed needs to wake up!</p><div id="seed-container" data-needed="3">🌱</div><div id="item-box"><div class="draggable-item-container" draggable="true" data-item-type="correct"><div class="draggable-item">☀️</div><span class="subtitle">Sun</span></div><div class="draggable-item-container" draggable="true" data-item-type="correct"><div class="draggable-item">💧</div><span class="subtitle">Water</span></div><div class="draggable-item-container" draggable="true" data-item-type="correct"><div class="draggable-item">🟫</div><span class="subtitle">Soil</span></div><div class="draggable-item-container" draggable="true" data-item-type="wrong"><div class="draggable-item">🍕</div><span class="subtitle">Pizza</span></div><div class="draggable-item-container" draggable="true" data-item-type="wrong"><div class="draggable-item">🎮</div><span class="subtitle">Game</span></div></div>`;
        setupDragAndDrop();
    }
    
    function setupDragAndDrop() {
        const draggables = document.querySelectorAll('.draggable-item-container');
        const dropZone = document.getElementById('seed-container');
        draggables.forEach(draggable => { draggable.addEventListener('dragstart', () => draggable.classList.add('dragging')); draggable.addEventListener('dragend', () => draggable.classList.remove('dragging')); });
        dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('drag-over'); const dragged = document.querySelector('.dragging'); if (dragged.dataset.itemType === 'correct') { dragged.classList.add('hidden'); gameState.stage1CorrectDrops++; DOMElements.sounds.ding.play(); if (gameState.stage1CorrectDrops >= parseInt(dropZone.dataset.needed)) { mascotSays(config.dialogue.stage1Complete); advanceToNextStage(); } } else { gameOver(config.dialogue.stage1Wrong); } });
    }

    function renderStage2() {
        DOMElements.mission.stageContainer.innerHTML = `<h2>Stage 2: The Sprout</h2><p>Which way does the plant grow first?</p><button class="btn btn-blue" data-choice="down">Grow Down ⬇️</button><button class="btn btn-blue" data-choice="up">Grow Up ⬆️</button>`;
        DOMElements.mission.stageContainer.querySelectorAll('.btn').forEach(b => b.addEventListener('click', handleSproutChoice));
    }
    
    function handleSproutChoice(e) { if (e.target.dataset.choice === 'down') { mascotSays(config.dialogue.stage2Correct); DOMElements.sounds.ding.play(); advanceToNextStage(); } else { gameOver(config.dialogue.stage2Wrong); } }
    
    function renderStage3() {
        DOMElements.mission.stageContainer.innerHTML = `<h2>Stage 3: The Growing Plant</h2><p>Drag the labels to the correct parts.</p><div id="plant-label-area"><div id="dz-flower" class="drop-zone" data-part="flower"></div><div id="dz-leaves" class="drop-zone" data-part="leaves"></div><div id="dz-stem" class="drop-zone" data-part="stem"></div><div id="dz-roots" class="drop-zone" data-part="roots"></div></div><div id="item-box"><div class="label" draggable="true" data-part="roots">Roots</div><div class="label" draggable="true" data-part="stem">Stem</div><div class="label" draggable="true" data-part="leaves">Leaves</div><div class="label" draggable="true" data-part="flower">Flower</div></div>`;
        setupLabelDragAndDrop();
    }
    
    function setupLabelDragAndDrop() {
        const labels = document.querySelectorAll('.label');
        const dropZones = document.querySelectorAll('.drop-zone');
        labels.forEach(l => { l.addEventListener('dragstart', (e) => e.dataTransfer.setData('text/plain', l.dataset.part)); });
        dropZones.forEach(zone => {
            zone.addEventListener('dragover', e => { e.preventDefault(); zone.classList.add('drag-over'); });
            zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
            zone.addEventListener('drop', e => {
                e.preventDefault();
                zone.classList.remove('drag-over');
                const draggedPart = e.dataTransfer.getData('text/plain');
                if (zone.dataset.part === draggedPart && !zone.classList.contains('filled')) {
                    zone.textContent = document.querySelector(`.label[data-part="${draggedPart}"]`).textContent;
                    zone.classList.add('filled');
                    document.querySelector(`.label[data-part="${draggedPart}"]`).classList.add('hidden');
                    gameState.stage3CorrectLabels++;
                    DOMElements.sounds.ding.play();
                    if (gameState.stage3CorrectLabels >= 4) { mascotSays(config.dialogue.stage3Complete); advanceToNextStage(); }
                } else { gameOver(config.dialogue.stage3Wrong); }
            });
        });
    }

    function renderStage4() {
        DOMElements.mission.stageContainer.innerHTML = `
            <h2>Stage 4: Flower Power & Pollination</h2>
            <div id="pollination-game">
                <div class="flower-container">
                    <span>🌸</span>
                    <button class="btn btn-blue" data-action="get-pollen">Get Pollen</button>
                </div>
                <div id="bee">🐝</div>
                <div class="flower-container">
                    <span>🌼</span>
                    <button class="btn btn-yellow" data-action="give-pollen" disabled>Give Pollen</button>
                </div>
            </div>`;
        
        const bee = document.getElementById('bee');
        const getPollenBtn = document.querySelector('[data-action="get-pollen"]');
        const givePollenBtn = document.querySelector('[data-action="give-pollen"]');
        const pinkFlower = getPollenBtn.previousElementSibling;
        const yellowFlower = givePollenBtn.previousElementSibling;

        getPollenBtn.addEventListener('click', () => {
            mascotSays(config.dialogue.stage4PollenGet);
            const flowerRect = pinkFlower.getBoundingClientRect();
            const gameRect = DOMElements.mission.stageContainer.getBoundingClientRect();
            bee.style.top = `${flowerRect.top - gameRect.top}px`;
            bee.style.left = `${flowerRect.left - gameRect.left + (flowerRect.width / 2)}px`;
            
            setTimeout(() => {
                DOMElements.sounds.ding.play();
                bee.classList.add('has-pollen');
                getPollenBtn.disabled = true;
                pinkFlower.classList.add('disabled');
                givePollenBtn.disabled = false;
            }, 600);
        });

        givePollenBtn.addEventListener('click', () => {
            const flowerRect = yellowFlower.getBoundingClientRect();
            const gameRect = DOMElements.mission.stageContainer.getBoundingClientRect();
            bee.style.top = `${flowerRect.top - gameRect.top}px`;
            bee.style.left = `${flowerRect.left - gameRect.left + (flowerRect.width / 2)}px`;
            
            setTimeout(() => {
                bee.classList.remove('has-pollen');
                yellowFlower.textContent = '✨';
                givePollenBtn.disabled = true;
                mascotSays(config.dialogue.stage4Complete);
                advanceToNextStage();
            }, 600);
        });
    }

    function renderStage5() {
        DOMElements.mission.stageContainer.innerHTML = `<h2>Stage 5: Spreading the Seeds</h2><p>The new seeds need to find a home. How should they travel?</p><button class="btn" data-choice="wind">Whoosh! By Wind 💨</button><button class="btn" data-choice="animal">Yum! By Animal 🐻</button><button class="btn" data-choice="pop">Pop! By Itself 🌱</button>`;
        DOMElements.mission.stageContainer.querySelectorAll('.btn').forEach(button => { button.addEventListener('click', (e) => { const choice = e.currentTarget.dataset.choice; mascotSays(config.dialogue.stage5Complete[choice]); advanceToNextStage(); }); });
    }

    // --- INITIALIZE THE GAME ---
    init();
});