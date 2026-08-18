// @ts-check
const { test, expect } = require('@playwright/test');

// ─── Helpers ────────────────────────────────────────────────────────────────

/**
 * Fills in player name and creates a room as Player 1 (host).
 * Returns the 6-letter room code extracted from the lobby header badge.
 * @param {import('@playwright/test').Page} page
 * @param {string} name
 */
async function createRoom(page, name) {
  await page.goto('/');
  // Fill nickname
  await page.locator('input[placeholder="Enter your name..."]').fill(name);
  // "Create Room" tab is active by default — submit the create form
  await page.locator('form button[type="submit"]').click();
  // Wait for Game Lobby overlay
  await expect(page.locator('h2:has-text("Game Lobby")')).toBeVisible();
  // Extract room code from the header badge  e.g.  "Code: ABCDEF"
  const badgeText = await page.locator('header button:has-text("Code:")').innerText();
  const roomCode = badgeText.replace(/Code:\s*/i, '').replace(/[^A-Z0-9]/g, '').trim();
  expect(roomCode).toHaveLength(6);
  return roomCode;
}

/**
 * Fills in player name, switches to Join Room tab, enters roomCode, and joins.
 * @param {import('@playwright/test').Page} page
 * @param {string} name
 * @param {string} roomCode
 */
async function joinRoom(page, name, roomCode) {
  await page.goto('/');
  await page.locator('input[placeholder="Enter your name..."]').fill(name);
  // Switch to Join Room tab
  await page.locator('button:has-text("Join Room")').click();
  // Fill in room code field
  await page.locator('input[placeholder*="room code"]').fill(roomCode);
  // Submit join form
  await page.locator('form button[type="submit"]').click();
  // Wait for Game Lobby overlay
  await expect(page.locator('h2:has-text("Game Lobby")')).toBeVisible();
}

/**
 * Waits for the word-selection modal and clicks the first word option,
 * returning the word text.
 * @param {import('@playwright/test').Page} drawerPage
 */
