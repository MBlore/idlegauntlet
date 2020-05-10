var Config = {
	pageTitle: "Idle Gauntlet",
	enemiesPerArea: 10,
	enemyAttackChance: 90,
	baseHpRecovery: 0,
	baseEnemyAttackPower: 1.01,
	baseHeroMaxHp: 500,
	lootEnemyDelay: 250,
	lootDropPercent: 30,
	bossHpMultiplier: 10,
}

// TODO: Get these out of global over time.
var baseEnemyGold = 2;
var tps = 10;		// game ticks per second
var bossSpawnPercent = 10;
var bossAreaMultiple = 10;
var maxLogLines = 1;

// A collection of curve functions for key scaling data values in the game.
var CurveFunction = {
	getEnemyAttack: function(area) {
		var pow = 1.0;
		var scale = 2.0;
		var base = 0.0;

		return base + Math.pow(area * scale, pow);
	},

	getMaxEnemyHp: function(area) {
		var pow = 1.6;
		var scale = 7.0;
		var base = 100.0;

		return base + Math.pow(area * scale, pow);
	},

	getGemCost: function(gemLevel, gemId) {
		var pow = 1.2;
		var scale = 1.5;
		var base = 0.0;

		if (gemId == 1) {
			gemLevel = gemLevel + 50;
		} else if (gemId == 2) {
			gemLevel = gemLevel + 100;
		} else if (gemId == 3) {
			gemLevel = gemLevel + 200;
		} else if (gemId == 4) {
			gemLevel = gemLevel + 500;
		}

		return Math.round(base + Math.pow(gemLevel * scale, pow));
	},

	getHpForArmorLevel: function(itemLevel) {
		var pow = 1.5;
		var scale = 2.0;
		var base = 0.0;

		return base + Math.round(Math.pow(itemLevel * scale, pow));
	},

	getWeaponDamage: function(area) {
		var pow = 1.06;
		var scale = 2.75;
		var base = 0.0;

		return base + Math.pow(area * scale, pow);
	},

	getGoldReward: function(area) {
		var pow = 2.0;
		var scale = 1.0;
		var base = 1.0;

		return Math.round(base + Math.pow(area * scale, pow));
	},

	getManaCrystalRewardForBoss: function(area) {
		var pow = 1.0;
		var scale = 0.05;
		var base = 1.0;

		return Math.round(base + Math.pow(area * scale, pow));
	}
}