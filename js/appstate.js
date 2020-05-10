var appState = {
	area: 1,
	season: 1,
	areawon: 0,
	deathCount: 0,
	enemiesKilledInArea: 0,
	lootchance: Config.lootDropPercent,
	heroHp: Config.baseHeroMaxHp,
	heroHpRecoveryPerSec: 0,
	attack: 1,
	critchance: 1,
	gold: 0,
	manaCrystals: 0,
	mana: 0,
	enemy: '',
	enemyType: 0,	// EnemyTypeEnum
	enemyhp: 0,
	enemyMaxHp: 0,
	enemydead: false,
	enemygold: baseEnemyGold,
	status: 'ATTACKING',
	weapon: { level: 1, rarity: "common", mindamage: 3, maxdamage: 3, name: "Weapon", inspected: true },
	log: [],
	autoContinue: true,
	startDate: 0,
	highestArea: 0,

	equipment: {
		head: null,
		shoulders: null,
		chest: null,
		legs: null,
		boots: null,
		hands: null,
		bracers: null
	},

	gems: [],

	achievements: [], // { id: 0, date: x }

	options: {
		cancelAutoContinue: false,
		soundEnabled: true,
	},

	// State that shouldnt be saved:
	showItemDetail: false,

	version: '1'
};