async function selectFirstWord(drawerPage) {
  await expect(drawerPage.locator('h2:has-text("Choose a Word!")')).toBeVisible({ timeout: 15000 });
  // Word buttons are inside the modal; each is a btn-primary button with the word text
  const wordButton = drawerPage.locator('div:below(h2:has-text("Choose a Word!")) button.btn-primary').first();
  const word = (await wordButton.innerText()).trim().toLowerCase();
  await wordButton.click();
  return word;
}

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe('Drawlulu.io – Multiplayer E2E Tests', () => {

  // ── Test 1: Full 2-player flow ─────────────────────────────────────────────
  test('Two players: create room → join → lobby check → word select → draw → guess → score update', async ({ browser }) => {
    // Launch two isolated browser contexts
    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();
    const page1 = await ctx1.newPage();
    const page2 = await ctx2.newPage();

    try {
      // ── Step 1: Player 1 creates room ────────────────────────────────────
      const roomCode = await createRoom(page1, 'Player 1');

      // ── Step 2: Player 2 joins with the room code ────────────────────────
      await joinRoom(page2, 'Player 2', roomCode);

      // ── Step 3: Both players see each other in the lobby ─────────────────
      // Lobby overlay lists all players
      const lobbyP1 = page1.locator('.glass-card.animate-fade-in');
      const lobbyP2 = page2.locator('.glass-card.animate-fade-in');
      await expect(lobbyP1).toContainText('Player 1');
      await expect(lobbyP1).toContainText('Player 2');
      await expect(lobbyP2).toContainText('Player 1');
      await expect(lobbyP2).toContainText('Player 2');

      // ── Step 4: Host (Player 1) starts the game ──────────────────────────
      const startBtn = page1.locator('button:has-text("Start Game")');
      await expect(startBtn).toBeEnabled();
      await startBtn.click();

      const p1Modal = page1.locator('h2:has-text("Choose a Word!")').waitFor({ state: 'visible', timeout: 8000 }).then(() => true).catch(() => false);
      const p2Modal = page2.locator('h2:has-text("Choose a Word!")').waitFor({ state: 'visible', timeout: 8000 }).then(() => false).catch(() => true);
      const p1HasModal = await Promise.race([p1Modal, p2Modal]);
      const drawerPage = p1HasModal ? page1 : page2;
      const guesserPage = p1HasModal ? page2 : page1;

      // ── Step 6: Drawer selects a word ────────────────────────────────────
      const chosenWord = await selectFirstWord(drawerPage);
      expect(chosenWord.length).toBeGreaterThan(0);

      // ── Step 7: Drawer draws on the canvas ───────────────────────────────
      const canvas = drawerPage.locator('canvas');
      await expect(canvas).toBeVisible({ timeout: 10000 });
      const box = await canvas.boundingBox();
      if (!box) throw new Error('Canvas bounding box not found');

      // Draw a horizontal line across the canvas
      await drawerPage.mouse.move(box.x + box.width * 0.15, box.y + box.height * 0.5);
      await drawerPage.mouse.down();
      for (let i = 1; i <= 10; i++) {
        await drawerPage.mouse.move(
          box.x + box.width * 0.15 + (box.width * 0.7 * i) / 10,
          box.y + box.height * 0.5,
        );
      }
      await drawerPage.mouse.up();

      // ── Step 8: Guesser types the correct answer ─────────────────────────
      const chatInput = guesserPage.locator('input[placeholder="Type your guess here..."]');
      await expect(chatInput).toBeEnabled({ timeout: 10000 });
      await chatInput.fill(chosenWord);
      await chatInput.press('Enter');

      // ── Step 9: Both contexts see the correct-guess system message & revealed word ────────
      await expect(guesserPage.locator('.chat-panel')).toContainText('guessed', { timeout: 10000 });
      await expect(drawerPage.locator('.chat-panel')).toContainText('guessed', { timeout: 10000 });

      // Verify the secret word is revealed in system chat and canvas overlay
      await expect(guesserPage.locator('.chat-panel')).toContainText(`The word was: "${chosenWord.toUpperCase()}"`, { timeout: 10000 });
      await expect(guesserPage.locator('.canvas-panel')).toContainText(chosenWord.toUpperCase(), { timeout: 10000 });

      // ── Step 10: Scoreboard shows non-zero points ─────────────────────────
      // After a correct guess the ROUND_END fires → scores update in .players-panel
      // Wait for round-end and scoreboard update (score > 0)
      await expect(guesserPage.locator('.players-panel')).toHaveText(/[1-9]\d*\s*pts/, { timeout: 12000 });

    } finally {
      await ctx1.close();
      await ctx2.close();
    }
  });

  // ── Test 2: 3 players – disconnect mid-round, game continues ──────────────
  test('Three players: one disconnects mid-round, game continues for remaining two', async ({ browser }) => {
    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();
    const ctx3 = await browser.newContext();
    const page1 = await ctx1.newPage();
    const page2 = await ctx2.newPage();
    const page3 = await ctx3.newPage();

    try {
      // ── Setup: all 3 players join ─────────────────────────────────────────
      const roomCode = await createRoom(page1, 'Alice');
      await joinRoom(page2, 'Bob', roomCode);
      await joinRoom(page3, 'Charlie', roomCode);

      // All 3 visible in lobby on page1
      await expect(page1.locator('.glass-card.animate-fade-in')).toContainText('Alice');
      await expect(page1.locator('.glass-card.animate-fade-in')).toContainText('Bob');
      await expect(page1.locator('.glass-card.animate-fade-in')).toContainText('Charlie');

      // ── Host starts game ──────────────────────────────────────────────────
      await page1.locator('button:has-text("Start Game")').click();

      // Wait for word-selection phase to begin (game left lobby)
      await expect(page1.locator('.game-container')).toBeVisible({ timeout: 15000 });
      await expect(page1.locator('h2:has-text("Game Lobby")')).not.toBeVisible({ timeout: 10000 });

      // ── Charlie disconnects mid-round ─────────────────────────────────────
      await ctx3.close();

      // ── Remaining players (Alice & Bob) stay in-game ──────────────────────
      // Server's removePlayer logic: with 2+ players remaining, game continues.
      // Players panel should show only 2 players and NOT contain Charlie.
      await expect(page1.locator('.players-panel')).toContainText('PLAYERS (2/', { timeout: 10000 });
      await expect(page2.locator('.players-panel')).toContainText('PLAYERS (2/', { timeout: 10000 });

      await expect(page1.locator('.players-panel')).toContainText('Alice');
      await expect(page1.locator('.players-panel')).toContainText('Bob');
      await expect(page1.locator('.players-panel')).not.toContainText('Charlie');

      // Game container should still be visible (not collapsed back to login)
      await expect(page1.locator('.game-container')).toBeVisible();
      await expect(page2.locator('.game-container')).toBeVisible();

    } finally {
      await ctx1.close().catch(() => {});
      await ctx2.close().catch(() => {});
      // ctx3 already closed above
    }
  });

});
